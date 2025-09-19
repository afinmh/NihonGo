import { readdir } from 'fs/promises';
import { join } from 'path';

export default async function handler(_req: any, res: any) {
  try {
    const dir = join(process.cwd(), 'public', 'assets', 'bg');
    const files = await readdir(dir);
    const images = files.filter(f => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));
    res.status(200).json({ files: images });
  } catch (e: any) {
    res.status(200).json({ files: [] });
  }
}
