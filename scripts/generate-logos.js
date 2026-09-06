import fs from 'fs';
import path from 'path';

const srcPath = path.join(process.cwd(), 'public', 'assets', 'branding', 'TeluguBandham_Logo_Primary.svg');
const content = fs.readFileSync(srcPath, 'utf8');

// Style for Dark mode
const darkStyle = `      .tb-title-telugu {
        font-family: 'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif;
        font-weight: 700;
        font-size: 46px;
        fill: #FFFFFF;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      }
      .tb-title-bandham {
        font-family: 'Cinzel', 'Playfair Display', Georgia, 'Times New Roman', serif;
        font-weight: 700;
        font-size: 46px;
        fill: #D9AE4D;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      }
      .tb-tagline {
        font-family: 'Cinzel', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 0.18em;
        fill: #EAE3D2;
        text-transform: uppercase;
      }
      .tb-divider-line {
        stroke: #D9AE4D;
        stroke-width: 1.6;
        stroke-linecap: round;
      }
      .tb-ornament {
        fill: #D9AE4D;
      }`;

const darkContent = content.replace(/\.tb-title-telugu[\s\S]*?\.tb-ornament\s*\{\s*fill:\s*#7A1635;\s*\}/, darkStyle);

fs.writeFileSync(path.join(process.cwd(), 'public', 'assets', 'branding', 'TeluguBandham_Logo_Dark.svg'), darkContent, 'utf8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'assets', 'branding', 'TeluguBandham_Logo_Light.svg'), content, 'utf8');
console.log('Successfully generated Dark and Light logo SVGs!');
