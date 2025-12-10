//+------------------------------------------------------------------+
//| EA_Oro_Indices_Volatility.mq5                                   |
//| Expert Advisor MQL5 - VERSIÓN FINAL CORREGIDA                   |
//+------------------------------------------------------------------+
#property copyright "Usuario"
#property version   "1.00"
#property description "EA para XAU y volatilidad: scalper/normal, EMA+RSI, trailing stop"

#include <Trade\Trade.mqh>
CTrade trade;

//--- Parámetros de entrada
input string   InpSymbol               = "";             // Símbolo (vacío = gráfico actual)
input ENUM_TIMEFRAMES InpTimeframe      = PERIOD_M1;       // Timeframe
input bool     InpScalperMode           = false;           // Modo Scalper
input double   InpLot                   = 0.01;            // Lote
input int      InpMaxOrders             = 3;               // Máximo órdenes abiertas
input int      InpMagic                 = 20250701;        // Magic number
input int      InpSlPoints              = 300;             // Stop Loss (puntos)
input int      InpTpPoints              = 600;             // Take Profit (puntos)
input bool     InpUseTrailing           = true;            // Usar trailing stop
input int      InpTrailingStartPips     = 200;             // Inicio trailing (pips)
input int      InpTrailingStepPips      = 50;              // Paso trailing (pips)
input bool     InpCloseAndOpenNew       = false;           // Cerrar y abrir al invertir
input int      InpFastEMA_Scalper       = 5;               // EMA Rápida scalper
input int      InpSlowEMA_Scalper       = 21;              // EMA Lenta scalper
input int      InpFastEMA_Normal        = 13;              // EMA Rápida normal
input int      InpSlowEMA_Normal        = 34;              // EMA Lenta normal
input int      InpRSIPeriod             = 14;              // RSI periodo
input int      InpRSI_Upper             = 70;              // RSI umbral venta
input int      InpRSI_Lower             = 30;              // RSI umbral compra
input int      InpMaxSlippage           = 5;               // Slippage (pips)
input bool     InpAllowTrading          = true;            // Habilitar trading
input bool     InpTradeOnNewBar         = true;            // Solo en nueva barra

//--- Variables globales
string symbolToTrade;
ENUM_TIMEFRAMES timeframeToUse;
int    fastEMA, slowEMA;
datetime lastBarTime = 0;

// Handles de indicadores
int handleFastEMA = INVALID_HANDLE;
int handleSlowEMA = INVALID_HANDLE;
int handleRSI = INVALID_HANDLE;

//+------------------------------------------------------------------+
//| Inicialización                                                    |
//+------------------------------------------------------------------+
int OnInit()
{
   // Determinar símbolo a operar
   string trimmedSymbol = InpSymbol;
   StringTrimLeft(trimmedSymbol);
   StringTrimRight(trimmedSymbol);
   symbolToTrade = (StringLen(trimmedSymbol) == 0) ? _Symbol : InpSymbol;

   timeframeToUse = InpTimeframe;

   // Configurar EMAs según modo
   if(InpScalperMode)
   {
      fastEMA = InpFastEMA_Scalper;
      slowEMA = InpSlowEMA_Scalper;
   }
   else
   {
      fastEMA = InpFastEMA_Normal;
      slowEMA = InpSlowEMA_Normal;
   }

   // Crear handles de indicadores
   handleFastEMA = iMA(symbolToTrade, timeframeToUse, fastEMA, 0, MODE_EMA, PRICE_CLOSE);
   handleSlowEMA = iMA(symbolToTrade, timeframeToUse, slowEMA, 0, MODE_EMA, PRICE_CLOSE);
   handleRSI = iRSI(symbolToTrade, timeframeToUse, InpRSIPeriod, PRICE_CLOSE);

   if(handleFastEMA == INVALID_HANDLE || handleSlowEMA == INVALID_HANDLE || handleRSI == INVALID_HANDLE)
   {
      Print("ERROR: No se pudieron crear los indicadores para ", symbolToTrade);
      return INIT_FAILED;
   }

   Print("EA iniciado: ", symbolToTrade, " TF=", EnumToString(timeframeToUse),
         " Modo=", InpScalperMode ? "Scalper" : "Normal");

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Desinicialización                                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // Liberar handles
   if(handleFastEMA != INVALID_HANDLE) IndicatorRelease(handleFastEMA);
   if(handleSlowEMA != INVALID_HANDLE) IndicatorRelease(handleSlowEMA);
   if(handleRSI != INVALID_HANDLE) IndicatorRelease(handleRSI);
}

//+------------------------------------------------------------------+
//| Verificar nueva barra                                            |
//+------------------------------------------------------------------+
bool IsNewBar()
{
   datetime currentTime = iTime(symbolToTrade, timeframeToUse, 0);
   if(currentTime != lastBarTime)
   {
      lastBarTime = currentTime;
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
//| Obtener valor de EMA                                             |
//+------------------------------------------------------------------+
double GetEMAValue(int handle, int shift)
{
   double buffer[1];
   if(CopyBuffer(handle, 0, shift, 1, buffer) <= 0)
      return 0.0;
   return buffer[0];
}

//+------------------------------------------------------------------+
//| Obtener valor de RSI                                             |
//+------------------------------------------------------------------+
double GetRSIValue(int handle, int shift)
{
   double buffer[1];
   if(CopyBuffer(handle, 0, shift, 1, buffer) <= 0)
      return 50.0;
   return buffer[0];
}

//+------------------------------------------------------------------+
//| Contar órdenes abiertas                                          |
//+------------------------------------------------------------------+
int CountOpenOrders(string sym)
{
   int total = 0;
   int posTotal = PositionsTotal();

   for(int idx = 0; idx < posTotal; idx++)
   {
      ulong ticket = PositionGetTicket(idx);
      if(ticket > 0)
      {
         if(PositionSelectByTicket(ticket))
         {
            if(PositionGetString(POSITION_SYMBOL) == sym &&
               PositionGetInteger(POSITION_MAGIC) == InpMagic)
            {
               total++;
            }
         }
      }
   }
   return total;
}

//+------------------------------------------------------------------+
//| Cerrar posiciones por tipo                                       |
//+------------------------------------------------------------------+
void ClosePositionsBySymbol(string sym, ENUM_POSITION_TYPE posType)
{
   int posTotal = PositionsTotal();

   for(int idx = posTotal - 1; idx >= 0; idx--)
   {
      if(PositionSelectByIndex(idx))
      {
         if(PositionGetString(POSITION_SYMBOL) == sym &&
            PositionGetInteger(POSITION_MAGIC) == InpMagic &&
            PositionGetInteger(POSITION_TYPE) == posType)
         {
            ulong ticket = PositionGetTicket(idx);
            trade.PositionClose(ticket);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Trailing Stop                                                     |
//+------------------------------------------------------------------+
void ManageTrailing(string sym)
{
   int posTotal = PositionsTotal();

   for(int idx = 0; idx < posTotal; idx++)
   {
      if(PositionSelectByIndex(idx))
      {
         if(PositionGetString(POSITION_SYMBOL) != sym ||
            PositionGetInteger(POSITION_MAGIC) != InpMagic)
            continue;

         ulong ticket = PositionGetTicket(idx);
         ENUM_POSITION_TYPE ptype = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
         double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
         double currentSL = PositionGetDouble(POSITION_SL);
         double point = SymbolInfoDouble(sym, SYMBOL_POINT);

         double currentPrice = (ptype == POSITION_TYPE_BUY) ?
                               SymbolInfoDouble(sym, SYMBOL_BID) :
                               SymbolInfoDouble(sym, SYMBOL_ASK);

         double profitPips = ((ptype == POSITION_TYPE_BUY) ?
                             (currentPrice - openPrice) :
                             (openPrice - currentPrice)) / point;

         // Activar trailing si supera el umbral
         if(InpUseTrailing && profitPips >= InpTrailingStartPips)
         {
            double newSL = 0;

            if(ptype == POSITION_TYPE_BUY)
            {
               double candidate = currentPrice - InpTrailingStepPips * point;
               newSL = (currentSL == 0) ? candidate : MathMax(candidate, currentSL);
            }
            else
            {
               double candidate = currentPrice + InpTrailingStepPips * point;
               newSL = (currentSL == 0) ? candidate : MathMin(candidate, currentSL);
            }

            if(newSL != currentSL && newSL > 0)
            {
               trade.PositionModify(ticket, newSL, PositionGetDouble(POSITION_TP));
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Abrir orden                                                       |
//+------------------------------------------------------------------+
bool OpenOrder(string sym, ENUM_ORDER_TYPE orderType)
{
   double lot = InpLot;
   double price = (orderType == ORDER_TYPE_BUY) ?
                  SymbolInfoDouble(sym, SYMBOL_ASK) :
                  SymbolInfoDouble(sym, SYMBOL_BID);

   double point = SymbolInfoDouble(sym, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);

   double sl = 0, tp = 0;

   if(InpSlPoints > 0)
   {
      sl = (orderType == ORDER_TYPE_BUY) ?
           NormalizeDouble(price - InpSlPoints * point, digits) :
           NormalizeDouble(price + InpSlPoints * point, digits);
   }

   if(InpTpPoints > 0)
   {
      tp = (orderType == ORDER_TYPE_BUY) ?
           NormalizeDouble(price + InpTpPoints * point, digits) :
           NormalizeDouble(price - InpTpPoints * point, digits);
   }

   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(InpMaxSlippage);

   bool result = false;
   if(orderType == ORDER_TYPE_BUY)
      result = trade.Buy(lot, sym, price, sl, tp, "EA_Oro_Vol");
   else if(orderType == ORDER_TYPE_SELL)
      result = trade.Sell(lot, sym, price, sl, tp, "EA_Oro_Vol");

   if(result)
      Print("Orden abierta: ", orderType == ORDER_TYPE_BUY ? "BUY" : "SELL", " @ ", price);
   else
      Print("Error abriendo orden: ", trade.ResultRetcode(), " - ", trade.ResultRetcodeDescription());

   return result;
}

//+------------------------------------------------------------------+
//| Obtener señal de trading                                         |
//+------------------------------------------------------------------+
int GetSignal(string sym)
{
   // Actualizar handles si cambian parámetros
   int newFastEMA = InpScalperMode ? InpFastEMA_Scalper : InpFastEMA_Normal;
   int newSlowEMA = InpScalperMode ? InpSlowEMA_Scalper : InpSlowEMA_Normal;

   if(newFastEMA != fastEMA || newSlowEMA != slowEMA)
   {
      fastEMA = newFastEMA;
      slowEMA = newSlowEMA;

      if(handleFastEMA != INVALID_HANDLE) IndicatorRelease(handleFastEMA);
      if(handleSlowEMA != INVALID_HANDLE) IndicatorRelease(handleSlowEMA);

      handleFastEMA = iMA(symbolToTrade, timeframeToUse, fastEMA, 0, MODE_EMA, PRICE_CLOSE);
      handleSlowEMA = iMA(symbolToTrade, timeframeToUse, slowEMA, 0, MODE_EMA, PRICE_CLOSE);
   }

   double emaFast = GetEMAValue(handleFastEMA, 0);
   double emaSlow = GetEMAValue(handleSlowEMA, 0);
   double emaFastPrev = GetEMAValue(handleFastEMA, 1);
   double emaSlowPrev = GetEMAValue(handleSlowEMA, 1);
   double rsi = GetRSIValue(handleRSI, 0);

   // Señal de compra: cruce alcista + RSI neutral
   if(emaFastPrev <= emaSlowPrev && emaFast > emaSlow &&
      rsi > InpRSI_Lower && rsi < InpRSI_Upper)
      return 1;

   // Señal de venta: cruce bajista + RSI neutral
   if(emaFastPrev >= emaSlowPrev && emaFast < emaSlow &&
      rsi > InpRSI_Lower && rsi < InpRSI_Upper)
      return -1;

   return 0;
}

//+------------------------------------------------------------------+
//| OnTick                                                            |
//+------------------------------------------------------------------+
void OnTick()
{
   if(!InpAllowTrading) return;
   if(InpTradeOnNewBar && !IsNewBar()) return;

   // Verificar símbolo disponible
   if(!SymbolInfoInteger(symbolToTrade, SYMBOL_SELECT))
   {
      if(!SymbolSelect(symbolToTrade, true))
      {
         Print("No se puede seleccionar: ", symbolToTrade);
         return;
      }
   }

   ManageTrailing(symbolToTrade);

   int signal = GetSignal(symbolToTrade);
   int openOrders = CountOpenOrders(symbolToTrade);

   // Señal de compra
   if(signal == 1)
   {
      if(openOrders >= InpMaxOrders) return;

      if(PositionSelect(symbolToTrade))
      {
         ENUM_POSITION_TYPE ptype = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);

         if(ptype == POSITION_TYPE_SELL)
         {
            if(InpCloseAndOpenNew)
            {
               ClosePositionsBySymbol(symbolToTrade, POSITION_TYPE_SELL);
               Sleep(1000);
               OpenOrder(symbolToTrade, ORDER_TYPE_BUY);
            }
         }
      }
      else
      {
         OpenOrder(symbolToTrade, ORDER_TYPE_BUY);
      }
   }

   // Señal de venta
   if(signal == -1)
   {
      if(openOrders >= InpMaxOrders) return;

      if(PositionSelect(symbolToTrade))
      {
         ENUM_POSITION_TYPE ptype = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);

         if(ptype == POSITION_TYPE_BUY)
         {
            if(InpCloseAndOpenNew)
            {
               ClosePositionsBySymbol(symbolToTrade, POSITION_TYPE_BUY);
               Sleep(1000);
               OpenOrder(symbolToTrade, ORDER_TYPE_SELL);
            }
         }
      }
      else
      {
         OpenOrder(symbolToTrade, ORDER_TYPE_SELL);
      }
   }
}
//+------------------------------------------------------------------+
