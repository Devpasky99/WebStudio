# Despliegue

## Configuracion

1. Copia `.env.example` como `.env` en el servidor.
2. Completa las variables reales en `.env`.
3. No subas `.env` al repositorio. Ya esta incluido en `.gitignore`.

## Variables requeridas

- `CONTACT_PHONE`: numero de WhatsApp en formato internacional, solo digitos.
- `COMPANY_EMAIL`: correo corporativo que se mostrara en la pagina.
- `GOOGLE_MAPS_URL`: enlace público de Google Maps.
- `GOOGLE_MAPS_EMBED_URL`: opcional. Usalo si tienes una URL oficial de insercion de Google Maps.
- `WHATSAPP_MESSAGE`: mensaje inicial opcional para WhatsApp.

## Ejecución

```bash
npm start
```

El sitio queda disponible en `http://localhost:3000` por defecto. Puedes cambiar el puerto con `PORT`.

## Producción

- Despliega como aplicacion Node.js, no como sitio estatico puro.
- Configura las variables de entorno en el panel del proveedor de hosting.
- Usa HTTPS en producción.
- Verifica que `/api/contact` responda con redireccion y que `/api/company-info` cargue correo/mapa.

## Verificación de privacidad

- El botón de WhatsApp en el HTML apunta solo a `/api/contact`.
- El numero real no esta en `index.html`, `css/styles.css` ni `js/main.js`.
- El numero vive en `.env`, que esta excluido del repositorio.
