# Conectar el formulario con Google Sheets y email

Cada respuesta se añade a una hoja y te llega un email. Sin cuentas nuevas: solo tu cuenta de Google.

1. Crea una hoja nueva en <https://sheets.google.com> (por ejemplo "Ganas Amigo Invisible").
2. Menú **Extensiones → Apps Script**.
3. Borra el código que aparece y pega el contenido de `Code.gs`.
4. Pulsa el engranaje **Configuración del proyecto** → **Propiedades del script** → **Añadir propiedad**: nombre `SECRET`, valor una clave larga inventada por ti (anótala, es el "secreto").
5. Pulsa **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
6. Pulsa **Implementar** y **autoriza los permisos** (Hojas de cálculo y enviar email). Si sale "Google no ha verificado esta app": *Configuración avanzada → Ir a (nombre) → Permitir*.
7. Copia la **URL de la aplicación web** (acaba en `/exec`).
8. En la raíz del repo, desde la terminal:
   ```
   npx vercel env add GOOGLE_SCRIPT_URL production
   npx vercel env add GOOGLE_SCRIPT_SECRET production
   ```
   Pega la URL y el secreto (el mismo del paso 4) cuando lo pida.
9. Avisa para redesplegar, o ejecuta `npx vercel deploy --prod`.

Si cambias el código del script, usa **Implementar → Administrar implementaciones → editar → Nueva versión**.
