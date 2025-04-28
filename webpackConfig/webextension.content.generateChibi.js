const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const glob = require('glob');

const outputPath = path.resolve(__dirname, '../src/chibiScript/ChibiGeneratorTypes.ts');

function generateChibiTypes() {
  console.log('Generating ChibiScript type definitions...');

  const functionsDir = path.resolve(__dirname, '../src/chibiScript/functions');
  const functionFilePaths = glob.sync(path.join(functionsDir, '**/*Functions.ts'));
  const functionModules = functionFilePaths.map(filePath =>
    path.relative(functionsDir, filePath).replace(/\\/g, '/'),
  );

  const allFunctionParts = [];

  functionModules.forEach(moduleFile => {
    const modulePath = path.join(functionsDir, moduleFile);
    const moduleSource = fs.readFileSync(modulePath, 'utf8');

    const sourceFile = ts.createSourceFile(
      moduleFile,
      moduleSource,
      ts.ScriptTarget.ESNext,
      true
    );

    allFunctionParts.push(extractFunction(sourceFile));
  });

  let typeDefinitions = `/* eslint-disable prettier/prettier */\n`;
  typeDefinitions += `import functionsRegistry from './functions';\n`;
  typeDefinitions += `import type { ChibiGenerator, ChibiJson } from './ChibiGenerator';\n`;
  typeDefinitions += `import type { ReservedKey } from './ChibiRegistry';\n`;
  typeDefinitions += `import type * as CT from './ChibiTypeHelper';\n\n`;
  typeDefinitions += `export interface ChibiGeneratorFunctions<Input> {\n`;

  typeDefinitions += allFunctionParts.join('\n');

  typeDefinitions += `\n}\n`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, typeDefinitions);

  console.log(`Generated ChibiScript type definitions with functions at ${outputPath}`);
}

function extractFunction(sourceFile) {
  const functionParts = [];

  ts.forEachChild(sourceFile, node => {
    if (
      ts.isExportAssignment(node) &&
      node.expression &&
      ts.isObjectLiteralExpression(node.expression)
    ) {
      const objectLiteral = node.expression;
      objectLiteral.properties.forEach(prop => {
        if (prop.name) {
          const part = [];
          const functionName = prop.name.text;

          const args = prop.parameters || prop.initializer?.parameters || [];
          const argsString = args.map(param => {
            const paramName = param.name.text || (param.dotDotDotToken ? '...args' : 'param');
            const optional = param.questionToken || param.initializer ? '?' : '';
            const type = param.type?.getText() || 'any';
            const dotDotDot = param.dotDotDotToken ? '...' : '';
            return `${dotDotDot}${paramName}${optional}: ${type}`;
          });

          const jsDocs = prop.jsDoc ? prop.jsDoc.map(doc => `  ${doc.getText()}`) : [];

          const returnTypeNames =
            prop.type?.getText() ||
            prop.initializer?.type?.getText() ||
            `ReturnType<typeof functionsRegistry.${functionName}>`;

          const typeParameters = prop.typeParameters || prop.initializer?.typeParameters;
            const typeParametersString = typeParameters
            ? typeParameters
              .filter(param => !param.name || param.name.text !== 'Input')
              .map(param => param.getText())
              .join(', ')
            : '';

          console.log(`Function Name: ${functionName}`);

          part.push(
            `${jsDocs.join('\n').replace('*/', `* @see {@link  functionsRegistry.${functionName}} for implementation details\n   */`)}`,
          );

          part.push(`  ${functionName}: CT.MatchesType<Input, CT.InputType<typeof functionsRegistry.${functionName}>> extends true`);
          part.push(
            `    ? ${typeParametersString ? `<${typeParametersString}>` : ''}(${argsString.slice(2).join(', ')}) => ChibiGenerator<${returnTypeNames}>`,
          );
          part.push(`    : CT.TypeMismatchError<'${functionName}', Input, CT.InputType<typeof functionsRegistry.${functionName}>>;`);

          functionParts.push(part.join('\n'));
        }
      });
    }
  });

  return functionParts.join('\n');
}

generateChibiTypes();
