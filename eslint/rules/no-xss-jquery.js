'use strict';

const utils = require('./utils.js')

const postUnsave = [
  'after',
  'append',
  'before',
  'html',
  'prepend',
]

const preUnsave = [
  'insertAfter',
  'insertBefore',
  'appendTo',
  'prependTo',
]

module.exports = function(context) {
  return {
    CallExpression: function(node) {
      if (node.callee.type !== 'MemberExpression') return
      if (node.callee.object.name === 'j') return

      if(postUnsave.includes(node.callee.property.name)) {
        if (node.arguments.length === 0 ) return
        if (
          node.arguments[0].callee &&
          node.arguments[0].callee.type === 'MemberExpression' &&
          node.arguments[0].callee.object.name === 'j' &&
          node.arguments[0].callee.property.name === 'html'
        ) return
        if (utils.isjQuery(node)) {
          context.report({
            node: node,
            message: `$.${node.callee.property.name} is potentially dangerous. Use "$.${node.callee.property.name}(j.html(html))" instead`
          })
        }
      }else if(preUnsave.includes(node.callee.property.name)){
        if (utils.isjQuery(node)) {
          context.report({
            node: node,
            message: `$.${node.callee.property.name} is potentially dangerous. Use something else instead`
          })
        }
      }

    }
  }
}

module.exports.schema = []
