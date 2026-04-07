# EcoAura - Gestion de ventas para negocio familiar

Aplicacion full-stack para administrar productos naturales, compras de inventario, ventas por cliente y reportes en Excel.

## Stack

- Backend: Node.js + Express
- Base de datos: SQLite con better-sqlite3
- Frontend: React + Vite
- UI: TailwindCSS
- Reportes: xlsx

## Estructura

- backend: API y base de datos SQLite
- frontend: interfaz React responsive

## Requisitos

- Node.js 20+
- npm

## Instalacion

1. Ejecuta:

```bash
npm install
```

Esto instala dependencias de la raiz, backend y frontend automaticamente.

## Ejecucion local (un solo comando)

```bash
npm run dev
```

Servicios:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## Variables de entorno

Puedes crear backend/.env basado en backend/.env.example:

- PORT=3001
- DB_PATH=./data/ecoaura.db

## Build de frontend

```bash
npm run build
```

## Produccion local

```bash
npm run start
```

En produccion, el backend sirve el frontend compilado desde frontend/dist.

## Despliegue en Fly.io

1. Instala Fly CLI e inicia sesion:

```bash
fly auth login
```

2. Crea la app si aun no existe:

```bash
fly apps create ecoaura-app
```

3. Crea el volumen para SQLite:

```bash
fly volumes create ecoaura_data --region bog --size 1
```

4. Despliega:

```bash
fly deploy
```

La persistencia de SQLite queda en /data/ecoaura.db gracias al volumen montado.

## Despliegue en Alwaysdata (gratis)

Este flujo funciona con el plan Free (0 EUR) y mantiene SQLite persistente en disco.

1. Crea cuenta en Alwaysdata y entra al panel de administracion.
2. Crea un acceso SSH en Remote access > SSH si aun no existe.
3. Conectate por SSH y clona el proyecto en tu carpeta personal:

ssh tu_usuario@ssh-tu_usuario.alwaysdata.net
cd ~
git clone URL_DE_TU_REPOSITORIO ecoaura
cd ecoaura

4. Instala dependencias y compila frontend:

npm install
npm run build

5. Define variables de entorno en el panel (Web > Environment o equivalente):

NODE_ENV=production
PORT=8100
DB_PATH=/home/tu_usuario/ecoaura/backend/data/ecoaura.db

6. Crea el sitio Node.js en Web > Sites > Add:

- Type: Node.js
- Address: el dominio/subdominio asignado
- Path (working directory): /home/tu_usuario/ecoaura
- Command: npm run start
- Internal port: 8100

7. Guarda, inicia el sitio y revisa logs desde el panel.
8. Abre la URL publica y prueba crear producto, compra y venta para validar persistencia.

### Actualizar despliegue despues de cambios

Con SSH en el servidor:

cd ~/ecoaura
git pull
npm install
npm run build

Luego reinicia el sitio Node.js desde el panel de Alwaysdata.

## Endpoints principales

- GET /api/dashboard
- GET/POST /api/products
- PUT /api/products/:id/price
- GET/POST /api/purchases
- GET/POST /api/sales
- GET /api/customers
- GET /api/reports/sales
- GET /api/reports/summary
