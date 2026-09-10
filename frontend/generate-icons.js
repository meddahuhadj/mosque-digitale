import sharp from 'sharp';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = resolve(__dirname, 'mosque/assets/icon.svg');
const outDir = resolve(__dirname, 'mosque/assets');

async function generateIcons() {
  const sizes = [192, 512];
  
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(resolve(outDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(resolve(outDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toFile(resolve(outDir, 'favicon-32.png'));
  console.log('Generated favicon-32.png');
}

generateIcons().catch(console.error);