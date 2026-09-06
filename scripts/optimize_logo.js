import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/assets/branding/TeluguBandham_Logo_Primary.png');
const backupPath = path.join(__dirname, '../public/assets/branding/TeluguBandham_Logo_Primary_original.png');

async function processLogo() {
  const { data, info } = await sharp(backupPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = 4;

  const minX = 155;
  const maxX = 1652;
  const minY = 232;
  const maxY = 638;

  const cropLeft = minX;
  const cropTop = minY;
  const cropWidth = maxX - minX;
  const cropHeight = maxY - minY;

  const outputData = Buffer.alloc(cropWidth * cropHeight * channels);

  for (let y = 0; y < cropHeight; y++) {
    for (let x = 0; x < cropWidth; x++) {
      const srcIdx = ((y + cropTop) * width + (x + cropLeft)) * channels;
      const dstIdx = (y * cropWidth + x) * channels;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      const isBg = (r > 240 && g > 235 && b > 225);

      if (isBg) {
        const lightness = (r + g + b) / 3;
        if (lightness > 246) {
          outputData[dstIdx] = r;
          outputData[dstIdx + 1] = g;
          outputData[dstIdx + 2] = b;
          outputData[dstIdx + 3] = 0;
        } else {
          const alpha = Math.max(0, Math.min(255, Math.round((248 - lightness) * 18)));
          outputData[dstIdx] = r;
          outputData[dstIdx + 1] = g;
          outputData[dstIdx + 2] = b;
          outputData[dstIdx + 3] = alpha;
        }
      } else {
        outputData[dstIdx] = r;
        outputData[dstIdx + 1] = g;
        outputData[dstIdx + 2] = b;
        outputData[dstIdx + 3] = 255;
      }
    }
  }

  await sharp(outputData, { raw: { width: cropWidth, height: cropHeight, channels: 4 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(logoPath);

  console.log(`Logo perfectly cropped and transparent: ${cropWidth}x${cropHeight}`);
}

processLogo().catch(console.error);
