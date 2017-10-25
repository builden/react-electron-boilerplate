import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sizeType, ofValues, toPx } from './util';

class Box extends Component {
  render() {
    const {
      w,
      h,
      m,
      mx,
      my,
      mt,
      mb,
      ml,
      mr,
      p,
      px,
      py,
      pt,
      pb,
      pl,
      pr,
      ofx,
      ofy,
      ofxy,
      flex,
      column,
      reverse,
      wrap,
      justifyContent,
      alignItems,
      alignContent,
      order,
      grow,
      shrink,
      basis,
      alignSelf,
      style,
      ...rest
    } = this.props;

    const wrapStyle = {
      width: toPx(w),
      height: toPx(h),
      margin: m,
      padding: p,
      overflow: ofxy,
    };

    if (mx) wrapStyle.marginLeft = wrapStyle.marginRight = toPx(mx);
    if (my) wrapStyle.marginTop = wrapStyle.marginBottom = toPx(my);
    if (px) wrapStyle.paddingLeft = wrapStyle.paddingRight = toPx(px);
    if (py) wrapStyle.paddingTop = wrapStyle.paddingBottom = toPx(py);
    if (mt) wrapStyle.marginTop = toPx(mt);
    if (mb) wrapStyle.marginBottom = toPx(mb);
    if (ml) wrapStyle.marginLeft = toPx(ml);
    if (mr) wrapStyle.marginRight = toPx(mr);
    if (pt) wrapStyle.paddingTop = toPx(pt);
    if (pb) wrapStyle.paddingBottom = toPx(pb);
    if (pl) wrapStyle.paddingLeft = toPx(pl);
    if (pr) wrapStyle.paddingRight = toPx(pr);
    if (ofx) wrapStyle.overflowX = ofx;
    if (ofy) wrapStyle.overflowY = ofy;

    if (order) wrapStyle.order = order;
    if ('grow' in this.props) wrapStyle.flexGrow = grow;
    if (basis) wrapStyle.flexBasis = basis;
    if ('shrink' in this.props) wrapStyle.flexShrink = shrink;
    if (alignSelf) wrapStyle.alignSelf = alignSelf;

    if (flex) {
      wrapStyle.display = 'flex';
      let direction = column ? 'column' : 'row';
      if (reverse) direction += '-reverse';
      if (direction !== 'row') wrapStyle.flexDirection = direction;
      if (wrap) wrapStyle.flexWrap = 'wrap';
      if (justifyContent) wrapStyle.justifyContent = justifyContent;
      if (alignItems) wrapStyle.alignItems = alignItems;
      if (alignContent) wrapStyle.alignContent = alignContent;
    }

    const wrapProps = {
      style: { ...wrapStyle, ...style },
      ...rest,
    };
    return <div {...wrapProps} />;
  }
}

// m: margin
// p: padding
//   '10px 5px 15px 20px' - top, right, bottom, left
//   '10px 5px 15px'      - top, left & right, bottom
//   '10px 5px'           - top & bottom, left & right
//   '10px'               - top & right & bottom & left
Box.propTypes = {
  w: sizeType,
  h: sizeType,

  m: sizeType,
  mx: sizeType, // left & right
  my: sizeType, // top & bottom
  mt: sizeType, // top
  mb: sizeType, // bottom
  ml: sizeType, // left
  mr: sizeType, // right
  p: sizeType,
  px: sizeType, // left & right
  py: sizeType, // top & bottom
  pt: sizeType, // top
  pb: sizeType, // bottom
  pl: sizeType, // left
  pr: sizeType, // right

  ofx: ofValues,
  ofy: ofValues,
  ofxy: ofValues,

  column: PropTypes.bool, // default is false
  reverse: PropTypes.bool, // default is false
  wrap: PropTypes.bool, // default is false

  // 主轴上的对齐方式: default is 'flex-start'
  justifyContent: PropTypes.oneOf(['flex-start', 'flex-end', 'center', 'space-between', 'space-around']),

  // 交叉轴上的对齐方式: default is 'stretch', 如果项目未设置高度或设为auto，讲占满整个容器的高度
  alignItems: PropTypes.oneOf(['flex-start', 'flex-end', 'center', 'baseline', 'stretch ']),

  // 多根主轴线的对齐方式: default is 'stretch', 轴线占满整个屏幕
  alignContent: PropTypes.oneOf(['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'stretch']),

  order: PropTypes.number,
  grow: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  basis: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  shrink: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  // default is auto, extends from parent
  alignSelf: PropTypes.oneOf(['flex-start', 'flex-end', 'center', 'baseline', 'stretch']),
};

export default Box;
