import React, { Component } from 'react';
import { Box } from './ui';
import { Button } from 'antd';

class WebTest extends Component {
  render() {
    return (
      <Box>
        <Box>WebTest Component</Box>
        <Button type="primary">Primary</Button>
        <Button icon="file">Default</Button>
        <Button type="dashed">Dashed</Button>
        <Button type="danger">Danger</Button>
      </Box>
    );
  }
}

export default WebTest;
