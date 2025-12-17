import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Nomina } from '../entities/nomina.entity';
import { NominaDetalle } from '../entities/nomina-detalle.entity';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { EmpleadosService } from '../empleados/empleados.service';
import { PeriodosNominaService } from '../periodos-nomina/periodos-nomina.service';
import { ConceptosNominaService } from '../conceptos-nomina/conceptos-nomina.service';

@Injectable()
export class NominasService {
  constructor(
    @InjectRepository(Nomina)
    private readonly nominaRepository: Repository<Nomina>,
    @InjectRepository(NominaDetalle)
    private readonly detalleRepository: Repository<NominaDetalle>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => EmpleadosService))
    private readonly empleadosService: EmpleadosService,
    @Inject(forwardRef(() => PeriodosNominaService))
    private readonly periodosService: PeriodosNominaService,
    @Inject(forwardRef(() => ConceptosNominaService))
    private readonly conceptosService: ConceptosNominaService,
  ) { }

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      let query = `
        SELECT
          n.id,
          n.periodo_id,
          n.empleado_id,
          n.salario_mensual,
          n.valor_hora,
          n.dias_pagados,
          n.total_devengado,
          n.total_deducciones,
          n.neto_pagar,
          n.estado,
          n.observaciones,
          n.empresa_id,
          n.fecha_creacion,
          e.cedula,
          e.nombre_completo as empleado_nombre,
          p.nombre as periodo_nombre,
          p.fecha_inicio,
          p.fecha_fin
        FROM public.nominas n
        INNER JOIN public.empleados e ON n.empleado_id = e.id
        INNER JOIN public.periodos_nomina p ON n.periodo_id = p.id
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCount = 1;

      if (filters.empresaId) {
        query += ` AND n.empresa_id = $${paramCount}`;
        queryParams.push(filters.empresaId);
        paramCount++;
      }

      if (filters.periodoId) {
        query += ` AND n.periodo_id = $${paramCount}`;
        queryParams.push(filters.periodoId);
        paramCount++;
      }

      if (filters.estado) {
        query += ` AND n.estado = $${paramCount}`;
        queryParams.push(filters.estado);
        paramCount++;
      }

      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      const totalResult = await this.nominaRepository.query(countQuery, queryParams);
      const total = parseInt(totalResult[0].count);

      query += ` ORDER BY n.id DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      const data = await this.nominaRepository.query(query, queryParams);

      return { data, total, page, limit };
    } catch (error) {
      throw new Error(`Error al obtener nóminas: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const nomina = await this.nominaRepository.findOne({
        where: { id },
        relations: ['empleado', 'periodo', 'detalles', 'detalles.concepto'],
      });

      if (!nomina) {
        throw new Error(`Nómina con ID ${id} no encontrada`);
      }

      return nomina;
    } catch (error) {
      throw new Error(`Error al obtener nómina: ${error.message}`);
    }
  }

  async create(createNominaDto: CreateNominaDto & { empresaId: number; usuarioCreacion: number }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar que no exista ya una nómina para este período y empleado
      const existing = await queryRunner.query(
        'SELECT id FROM nominas WHERE periodo_id = $1 AND empleado_id = $2 AND empresa_id = $3',
        [createNominaDto.periodoId, createNominaDto.empleadoId, createNominaDto.empresaId]
      );

      if (existing.length > 0) {
        throw new Error('Ya existe una nómina para este empleado en este período');
      }

      // Obtener datos del empleado y período
      const empleado = await this.empleadosService.findOne(createNominaDto.empleadoId);
      const periodo = await this.periodosService.findOne(createNominaDto.periodoId);

      if (!empleado || !periodo) {
        throw new Error('Empleado o período no encontrado');
      }

      // Calcular valor hora (salario_mensual / 220)
      const valorHora = Number(empleado.salario_mensual) / 220;

      // Crear nómina
      const nomina = this.nominaRepository.create({
        periodoId: createNominaDto.periodoId,
        empleadoId: createNominaDto.empleadoId,
        salarioMensual: Number(empleado.salario_mensual),
        valorHora: valorHora,
        diasPagados: periodo.dias_periodo,
        totalDevengado: 0,
        totalDeducciones: 0,
        netoPagar: 0,
        estado: 'BORRADOR',
        observaciones: createNominaDto.observaciones,
        empresaId: createNominaDto.empresaId,
        usuarioCreacion: createNominaDto.usuarioCreacion,
      });

      const savedNomina = await queryRunner.manager.save(nomina);
      await queryRunner.commitTransaction();

      return savedNomina;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al crear nómina: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async generarNominasParaPeriodo(periodoId: number, empresaId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener período
      const periodo = await this.periodosService.findOne(periodoId);
      if (!periodo || periodo.empresaId !== empresaId) {
        throw new Error('Período no encontrado');
      }

      // Obtener empleados activos
      const empleados = await this.empleadosService.findAll(1, 1000, { empresaId, activo: true });

      const nominasCreadas = [];

      for (const empleado of empleados.data) {
        // Verificar si ya existe nómina
        const existing = await queryRunner.query(
          'SELECT id FROM nominas WHERE periodo_id = $1 AND empleado_id = $2',
          [periodoId, empleado.id]
        );

        if (existing.length > 0) {
          continue; // Ya existe, saltar
        }

        // Calcular valor hora
        const valorHora = Number(empleado.salario_mensual) / 220;

        // Crear nómina
        const nomina = this.nominaRepository.create({
          periodoId: periodoId,
          empleadoId: empleado.id,
          salarioMensual: Number(empleado.salario_mensual),
          valorHora: valorHora,
          diasPagados: periodo.dias_periodo,
          totalDevengado: 0,
          totalDeducciones: 0,
          netoPagar: 0,
          estado: 'BORRADOR',
          empresaId: empresaId,
          usuarioCreacion: userId,
        });

        const savedNomina = await queryRunner.manager.save(nomina);
        nominasCreadas.push(savedNomina);
      }

      await queryRunner.commitTransaction();
      return { message: `Se generaron ${nominasCreadas.length} nóminas`, nominas: nominasCreadas };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al generar nóminas: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async calcularNomina(nominaId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nomina = await this.findOne(nominaId);
      if (!nomina) {
        throw new Error('Nómina no encontrada');
      }

      // Obtener conceptos activos
      const conceptos = await this.conceptosService.findAll(1, 1000, { empresaId: nomina.empresaId, activo: true });

      // Eliminar detalles existentes
      await queryRunner.query('DELETE FROM nomina_detalle WHERE nomina_id = $1', [nominaId]);

      let totalDevengado = 0;
      let totalDeducciones = 0;

      // Calcular salario básico del período
      // Para períodos de 15 días: salario_mensual / 2
      // Para otros períodos: (salario_mensual / 30) * dias_pagados
      const salarioBasico = nomina.diasPagados === 15
        ? Number(nomina.salarioMensual) / 2
        : (Number(nomina.salarioMensual) / 30) * nomina.diasPagados;
      
      // Buscar concepto de salario básico
      const conceptoBasico = conceptos.data.find(c => c.subtipo === 'BASICO' && c.tipo === 'DEVENGADO');
      if (conceptoBasico) {
        const detalleBasico = this.detalleRepository.create({
          nominaId: nominaId,
          conceptoId: conceptoBasico.id,
          cantidad: nomina.diasPagados,
          valorUnitario: Number(nomina.salarioMensual) / 30,
          valorTotal: salarioBasico,
          empresaId: nomina.empresaId,
          usuarioCreacion: nomina.usuarioCreacion,
        });
        await queryRunner.manager.save(detalleBasico);
        totalDevengado += salarioBasico;
      }

      // Calcular horas extras
      const horasExtras = await queryRunner.query(
        `SELECT * FROM horas_extras WHERE periodo_id = $1 AND empleado_id = $2 AND aprobado = true`,
        [nomina.periodoId, nomina.empleadoId]
      );

      for (const he of horasExtras) {
        const conceptoHE = conceptos.data.find(c => 
          (c.subtipo === 'HORA_EXTRA_DIURNA' && he.tipo === 'DIURNA') ||
          (c.subtipo === 'HORA_EXTRA_FESTIVA' && he.tipo === 'FESTIVA')
        );

        if (conceptoHE) {
          const detalleHE = this.detalleRepository.create({
            nominaId: nominaId,
            conceptoId: conceptoHE.id,
            cantidad: Number(he.cantidad_horas),
            valorUnitario: Number(he.valor_hora),
            valorTotal: Number(he.valor_total),
            empresaId: nomina.empresaId,
            usuarioCreacion: nomina.usuarioCreacion,
          });
          await queryRunner.manager.save(detalleHE);
          totalDevengado += Number(he.valor_total);
        }
      }

      // Calcular auxilio de transporte
      const empleado = await this.empleadosService.findOne(nomina.empleadoId);
      if (empleado.auxilio_transporte) {
        const conceptoAux = conceptos.data.find(c => c.subtipo === 'AUXILIO_TRANSPORTE');
        if (conceptoAux) {
          // Obtener valor del auxilio de transporte desde parámetros
          const anio = new Date().getFullYear();
          const paramAux = await queryRunner.query(
            `SELECT valor FROM parametros_nomina
             WHERE codigo LIKE 'AUX_TRANSPORTE%' AND empresa_id = $1 AND anio = $2
             ORDER BY anio DESC LIMIT 1`,
            [nomina.empresaId, anio]
          );
          const valorAuxMensual = paramAux.length > 0 ? Number(paramAux[0].valor) : 200000;
          // Para períodos de 15 días: auxilio / 2
          // Para otros períodos: (auxilio / 30) * dias_pagados
          const valorAuxPeriodo = nomina.diasPagados === 15
            ? Number(valorAuxMensual) / 2
            : (Number(valorAuxMensual) / 30) * nomina.diasPagados;

          const detalleAux = this.detalleRepository.create({
            nominaId: nominaId,
            conceptoId: conceptoAux.id,
            cantidad: 1,
            valorUnitario: valorAuxPeriodo,
            valorTotal: valorAuxPeriodo,
            empresaId: nomina.empresaId,
            usuarioCreacion: nomina.usuarioCreacion,
          });
          await queryRunner.manager.save(detalleAux);
          totalDevengado += valorAuxPeriodo;
        }
      }

      // Calcular deducciones (Salud y Pensión - 4% cada una)
      const deducciones = conceptos.data.filter(c => c.tipo === 'DEDUCCION');
      for (const ded of deducciones) {
        if (ded.porcentaje) {
          const valorDeduccion = salarioBasico * (Number(ded.porcentaje) / 100);
          const detalleDed = this.detalleRepository.create({
            nominaId: nominaId,
            conceptoId: ded.id,
            cantidad: 1,
            valorUnitario: valorDeduccion,
            valorTotal: valorDeduccion,
            empresaId: nomina.empresaId,
            usuarioCreacion: nomina.usuarioCreacion,
          });
          await queryRunner.manager.save(detalleDed);
          totalDeducciones += valorDeduccion;
        }
      }

      // Calcular otros pagos
      const otrosPagos = await queryRunner.query(
        `SELECT * FROM otros_pagos WHERE periodo_id = $1 AND empleado_id = $2 AND aprobado = true`,
        [nomina.periodoId, nomina.empleadoId]
      );

      for (const op of otrosPagos) {
        const conceptoOP = conceptos.data.find(c => c.subtipo === 'OTRO');
        if (conceptoOP) {
          const detalleOP = this.detalleRepository.create({
            nominaId: nominaId,
            conceptoId: conceptoOP.id,
            cantidad: 1,
            valorUnitario: Number(op.valor),
            valorTotal: Number(op.valor),
            observaciones: op.concepto,
            empresaId: nomina.empresaId,
            usuarioCreacion: nomina.usuarioCreacion,
          });
          await queryRunner.manager.save(detalleOP);
          
          if (op.tipo === 'INGRESO') {
            totalDevengado += Number(op.valor);
          } else {
            totalDeducciones += Number(op.valor);
          }
        }
      }

      // Actualizar totales
      const netoPagar = totalDevengado - totalDeducciones;

      await queryRunner.query(
        `UPDATE nominas SET 
          total_devengado = $1, 
          total_deducciones = $2, 
          neto_pagar = $3 
        WHERE id = $4`,
        [totalDevengado, totalDeducciones, netoPagar, nominaId]
      );

      await queryRunner.commitTransaction();
      return await this.findOne(nominaId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al calcular nómina: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async aprobarNomina(nominaId: number, userId: number, observaciones?: string) {
    try {
      const nomina = await this.findOne(nominaId);
      if (nomina.estado !== 'BORRADOR') {
        throw new Error('Solo se pueden aprobar nóminas en estado BORRADOR');
      }

      await this.nominaRepository.update(nominaId, {
        estado: 'APROBADO',
        fechaAprobacion: new Date(),
        usuarioAprobacion: userId,
        observaciones: observaciones || nomina.observaciones,
      });

      return await this.findOne(nominaId);
    } catch (error) {
      throw new Error(`Error al aprobar nómina: ${error.message}`);
    }
  }

  async marcarComoPagado(nominaId: number) {
    try {
      const nomina = await this.findOne(nominaId);
      if (nomina.estado !== 'APROBADO') {
        throw new Error('Solo se pueden marcar como pagadas nóminas en estado APROBADO');
      }

      await this.nominaRepository.update(nominaId, {
        estado: 'PAGADO',
      });

      return await this.findOne(nominaId);
    } catch (error) {
      throw new Error(`Error al marcar nómina como pagada: ${error.message}`);
    }
  }

  async update(id: number, updateNominaDto: UpdateNominaDto) {
    try {
      await this.nominaRepository.update(id, updateNominaDto);
      return await this.findOne(id);
    } catch (error) {
      throw new Error(`Error al actualizar nómina: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const nomina = await this.findOne(id);
      if (nomina.estado === 'PAGADO') {
        throw new Error('No se puede eliminar una nómina pagada');
      }
      await this.nominaRepository.delete(id);
      return { message: 'Nómina eliminada exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar nómina: ${error.message}`);
    }
  }

  async crearHoraExtra(dto: any) {
    try {
      const empleado = await this.empleadosService.findOne(dto.empleadoId);
      const valorHora = Number(empleado.salario_mensual) / 220;
      
      let valorHoraExtra = valorHora;
      if (dto.tipo === 'DIURNA') {
        valorHoraExtra = valorHora * 1.25; // 25% recargo
      } else if (dto.tipo === 'FESTIVA') {
        valorHoraExtra = valorHora * 1.75; // 75% recargo
      }

      const valorTotal = valorHoraExtra * Number(dto.cantidadHoras);

      const query = `
        INSERT INTO horas_extras (empleado_id, periodo_id, fecha, tipo, cantidad_horas, valor_hora, valor_total, aprobado, empresa_id, usuario_creacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const result = await this.dataSource.query(query, [
        dto.empleadoId,
        dto.periodoId,
        dto.fecha || new Date(),
        dto.tipo,
        dto.cantidadHoras,
        valorHoraExtra,
        valorTotal,
        dto.aprobado !== undefined ? dto.aprobado : true,
        dto.empresaId,
        dto.usuarioCreacion,
      ]);

      return result[0];
    } catch (error) {
      throw new Error(`Error al crear hora extra: ${error.message}`);
    }
  }

  async crearOtroPago(dto: any) {
    try {
      const query = `
        INSERT INTO otros_pagos (empleado_id, periodo_id, concepto, descripcion, valor, tipo, aprobado, empresa_id, usuario_creacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const result = await this.dataSource.query(query, [
        dto.empleadoId,
        dto.periodoId,
        dto.concepto,
        dto.descripcion || null,
        dto.valor,
        dto.tipo || 'INGRESO',
        dto.aprobado !== undefined ? dto.aprobado : true,
        dto.empresaId,
        dto.usuarioCreacion,
      ]);

      return result[0];
    } catch (error) {
      throw new Error(`Error al crear otro pago: ${error.message}`);
    }
  }

  async getEmpleadosConNominasParaPeriodo(periodoId: number, empresaId: number) {
    try {
      // Obtener período
      const periodo = await this.periodosService.findOne(periodoId);
      
      // Obtener empleados activos
      const empleados = await this.dataSource.query(
        `SELECT * FROM empleados WHERE activo = true AND empresa_id = $1 ORDER BY nombre_completo`,
        [empresaId]
      );

      // Obtener nóminas existentes para el período
      const nominas = await this.dataSource.query(
        `SELECT * FROM nominas WHERE periodo_id = $1 AND empresa_id = $2`,
        [periodoId, empresaId]
      );

      // Obtener horas extras
      const horasExtras = await this.dataSource.query(
        `SELECT * FROM horas_extras WHERE periodo_id = $1 AND empresa_id = $2 AND aprobado = true`,
        [periodoId, empresaId]
      );

      // Obtener otros pagos
      const otrosPagos = await this.dataSource.query(
        `SELECT * FROM otros_pagos WHERE periodo_id = $1 AND empresa_id = $2 AND aprobado = true`,
        [periodoId, empresaId]
      );

      // Combinar datos
      const resultado = empleados.map((empleado: any) => {
        const nomina = nominas.find((n: any) => n.empleado_id === empleado.id);
        const heDiurnas = horasExtras.filter((he: any) => he.empleado_id === empleado.id && he.tipo === 'DIURNA');
        const heFestivas = horasExtras.filter((he: any) => he.empleado_id === empleado.id && he.tipo === 'FESTIVA');
        const otros = otrosPagos.filter((op: any) => op.empleado_id === empleado.id);

        const totalHEDiurnas = heDiurnas.reduce((sum: number, he: any) => sum + Number(he.cantidad_horas), 0);
        const totalHEFestivas = heFestivas.reduce((sum: number, he: any) => sum + Number(he.cantidad_horas), 0);
        const totalOtros = otros.filter((op: any) => op.tipo === 'INGRESO').reduce((sum: number, op: any) => sum + Number(op.valor), 0);
        const totalDeducciones = otros.filter((op: any) => op.tipo === 'DEDUCCION').reduce((sum: number, op: any) => sum + Number(op.valor), 0);

        return {
          empleado,
          nomina: nomina || null,
          periodo,
          horasExtrasDiurnas: totalHEDiurnas,
          horasExtrasFestivas: totalHEFestivas,
          otrosPagos: totalOtros,
          otrasDeducciones: totalDeducciones,
          horasExtrasData: { diurnas: heDiurnas, festivas: heFestivas },
          otrosPagosData: otros,
        };
      });

      return resultado;
    } catch (error) {
      throw new Error(`Error al obtener empleados con nóminas: ${error.message}`);
    }
  }
}

