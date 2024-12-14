const postUnSave = ['after', 'append', 'before', 'html', 'prepend'];

const preUnSave = ['insertAfter', 'insertBefore', 'appendTo', 'prependTo'];

/**
 * @typedef {Parameters<NonNullable<import('eslint').Rule.RuleListener['CallExpression']>>[0]} Node
 */

/**
 * @param {Node} node
 * @returns {Node | null}
 */
function traverse(node) {
  while (node) {
    switch (node.type) {
      case 'CallExpression':
        node = node.callee;
        break;
      case 'MemberExpression':
        node = node.object;
        break;
      case 'Identifier':
        return node;
      default:
        return null;
    }
  }

  return null;
}

// Traverses from a node up to its root parent to determine if it
// originated from a jQuery `$()` function.
//
// node - The CallExpression node to start the traversal.
//
// Examples
//
//   // $('div').find('p').first()
//   isjQuery(firstNode) // => true
//
// Returns true if the function call node is attached to a jQuery element set.
/**
 *
 * @param {Node} node
 * @returns
 */
function isjQuery(node) {
  return true;
  const id = traverse(node);
  return id && id.name.startsWith('$');
}

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'eslint-plugin-jquery-unsafe-malsync',
    version: '0.1.0',
  },
  configs: {},
  rules: {
    'no-xss-jquery': {
      create: context => ({
        CallExpression(node) {
          if (node.callee.type !== 'MemberExpression') return;
          if (node.callee.object.name === 'j') return;

          if (postUnSave.includes(node.callee.property.name)) {
            if (node.arguments.length === 0) return;
            if (
              node.arguments[0].callee &&
              node.arguments[0].callee.type === 'MemberExpression' &&
              node.arguments[0].callee.object.name === 'j' &&
              node.arguments[0].callee.property.name === 'html'
            )
              return;
            if (isjQuery(node)) {
              context.report({
                node,
                message: `$.${node.callee.property.name} is potentially dangerous. Use "$.${node.callee.property.name}(j.html(html))" instead`,
              });
            }
          } else if (preUnSave.includes(node.callee.property.name)) {
            if (isjQuery(node)) {
              context.report({
                node,
                message: `$.${node.callee.property.name} is potentially dangerous. Use something else instead`,
              });
            }
          }
        },
      }),
    },
  },
};

Object.assign(
  plugin.configs,
  /** @type {import('eslint').ESLint.Plugin['configs']} */ ({
    recommended: [
      {
        plugins: {
          'jquery-unsafe-malsync': plugin,
        },
        rules: {
          'jquery-unsafe-malsync/no-xss-jquery': 'error',
        },
      },
    ],
  }),
);

export default plugin;
