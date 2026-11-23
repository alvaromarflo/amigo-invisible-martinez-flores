// Script de ENVÍO de correos del sorteo. Úsalo con una cuenta de Google que NO participe en el sorteo
// (los correos enviados con MailApp aparecen en la carpeta "Enviados" de esa cuenta).
// Propiedad del script necesaria: SECRET (Configuración del proyecto > Propiedades del script).

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || d.secret !== secret) return salida({ ok: false });
    if (!d.to || !d.subject || !d.html) return salida({ ok: false });
    MailApp.sendEmail({ to: d.to, subject: d.subject, htmlBody: d.html, name: "Amigo Invisible Martinez Flores" });
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false });
  }
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
