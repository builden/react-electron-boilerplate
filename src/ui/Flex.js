import React, { Component } from 'react';
import Box from './Box';

class Flex extends Component {
  render() {
    return <Box flex {...this.props} />;
  }
}

export default Flex;
