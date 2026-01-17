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

    async getFacturasPeriodo(mes: number, year: number, empresaId: number) {
        const query = `
        SELECT 
          '01' as empresa, 
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
        WHERE mes = $1 AND year = $2 AND empresa_id = $3
      `;
        return this.dataSource.query(query, [mes, year, empresaId]);
    }

    async getFacturasCarteraPeriodo(mes: number, year: number, empresaId: number) {
        // User provided query:
        // SELECT '01' as empresa, year as perdiodo, mes, prefijo, factura as consecutivo, 1 as centro_costos, 1 as tramite, 
        // ident as nit, nombre, fecha_factura as fecha, fecha_factura as fecha_documento, valor_total as debito, 0 as credito, 0 as banco, direccion, 1 as cuenta, 'Registro inicial de factura' as descripcion
        // FROM public.view_facturas where mes=? and year=?;
        const query = `
          SELECT 
            '01' as empresa, 
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
          WHERE mes = $1 AND year = $2 AND empresa_id = $3
        `;
        return this.dataSource.query(query, [mes, year, empresaId]);
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
                    this.logger.log(`Factura ${factura.prefijo}${factura.consecutivo} migrada exitosamente.`);
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
            this.logger.error(`Error general en la migración: ${error.message}`);
            throw error;
        }
    }
}
