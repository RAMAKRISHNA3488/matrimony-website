import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../public/assets/backgrounds');
const outputDir = path.join(__dirname, '../public/assets/backgrounds/telugu-culture');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertAllFrames() {
  console.log("Converting 240 frames to WebP in public/assets/backgrounds/telugu-culture/...");
  
  for (let i = 1; i <= 240; i++) {
    // ezgif-frame-001.jpg, ezgif-frame-010.jpg, ezgif-frame-100.jpg
    const inputNumStr = String(i).padStart(3, '0');
    const inputPath = path.join(inputDir, `ezgif-frame-${inputNumStr}.jpg`);
    
    // target: frame_0001.webp, frame_0002.webp, etc.
    const outNumStr = String(i).padStart(4, '0');
    const outputPath = path.join(outputDir, `frame_${outNumStr}.webp`);

    if (!fs.existsSync(inputPath)) {
      console.warn(`Missing input file: ${inputPath}`);
      continue;
    }

    await sharp(inputPath)
      .webp({ quality: 95, effort: 6, smartSubsample: true })
      .toFile(outputPath);

    if (i % 30 === 0 || i === 240) {
      console.log(`Converted ${i}/240 frames -> frame_${outNumStr}.webp`);
    }
  }

  console.log("All 240 frames converted to WebP successfully!");
}

convertAllFrames().catch(err => {
  console.error("Error converting frames:", err);
  process.exit(1);
});
