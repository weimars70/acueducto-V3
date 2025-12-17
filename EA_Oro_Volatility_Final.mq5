//+------------------------------------------------------------------+
//| EA_Oro_Indices_Volatility.mq5                                    |
//| Expert Advisor MQL5 - VERSIÓN MEJORADA CON FILTROS DE SEGURIDAD  |
//| Mejoras: ATR, EMA200, Spread, Confirmación 2 barras, Time filter |
//+------------------------------------------------------------------+
#property copyright "Usuario"
#property version   "2.00"
#property description "EA para XAU y volatilidad: scalper/normal, EMA+RSI+ATR+Trend, trailing stop"

#include <Trade\Trade.mqh>
CTrade trade;

//--- Parámetros de entrada
input string       InpSymbol                        = "";                      // Símbolo (vacío = gráfico actual)
input ENUM_TIMEFRAMES InpTimeframe                  = PERIOD_M1;              // Timeframe
input bool         InpScalperMode                   = false;                  // Modo Scalper
input double       InpLot                           = 0.01;                   // Lote
input int          InpMaxOrders                     = 3;                      // Máximo órdenes abiertas
input int          InpMagic                         = 20250701;              // Magic number

//--- Parámetros de SL/TP dinámicos con ATR
input bool         InpUseDynamicSLTP                = true;                   // Usar SL/TP dinámicos (ATR)
input double       InpATR_SL_Multiplier             = 2.0;                    // Multiplicador ATR para SL
input double       InpATR_TP_Multiplier             = 4.0;                    // Multiplicador ATR para TP
input int          InpSlPoints                      = 300;                    // Stop Loss fijo (puntos) si no usa ATR
input int          InpTpPoints                      = 600;                    // Take Profit fijo (puntos) si no usa ATR

//--- Trailing Stop
input bool         InpUseTrailing                   = true;                   // Usar trailing stop
input int          InpTrailingStartPips             = 200;                    // Inicio trailing (pips)
input int          InpTrailingStepPips              = 50;                     // Paso trailing (pips)

//--- Parámetros de EMAs
input int          InpFastEMA_Scalper               = 5;                      // EMA Rápida scalper
input int          InpSlowEMA_Scalper               = 21;                     // EMA Lenta scalper
input int          InpFastEMA_Normal                = 13;                     // EMA Rápida normal
input int          InpSlowEMA_Normal                = 34;                     // EMA Lenta normal
input int          InpTrendEMA                      = 200;                    // EMA de tendencia (filtro)

//--- Parámetros de RSI (más estrictos)
input int          InpRSIPeriod                     = 14;                     // RSI periodo
input int          InpRSI_Upper                     = 75;                     // RSI umbral venta (más estricto)
input int          InpRSI_Lower                     = 25;                     // RSI umbral compra (más estricto)

//--- Parámetros de ATR
input int          InpATRPeriod                     = 14;                     // ATR periodo

//--- Filtros de seguridad
input double       InpMaxSpreadPoints               = 50;                     // Spread máximo permitido (puntos)
input double       InpMinEMADistance                = 20;                     // Distancia mínima entre EMAs (puntos)
input bool         InpRequire2BarConfirmation       = true;                   // Requerir confirmación de 2 barras
input bool         InpUseTrendFilter                = true;                   // Usar filtro de tendencia EMA200
input bool         InpUseTimeFilter                 = true;                   // Usar filtro de horario
input int          InpStartHour                     = 8;                      // Hora inicio trading (GMT)
input int          InpEndHour                       = 20;                     // Hora fin trading (GMT)

//--- Otros
input bool         InpCloseAndOpenNew               = false;                  // Cerrar y abrir al invertir
input int          InpMaxSlippage                   = 5;                      // Slippage (pips)
input bool         InpAllowTrading                  = true;                   // Habilitar trading
input bool         InpTradeOnNewBar                 = true;                   // Solo en nueva barra

//--- Variables globales
string   symbolToTrade;
ENUM_TIMEFRAMES timeframeToUse;
int      fastEMA, slowEMA;
datetime lastBarTime = 0;
datetime lastSignalBarTime = 0;  // Para confirmación de 2 barras

//   Handles de indicadores
int handleFastEMA = INVALID_HANDLE;
int handleSlowEMA = INVALID_HANDLE;
int handleTrendEMA = INVALID_HANDLE;
int handleRSI = INVALID_HANDLE;
int handleATR = INVALID_HANDLE;

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

   Print("EMA rápida = ", fastEMA, " EMA lenta = ", slowEMA, " EMA tendencia = ", InpTrendEMA);

   // Crear handles de indicadores
   handleFastEMA = iMA(symbolToTrade, timeframeToUse, fastEMA, 0, MODE_EMA, PRICE_CLOSE);
   handleSlowEMA = iMA(symbolToTrade, timeframeToUse, slowEMA, 0, MODE_EMA, PRICE_CLOSE);
   handleTrendEMA = iMA(symbolToTrade, timeframeToUse, InpTrendEMA, 0, MODE_EMA, PRICE_CLOSE);
   handleRSI = iRSI(symbolToTrade, timeframeToUse, InpRSIPeriod, PRICE_CLOSE);
   handleATR = iATR(symbolToTrade, timeframeToUse, InpATRPeriod);

   if(handleFastEMA == INVALID_HANDLE || handleSlowEMA == INVALID_HANDLE ||
      handleTrendEMA == INVALID_HANDLE || handleRSI == INVALID_HANDLE ||
      handleATR == INVALID_HANDLE)
   {
      Print("ERROR: No se pudieron crear los indicadores para ", symbolToTrade);
      return INIT_FAILED;
   }

   // Validar parámetros
   if(InpATR_SL_Multiplier <= 0 || InpATR_TP_Multiplier <= 0)
   {
      Print("ERROR: Multiplicadores ATR deben ser positivos");
      return INIT_FAILED;
   }

   if(InpLot <= 0)
   {
      Print("ERROR: Lote debe ser positivo");
      return INIT_FAILED;
   }

   Print("========================================");
   Print("EA MEJORADO INICIADO");
   Print("Símbolo: ", symbolToTrade, " TF=", EnumToString(timeframeToUse));
   Print("Modo: ", InpScalperMode ? "Scalper" : "Normal");
   Print("SL/TP Dinámico: ", InpUseDynamicSLTP ? "SI" : "NO");
   Print("Filtro Tendencia EMA200: ", InpUseTrendFilter ? "SI" : "NO");
   Print("Confirmación 2 barras: ", InpRequire2BarConfirmation ? "SI" : "NO");
   Print("Spread máximo: ", InpMaxSpreadPoints, " puntos");
   Print("Horario: ", InpUseTimeFilter ? IntegerToString(InpStartHour) + ":00 - " + IntegerToString(InpEndHour) + ":00 GMT" : "24h");
   Print("========================================");

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
   if(handleTrendEMA != INVALID_HANDLE) IndicatorRelease(handleTrendEMA);
   if(handleRSI != INVALID_HANDLE) IndicatorRelease(handleRSI);
   if(handleATR != INVALID_HANDLE) IndicatorRelease(handleATR);

   Print("EA detenido. Razón: ", reason);
}

//+------------------------------------------------------------------+
//| Verificar nueva barra                                             |
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
//| Obtener valor de EMA                                              |
//+------------------------------------------------------------------+
double GetEMAValue(int handle, int shift)
{
   double buffer[1];
   if(CopyBuffer(handle, 0, shift, 1, buffer) <= 0)
   {
      Print("ERROR: No se pudo copiar buffer EMA, shift=", shift);
      return 0.0;
   }
   return buffer[0];
}

//+------------------------------------------------------------------+
//| Obtener valor de RSI                                              |
//+------------------------------------------------------------------+
double GetRSIValue(int handle, int shift)
{
   double buffer[1];
   if(CopyBuffer(handle, 0, shift, 1, buffer) <= 0)
   {
      Print("ERROR: No se pudo copiar buffer RSI, shift=", shift);
      return 50.0;
   }
   return buffer[0];
}

//+------------------------------------------------------------------+
//| Obtener valor de ATR                                              |
//+------------------------------------------------------------------+
double GetATRValue(int handle, int shift)
{
   double buffer[1];
   if(CopyBuffer(handle, 0, shift, 1, buffer) <= 0)
   {
      Print("ERROR: No se pudo copiar buffer ATR, shift=", shift);
      return 0.0;
   }
   return buffer[0];
}

//+------------------------------------------------------------------+
//| Verificar spread máximo permitido                                 |
//+------------------------------------------------------------------+
bool CheckSpread(string sym)
{
   double ask = SymbolInfoDouble(sym, SYMBOL_ASK);
   double bid = SymbolInfoDouble(sym, SYMBOL_BID);
   double point = SymbolInfoDouble(sym, SYMBOL_POINT);

   if(point == 0)
   {
      Print("ERROR: Point es cero para ", sym);
      return false;
   }

   double spreadPoints = (ask - bid) / point;

   if(spreadPoints > InpMaxSpreadPoints)
   {
      Print("FILTRO SPREAD: Spread actual=", DoubleToString(spreadPoints, 1),
            " > máximo=", InpMaxSpreadPoints, " - NO SE OPERA");
      return false;
   }

   return true;
}

//+------------------------------------------------------------------+
//| Verificar horario de trading                                      |
//+------------------------------------------------------------------+
bool CheckTradingTime()
{
   if(!InpUseTimeFilter) return true;

   MqlDateTime dt;
   TimeCurrent(dt);
   int currentHour = dt.hour;

   if(currentHour < InpStartHour || currentHour >= InpEndHour)
   {
      // Print("FILTRO HORARIO: Hora actual=", currentHour, " fuera de rango ", InpStartHour, "-", InpEndHour);
      return false;
   }

   return true;
}

//+------------------------------------------------------------------+
//| Contar órdenes abiertas                                           |
//+------------------------------------------------------------------+
int CountOpenOrders(string sym)
{
   int i;
   int total = 0;
   int posTotal = PositionsTotal();
   ulong ticket;

   for(i = 0; i < posTotal; i++)
   {
      ticket = PositionGetTicket(i);
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
//| Cerrar posiciones por tipo                                        |
//+------------------------------------------------------------------+
void ClosePositionsBySymbol(string sym, ENUM_POSITION_TYPE posType)
{
   int total = PositionsTotal();

   for(int i = total - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);

      if(ticket != 0)
      {
         if(PositionSelectByTicket(ticket))
         {
            if(PositionGetString(POSITION_SYMBOL) == sym &&
              PositionGetInteger(POSITION_MAGIC) == InpMagic &&
              PositionGetInteger(POSITION_TYPE) == posType)
            {
               if(!trade.PositionClose(ticket))
               {
                  Print("ERROR cerrando posición ", ticket, ": ", trade.ResultRetcodeDescription());
               }
            }
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

   for(int i = 0; i < posTotal; i++)
   {
      ulong ticket = PositionGetTicket(i);

      if(ticket == 0)
         continue;

      if(!PositionSelectByTicket(ticket))
         continue;

      if(PositionGetString(POSITION_SYMBOL) != sym ||
        PositionGetInteger(POSITION_MAGIC) != InpMagic)
         continue;

      ENUM_POSITION_TYPE ptype = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      double openPrice      = PositionGetDouble(POSITION_PRICE_OPEN);
      double currentSL      = PositionGetDouble(POSITION_SL);
      double point          = SymbolInfoDouble(sym, SYMBOL_POINT);

      double currentPrice = (ptype == POSITION_TYPE_BUY)
         ? SymbolInfoDouble(sym, SYMBOL_BID)
         : SymbolInfoDouble(sym, SYMBOL_ASK);

      double profitPips = ((ptype == POSITION_TYPE_BUY)
         ? (currentPrice - openPrice)
         : (openPrice - currentPrice)) / point;

      if(InpUseTrailing && profitPips >= InpTrailingStartPips)
      {
         double newSL = 0;
         double candidate;

         if(ptype == POSITION_TYPE_BUY)
         {
            candidate = currentPrice - InpTrailingStepPips * point;
            newSL = (currentSL == 0) ? candidate : MathMax(candidate, currentSL);
         }
         else
         {
            candidate = currentPrice + InpTrailingStepPips * point;
            newSL = (currentSL == 0) ? candidate : MathMin(candidate, currentSL);
         }

         if(newSL != currentSL && newSL > 0)
         {
            if(!trade.PositionModify(ticket, newSL, PositionGetDouble(POSITION_TP)))
            {
               Print("ERROR modificando trailing para ticket ", ticket, ": ", trade.ResultRetcodeDescription());
            }
            else
            {
               Print("Trailing actualizado para ticket ", ticket, " nuevo SL=", newSL);
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Abrir orden con SL/TP dinámicos o fijos                           |
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

   // Calcular SL/TP dinámicos con ATR o usar fijos
   if(InpUseDynamicSLTP)
   {
      double atr = GetATRValue(handleATR, 0);

      if(atr <= 0)
      {
         Print("ERROR: ATR inválido (", atr, "), no se abre orden");
         return false;
      }

      double slDistance = atr * InpATR_SL_Multiplier;
      double tpDistance = atr * InpATR_TP_Multiplier;

      if(orderType == ORDER_TYPE_BUY)
      {
         sl = NormalizeDouble(price - slDistance, digits);
         tp = NormalizeDouble(price + tpDistance, digits);
      }
      else
      {
         sl = NormalizeDouble(price + slDistance, digits);
         tp = NormalizeDouble(price - tpDistance, digits);
      }

      Print("SL/TP DINÁMICO - ATR=", DoubleToString(atr, digits),
            " SL=", DoubleToString(slDistance/point, 1), " puntos",
            " TP=", DoubleToString(tpDistance/point, 1), " puntos");
   }
   else
   {
      // SL/TP fijos
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
   }

   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(InpMaxSlippage);

   bool result = false;
   if(orderType == ORDER_TYPE_BUY)
      result = trade.Buy(lot, sym, price, sl, tp, "EA_Oro_Vol_V2");
   else if(orderType == ORDER_TYPE_SELL)
      result = trade.Sell(lot, sym, price, sl, tp, "EA_Oro_Vol_V2");

   if(result)
   {
      Print("✅ ORDEN ABIERTA: ", orderType == ORDER_TYPE_BUY ? "BUY" : "SELL",
            " @ ", price, " SL=", sl, " TP=", tp);
   }
   else
   {
      Print("❌ ERROR abriendo orden: ", trade.ResultRetcode(), " - ", trade.ResultRetcodeDescription());
   }

   return result;
}

//+------------------------------------------------------------------+
//| Obtener señal de trading con TODOS los filtros                    |
//+------------------------------------------------------------------+
int GetSignal(string sym)
{
   // Obtener valores actuales y previos
   double emaFast = GetEMAValue(handleFastEMA, 0);
   double emaSlow = GetEMAValue(handleSlowEMA, 0);
   double emaFastPrev = GetEMAValue(handleFastEMA, 1);
   double emaSlowPrev = GetEMAValue(handleSlowEMA, 1);
   double emaTrend = GetEMAValue(handleTrendEMA, 0);
   double rsi = GetRSIValue(handleRSI, 0);
   double currentPrice = SymbolInfoDouble(sym, SYMBOL_BID);
   double point = SymbolInfoDouble(sym, SYMBOL_POINT);

   // Validar datos
   if(emaFast == 0 || emaSlow == 0 || emaTrend == 0 || point == 0)
   {
      Print("ERROR: Valores de indicadores inválidos");
      return 0;
   }

   // FILTRO 1: Verificar distancia mínima entre EMAs
   double emaDistance = MathAbs(emaFast - emaSlow) / point;
   if(emaDistance < InpMinEMADistance)
   {
      // Print("FILTRO EMA DISTANCIA: Distancia=", DoubleToString(emaDistance, 1), " < mínimo=", InpMinEMADistance);
      return 0;
   }

   // FILTRO 2: Filtro de tendencia con EMA 200
   if(InpUseTrendFilter)
   {
      // Para compra: precio debe estar por encima de EMA 200
      // Para venta: precio debe estar por debajo de EMA 200
      bool trendUpOK = (currentPrice > emaTrend);
      bool trendDownOK = (currentPrice < emaTrend);

      // Señal de compra: cruce alcista + RSI + tendencia alcista
      if(emaFastPrev <= emaSlowPrev && emaFast > emaSlow)
      {
         if(rsi > InpRSI_Lower && rsi < InpRSI_Upper && trendUpOK)
         {
            Print("📈 SEÑAL COMPRA: EMA cruce alcista, RSI=", DoubleToString(rsi, 1),
                  ", Precio > EMA200, Distancia EMAs=", DoubleToString(emaDistance, 1));
            return 1;
         }
         else
         {
            Print("SEÑAL COMPRA RECHAZADA: RSI=", DoubleToString(rsi, 1),
                  " o TrendFilter (precio=", currentPrice, " EMA200=", emaTrend, ")");
         }
      }

      // Señal de venta: cruce bajista + RSI + tendencia bajista
      if(emaFastPrev >= emaSlowPrev && emaFast < emaSlow)
      {
         if(rsi > InpRSI_Lower && rsi < InpRSI_Upper && trendDownOK)
         {
            Print("📉 SEÑAL VENTA: EMA cruce bajista, RSI=", DoubleToString(rsi, 1),
                  ", Precio < EMA200, Distancia EMAs=", DoubleToString(emaDistance, 1));
            return -1;
         }
         else
         {
            Print("SEÑAL VENTA RECHAZADA: RSI=", DoubleToString(rsi, 1),
                  " o TrendFilter (precio=", currentPrice, " EMA200=", emaTrend, ")");
         }
      }
   }
   else
   {
      // Sin filtro de tendencia (comportamiento original pero con RSI más estricto)
      if(emaFastPrev <= emaSlowPrev && emaFast > emaSlow &&
        rsi > InpRSI_Lower && rsi < InpRSI_Upper)
      {
         Print("📈 SEÑAL COMPRA: EMA cruce alcista, RSI=", DoubleToString(rsi, 1));
         return 1;
      }

      if(emaFastPrev >= emaSlowPrev && emaFast < emaSlow &&
        rsi > InpRSI_Lower && rsi < InpRSI_Upper)
      {
         Print("📉 SEÑAL VENTA: EMA cruce bajista, RSI=", DoubleToString(rsi, 1));
         return -1;
      }
   }

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

   // FILTRO: Spread máximo
   if(!CheckSpread(symbolToTrade))
      return;

   // FILTRO: Horario de trading
   if(!CheckTradingTime())
      return;

   // Gestionar trailing stop
   ManageTrailing(symbolToTrade);

   // Obtener señal con TODOS los filtros
   int signal = GetSignal(symbolToTrade);
   int openOrders = CountOpenOrders(symbolToTrade);

   // FILTRO: Confirmación de 2 barras
   if(InpRequire2BarConfirmation && signal != 0)
   {
      datetime currentBarTime = iTime(symbolToTrade, timeframeToUse, 0);

      // Si es la misma barra que la última señal, esperar
      if(currentBarTime == lastSignalBarTime)
      {
         // Print("FILTRO 2 BARRAS: Esperando confirmación en próxima barra");
         return;
      }

      // Nueva barra, registrar y permitir operación
      lastSignalBarTime = currentBarTime;
   }

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
