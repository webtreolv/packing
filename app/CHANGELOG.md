# Changelog

## [Unreleased]

- Se migró el almacenamiento local (localStorage) a un servidor real usando PHP y SQLite (`backend.php` -> `database.sqlite`).
- Se configuró la zona horaria de la base de datos de manera estricta a Hora Central (Ciudad de México).
- Se agregó un filtro de fecha en la vista de historial (con fecha predeterminada del día actual) que permite consultar etiquetas generadas en días específicos con efecto visual de carga (ajax).
- Se implementó la paginación para el historial de etiquetas (5 por página).
- Se mejoró la exportación a Excel: el botón genera ahora un archivo `.xlsx` real utilizando la librería `ExcelJS`.
- El archivo de Excel descargado ahora incrusta imágenes reales de los códigos de barras de manera automática y obedece al filtro de fecha actual.
- Se agregó una rutina de limpieza (normalización) que reemplaza automáticamente el carácter `ñ` por espacios y el apóstrofe `'` por guion `-` justo en el momento en que el escáner realiza la lectura.
- Se corrigió un error crítico de impresión donde la etiqueta salía en blanco si el panel padre estaba oculto; se logró aislando el contenedor de impresión directamente en la raíz de la página.
- Se mantuvo el esquema de colores, pero se mejoró la resiliencia al evitar la caché de navegadores mediante sufijos de versión en `index.html`.
- Se protegió la exportación a Excel con la misma contraseña general de la aplicación (`Danfoss2026-`).

## Versiones Previas
- Se creó la aplicación independiente `paking` para escanear códigos QR.
- Se agregó lectura mediante cámara, captura manual, copia del resultado e historial.
- Flujo de lecturas USB con generación de código Code 128 (8 x 2 cm).
- Se agregó eliminación individual de etiquetas y limpiado general protegidos por contraseña.
