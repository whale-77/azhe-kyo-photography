import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import convertHeic from 'heic-convert';

const root = process.cwd();
const sets = [
  { source: '秋-宫岛-25.11', slug: 'miyajima' },
  { source: '夏-尾道-25.10', slug: 'onomichi' },
  { source: '秋-京都-25.12', slug: 'kyoto' },
  { source: '冬-北海道-26.2', slug: 'hokkaido' },
  { source: '夏-广岛-25.9', slug: 'hiroshima' },
  { source: '冬-东京-26.1', slug: 'tokyo' },
];

await fs.mkdir(path.join(root, 'public', 'photos'), { recursive: true });
const manifest = {};

for (const set of sets) {
  const sourceDir = path.join(root, set.source);
  const outputDir = path.join(root, 'public', 'photos', set.slug);
  await fs.mkdir(outputDir, { recursive: true });
  const files = (await fs.readdir(sourceDir))
    .filter((name) => /\.(jpe?g|png|heic)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  manifest[set.slug] = [];
  for (let index = 0; index < files.length; index += 1) {
    const input = path.join(sourceDir, files[index]);
    const filename = `${String(index + 1).padStart(2, '0')}.webp`;
    const output = path.join(outputDir, filename);
    const source = /\.heic$/i.test(files[index])
      ? await convertHeic({ buffer: await fs.readFile(input), format: 'JPEG', quality: 0.94 })
      : input;
    const image = sharp(source, { failOn: 'none' }).rotate();
    const metadata = await image.metadata();
    await image.resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 }).toFile(output);
    manifest[set.slug].push({
      src: `/photos/${set.slug}/${filename}`,
      width: metadata.autoOrient?.width ?? metadata.width,
      height: metadata.autoOrient?.height ?? metadata.height,
      alt: '',
    });
    console.log(`${set.slug}: ${files[index]} -> ${filename}`);
  }
}

await fs.writeFile(
  path.join(root, 'src', 'photo-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);
