import { ZipArchive } from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');

const output = fs.createWriteStream(path.join(dist, '/webextension.zip'));
const archive = new ZipArchive({
  zlib: { level: 9 },
});
archive.pipe(output);
archive.directory(path.join(dist, 'webextension'), false);
archive.finalize();
