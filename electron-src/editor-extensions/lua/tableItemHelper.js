const _ = require('lodash');
const { getContainerNames, CompletionItemKind } = require('./comm');

function transType(type) {
  switch (type) {
    case 'NumericLiteral':
      return 'number';
    case 'StringLiteral':
      return 'string';
    case 'BooleanLiteral':
      return 'bool';
    case 'TableConstructorExpression':
      return 'Object';
    case 'NilLiteral':
    case 'any':
      return 'any';
    default:
      console.log('unknown type', type);
      return 'any';
  }
}

function getValueInitType(orignType) {
  switch (orignType) {
    case 'number':
      return {
        kind: CompletionItemKind.Property,
        name: 'number',
      };
    case 'string':
      return {
        kind: CompletionItemKind.Property,
        name: 'string',
      };
    case 'bool':
      return {
        kind: CompletionItemKind.Property,
        name: 'bool',
      };
    case 'Object':
      return {
        kind: CompletionItemKind.Module,
        name: 'table',
      };
    case 'Function':
      return {
        kind: CompletionItemKind.Function,
        name: 'function',
      };
    default:
      return {
        kind: CompletionItemKind.Property,
        name: 'any',
      };
  }
}

function parseFunc(target, node) {
  const containerNames = getContainerNames(node.identifier);
  let curCursor = target;

  for (let i = containerNames.length - 1; i >= 0; i--) {
    const name = containerNames[i];
    if (i === 0) {
      if (node.type === 'FunctionDeclaration') {
        const params = node.parameters.map(param => ({
          name: param.name,
          paramType: 'any',
        }));
        curCursor.push({
          propName: name,
          propType: 'Function',
          params: params,
        });
      }
    } else {
      let objItem = _.find(curCursor, oneProp => oneProp.propName === name && oneProp.propType === 'Object');

      if (!objItem) {
        objItem = { propName: name, propType: 'Object', children: [] };
        curCursor.push(objItem);
      }
      curCursor = objItem.children;
    }
  }
  return target;
}

function parseTableCtor(target, node) {
  node.fields.forEach(field => {
    if (field.type === 'TableKeyString') {
      const name = field.key.name;
      const prop = { propName: name, propType: transType(field.value.type) };
      target.push(prop);
      if (field.value.type === 'TableConstructorExpression') {
        prop.children = [];
        parseTableCtor(prop.children, field.value);
      }
    }
  });
  return target;
}

function parseValue(target, name, node) {
  if (node.type === 'TableConstructorExpression') {
    const prop = { propName: name, propType: 'Object', children: [] };
    target.push(prop);
    parseTableCtor(prop.children, node);
  } else {
    const prop = { propName: name, propType: transType(node.type) };
    target.push(prop);
  }
}

function parseAssign(target, node) {
  node.variables.forEach((oneVar, idx) => {
    if (oneVar.base) {
      const containerNames = getContainerNames(oneVar);
      let curCursor = target;
      for (let i = containerNames.length - 1; i >= 0; i--) {
        const name = containerNames[i];
        if (i === 0) {
          if (node.type === 'AssignmentStatement') {
            parseValue(curCursor, name, node.init[idx]);
          }
        } else {
          let objItem = _.find(curCursor, oneProp => oneProp.propName === name && oneProp.propType === 'Object');

          if (!objItem) {
            objItem = { propName: name, propType: 'Object', children: [] };
            curCursor.push(objItem);
          }
          curCursor = objItem.children;
        }
      }
    }
  });
  return target;
}

function transParams(params) {
  return params.map(param => `${param.name}: ${transType(param.paramType)}`).join(', ');
}

function getCompletionItemsAtScope(scope, containerNames) {
  if (!containerNames.length) return [];
  const [baseName] = containerNames;
  if (
    !_.find(scope.tableCompItems, item => item.propName === baseName && item.propType === 'Object') &&
    scope.parentScope
  ) {
    return getCompletionItemsAtScope(scope.parentScope, containerNames);
  }
  const rst = [];
  let curCursor = scope.tableCompItems;
  for (let i = containerNames.length - 1; i >= 0; i--) {
    const name = containerNames[i];
    const prop = _.find(curCursor, item => item.propName === name && item.propType === 'Object');
    if (prop) {
      if (i === 0) {
        prop.children.forEach(child => {
          const typeInfo = getValueInitType(child.propType);
          const isFunc = child.propType === 'Function';
          if (isFunc && _.find(rst, old => old.label === child.propName && old.kind === CompletionItemKind.Function))
            return;
          const item = {
            label: child.propName,
            kind: typeInfo.kind,
            detail: `(property) ${child.propName}: ${typeInfo.name}`,
          };
          if (isFunc) {
            const params = transParams(child.params);
            item.detail = `function ${child.propName}(${params})`;
          }
          rst.push(item);
        });
      } else {
        curCursor = prop.children;
      }
    } else {
      break;
    }
  }
  return rst;
}

function getSignatureItemsAtScope(scope, containerNames) {
  if (!containerNames.length) return [];
  const [baseName] = containerNames;
  if (
    !!_.find(scope.tableCompItems, item => item.propName === baseName && item.propType === 'Object') &&
    scope.parentScope
  ) {
    return getSignatureItemsAtScope(scope.parentScope, containerNames);
  }
  const rst = [];
  let curCursor = scope.tableCompItems;
  for (let i = containerNames.length - 1; i >= 0; i--) {
    const name = containerNames[i];
    if (i > 0) {
      const prop = _.find(curCursor, item => item.propName === name && item.propType === 'Object');
      if (prop) curCursor = prop.children;
      else break;
    } else {
      curCursor.forEach(item => {
        if (item.propName === name && item.propType === 'Function') {
          rst.push({
            label: `${name}(${transParams(item.params)})`,
            parameters: item.params.map(param => ({ label: `${param.name}: ${transType(param.paramType)}` })),
          });
        }
      });
    }
  }
  return rst;
}

exports.parseFunc = parseFunc;
exports.parseAssign = parseAssign;
exports.transType = transType;
exports.getCompletionItemsAtScope = getCompletionItemsAtScope;
exports.getSignatureItemsAtScope = getSignatureItemsAtScope;
