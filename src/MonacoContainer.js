import React, { Component } from 'react';
import { MonacoEditor } from './ui';

const defaultCode = `
local ab, qux = function(efc) end, function(abc) 
   local def = abc + 1
   return def
end

function add(xy, zf)

   return xy + zf
end

function xad(xx)

end

`;
/* const defaultCode = `local abc = 456

function qux(ab, bcd) 
   local abd = ab + '123' + bcd
   bcd = abd + 87
   function qux(cc)
      return abc + 4
   end
   qux(123)
end

local bar = function()
end

abc = 789;

qux(1, 2)`; */

/*
const defaultCode = `local xyz = "xx"
xyz = "dd"

function add(a,b) 
local c = 2
   function xx()
     function yx()
       local xx = 3
     end
     local xx = 3
   end
return a +b
end

local qux = function(foo, bar)
  local xx = 1
  function innerFunc(a, b) 
    local c = 2
    return a + b
  end
  return innerFunc(1, 2) 
end

module = {}

-- 定义一个常量
module.constant = "这是一个常量"

-- 定义一个函数
function module.func1()
    io.write("这是一个公有函数！")
end`;*/

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
