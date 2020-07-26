'use strict';

const utils = require('./utils.js')

module.exports = function(context) {
  return {
    CallExpression: function(node) {
      if (node.callee.type !== 'MemberExpression') return
      if (node.callee.property.name !== 'appendTo') return
      if (node.arguments.length === 0 ) return

      if (utils.isjQuery(node)) {
        context.report({
          node: node,
          message: '$.appendTo is potentially dangerous. Use "utils.safeAppendTo($Html, $)" instead'
        })
      }
    }
  }
}

module.exports.schema = []
