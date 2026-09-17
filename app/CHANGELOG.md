# Changelog

## [Unreleased]

- Se creó la aplicación independiente `paking` para escanear códigos QR.
- Se agregó lectura mediante cámara, captura manual, copia del resultado e historial local.
- Se agregó flujo de dos escaneos con lector USB: etiqueta base y segunda etiqueta.
- Se agregó extracción de los primeros 10 dígitos, generación de código Code 128 e impresión de etiqueta de 8 × 2 cm.
- Se precisó que la etiqueta superior de `base.png` es la fuente del resultado.
- Se eliminó la trazabilidad visible y el listado ahora muestra una fila por etiqueta generada, con código de barras y botón individual de impresión.
- Se eliminó la tarjeta de fuente del resultado y se agregó el botón explícito **Guardar etiqueta**.
- Se agregó eliminación individual de etiquetas protegida por contraseña configurable en `app.js`.
- Se protegió también la opción **Limpiar listado** con la misma contraseña.
- Se simplificó el flujo a una sola lectura: el QR genera automáticamente la etiqueta sin esperar un segundo escaneo.
- Se actualizó la interfaz con una paleta roja y degradados en lugar de tonos verdes.
- Se mantuvo el punto indicador de estado en color verde cuando la estación está lista.
