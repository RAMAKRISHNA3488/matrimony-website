import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(process.env.USERPROFILE, '.gemini/antigravity-ide/brain/d48b75e0-0b46-4c34-86e1-878b654998f2');
const targetDir = path.resolve(__dirname, '../public/assets/couples');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = [
  { prefix: 'story_rahul_sravani', target: 'story_rahul_sravani.jpg' },
  { prefix: 'story_karthik_ananya', target: 'story_karthik_ananya.jpg' },
  { prefix: 'story_vamsi_harika', target: 'story_vamsi_harika.jpg' },
  { prefix: 'story_arjun_keerthi', target: 'story_arjun_keerthi.jpg' },
  { prefix: 'story_sai_divya', target: 'story_sai_divya.jpg' },
  { prefix: 'story_rohit_meghana', target: 'story_rohit_meghana.jpg' }
];

const allBrainFiles = fs.readdirSync(srcDir);

files.forEach(({ prefix, target }) => {
  const match = allBrainFiles.find(f => f.startsWith(prefix) && f.endsWith('.jpg'));
  if (match) {
    const srcPath = path.join(srcDir, match);
    const destPath = path.join(targetDir, target);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${match} -> ${destPath}`);
  } else {
    console.error(`Could not find file with prefix ${prefix}`);
  }
});
