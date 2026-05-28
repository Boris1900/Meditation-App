const sharp = require('sharp');

async function makeIcon() {
  const bg = sharp('background.png');
  const meta = await bg.metadata();

  // Quadratischer Ausschnitt: volle Breite, von oben (Bambus + goldenes Licht)
  const size = meta.width;
  const bgCropped = await bg
    .extract({ left: 0, top: 0, width: size, height: size })
    .resize(1024, 1024)
    .toBuffer();

  // Gong: 72% der Iconfläche, zentriert
  const gongSize = Math.round(1024 * 0.88);
  const gongResized = await sharp('gong.png')
    .resize(gongSize, gongSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const offset = Math.round((1024 - gongSize) / 2);

  await sharp(bgCropped)
    .composite([{ input: gongResized, top: offset, left: offset }])
    .png()
    .toFile('icon-1024.png');

  console.log('icon-1024.png erstellt');
}

makeIcon().catch(console.error);
