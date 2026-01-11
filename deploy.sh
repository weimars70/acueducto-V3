#!/bin/bash

# 1. Limpiar root
echo "Limpiando root..."
rm -rf node_modules/ dist/

# 2. Ir a backend y limpiar/construir
cd backend
echo "Limpiando backend..."
rm -rf node_modules/ dist/

echo "Instalando dependencias del backend..."
npm install

echo "Construyendo backend..."
npm run build

# 3. Volver a root y instalar/construir
cd ..
echo "Instalando dependencias del root..."
npm install

echo "Construyendo root..."
npm run build

# 4. Arrancar con PM2
echo "Arrancando aplicación..."
pm2 start ecosystem.config.cjs --env production

echo "Despliegue completado."
