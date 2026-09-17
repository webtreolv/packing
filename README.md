# Paking

Estación web independiente para procesar etiquetas mediante un escáner QR USB.

## Uso

1. Abre `index.html` desde un servidor web local.
2. Conecta el escáner USB; el navegador lo recibe como entrada de teclado.
3. Escanea el QR de la **etiqueta superior** mostrada en `base.png`; la etiqueta se genera automáticamente al terminar la lectura.
4. El sistema toma los primeros 10 dígitos disponibles de la lectura.
5. El resultado se formatea como `XXX-XXXX-XXX`, genera un código de barras Code 128 y puede imprimirse.
6. Presiona **Guardar etiqueta** para agregar el resultado al listado, o **Imprimir etiqueta** para imprimirlo directamente.

La etiqueta de impresión está configurada a **8 cm de ancho × 2 cm de alto**.
El listado guarda únicamente los códigos resultantes cuando se presiona **Guardar etiqueta**. Conserva las últimas 30 etiquetas y cada fila incluye su código de barras y un botón **Imprimir** independiente.
Cada fila también incluye **Eliminar** y el botón **Limpiar listado** elimina todas las etiquetas. Ambas acciones solicitan la contraseña configurada en `app.js`, actualmente `Danfoss2026-`.

## Notas

- El lector debe estar configurado para enviar Enter al terminar cada lectura; la interfaz procesa la lectura automáticamente.
- El generador Code 128 (`JsBarcode`) se carga desde un CDN; se requiere Internet para generar el código si no se descarga la librería localmente.
- Esta versión no guarda datos en MariaDB ni envía códigos a un servidor.
