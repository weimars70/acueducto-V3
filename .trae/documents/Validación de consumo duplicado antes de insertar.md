## Objetivo

* Validar vía SELECT si ya existe un consumo para `instalacion + mes + year + medidor` antes de crear.

* Si existe, lanzar un `Error` con el mensaje solicitado.

## Cambios en Servicio

* Ubicación: `backend/src/consumo/consumo.service.ts`, método `create` (≈ línea 226).

* Añadir una consulta SQL cruda con `SELECT COALESCE(count(*),0) AS registros` sobre `public.consumo` usando `this.consumoRepository.query(...)`.

* Si `registros > 0`, lanzar el error y no insertar.

## Implementación (snippet)

```ts
async create(createConsumoDto: any) {
  try {
    const sql = `SELECT COALESCE(count(*),0) AS registros
                 FROM public.consumo
                 WHERE instalacion=$1 AND mes=$2 AND year=$3 AND medidor=$4`;

    const params = [
      createConsumoDto.instalacion,
      createConsumoDto.mes,
      createConsumoDto.year,
      createConsumoDto.medidor,
    ];

    const result = await this.consumoRepository.query(sql, params);
    const registros = parseInt(result?.[0]?.registros ?? '0', 10);

    if (registros > 0) {
      throw new Error(
        `Ya existe un consumo para la instalación ${createConsumoDto.instalacion} en el mes ${createConsumoDto.mes} y año ${createConsumoDto.year} con el medidor ${createConsumoDto.medidor}`,
      );
    }

    const consumptionData = {
      instalacion: createConsumoDto.instalacion,
      lectura: createConsumoDto.lectura,
      fecha: createConsumoDto.fecha,
      consumo: createConsumoDto.consumo,
      mes: createConsumoDto.mes,
      year: createConsumoDto.year,
      medidor: createConsumoDto.medidor,
      otrosCobros: createConsumoDto.otrosCobros,
      reconexion: createConsumoDto.reconexion,
      usuario: createConsumoDto.usuario,
    };

    const consumption = this.consumoRepository.create(consumptionData);
    return await this.consumoRepository.save(consumption);
  } catch (error) {
    throw new Error(`Error al crear consumo: ${error.message}`);
  }
}
```

## Mensaje de error

* Texto: `Ya existe un consumo para la instalación ${instalacion} en el mes ${mes} y año ${year} con el medidor ${medidor}`.

## Verificación

* Enviar `POST /consumo` con datos de una combinación existente: debe lanzar el error anterior.

* Enviar `POST /consumo` con combinación nueva: debe crear y devolver el registro.

## Consideraciones

* Se mantiene el estilo actual del servicio lanzando `Error`.

* No se modifican puertos ni se reinicia el servidor automáticamente.

