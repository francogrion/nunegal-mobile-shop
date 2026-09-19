# Mobile Shop

[![CI](https://github.com/francogrion/nunegal-mobile-shop/actions/workflows/ci.yml/badge.svg)](https://github.com/francogrion/nunegal-mobile-shop/actions/workflows/ci.yml)
[![E2E](https://github.com/francogrion/nunegal-mobile-shop/actions/workflows/e2e.yml/badge.svg)](https://github.com/francogrion/nunegal-mobile-shop/actions/workflows/e2e.yml)

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

| Script                  | Descripción                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `npm start`             | Arranca el servidor de desarrollo con recarga en caliente.                               |
| `npm run build`         | Genera la versión de producción en `dist/`.                                              |
| `npm run preview`       | Sirve en local la versión de producción generada.                                        |
| `npm test`              | Ejecuta la batería de tests una vez.                                                     |
| `npm run test:watch`    | Ejecuta los tests en modo observación.                                                   |
| `npm run test:coverage` | Ejecuta los tests y genera el informe de cobertura en `coverage/`.                       |
| `npm run test:e2e`      | Ejecuta los tests end-to-end con Playwright (ver [Tests end-to-end](#tests-end-to-end)). |
| `npm run lint`          | Comprueba el código con ESLint y el formato con Prettier.                                |
| `npm run format`        | Formatea el código con Prettier.                                                         |

## Stack

- **[React 19](https://react.dev/)** con **[Vite](https://vite.dev/)** como bundler y servidor de desarrollo.
- **[React Router 8](https://reactrouter.com/)** en modo declarativo para el enrutado en cliente.
- **CSS Modules** para los estilos de cada componente, sobre unas variables de diseño globales (colores, tipografías, espaciados).
- Tipografías **Inter**, **Space Grotesk** y **JetBrains Mono** servidas desde el propio proyecto con [Fontsource](https://fontsource.org/), e iconos de [Tabler](https://tabler.io/icons) como componentes de React.
- **[Vitest](https://vitest.dev/)** + **[Testing Library](https://testing-library.com/)** (sobre jsdom) para los tests, y **[MSW](https://mswjs.io/)** para simular la API a nivel de red.
- **[Playwright](https://playwright.dev/)** + **[axe](https://github.com/dequelabs/axe-core-npm)** para los tests end-to-end y la auditoría automática de accesibilidad.
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
- El estado compartido (almacenamiento, peticiones en curso, temporizadores simulados) se reinicia tras cada test, de modo que un test que falla no arrastra a los demás.

### Calidad

- **Integración continua** con GitHub Actions ([`ci.yml`](.github/workflows/ci.yml)): en cada push a `main` y en cada pull request se ejecutan lint, tests con cobertura y build.
- **Cobertura** cercana al 100 % (`npm run test:coverage`). Los huecos que detectó el informe se cubrieron con tests de comportamiento; al haberse escrito después del código, se comprobó que cada uno falla si se elimina la lógica que protege.
- **Accesibilidad** verificada desde los tests: se consulta la interfaz por roles y nombres accesibles (como lo haría un lector de pantalla), con regiones de estado para cargas y resultados, alertas para errores, migas de pan con `aria-current` y selectores como grupos de botones de opción. Además, los tests end-to-end auditan cada página con axe (WCAG 2.1 AA).

### Tests end-to-end

Los tests de [`e2e/`](e2e) recorren la aplicación como lo haría un usuario, con Playwright, contra el **build de producción** (`vite preview`) y la **API real**. Complementan a los tests de integración con MSW: estos detectan, por ejemplo, cambios en el contrato de la API o problemas que solo aparecen en un navegador real.

- Se ejecutan en Chromium con dos perfiles: **escritorio** y **móvil** (Pixel 7), lo que también verifica la cuadrícula de 4 columnas y 1 columna respectivamente.
- Cubren listado y búsqueda, caché (una recarga no vuelve a llamar a la API), detalle, cesta (el contador sobrevive a recargas y cambios de página), navegación, página 404 y la auditoría de accesibilidad.
- Antes de empezar, una configuración global [despierta la API](e2e/global-setup.js), que puede tardar un minuto en responder tras un tiempo sin uso. En CI se reintentan los fallos transitorios y se guarda el informe de Playwright con trazas.
- Se ejecutan en un workflow propio ([`e2e.yml`](.github/workflows/e2e.yml)), para que una caída de la API externa no oculte el estado de los checks del código.

La primera vez hay que descargar el navegador:

```bash
npx playwright install chromium
npm run test:e2e
```

Estos tests ya encontraron un error que los de jsdom no podían ver: al escribir rápido en el buscador se perdían caracteres. El buscador toma su valor de la URL y React Router aplicaba los cambios de URL como _transiciones_ de React, que pueden retrasarse; en jsdom, `act()` las resuelve al instante. Se corrigió desactivando las transiciones del router, que la aplicación no necesita.

## Estructura

```text
e2e/                  Tests end-to-end con Playwright (API real)
src/
├── api/              Capa de acceso a datos
│   ├── cache.js        Caché clave-valor en localStorage con expiración
│   ├── config.js       URL base de la API y tiempo de vida de la caché
│   ├── httpClient.js   Cliente HTTP (fetch + errores tipados ApiError)
│   ├── normalizers.js  Adaptadores de la respuesta de la API al modelo de la app
│   └── products.js     Servicio de productos y cesta (con caché)
├── components/       Componentes reutilizables (Header, Breadcrumbs, Layout, CircuitBackground,
│                     ProductCard, SearchBar, ProductHighlights, ProductSpecs,
│                     ProductActions, OptionSelector, ProductImage…)
├── hooks/            Hooks (useResource y sus envoltorios useProducts / useProduct,
│                     useCartCount, useAddToCart)
├── pages/            Una carpeta por ruta (ProductListPage, ProductDetailPage, NotFoundPage)
├── store/            Estado global de la cesta (cartStore)
├── styles/           Estilos globales y variables de diseño
├── test/             Configuración de tests, helpers, servidor MSW y fixtures
├── utils/            Funciones puras (precio, filtrado, cifras del catálogo, especificaciones
│                     destacadas, colores de muestra, acceso seguro a localStorage)
├── App.jsx           Definición de rutas
├── main.jsx          Punto de entrada (monta el router)
└── routes.js         Rutas compartidas (patrón y generador de la URL de detalle)
```

Los tests conviven junto al código que prueban (`*.test.js` / `*.test.jsx`).

## Diseño

La interfaz sigue la estructura de las capturas del enunciado con una estética de tienda tecnológica (paleta _Niebla · cobalto_):

- **Fondo claro con acento cobalto** y un degradado cobalto → cian en los elementos de marca. Todos los textos cumplen el contraste WCAG AA, verificado por la auditoría de axe de los tests end-to-end.
- **Tipografía monoespaciada** (JetBrains Mono) para los datos: precios, capacidades, especificaciones y migas de pan, con cifras alineadas como en una ficha técnica. Space Grotesk para los titulares e Inter para el texto.
- **Fondo de circuito impreso** tras la cabecera, con pulsos de luz que recorren las pistas. Es decorativo (oculto a los lectores de pantalla), solo anima el trazo de un SVG y se detiene si el sistema pide movimiento reducido.
- Cabecera flotante tipo cristal que se mantiene visible al desplazarse, tarjetas con la foto fundida sobre una bandeja iluminada y un visor con esquinas de cámara en el detalle.

## Funcionalidades

### Listado de productos (`/`)

- Muestra todos los productos de la API en una **cuadrícula adaptable**: 1 columna en móvil y 2, 3 o 4 columnas según el ancho de pantalla (máximo 4).
- Cada tarjeta muestra imagen, marca, modelo y precio, y enlaza al detalle del producto (`/product/:id`).
- **Búsqueda en tiempo real** por marca y modelo: se filtra con cada pulsación, sin distinguir mayúsculas, y cada palabra buscada debe aparecer en la marca o el modelo en cualquier orden (`z6 acer` encuentra _Acer Liquid Z6_).
- La búsqueda se guarda en la URL (`/?search=jade`), de forma que se puede compartir y se conserva al volver atrás desde un producto.
- Una región de estado accesible anuncia la carga y el número de resultados, y hay un mensaje específico cuando ninguna coincide.
- Si la API falla, se muestra un aviso con un botón para reintentar.
- Un **resumen del catálogo** muestra el número de modelos y de marcas y el precio mínimo, calculados a partir de los datos de la API.
- Mientras se cargan los productos se muestran tarjetas de esqueleto.
- Atajo de teclado: pulsar `/` en cualquier punto lleva al buscador (anunciado con `aria-keyshortcuts`).

Los precios se muestran en euros con formato español (`170 €`); la API no indica la moneda, así que se asume euro.

### Detalle de producto (`/product/:id`)

- Vista en **dos columnas**: la imagen a la izquierda y los detalles y acciones a la derecha (en móvil se apilan).
- **Especificaciones destacadas** (pantalla, batería, cámara y RAM) extraídas del texto libre de la API. Si un dato no se puede leer con fiabilidad, no se muestra; la tabla completa siempre conserva el texto original.
- Tabla de **especificaciones** con marca, modelo, precio, CPU, RAM, sistema operativo, resolución y tamaño de pantalla, batería, cámaras principal y frontal, dimensiones y peso. Los datos que la API no proporciona se muestran como _No disponible_.
- **Selectores de almacenamiento y color** como grupos de botones de opción accesibles. Si solo hay una opción, se muestra igualmente y viene seleccionada; si hay varias, ninguna se preselecciona para que el usuario elija de forma explícita. Los colores muestran una muestra cuando el nombre corresponde a un color CSS válido (lo valida el propio navegador).
- El enlace **Volver al listado** regresa al listado del que venía el usuario, conservando su búsqueda y el punto de la lista donde estaba (vuelve atrás en el historial, así que el navegador restaura el scroll); si se abrió el detalle directamente, lleva al listado completo.
- Botón **Añadir a la cesta**, activo cuando hay almacenamiento y color seleccionados. Envía a la API el identificador del producto y los códigos de color y almacenamiento, se desactiva mientras la petición está en curso (evitando envíos dobles) y confirma el resultado o muestra un error.
- Estados de carga y de error con opción de reintento.

### Cabecera y cesta

- El nombre de la aplicación enlaza con el listado.
- **Migas de pan** con la página actual (`Catálogo`, `Catálogo / Acer Iconia Talk S` o `Catálogo / Página no encontrada`). El nombre del producto reutiliza la petición de la página de detalle, sin llamadas extra a la API.
- **Contador de la cesta** en la parte derecha, visible en todas las vistas. Se guarda en `localStorage`, por lo que se mantiene al recargar, y se sincroniza entre pestañas abiertas; si el navegador bloquea el almacenamiento, sigue funcionando en memoria durante la sesión.

### Detalles transversales

- Cada página tiene su propio **título de documento** (`Acer Iconia Talk S · Mobile Shop`).
- Cada página nueva se abre **desde arriba**, aunque se llegue desde el final del listado; al volver atrás, el navegador restaura la posición anterior.
- Si una carga tarda más de 3 segundos, se avisa de que el servidor se está activando y **la primera carga puede tardar hasta un minuto** (arranque en frío de la API).
- Si la imagen de un producto no carga, se muestra un **marcador de posición** en su lugar.
- Las rutas desconocidas muestran una página 404 con un enlace de vuelta al catálogo.

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

- **`POST /api/cart` siempre devuelve `{ "count": 1 }`**: el servicio no guarda estado entre peticiones, así que usar el valor tal cual dejaría la cesta siempre en 1. Por eso el contador de la cabecera acumula en cliente el `count` de cada respuesta y lo persiste en `localStorage`. Si la API pasara a devolver el total real de la cesta, bastaría con cambiar la suma por una asignación en [`useAddToCart.js`](src/hooks/useAddToCart.js).
- **Arranque en frío**: la API está alojada en Render y, tras un tiempo sin uso, la primera petición puede tardar en torno a un minuto. La caché en cliente evita repetir peticiones y comparte las simultáneas; la interfaz muestra estados de carga y de error con opción de reintento.
- **Precios vacíos**: el precio llega como texto y algunos productos lo tienen vacío (`""`). Se convierte a número, o a `null` cuando no hay precio, y estos productos se muestran como _Precio no disponible_.
- **Nombres de campo con erratas** (`dimentions`, `secondaryCmera`) y **campos intercambiados** (`displayResolution` contiene el tamaño en pulgadas y `displaySize` la resolución en píxeles). La respuesta se normaliza en la capa de API ([`normalizers.js`](src/api/normalizers.js)), de forma que los componentes trabajan con un modelo limpio.
- **Tipos no homogéneos**: campos como `primaryCamera` llegan unas veces como array y otras como texto; se normalizan siempre a array.
- **Unidades implícitas**: el peso llega como texto sin unidad (`"260"`); se convierte a número y se muestra en gramos.
- **Productos inexistentes**: pedir un id que no existe devuelve un error `500` genérico en lugar de un `404`, por lo que la aplicación no puede distinguirlo de un fallo del servidor y muestra un único estado de error con opción de reintentar y de volver al listado.

## Hitos

El desarrollo se organiza en hitos incrementales, cada uno reflejado en el historial de commits:

- [x] **1. Proyecto base**: Vite + React, tests, lint, formato y README.
- [x] **2. Capa de API y caché**: cliente HTTP, normalización de datos y caché en cliente con expiración de 1 hora.
- [x] **3. Listado (PLP)**: enrutado, cuadrícula adaptable de hasta 4 columnas y búsqueda en tiempo real.
- [x] **4. Detalle (PDP)**: vista en dos columnas con imagen, especificaciones y selectores de opciones.
- [x] **5. Cesta y cabecera**: añadir a la cesta, contador persistido y breadcrumbs.
- [x] **6. Pulido**: CI, cobertura, títulos por página, aviso de arranque en frío, imagen de respaldo y casos límite.

## Posibles mejoras

- **Página de cesta**: la API solo expone el número de productos, pero la aplicación podría guardar también qué variantes se han añadido.
- **Modo oscuro** a partir de las variables de diseño ya definidas.
