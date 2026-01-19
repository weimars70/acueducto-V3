import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MigracionContabilidadService {
    private readonly logger = new Logger(MigracionContabilidadService.name);
    private readonly accountingApiUrl: string;

    constructor(
        private readonly dataSource: DataSource,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.accountingApiUrl = this.configService.get<string>('ACCOUNTING_API_URL');
    }

    private formatEmpresa(empresaId: number): string {
        return empresaId.toString().padStart(2, '0');
    }

    async getFacturasPeriodo(mes: number, year: number, empresaId: number) {
        const empresaFormatted = this.formatEmpresa(empresaId);
        const query = `
        SELECT 
          $1 as empresa, 
          year as periodo, 
          mes, 
          prefijo, 
          factura as consecutivo,  
          1 as centro_costos, 
          1 as concepto, 
          ident as nit, 
          dv as dg_verifica, 
          nombre, 
          valor_total as valor, 
          sin_recargo as vence, 
          1 as cuenta, 
          direccion, 
          '' as barrio,
          telefono, 
          ciudad_codigo as ciudad, 
          ciudad_nombre as n_ciudad,  
          saldo, 
          fecha_factura as fecha
        FROM public.view_facturas 
        WHERE mes = $2 AND year = $3 AND empresa_id = $4
      `;
        return this.dataSource.query(query, [empresaFormatted, mes, year, empresaId]);
    }

    async getFacturasCarteraPeriodo(mes: number, year: number, empresaId: number) {
        const empresaFormatted = this.formatEmpresa(empresaId);
        const query = `
          SELECT 
            $1 as empresa, 
            year as periodo, 
            mes, 
            prefijo, 
            factura as consecutivo,  
            1 as centro_costos, 
            1 as tramite, 
            ident as nit, 
            nombre, 
            fecha_factura as fecha, 
            fecha_factura as fecha_documento, 
            valor_total as debito, 
            0 as credito, 
            0 as banco, 
            direccion, 
            1 as cuenta, 
            'Registro inicial de factura' as descripcion
          FROM public.view_facturas 
          WHERE mes = $2 AND year = $3 AND empresa_id = $4
        `;
        return this.dataSource.query(query, [empresaFormatted, mes, year, empresaId]);
    }

    async getFacturasDetallePeriodo(mes: number, year: number, empresaId: number) {
        const empresaFormatted = this.formatEmpresa(empresaId);
        const query = `
        SELECT 
          $1 as empresa,
          year as periodo,
          mes,
          prefijo,
          factura as consecutivo, 
          row_number() OVER (
              PARTITION BY factura
              ORDER BY factura
          ) AS linea,
          n_concepto as referencia,
          concepto as articulo, 
          n_concepto as descripcion,
          1 as cantidad,
          valor as valor_und, 
          0 as descuento, 
          concepto
        FROM view_facturas_detalle_contable 
        WHERE year = $2 AND mes = $3 AND empresa_id = $4
      `;
        return this.dataSource.query(query, [empresaFormatted, year, mes, empresaId]);
    }

    async migrarFacturaIndividual(factura: any) {
        const payload = {
            ...factura,
            valor: parseFloat(factura.valor),
            saldo: parseFloat(factura.saldo),
            centro_costos: parseInt(factura.centro_costos),
            concepto: parseInt(factura.concepto),
            cuenta: parseInt(factura.cuenta),
            mes: parseInt(factura.mes),
            periodo: factura.periodo.toString(),
            nit: factura.nit ? factura.nit.toString() : '',
            dg_verifica: factura.dg_verifica != null ? factura.dg_verifica.toString() : '',
        };

        const response = await firstValueFrom(
            this.httpService.post(`${this.accountingApiUrl}/facturas`, payload)
        );
        return response.data;
    }

    async migrarFacturaCarteraIndividual(factura: any) {
        const payload = {
            ...factura,
            debito: parseFloat(factura.debito),
            credito: parseFloat(factura.credito),
            centro_costos: parseInt(factura.centro_costos),
            tramite: parseInt(factura.tramite),
            cuenta: parseInt(factura.cuenta),
            mes: parseInt(factura.mes),
            periodo: factura.periodo.toString(),
            nit: factura.nit ? factura.nit.toString() : '',
            consecutivo: parseInt(factura.consecutivo),
            banco: parseInt(factura.banco)
        };

        const response = await firstValueFrom(
            this.httpService.post(`${this.accountingApiUrl}/facturas-cartera`, payload)
        );
        return response.data;
    }

    async migrarFacturaDetalleIndividual(detalle: any) {
        const payload = {
            ...detalle,
            valor_und: parseFloat(detalle.valor_und),
            descuento: parseFloat(detalle.descuento),
            cantidad: parseFloat(detalle.cantidad),
            consecutivo: parseInt(detalle.consecutivo),
            linea: parseInt(detalle.linea),
            articulo: parseInt(detalle.articulo),
            periodo: detalle.periodo.toString(),
            concepto: parseInt(detalle.concepto)
        };

        const response = await firstValueFrom(
            this.httpService.post(`${this.accountingApiUrl}/facturas-detalle`, payload)
        );
        return response.data;
    }

    async migrarFacturas(mes: number, year: number, empresaId: number) {
        this.logger.log(`Iniciando migración de facturas para ${mes}/${year} - Empresa: ${empresaId}`);

        try {
            const facturas = await this.getFacturasPeriodo(mes, year, empresaId);
            this.logger.log(`Encontradas ${facturas.length} facturas para migrar.`);

            const resultados = {
                total: facturas.length,
                exitosos: 0,
                fallidos: 0,
                detalles: [],
            };

            for (const factura of facturas) {
                try {
                    await this.migrarFacturaIndividual(factura);
                    resultados.exitosos++;
                } catch (error) {
                    resultados.fallidos++;
                    const errorMsg = error.response?.data?.message || error.message;
                    this.logger.error(`Error migrando factura ${factura.prefijo}${factura.consecutivo}: ${errorMsg}`);
                    resultados.detalles.push({
                        factura: `${factura.prefijo}${factura.consecutivo}`,
                        error: errorMsg,
                    });
                }
            }

            return resultados;
        } catch (error) {
            this.logger.error(`Error general en la migración de facturas: ${error.message}`);
            throw error;
        }
    }

    async migrarCartera(mes: number, year: number, empresaId: number) {
        this.logger.log(`Iniciando migración de cartera para ${mes}/${year} - Empresa: ${empresaId}`);

        try {
            const facturas = await this.getFacturasCarteraPeriodo(mes, year, empresaId);
            this.logger.log(`Encontradas ${facturas.length} facturas de cartera para migrar.`);

            const resultados = {
                total: facturas.length,
                exitosos: 0,
                fallidos: 0,
                detalles: [],
            };

            for (const factura of facturas) {
                try {
                    await this.migrarFacturaCarteraIndividual(factura);
                    resultados.exitosos++;
                } catch (error) {
                    resultados.fallidos++;
                    const errorMsg = error.response?.data?.message || error.message;
                    this.logger.error(`Error migrando cartera ${factura.prefijo}${factura.consecutivo}: ${errorMsg}`);
                    resultados.detalles.push({
                        factura: `${factura.prefijo}${factura.consecutivo}`,
                        error: errorMsg,
                    });
                }
            }

            return resultados;
        } catch (error) {
            this.logger.error(`Error general en la migración de cartera: ${error.message}`);
            throw error;
        }
    }

    async migrarDetalles(mes: number, year: number, empresaId: number) {
        this.logger.log(`Iniciando migración de detalles para ${mes}/${year} - Empresa: ${empresaId}`);

        try {
            const detalles = await this.getFacturasDetallePeriodo(mes, year, empresaId);
            this.logger.log(`Encontrados ${detalles.length} detalles para migrar.`);

            const resultados = {
                total: detalles.length,
                exitosos: 0,
                fallidos: 0,
                detalles: [],
            };

            for (const detalle of detalles) {
                try {
                    await this.migrarFacturaDetalleIndividual(detalle);
                    resultados.exitosos++;
                } catch (error) {
                    resultados.fallidos++;
                    const errorMsg = error.response?.data?.message || error.message;
                    this.logger.error(`Error migrando detalle de factura ${detalle.prefijo}${detalle.consecutivo} linea ${detalle.linea}: ${errorMsg}`);
                    resultados.detalles.push({
                        factura: `${detalle.prefijo}${detalle.consecutivo} - L${detalle.linea}`,
                        error: errorMsg,
                    });
                }
            }

            return resultados;
        } catch (error) {
            this.logger.error(`Error general en la migración de detalles: ${error.message}`);
            throw error;
        }
    }
}
