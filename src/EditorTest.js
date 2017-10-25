import React, { Component } from 'react';
import MonacoContainer from './MonacoContainer';
import { Fill } from './ui';

class EditorTest extends Component {
  render() {
    return (
      <Fill flex ofxy="hidden">
        <MonacoContainer />
      </Fill>
    );
  }
}

export default EditorTest;
