const Analyser = require('./analyser');
const findSymbols = require('./findSymbols');
const { findDefNode, findReferenceNodes } = require('./helper');
const { initXlua } = require('./xlua');

const changeAnalyser = {};
initXlua();

process.on('message', m => {
  if (m.id) {
    try {
      const rst = { id: m.id, code: 0 };
      if (m.channel === 'onDidChangeModelContent') {
        try {
          changeAnalyser[m.body.modelId] = new Analyser(m.body.value);
        } catch (err) {
          rst.code = -1;
          rst.msg = err.message;
        }
      } else if (m.channel === 'symbol') {
        const symbols = findSymbols(changeAnalyser[m.body.modelId].ast);
        rst.body = symbols;
      } else if (m.channel === 'definition') {
        const defNode = findDefNode(changeAnalyser[m.body.modelId].allIdentNodes, m.body.word, m.body.offset);
        rst.body = defNode.loc;
      } else if (m.channel === 'reference') {
        const nodes = findReferenceNodes(changeAnalyser[m.body.modelId].allIdentNodes, m.body.word, m.body.offset);
        rst.body = nodes.map(node => node.loc);
      } else if (m.channel === 'completionItem') {
        const completionAnalyser = new Analyser(m.body.value, m.body.offset);
        rst.body = completionAnalyser.getCompletionItems();
      } else if (m.channel === 'signature') {
        const signatureAnalyser = new Analyser(m.body.value, m.body.offset, true);
        rst.body = signatureAnalyser.getSignature();
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
