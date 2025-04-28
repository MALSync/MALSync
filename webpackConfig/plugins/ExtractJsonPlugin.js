import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import webpack from 'webpack';

export class ExtractJsonPlugin {
  constructor(options) {
    this.options = {
      entryName: '',
      typescriptFile: '',
      filename: '',
      folderMode: false,
      ...options,
    };
  }

  apply(compiler) {
    const { entryName, typescriptFile, filename } = this.options;

    if (entryName && typescriptFile) {
      const context = compiler.context || compiler.options.context;
      const entry = new webpack.EntryPlugin(
        context,
        'expose-loader?exposes=_extractJson!' + typescriptFile,
        {
          name: entryName,
          filename: '../temp/[name].js'
        },
      );
      entry.apply(compiler);
    }

    compiler.hooks.afterEmit.tapAsync('ExtractJsonPlugin', (compilation, callback) => {
      const entrypoint = compilation.entrypoints.get(entryName);
      if (!entrypoint) {
        const error = new Error(`ExtractJsonPlugin: Entry '${entryName}' not found`);
        return callback(error);
      }

      const outputFiles = entrypoint.getFiles();
      if (!outputFiles.length) {
        const error = new Error(`ExtractJsonPlugin: No output files found for entry '${entryName}'`);
        return callback(error);
      }

      const outputFile = outputFiles[0];
      const outputPath = path.join(compiler.outputPath, outputFile);

      setTimeout(() => {
        try {
          const require = createRequire(import.meta.url);

          if (require.cache[outputPath]) {
            delete require.cache[outputPath];
          }
          delete globalThis._extractJson;
          global.jQuery = {};
          const module = require(outputPath);
          const jsonData = globalThis._extractJson.default();

          if (this.options.folderMode) {
            const folderPath = path.join(compiler.outputPath, filename);

            if (!fs.existsSync(folderPath)) {
              fs.mkdirSync(folderPath, { recursive: true });
            }

            for (const [key, value] of Object.entries(jsonData)) {
              const filePath = path.join(folderPath, `${key}.json`);
              const jsonString = JSON.stringify(value, null, 2);
              fs.writeFileSync(filePath, jsonString);

              const stats = fs.statSync(filePath);

              const fileSize = stats.size;
              let fileSizeDisplay = `${fileSize} bytes`;
              console.log(
                `asset \x1b[32m${filename}/${key}.json\x1b[0m ${fileSizeDisplay} \x1b[33m[extracted]\x1b[0m`
              );
            }
          } else {
            const jsonString = JSON.stringify(jsonData, null, 2);
            const outputFilePath = path.join(compiler.outputPath, filename);

            const dirname = path.dirname(outputFilePath);
            if (!fs.existsSync(dirname)) {
              fs.mkdirSync(dirname, { recursive: true });
            }
            fs.writeFileSync(outputFilePath, jsonString);

            const stats = fs.statSync(outputFilePath);
            const fileSizeInBytes = stats.size;
            let fileSizeDisplay = `${fileSizeInBytes} bytes`;

            console.log(
              `\nasset \x1b[32m${filename}\x1b[0m ${fileSizeDisplay} \x1b[33m[extracted]\x1b[0m (name: ${entryName})`,
            );
          }

          callback();
        } catch (error) {
          callback(error);
        }
      }, 100);
    });
  }
}

export default ExtractJsonPlugin;
