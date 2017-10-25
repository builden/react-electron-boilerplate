import PropTypes from 'prop-types';

export const sizeType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

export const ofValues = PropTypes.oneOf(['visible', 'hidden', 'scroll', 'auto']);

export function toPx(v) {
  return Number.isInteger(v) ? `${v}px` : v;
}
