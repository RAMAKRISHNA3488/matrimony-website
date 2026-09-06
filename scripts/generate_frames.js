import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseImagePath = path.join(__dirname, '../public/assets/backgrounds/Background1.png');
const outDir = path.join(__dirname, '../public/assets/backgrounds/telugu-culture');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function generateFrames() {
  const metadata = await sharp(baseImagePath).metadata();
  const width = metadata.width || 1920;
  const height = metadata.height || 1080;
  const frameCount = 48;

  console.log(`Generating ${frameCount} frames at ${width}x${height}...`);

  // Define 18 floating petals with varying starting positions, speeds, oscillations and sizes
  const petals = [
    { x: 0.15, y: 0.10, vx: 0.012, vy: 0.008, size: 14, color: 'rgba(235, 120, 140, 0.75)', amp: 25, freq: 2 },
    { x: 0.35, y: 0.05, vx: 0.015, vy: 0.010, size: 18, color: 'rgba(245, 140, 160, 0.8)', amp: 35, freq: 1.5 },
    { x: 0.55, y: 0.12, vx: 0.010, vy: 0.009, size: 12, color: 'rgba(230, 110, 130, 0.7)', amp: 20, freq: 3 },
    { x: 0.75, y: 0.08, vx: 0.014, vy: 0.012, size: 16, color: 'rgba(250, 160, 175, 0.85)', amp: 30, freq: 2.2 },
    { x: 0.90, y: 0.15, vx: 0.011, vy: 0.007, size: 10, color: 'rgba(240, 130, 150, 0.75)', amp: 18, freq: 2.8 },
    { x: 0.25, y: 0.40, vx: 0.013, vy: 0.009, size: 15, color: 'rgba(255, 180, 190, 0.8)', amp: 28, freq: 1.8 },
    { x: 0.45, y: 0.35, vx: 0.016, vy: 0.011, size: 20, color: 'rgba(235, 120, 140, 0.75)', amp: 40, freq: 2 },
    { x: 0.65, y: 0.45, vx: 0.012, vy: 0.008, size: 13, color: 'rgba(245, 150, 165, 0.7)', amp: 22, freq: 2.5 },
    { x: 0.80, y: 0.30, vx: 0.015, vy: 0.010, size: 17, color: 'rgba(230, 110, 130, 0.8)', amp: 32, freq: 1.6 },
    { x: 0.05, y: 0.50, vx: 0.014, vy: 0.009, size: 14, color: 'rgba(255, 190, 200, 0.85)', amp: 26, freq: 2.4 },
    { x: 0.30, y: 0.65, vx: 0.011, vy: 0.007, size: 11, color: 'rgba(240, 130, 150, 0.65)', amp: 19, freq: 3.1 },
    { x: 0.70, y: 0.60, vx: 0.013, vy: 0.009, size: 16, color: 'rgba(250, 160, 175, 0.75)', amp: 30, freq: 1.9 },
    // Golden jasmine sparkle particles
    { x: 0.20, y: 0.25, vx: 0.008, vy: 0.005, size: 6, color: 'rgba(217, 174, 77, 0.8)', amp: 15, freq: 4 },
    { x: 0.50, y: 0.20, vx: 0.009, vy: 0.006, size: 8, color: 'rgba(198, 154, 58, 0.75)', amp: 20, freq: 3.5 },
    { x: 0.85, y: 0.50, vx: 0.007, vy: 0.004, size: 5, color: 'rgba(217, 174, 77, 0.9)', amp: 12, freq: 4.5 },
    { x: 0.40, y: 0.75, vx: 0.010, vy: 0.006, size: 7, color: 'rgba(217, 174, 77, 0.7)', amp: 16, freq: 3.8 }
  ];

  for (let i = 1; i <= frameCount; i++) {
    const progress = (i - 1) / frameCount; // 0 to 1
    const angle = progress * Math.PI * 2;

    // Build SVG overlay for petals, subtle sunbeam pulse and water shimmer
    const svgElements = [];

    // 1. Soft atmospheric sunlight breathing over top-left & sky
    const sunGlowOpacity = (0.08 + Math.sin(angle) * 0.04).toFixed(3);
    svgElements.push(`
      <radialGradient id="sunGlow" cx="20%" cy="25%" r="60%">
        <stop offset="0%" stop-color="#FCF4DF" stop-opacity="${sunGlowOpacity}" />
        <stop offset="100%" stop-color="#FFF9F4" stop-opacity="0" />
      </radialGradient>
      <rect width="${width}" height="${height}" fill="url(#sunGlow)" />
    `);

    // 2. Water surface gentle ripple shimmer on the river bottom area (y > 750)
    for (let r = 0; r < 5; r++) {
      const rippleY = 820 + r * 45 + Math.sin(angle + r * 1.2) * 6;
      const rippleX = 500 + Math.cos(angle + r * 0.8) * 80;
      const rippleLen = 350 + Math.sin(angle * 2 + r) * 60;
      const rippleAlpha = (0.12 + Math.sin(angle + r * 1.5) * 0.06).toFixed(3);
      svgElements.push(`
        <path d="M${rippleX} ${rippleY} Q ${rippleX + rippleLen / 2} ${rippleY + 4} ${rippleX + rippleLen} ${rippleY}" 
              stroke="#FFF9F4" stroke-width="2" stroke-opacity="${rippleAlpha}" fill="none" />
      `);
    }

    // 3. Floating petals in seamless loop
    petals.forEach((p, idx) => {
      // Loop position continuously
      const curX = ((p.x + progress * p.vx * 15) % 1) * width + Math.sin(angle * p.freq + idx) * p.amp;
      const curY = ((p.y + progress * p.vy * 15) % 1) * height + Math.cos(angle * p.freq + idx) * (p.amp * 0.5);
      const rot = (progress * 360 * (idx % 2 === 0 ? 1 : -1) + idx * 45).toFixed(1);
      const scale = (0.85 + Math.sin(angle + idx) * 0.15).toFixed(2);

      // Petal SVG path
      svgElements.push(`
        <g transform="translate(${curX.toFixed(1)}, ${curY.toFixed(1)}) rotate(${rot}) scale(${scale})">
          <path d="M0,${-p.size} C${p.size * 0.8},${-p.size * 0.4} ${p.size * 0.8},${p.size * 0.6} 0,${p.size} C${-p.size * 0.8},${p.size * 0.6} ${-p.size * 0.8},${-p.size * 0.4} 0,${-p.size}" 
                fill="${p.color}" />
        </g>
      `);
    });

    const svgBuffer = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${svgElements.join('\n')}
      </svg>
    `);

    const frameNumberStr = String(i).padStart(4, '0');
    const outPath = path.join(outDir, `frame_${frameNumberStr}.webp`);

    await sharp(baseImagePath)
      .composite([{ input: svgBuffer, blend: 'over' }])
      .webp({ quality: 84, effort: 4 })
      .toFile(outPath);

    if (i % 8 === 0 || i === frameCount) {
      console.log(`Generated frame ${i}/${frameCount} -> frame_${frameNumberStr}.webp`);
    }
  }

  console.log("All frames generated successfully in public/assets/backgrounds/telugu-culture/!");
}

generateFrames().catch(err => {
  console.error("Error generating frames:", err);
  process.exit(1);
});
