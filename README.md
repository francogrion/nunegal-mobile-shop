# Mobile Shop

Mini aplicación SPA para comprar dispositivos móviles, desarrollada como prueba técnica de front-end.

Consta de dos vistas:

- **PLP (Product List Page)**: listado de productos con búsqueda en tiempo real por marca y modelo.
- **PDP (Product Details Page)**: imagen, especificaciones y selección de almacenamiento y color para añadir el producto a la cesta.

## Requisitos

- Node.js `>= 22.22` (mínimo exigido por React Router 8); la versión de referencia está en [`.nvmrc`](.nvmrc) y con nvm basta con `nvm use`
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
- **[React Router 8](https://reactrouter.com/)** en modo declarativo para el enrutado en cliente.
- **CSS Modules** para los estilos de cada componente, sobre unas variables de diseño globales (colores, espaciados).
- **[Vitest](https://vitest.dev/)** + **[Testing Library](https://testing-library.com/)** (sobre jsdom) para los tests, y **[MSW](https://mswjs.io/)** para simular la API a nivel de red.
- **[ESLint](https://eslint.org/)** (reglas recomendadas, reglas de hooks de React y de Fast Refresh) y **[Prettier](https://prettier.io/)** para la calidad y el formato del código.

El proyecto se generó a partir de la plantilla oficial `create-vite` (`react`), sustituyendo el linter de la plantilla por ESLint + Prettier y añadiendo la configuración de tests.

## Metodología: TDD

El proyecto se desarrolla siguiendo **Test-Driven Development** con el ciclo _red → green → refactor_:

1. **Red**: se escribe un test que describe el siguiente comportamiento y se comprueba que falla por el motivo esperado.
2. **Green**: se escribe el código mínimo para que el test pase.
3. **Refactor**: con los tests en verde, se mejora el diseño del código sin cambiar su comportamiento.

Algunas convenciones seguidas en los tests:

- Se prueba el **comportamiento observable**, no la implementación: los tests de la capa de API simulan la red con MSW en lugar de mockear `fetch`, y cualquier petición no declarada hace fallar el test, de modo que nunca se llama a la API real.
- Los datos de prueba ([`src/test/fixtures`](src/test/fixtures)) son **respuestas reales de la API**, con sus erratas y rarezas, para que los tests ejerciten los mismos datos que recibe la aplicación.
- Cada commit deja el proyecto en verde (tests, lint y build).

## Estructura

```text
src/
├── api/              Capa de acceso a datos
│   ├── cache.js        Caché clave-valor en localStorage con expiración
│   ├── config.js       URL base de la API y tiempo de vida de la caché
│   ├── httpClient.js   Cliente HTTP (fetch + errores tipados ApiError)
│   ├── normalizers.js  Adaptadores de la respuesta de la API al modelo de la app
│   └── products.js     Servicio de productos y cesta (con caché)
├── components/       Componentes reutilizables (Header, Layout, ProductCard, SearchBar)
├── hooks/            Hooks de datos (useProducts)
├── pages/            Una carpeta por ruta (ProductListPage, NotFoundPage)
├── styles/           Estilos globales y variables de diseño
├── test/             Configuración de tests, helpers, servidor MSW y fixtures
├── utils/            Funciones puras (formato de precio, filtrado de productos)
├── App.jsx           Definición de rutas
└── main.jsx          Punto de entrada (monta el router)
```

Los tests conviven junto al código que prueban (`*.test.js` / `*.test.jsx`).

## Funcionalidades

### Listado de productos (`/`)

- Muestra todos los productos de la API en una **cuadrícula adaptable**: 1 columna en móvil y 2, 3 o 4 columnas según el ancho de pantalla (máximo 4).
- Cada tarjeta muestra imagen, marca, modelo y precio, y enlaza al detalle del producto (`/product/:id`).
- **Búsqueda en tiempo real** por marca y modelo: se filtra con cada pulsación, sin distinguir mayúsculas, y cada palabra buscada debe aparecer en la marca o el modelo en cualquier orden (`z6 acer` encuentra _Acer Liquid Z6_).
- La búsqueda se guarda en la URL (`/?search=jade`), de forma que se puede compartir y se conserva al volver atrás desde un producto.
- Una región de estado accesible anuncia la carga y el número de resultados, y hay un mensaje específico cuando ninguna coincide.
- Si la API falla, se muestra un aviso con un botón para reintentar.

Los precios se muestran en euros con formato español (`170 €`); la API no indica la moneda, así que se asume euro.

Las rutas desconocidas muestran una página 404 con un enlace de vuelta al catálogo.

## API

Todas las peticiones se hacen contra `https://itx-frontend-test.onrender.com`. La URL se puede sobrescribir con la variable de entorno `VITE_API_BASE_URL` (por ejemplo en un fichero `.env.local`).

| Método | Ruta               | Uso                                                              |
| ------ | ------------------ | ---------------------------------------------------------------- |
| `GET`  | `/api/product`     | Listado de productos.                                            |
| `GET`  | `/api/product/:id` | Detalle de un producto.                                          |
| `POST` | `/api/cart`        | Añade un producto a la cesta (`id`, `colorCode`, `storageCode`). |

### Caché en cliente

Las respuestas de `GET /api/product` y `GET /api/product/:id` se guardan en `localStorage` durante **1 hora**; pasado ese tiempo se consideran caducadas y se vuelven a pedir a la API. Además:

- Se guardan las **respuestas en bruto** y se normalizan al leerlas, de forma que un cambio en los normalizadores nunca tiene que lidiar con datos guardados por una versión anterior.
- Las llamadas **simultáneas** al mismo recurso comparten una única petición.
- Las peticiones **fallidas no se guardan**, para poder reintentarlas.
- Si `localStorage` no está disponible o está lleno, la aplicación sigue funcionando sin caché.
- `POST /api/cart` nunca se cachea.

### Observaciones sobre la API

Antes de empezar a desarrollar se analizaron las respuestas reales de la API. Estas son las particularidades encontradas y cómo se tratan en la aplicación:

- **`POST /api/cart` siempre devuelve `{ "count": 1 }`**: el servicio no guarda estado entre peticiones, así que usar el valor tal cual dejaría la cesta siempre en 1. El contador de la cabecera acumulará en cliente el `count` de cada respuesta y se persistirá en `localStorage`.
- **Arranque en frío**: la API está alojada en Render y, tras un tiempo sin uso, la primera petición puede tardar en torno a un minuto. La caché en cliente evita repetir peticiones y comparte las simultáneas; la interfaz muestra estados de carga y de error con opción de reintento.
- **Precios vacíos**: el precio llega como texto y algunos productos lo tienen vacío (`""`). Se convierte a número, o a `null` cuando no hay precio, y estos productos se muestran como _Precio no disponible_.
- **Nombres de campo con erratas** (`dimentions`, `secondaryCmera`) y **campos intercambiados** (`displayResolution` contiene el tamaño en pulgadas y `displaySize` la resolución en píxeles). La respuesta se normaliza en la capa de API ([`normalizers.js`](src/api/normalizers.js)), de forma que los componentes trabajan con un modelo limpio.
- **Tipos no homogéneos**: campos como `primaryCamera` llegan unas veces como array y otras como texto; se normalizan siempre a array.
- **Unidades implícitas**: el peso llega como texto sin unidad (`"260"`); se convierte a número y se mostrará en gramos.

## Hitos

El desarrollo se organiza en hitos incrementales, cada uno reflejado en el historial de commits:

- [x] **1. Proyecto base**: Vite + React, tests, lint, formato y README.
- [x] **2. Capa de API y caché**: cliente HTTP, normalización de datos y caché en cliente con expiración de 1 hora.
- [x] **3. Listado (PLP)**: enrutado, cuadrícula adaptable de hasta 4 columnas y búsqueda en tiempo real.
- [ ] **4. Detalle (PDP)**: vista en dos columnas con imagen, especificaciones y selectores de opciones.
- [ ] **5. Cesta y cabecera**: añadir a la cesta, contador persistido y breadcrumbs.
- [ ] **6. Pulido**: accesibilidad, estados de carga y error, y ampliación de tests.
