const { formatText } = require('lua-fmt');
const Analyser = require('./analyser');
const findSymbols = require('./findSymbols');
const { findDefNode, findReferenceNodes, getCompletionItems } = require('./helper');

let changeAnalyser = null;

process.on('message', m => {
  if (m.id) {
    try {
      const rst = { id: m.id, code: 0 };
      if (m.channel === 'onDidChangeModelContent') {
        changeAnalyser = new Analyser(m.body);
      } else if (m.channel === 'symbol') {
        const symbols = findSymbols(changeAnalyser.ast);
        rst.body = symbols;
      } else if (m.channel === 'definition') {
        const defNode = findDefNode(changeAnalyser.allIdentNodes, m.body.word, m.body.offset);
        rst.body = defNode.loc;
      } else if (m.channel === 'reference') {
        const nodes = findReferenceNodes(changeAnalyser.allIdentNodes, m.body.word, m.body.offset);
        rst.body = nodes.map(node => node.loc);
      } else if (m.channel === 'luaDocumentFormatting') {
        rst.body = formatLua(m.body);
      } else if (m.channel === 'completionItem') {
        console.log('completionItem', m.body);
        const completionAnalyser = new Analyser(m.body.value, m.body.offset);
        rst.body = getCompletionItems(completionAnalyser.globalScope, m.body.offset);
      }

      process.send(rst);
    } catch (e) {
      console.error('sub-child catch', e);
      process.send({
        id: m.id,
        code: -1,
      });
    }
  }
});

function formatLua(body) {
  console.log('formatLua', body);
  const formatOptions = {
    indentCount: body.tabSize || 4,
    // lineWidth: 80,
    // quotemark: 'single'
  };
  const text = formatText(body.value, formatOptions);
  return text;
}
