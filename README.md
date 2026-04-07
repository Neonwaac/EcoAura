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

## Ejecucion del backend

```bash
npm run start
```

## Despliegue gratuito recomendado

Servicio recomendado: Alwaysdata Free. Es gratis de por vida, no pide tarjeta para registrarse y mantiene almacenamiento persistente para SQLite.

### Paso a paso

1. Crea tu cuenta en Alwaysdata Free.
2. Crea un acceso SSH desde el panel si no existe.
3. Sube el proyecto al servidor, idealmente con Git:

```bash
git clone URL_DE_TU_REPOSITORIO ecoaura
cd ecoaura
```

4. Instala dependencias desde la raiz del proyecto:

```bash
npm install
```

5. En el panel del sitio Node.js, configura lo siguiente:

- Working directory: la raiz del proyecto, por ejemplo `/home/TU_USUARIO/ecoaura`
- Start command: `npm run start`
- Internal port: el mismo valor que pongas en `PORT`

6. Define estas variables de entorno en el sitio:

```bash
NODE_ENV=production
PORT=8100
DB_PATH=/home/TU_USUARIO/ecoaura/backend/data/ecoaura.db
```

7. Guarda la configuracion e inicia el sitio.
8. Abre la URL publica y valida que cargue la interfaz.
9. Prueba crear un producto, una compra y una venta, luego recarga la pagina para confirmar que SQLite quedo persistente.

### Que hace cada comando

- `npm install` instala las dependencias de la raiz y, por el `postinstall`, tambien las de `backend` y `frontend`.
- `npm run build` compila solo el frontend.
- `npm run start` compila el frontend y luego arranca el backend en modo produccion.

### Si el panel te pide un build command

```bash
npm run build
```

### Actualizaciones futuras

Cuando hagas cambios:

```bash
cd ~/ecoaura
git pull
npm install
npm run build
```

Luego reinicia el sitio desde el panel.

## Endpoints principales

- GET /api/dashboard
- GET/POST /api/products
- PUT /api/products/:id/price
- GET/POST /api/purchases
- GET/POST /api/sales
- GET /api/customers
- GET /api/reports/sales
- GET /api/reports/summary
