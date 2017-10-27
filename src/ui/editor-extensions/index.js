import completionItemProvider from './lua/completionItemProvider';
import documentFormattingEditProvider from './lua/documentFormattingEditProvider';
import documentSymbolProvider from './lua/documentSymbolProvider';

let inited = false;

export default function registerProviders(monaco) {
  if (inited) return;
  inited = true;

  completionItemProvider();
  documentFormattingEditProvider();
  documentSymbolProvider();

  // registerCompletionItemProvider -- 代码提示
  // registerDocumentFormattingEditProvider -- 全文本格式化 (Alt + Shift + O)
  // registerDocumentSymbolProvider -- Symbol (Ctrl + Shift + O)
  // registerRenameProvider -- 重命名
  // registerDefinitionProvider -- 跳转到定义 (F12)
  // registerDocumentRangeFormattingEditProvider -- 选中文本格式化
  // registerSignatureHelpProvider -- 参数检测
  // registerHoverProvider -- 悬浮提示
  // registerReferenceProvider
  // registerImplementationProvider -- 跳转到实现
  // registerTypeDefinitionProvider -- 跳转到类型定义，ts里可跳转到interface
  // registerLinkProvider -- 超链接检测
}
