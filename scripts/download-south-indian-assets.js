import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const femaleDir = path.join(rootDir, 'public', 'assets', 'profiles', 'female');
const maleDir = path.join(rootDir, 'public', 'assets', 'profiles', 'male');
const profilesDir = path.join(rootDir, 'public', 'assets', 'profiles');
const couplesDir = path.join(rootDir, 'public', 'assets', 'couples');

fs.mkdirSync(femaleDir, { recursive: true });
fs.mkdirSync(maleDir, { recursive: true });
fs.mkdirSync(profilesDir, { recursive: true });
fs.mkdirSync(couplesDir, { recursive: true });

// Curated South Indian / Indian portrait images
const FEMALE_IMAGES = [
  { name: 'Female_Profile_01.jpg', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_02.jpg', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_03.jpg', url: 'https://images.unsplash.com/photo-1621784563330-caee0b138a00?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_04.jpg', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_05.jpg', url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_06.jpg', url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_07.jpg', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_08.jpg', url: 'https://images.unsplash.com/photo-1604072374690-0e7d7b1ec793?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_09.jpg', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80' },
  { name: 'Female_Profile_10.jpg', url: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=600&q=80' }
];

const MALE_IMAGES = [
  { name: 'Male_Profile_01.jpg', url: 'https://images.unsplash.com/photo-1618886614638-80e3c153d31a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Male_Profile_02.jpg', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Male_Profile_03.jpg', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Male_Profile_04.jpg', url: 'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Male_Profile_05.jpg', url: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Male_Profile_06.jpg', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=600&q=80' },
  { name: 'Male_Profile_07.jpg', url: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=600&q=80' },
  { name: 'Male_Profile_08.jpg', url: 'https://images.unsplash.com/photo-1615813967515-e1838c1c5116?auto=format&fit=crop&w=600&q=80' }
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
  console.log("Starting download of authentic South Indian profile assets...");

  // Download female portraits
  for (const item of FEMALE_IMAGES) {
    const target = path.join(femaleDir, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      await downloadFile(item.url, target);
      console.log(`✓ Saved ${item.name} (${fs.statSync(target).size} bytes)`);
    } catch (e) {
      console.error(`✗ Error downloading ${item.name}:`, e.message);
    }
  }

  // Download male portraits
  for (const item of MALE_IMAGES) {
    const target = path.join(maleDir, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      await downloadFile(item.url, target);
      console.log(`✓ Saved ${item.name} (${fs.statSync(target).size} bytes)`);
    } catch (e) {
      console.error(`✗ Error downloading ${item.name}:`, e.message);
    }
  }

  // Copy some to profiles root for compatibility
  const copyMap = [
    { src: path.join(femaleDir, 'Female_Profile_01.jpg'), dest: path.join(profilesDir, 'sravani_match.jpg') },
    { src: path.join(femaleDir, 'Female_Profile_02.jpg'), dest: path.join(profilesDir, 'ananya_match.jpg') },
    { src: path.join(femaleDir, 'Female_Profile_03.jpg'), dest: path.join(profilesDir, 'harika_match.jpg') }
  ];

  for (const c of copyMap) {
    if (fs.existsSync(c.src)) {
      fs.copyFileSync(c.src, c.dest);
      console.log(`✓ Copied ${path.basename(c.src)} -> ${path.basename(c.dest)}`);
    }
  }

  console.log("\n========================================");
  console.log("ALL SOUTH INDIAN ASSETS DOWNLOADED!");
  console.log("========================================");
}

main();
