import { mkdir, writeFile } from 'node:fs/promises';
const origin = 'https://adrenaline-fitness.javkhlanbaataru.chatgpt.site';
const response = await fetch(`${origin}/api/content`);
if (!response.ok) throw new Error(`Content: ${response.status}`);
const content = await response.json();
const paths = [...new Set(JSON.stringify(content).match(/\/api\/media\/[^"\\\s]+/g) || [])];
await mkdir('public/migrated', { recursive: true });
for (const path of paths) {
  const filename = path.split('/').pop();
  if (!/^[a-zA-Z0-9.-]+$/.test(filename)) throw new Error('Invalid filename');
  const media = await fetch(`${origin}${path}`);
  if (!media.ok) throw new Error(`Media: ${media.status}`);
  await writeFile(`public/migrated/${filename}`, Buffer.from(await media.arrayBuffer()));
}
console.log(JSON.stringify({ downloaded: paths.length }));
