import completionItemProvider from './lua/completionItemProvider';
import documentFormattingEditProvider from './lua/documentFormattingEditProvider';
import documentSymbolProvider from './lua/documentSymbolProvider';
import definitionProvider from './lua/definitionProvider';
import referenceProvider from './lua/referenceProvider';
import { docAnalyse } from './lua/analyser';

let inited = false;

export default function registerProviders(monaco, editor) {
  if (inited) return;
  inited = true;

  completionItemProvider();
  documentFormattingEditProvider();

  documentSymbolProvider();

  const value = editor.getValue();
  docAnalyse(value);
  definitionProvider();
  referenceProvider();

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
