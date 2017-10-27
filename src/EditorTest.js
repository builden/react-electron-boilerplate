import React, { Component } from 'react';
import MonacoContainer from './MonacoContainer';
import { Fill, Box, Flex } from './ui';

const supportLang = ['javascript', 'lua'];
const themes = ['vs-dark', 'vs'];
class EditorTest extends Component {
  state = {
    language: 'lua',
    theme: 'vs-dark',
  };

  renderHeader = () => {
    return (
      <Flex shrink={0} h={30} my={4}>
        <select onChange={e => this.setState({ language: e.target.value })} defaultValue={this.state.language}>
          {supportLang.map(lang => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select onChange={e => this.setState({ theme: e.target.value })} defaultValue={this.state.theme}>
          {themes.map(theme => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </Flex>
    );
  };

  render() {
    const { language, theme } = this.state;
    return (
      <Fill flex column>
        {this.renderHeader()}
        <Box grow={1} style={{ position: 'relative' }} ofxy="hidden">
          <Fill>
            <MonacoContainer language={language} theme={theme} />
          </Fill>
        </Box>
      </Fill>
    );
  }
}

export default EditorTest;
