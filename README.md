# Mobile Shop

Mini aplicación SPA para comprar dispositivos móviles, desarrollada como prueba técnica de front-end.

Consta de dos vistas:

- **PLP (Product List Page)**: listado de productos con búsqueda en tiempo real por marca y modelo.
- **PDP (Product Details Page)**: imagen, especificaciones y selección de almacenamiento y color para añadir el producto a la cesta.

## Requisitos

- Node.js `>= 22.13` (la versión de referencia está en [`.nvmrc`](.nvmrc); con nvm basta con `nvm use`)
- npm `>= 10`

## Puesta en marcha

```bash
npm install
npm start
```

La aplicación queda disponible en <http://localhost:5173>.

## Scripts

| Script               | Descripción                                                |
| -------------------- | ---------------------------------------------------------- |
| `npm start`          | Arranca el servidor de desarrollo con recarga en caliente. |
| `npm run build`      | Genera la versión de producción en `dist/`.                |
| `npm run preview`    | Sirve en local la versión de producción generada.          |
| `npm test`           | Ejecuta la batería de tests una vez.                       |
| `npm run test:watch` | Ejecuta los tests en modo observación.                     |
| `npm run lint`       | Comprueba el código con ESLint y el formato con Prettier.  |
| `npm run format`     | Formatea el código con Prettier.                           |

## Stack

- **[React 19](https://react.dev/)** con **[Vite](https://vite.dev/)** como bundler y servidor de desarrollo.
- **[Vitest](https://vitest.dev/)** + **[Testing Library](https://testing-library.com/)** (sobre jsdom) para los tests.
- **[ESLint](https://eslint.org/)** (reglas recomendadas, reglas de hooks de React y de Fast Refresh) y **[Prettier](https://prettier.io/)** para la calidad y el formato del código.

El proyecto se generó a partir de la plantilla oficial `create-vite` (`react`), sustituyendo el linter de la plantilla por ESLint + Prettier y añadiendo la configuración de tests.

## API

Todas las peticiones se hacen contra `https://itx-frontend-test.onrender.com`.

| Método | Ruta               | Uso                                                              |
| ------ | ------------------ | ---------------------------------------------------------------- |
| `GET`  | `/api/product`     | Listado de productos.                                            |
| `GET`  | `/api/product/:id` | Detalle de un producto.                                          |
| `POST` | `/api/cart`        | Añade un producto a la cesta (`id`, `colorCode`, `storageCode`). |

### Observaciones sobre la API

Antes de empezar a desarrollar se analizaron las respuestas reales de la API. Estas son las particularidades encontradas y cómo se van a tratar en la aplicación:

- **`POST /api/cart` siempre devuelve `{ "count": 1 }`**: el servicio no guarda estado entre peticiones, así que usar el valor tal cual dejaría la cesta siempre en 1. El contador de la cabecera acumulará en cliente el `count` de cada respuesta y se persistirá en `localStorage`.
- **Arranque en frío**: la API está alojada en Render y, tras un tiempo sin uso, la primera petición puede tardar en torno a un minuto. La aplicación mostrará estados de carga y de error con opción de reintento, y la caché en cliente reducirá el número de peticiones.
- **Precios vacíos**: el precio llega como texto y algunos productos lo tienen vacío (`""`). Estos productos se mostrarán como _precio no disponible_.
- **Nombres de campo con erratas** (`dimentions`, `secondaryCmera`) y **campos intercambiados** (`displayResolution` contiene el tamaño en pulgadas y `displaySize` la resolución en píxeles). La respuesta se normalizará en la capa de API, de forma que los componentes trabajen con un modelo limpio.
- **Tipos no homogéneos**: campos como `primaryCamera` llegan unas veces como array y otras como texto; también se normalizarán.
- **Unidades implícitas**: el peso llega sin unidad (`"260"`) y se mostrará en gramos.

## Hitos

El desarrollo se organiza en hitos incrementales, cada uno reflejado en el historial de commits:

- [x] **1. Proyecto base**: Vite + React, tests, lint, formato y README.
- [ ] **2. Capa de API y caché**: cliente HTTP, normalización de datos y caché en cliente con expiración de 1 hora.
- [ ] **3. Listado (PLP)**: enrutado, cuadrícula adaptable de hasta 4 columnas y búsqueda en tiempo real.
- [ ] **4. Detalle (PDP)**: vista en dos columnas con imagen, especificaciones y selectores de opciones.
- [ ] **5. Cesta y cabecera**: añadir a la cesta, contador persistido y breadcrumbs.
- [ ] **6. Pulido**: accesibilidad, estados de carga y error, y ampliación de tests.
