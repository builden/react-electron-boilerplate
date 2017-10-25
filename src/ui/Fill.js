import React, { Component } from 'react';
import Box from './Box';

class Fill extends Component {
  render() {
    return <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} {...this.props} />;
  }
}

export default Fill;
