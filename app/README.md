# Paking

Estación web independiente para procesar etiquetas mediante un escáner QR USB.

## Arquitectura y Base de Datos
- La aplicación ahora cuenta con un archivo **`backend.php`** que interactúa con una base de datos local **`database.sqlite`**.
- Es requerido ejecutar esta aplicación en un entorno con soporte PHP y SQLite (por ejemplo: contenedor de Docker con la imagen `php:8.3-apache`, XAMPP o WAMP).

## Uso

1. Levanta el servidor local que tenga soporte para PHP (ej. `http://localhost:8080/paking/app/`).
2. Conecta el escáner USB; el navegador lo recibe como entrada de teclado.
3. Escanea el código: la aplicación leerá los caracteres, y automáticamente reemplazará las letras `ñ` por espacios y los apostrofes `'` por guiones medios `-`.
4. El sistema toma los primeros 10 dígitos disponibles de la lectura para formatear como `XXX-XXXX-XXX` y genera un código de barras Code 128.
5. Presiona **Guardar etiqueta** para enviar el resultado a la base de datos (con hora exacta de la Ciudad de México).
6. Presiona **Imprimir etiqueta** para imprimir el resultado directamente a tamaño de **8 cm de ancho x 2 cm de alto**.

## Panel de Historial y Exportación
- **Filtro de Fechas:** Permite buscar los registros de un día en específico (por defecto muestra el día actual).
- **Paginación:** Muestra únicamente 5 resultados por página para optimizar el rendimiento.
- **Botón Exportar Excel:** Protegido con contraseña. Genera y descarga un archivo real `.xlsx` que respeta el filtro de fecha actual e **incluye el código de barras como imagen incrustada**.
- Los botones de eliminación (individual y limpieza total) y exportación piden la contraseña configurada en `app.js` (actualmente `Danfoss2026-`).

## Notas

- El lector debe estar configurado para enviar Enter al terminar cada lectura.
- El generador Code 128 (`JsBarcode`) y `ExcelJS` se cargan mediante CDN; **se requiere Internet** para mostrar las gráficas de códigos de barras y exportar los archivos Excel.
