import { globSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join, relative, dirname } from 'path';
import { createSourceFile, ScriptTarget, forEachChild, isExportAssignment, isObjectLiteralExpression } from 'typescript';

const outputPath = resolve(import.meta.dirname, '../src/chibiScript/ChibiGeneratorTypes.ts');

function generateChibiTypes() {
  console.log('Generating ChibiScript type definitions...');

  const functionsDir = resolve(import.meta.dirname, '../src/chibiScript/functions');
  const filesNodeGlobSync = globSync(join(functionsDir, '**/*Functions.ts'), { nodir: true });
  const functionModules = filesNodeGlobSync.map(filePath =>
    relative(functionsDir, filePath).replace(/\\/g, '/'),
  ).sort();  

  const allFunctionParts = [];

  functionModules.forEach(moduleFile => {
    const modulePath = join(functionsDir, moduleFile);
    const moduleSource = readFileSync(modulePath, 'utf8');

    const sourceFile = createSourceFile(
      moduleFile,
      moduleSource,
      ScriptTarget.ESNext,
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

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, typeDefinitions);

  console.log(`Generated ChibiScript type definitions with functions at ${outputPath}`);
}

function extractFunction(sourceFile) {
  const functionParts = [];

  forEachChild(sourceFile, node => {
    if (
      isExportAssignment(node) &&
      node.expression &&
      isObjectLiteralExpression(node.expression)
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
