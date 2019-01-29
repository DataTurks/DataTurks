
function Viewport(options) {
  this.x = options.x || 0;
  this.y = options.y || 0;
  this.width = options.width;
  this.height = options.height;
}

Viewport.convert = function(point, options) {
  const fromView = options.from;
  const toView = options.to;
  const widthScale = fromView.width / toView.width;
  const heightScale = fromView.height / toView.height;

  const result = {
    x: point.x * widthScale + toView.x * widthScale,
    y: point.y * heightScale + toView.y * heightScale
  };
  return result;
};

module.exports = Viewport;
