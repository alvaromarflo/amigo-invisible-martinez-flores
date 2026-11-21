// Pega este código en Extensiones > Apps Script de tu Google Sheet.
// El secreto NO va aquí: se guarda en Propiedades del script (ver LEEME.md).

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || d.secret !== secret) return salida({ ok: false, error: "no autorizado" });

    var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (hoja.getLastRow() === 0) hoja.appendRow(["Fecha", "Quién", "Ganas (1-5)", "Nivel", "Comentario"]);
    hoja.appendRow([new Date(), d.quien, d.ganas, d.nivel, d.comentario || ""]);

    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      "🎁 " + d.quien + ": " + d.nivel + " (" + d.ganas + "/5)",
      d.quien + " ha respondido\n\nGanas: " + d.nivel + " (" + d.ganas + "/5)\n\nComentario sobre los Reyes Magos / Papá Noel:\n" + (d.comentario || "(sin comentario)")
    );
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  }
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
