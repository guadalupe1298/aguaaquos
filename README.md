# AquosLife · Astro

Proyecto organizado a partir de tu HTML original. Requiere Node.js 22.12 o superior.

## Iniciar

```sh
npm install
npm run dev
```

Abre la dirección que muestre Astro (normalmente http://localhost:4321).

```sh
npm run build
npm run preview
```

El sitio estático de producción se genera en `dist/`.

## Dónde editar

- `src/pages/index.astro`: orden de las secciones.
- `src/layouts/BaseLayout.astro`: documento HTML, título, fuentes, metadatos y carga del script.
- `src/components/`: encabezado, portada, planes, formulario, calculadora, testimonios, preguntas, modales y pie de página.
- `src/styles/global.css`: estilos originales en su orden de cascada. Se eliminó un bloque idéntico; se conservan las otras capas y sus sobrescrituras para evitar cambios de diseño.
- `src/scripts/landing.js`: eventos, formulario Zoho, calculadora, carruseles y modales. Astro procesa este JavaScript para el navegador; no necesita React ni directivas `client:*`.
- `public/images/`: las siete imágenes extraídas del base64, con referencias compartidas para evitar duplicados.

## Pago y formulario

Copia `.env.example` como `.env` y establece `PUBLIC_PAYMENT_URL` con tu dirección de pago. Es una variable pública: no coloques secretos. Vuelve a compilar después de cambiarla.

El formulario conserva la URL y los nombres de campos de Zoho. No se enviaron registros de prueba. El comportamiento original interpreta la carga del iframe como continuación del proceso, pero eso no verifica que Zoho haya aceptado el registro. El primer paso y la reserva final hacen envíos separados: revisa en Zoho si deben crear o actualizar el mismo registro.

La pantalla de éxito original se abre con `?payment=success`; ese parámetro no verifica un pago. Antes de usar pagos reales, confirma el resultado mediante el proveedor y un backend/webhook.

Los eventos se guardan en `window.dataLayer`, como en el original; este proyecto no añade un proveedor de analítica.

## Cambios de la migración

- Separación en 20 componentes Astro.
- Extracción de imágenes a archivos locales.
- CSS global para preservar selectores entre componentes.
- Corrección de un `div` sin cerrar en la sección de comodidad.
- Configuración del enlace de pago mediante variable de entorno.

La compilación valida la integración con Astro. Las integraciones externas requieren verificación con las cuentas correspondientes.

## Verificación realizada

Consulta RESPONSIVE.md para la verificación actual. La compilación completa ya finaliza correctamente.
