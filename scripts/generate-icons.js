import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const sourceImage = path.resolve('src/assets/images/duo_calendar_icon_1790442864954.jpg');

async function generate() {
  if (fs.existsSync(sourceImage)) {
    // 192x192
    await sharp(sourceImage)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'pwa-192x192.png'));

    // 512x512
    await sharp(sourceImage)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'pwa-512x512.png'));

    // 512x512 maskable (with 10% padding for safe zone)
    await sharp(sourceImage)
      .resize(410, 410)
      .extend({
        top: 51,
        bottom: 51,
        left: 51,
        right: 51,
        background: '#ffffff'
      })
      .png()
      .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

    // apple touch icon 180x180
    await sharp(sourceImage)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    console.log('Icons generated successfully from asset image.');
  }
}

generate().catch(console.error);
