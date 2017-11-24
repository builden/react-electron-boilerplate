const { format } = require('prettier');
const Analyser = require('../analyser');
const { parseAssign, parseFunc, getCompletionItemsAtScope, getSignatureItemsAtScope } = require('../tableItemHelper');

const luaCode = `CS.LuaBehaviour = {}
function CS.LuaBehaviour(abc, cbd) end
CS.LuaBehaviour.luaScript = nil`;

function formatJson(j) {
  return format(JSON.stringify(j), { parser: 'json', printWidth: 120 });
}

test('analyse', () => {
  const analyse = new Analyser(luaCode);
  // console.log(formatJson(analyse.globalScope.tableCompItems));
});

const tableNode = {
  type: 'AssignmentStatement',
  variables: [
    {
      type: 'MemberExpression',
      indexer: '.',
      identifier: { type: 'Identifier', name: 'LuaBehaviour' },
      base: { type: 'Identifier', name: 'CS' },
    },
  ],
  init: [
    {
      type: 'TableConstructorExpression',
      fields: [
        {
          type: 'TableKeyString',
          key: { type: 'Identifier', name: 'ab' },
          value: { type: 'NumericLiteral', value: 1, raw: '1' },
        },
        {
          type: 'TableKeyString',
          key: { type: 'Identifier', name: 'cd' },
          value: {
            type: 'TableConstructorExpression',
            fields: [
              {
                type: 'TableValue',
                value: {
                  type: 'NumericLiteral',
                  value: 1,
                  raw: '1',
                },
              },
              {
                type: 'TableValue',
                value: {
                  type: 'NumericLiteral',
                  value: 2,
                  raw: '2',
                },
              },
            ],
          },
        },
        {
          type: 'TableKeyString',
          key: { type: 'Identifier', name: 'ef' },
          value: {
            type: 'TableConstructorExpression',
            fields: [
              {
                type: 'TableKeyString',
                key: { type: 'Identifier', name: 'qg' },
                value: {
                  type: 'BooleanLiteral',
                  value: false,
                  raw: 'false',
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

const funcNode = {
  type: 'FunctionDeclaration',
  identifier: {
    type: 'MemberExpression',
    indexer: '.',
    identifier: { type: 'Identifier', name: 'LuaBehaviour' },
    base: { type: 'Identifier', name: 'CS' },
  },
  isLocal: false,
  parameters: [{ type: 'Identifier', name: 'abc' }, { type: 'Identifier', name: 'cbd' }],
  body: [],
};

const assignNode = {
  type: 'AssignmentStatement',
  variables: [
    {
      type: 'MemberExpression',
      indexer: '.',
      identifier: { type: 'Identifier', name: 'luaScript' },
      base: {
        type: 'MemberExpression',
        indexer: '.',
        identifier: { type: 'Identifier', name: 'LuaBehaviour' },
        base: { type: 'Identifier', name: 'CS' },
      },
    },
  ],
  init: [{ type: 'NilLiteral', value: null, raw: 'nil' }],
};

test('parse Table', () => {
  const compItems = [];
  parseAssign(compItems, tableNode);
  parseAssign(compItems, assignNode);
  parseFunc(compItems, funcNode);

  expect(compItems).toEqual([
    {
      propName: 'CS',
      propType: 'Object',
      children: [
        {
          propName: 'LuaBehaviour',
          propType: 'Object',
          children: [
            { propName: 'ab', propType: 'number' },
            { propName: 'cd', propType: 'Object', children: [] },
            { propName: 'ef', propType: 'Object', children: [{ propName: 'qg', propType: 'bool' }] },
            { propName: 'luaScript', propType: 'any' },
          ],
        },
        {
          propName: 'LuaBehaviour',
          propType: 'Function',
          params: [{ name: 'abc', paramType: 'any' }, { name: 'cbd', paramType: 'any' }],
        },
      ],
    },
  ]);
});

test('getCompletionItemsAtScope', () => {
  const scope = {
    tableCompItems: [],
    parentScope: null,
  };

  parseAssign(scope.tableCompItems, tableNode);
  parseAssign(scope.tableCompItems, assignNode);
  parseFunc(scope.tableCompItems, funcNode);

  const rst = getCompletionItemsAtScope(scope, ['CS']);
  expect(rst).toEqual([
    {
      label: 'LuaBehaviour',
      kind: 8,
      detail: '(property) LuaBehaviour: table',
    },
    {
      label: 'LuaBehaviour',
      kind: 2,
      detail: 'function LuaBehaviour(abc: any, cbd: any)',
    },
  ]);

  const rst2 = getCompletionItemsAtScope(scope, ['LuaBehaviour', 'CS']);
  expect(rst2).toEqual([
    { label: 'ab', kind: 9, detail: '(property) ab: number' },
    { label: 'cd', kind: 8, detail: '(property) cd: table' },
    { label: 'ef', kind: 8, detail: '(property) ef: table' },
    {
      label: 'luaScript',
      kind: 9,
      detail: '(property) luaScript: any',
    },
  ]);
});

test('getSignatureItemsAtScope', () => {
  const scope = {
    tableCompItems: [],
    parentScope: null,
  };

  parseAssign(scope.tableCompItems, tableNode);
  parseFunc(scope.tableCompItems, funcNode);

  const rst = getSignatureItemsAtScope(scope, ['LuaBehaviour', 'CS']);
  expect(rst).toEqual([
    {
      label: 'LuaBehaviour(abc: any, cbd: any)',
      parameters: [{ label: 'abc' }, { label: 'cbd' }],
    },
  ]);
});
