'use strict';

const utils = require('./utils.js')

module.exports = function(context) {
  return {
    CallExpression: function(node) {
      if (node.callee.type !== 'MemberExpression') return
      if (node.callee.property.name !== 'insertAfter') return
      if (node.arguments.length === 0 ) return

      if (utils.isjQuery(node)) {
        context.report({
          node: node,
          message: '$.insertAfter is potentially dangerous. Use "j.safeinsertAfter($HTML, $)" instead'
        })
      }
    }
  }
}

module.exports.schema = []
