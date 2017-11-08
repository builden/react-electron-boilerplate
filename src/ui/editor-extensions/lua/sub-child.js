const Analyser = require('./analyser');
const findSymbols = require('./findSymbols');
const { findDefNode, findReferenceNodes } = require('./helper');

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
      } else if (m.channel === 'completionItem') {
        const completionAnalyser = new Analyser(m.body.value, m.body.offset);
        rst.body = completionAnalyser.getCompletionItems();
      }

      process.send(rst);
    } catch (e) {
      // console.error('sub-child catch', e);
      process.send({
        id: m.id,
        code: -1,
      });
    }
  }
});
