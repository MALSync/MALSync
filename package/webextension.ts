import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { join } from 'path';

const dist = join(__dirname, '../dist');

const output = createWriteStream(join(dist, '/webextension.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 },
});
archive.pipe(output);
archive.directory(join(dist, 'webextension'), false);
archive.finalize();
