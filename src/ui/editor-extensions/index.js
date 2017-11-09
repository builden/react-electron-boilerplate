import completionItemProvider from './lua/Provider/completionItemProvider';
import documentFormattingEditProvider from './lua/Provider/documentFormattingEditProvider';
import documentSymbolProvider from './lua/Provider/documentSymbolProvider';
import definitionProvider from './lua/Provider/definitionProvider';
import referenceProvider from './lua/Provider/referenceProvider';
import renameProvider from './lua/Provider/renameProvider';
import { updateRealAnalyse } from './lua/realAnalyse';

let inited = false;

export function registerProviders(monaco) {
  if (inited) return;
  inited = true;

  completionItemProvider();
  documentFormattingEditProvider();

  documentSymbolProvider();

  definitionProvider();
  referenceProvider();
  renameProvider();

  // registerCompletionItemProvider -- 代码提示
  // registerDocumentFormattingEditProvider -- 全文本格式化 (Alt + Shift + O)
  // registerDocumentSymbolProvider -- Symbol (Ctrl + Shift + O)
  // registerRenameProvider -- 重命名
  // registerDefinitionProvider -- 跳转到定义 (F12), Peek Definition (Alt + F12)
  // registerReferenceProvider -- 所有被引用的地方，Find All References (Shift + F12)
  // registerDocumentRangeFormattingEditProvider -- 选中文本格式化
  // registerSignatureHelpProvider -- 参数检测
  // registerHoverProvider -- 悬浮提示
  // registerImplementationProvider -- 跳转到实现
  // registerTypeDefinitionProvider -- 跳转到类型定义，ts里可跳转到interface
  // registerLinkProvider -- 超链接检测
}

export function watchContent(editor, lang) {
  if (lang === 'lua') {
    updateRealAnalyse(editor.model.id, editor.getValue());
    editor.onDidChangeModelContent(e => {
      updateRealAnalyse(editor.model.id, editor.getValue());
    });
  }
}
