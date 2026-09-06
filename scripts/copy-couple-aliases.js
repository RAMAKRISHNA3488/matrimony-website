import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const couplesDir = path.resolve(__dirname, '..', 'public', 'assets', 'couples');

const mapping = [
  { from: 'story_rahul_sravani.jpg', to: 'Success_Story_01.jpg' },
  { from: 'story_karthik_ananya.jpg', to: 'Success_Story_02.jpg' },
  { from: 'story_vamsi_harika.jpg', to: 'Success_Story_03.jpg' },
  { from: 'story_arjun_keerthi.jpg', to: 'Success_Story_04.jpg' },
  { from: 'story_sai_divya.jpg', to: 'Success_Story_05.jpg' },
  { from: 'story_rohit_meghana.jpg', to: 'Success_Story_06.jpg' }
];

for (const m of mapping) {
  const src = path.join(couplesDir, m.from);
  const dest = path.join(couplesDir, m.to);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${m.from} -> ${m.to}`);
  }
}
