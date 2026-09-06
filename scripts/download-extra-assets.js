import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const femaleDir = path.join(rootDir, 'public', 'assets', 'profiles', 'female');
const maleDir = path.join(rootDir, 'public', 'assets', 'profiles', 'male');

const EXTRA_IMAGES = [
  { dir: maleDir, name: 'Male_Profile_01.jpg', url: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=600&q=80' },
  { dir: maleDir, name: 'Male_Profile_03.jpg', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80' },
  { dir: femaleDir, name: 'Female_Profile_08.jpg', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, (redirectRes) => {
          redirectRes.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(destPath, () => {});
        reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const item of EXTRA_IMAGES) {
    const target = path.join(item.dir, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      await downloadFile(item.url, target);
      console.log(`✓ Saved ${item.name} (${fs.statSync(target).size} bytes)`);
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  }
}

main();
