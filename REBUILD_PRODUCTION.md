# Instrucciones para Actualizar Producción

## Error: column Empresa.clave does not exist

Este error ocurre porque el servidor en producción está ejecutando código compilado antiguo.

## Solución

Ejecuta los siguientes comandos en el servidor de producción:

```bash
# 1. Navegar al directorio del backend
cd /ruta/al/proyecto/backend

# 2. Detener el servidor (si usas PM2)
pm2 stop acueducto
# O si usas otro método, detener el proceso correspondiente

# 3. Limpiar archivos compilados anteriores
rm -rf dist

# 4. Recompilar el proyecto
npm run build

# 5. Reiniciar el servidor
pm2 start acueducto
# O el comando que uses para iniciar tu aplicación
```

## Si usas PM2 con ecosystem config

```bash
cd /ruta/al/proyecto/backend
pm2 stop acueducto
rm -rf dist
npm run build
pm2 restart acueducto
```

## Verificación

Después de reiniciar, verifica los logs:

```bash
pm2 logs acueducto --lines 50
```

El error "column Empresa.clave does not exist" debe desaparecer.

## Notas

- La columna `clave` ya fue eliminada de la entidad Empresa.entity.ts
- El código actual NO tiene referencias a esta columna
- El problema es únicamente código compilado viejo en el servidor

## Archivos modificados en esta sesión

- `backend/src/entities/empresa.entity.ts` - Columnas `email`, `clave`, `usuario` eliminadas previamente
- `src/pages/EnviarDianPage.vue` - Diálogo de éxito agregado
- `backend/src/dian/dian.service.ts` - Servicio completo para envío a DIAN
