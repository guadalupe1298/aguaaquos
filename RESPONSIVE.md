# Ajustes responsive

Base: el archivo aquoslife-astro.zip indicado por el usuario. Se conservaron sus componentes, contenido, campos y lógica del formulario.

Los ajustes están en src/styles/responsive.css, importado después de global.css. Se adaptaron portada, columnas, planes, formulario, ventanas y botones flotantes; se respeta el espacio de encabezado fijo y las zonas seguras de teléfonos.

Astro actualizado a 7.3.5. npm audit: 0 vulnerabilidades al realizar la entrega. npm run build completó correctamente.

Verificación en Chrome headless con ventanas 320x568, 360x800, 390x844, 430x932, 768x1024, 820x1180, 1024x768, 1366x768, 1920x1080 y 844x390. No se detectaron desbordamientos horizontales ni errores de JavaScript en la carga. Se inspeccionó visualmente la portada móvil y de escritorio. Los recursos externos se bloquearon durante la prueba; no se enviaron formularios. No equivale a probar todos los modelos físicos ni Safari/iOS.

Para ejecutar: npm install y después npm run dev, cada comando por separado.
