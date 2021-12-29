/**
 * Convert a degree angle in radian.
 */
export function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/**
 * Maps the value from one range of [inputMin..inputMax] to another range of [outputMin..outputMax].
 *
 * @param  {Number} value     The value to map.
 * @param  {Number} inputMin  The input's minimum value.
 * @param  {Number} inputMax  The input's maximum value.
 * @param  {Number} outputMin The output's minimum value.
 * @param  {Number} outputMax The output's maximum value.
 * @return {Number}           The input value mapped to the output range.
 */
export function map(value, inputMin, inputMax, outputMin, outputMax) {
  return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;
}

/**
 * Get the next damped value for a given factor.
 *
 * @param  {number} targetValue The final value.
 * @param  {number} currentValue The current value.
 * @param  {number=} [factor=0.5] The factor used to reach the target value.
 * @param  {number=} [precision=0.01] The precision used to calculate the latest value.
 * @return {number} The next value.
 */
export function damp(targetValue, currentValue, factor = 0.5, precision = 0.01) {
  return Math.abs(targetValue - currentValue) < precision
    ? targetValue
    : currentValue + (targetValue - currentValue) * factor;
}

/**
 * Format a CSS transform matrix with the given values.
 *
 * @param  {Object}  transform
 * @param  {Number=} [transform.scaleX=1]     The scale on the x axis.
 * @param  {Number=} [transform.scaleY=1]     The scale on the y axis.
 * @param  {Number=} [transform.skewX=0]      The skew on the x axis.
 * @param  {Number=} [transform.skewY=0]      The skew on the y axis.
 * @param  {Number=} [transform.translateX=0] The translate on the x axis.
 * @param  {Number=} [transform.translateY=0] The translate on the y axis.
 * @return {String}                           A formatted CSS matrix transform.
 *
 * @example
 * ```js
 * matrix({ scaleX: 0.5, scaleY: 0.5 });
 * // matrix(0.5, 0, 0, 0.5, 0, 0)
 * ```
 */
export function matrix(transform) {
  // eslint-disable-next-line no-param-reassign
  transform = transform || {};
  return `matrix(${transform.scaleX ?? 1}, ${transform.skewY ?? 0}, ${transform.skewX ?? 0}, ${
    transform.scaleY ?? 1
  }, ${transform.translateX ?? 0}, ${transform.translateY ?? 0})`;
}

export function easeInOutExpo(x) {
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
}
