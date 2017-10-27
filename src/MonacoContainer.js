import React, { Component } from 'react';
import { MonacoEditor } from './ui';

const defaultCode = `function add(a,b) 
return a +b;
end

local x= "xx";`;

class MonacoContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: defaultCode,
    };
  }
  editorDidMount = (editor, monaco) => {
    console.log('editorDidMount', editor);
    editor.focus();
    window.editor = editor;
    editor.addAction({
      id: 'custorm.testMenu',
      label: 'myMenu',
      contextMenuGroupId: 'myMenuGroup',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_U],
      run: commEditor => {
        const value = editor.getModel().getValueInRange(editor.getSelection());
        console.log('click Menu', value);
      },
    });
  };
  onChange = (newValue, e) => {
    // console.log('onChange', newValue, e);
  };
  render() {
    const { language, theme } = this.props;
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true,
      automaticLayout: true,
    };
    return (
      <MonacoEditor
        language={language}
        theme={theme}
        value={code}
        options={options}
        onChange={this.onChange}
        editorDidMount={this.editorDidMount}
      />
    );
  }
}

export default MonacoContainer;
