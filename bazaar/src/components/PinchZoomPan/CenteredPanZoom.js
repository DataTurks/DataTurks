const Viewport = require('./Viewport.js');

function CenteredPanZoom(options) {
  this.screen = new Viewport({
    x: 0,
    y: 0,
    width: options.screenWidth,
    height: options.screenHeight
  });
  this.viewport = new Viewport({
    x: 0,
    y: 0,
    width: options.screenWidth,
    height: options.screenHeight
  });
  this.scale = options.scale || 1;
}

CenteredPanZoom.prototype.pan = function(screenX, screenY) {
  this.viewport.x += screenX;
  this.viewport.y += screenY;
};

CenteredPanZoom.prototype.panFrom = function(screenStart, screenEnd) {
  this.pan(screenEnd.x - screenStart.x, screenEnd.y - screenStart.y);
};

CenteredPanZoom.prototype.oldZoom = function(factor, screenCenter) {
  let scale = (this.scale * factor).toFixed(1);
  const v1 = Viewport.convert(screenCenter, {from: this.screen, to: this.viewport});
  console.log('v1 viewport is ', screenCenter, this.screen, this.viewport, v1, scale, this.scale);
  this.viewport.x = this.viewport.x * (scale / this.scale);
  this.viewport.y = this.viewport.y * (scale / this.scale);
  this.viewport.width = this.screen.width * scale;
  this.viewport.height = this.screen.height * scale;
  this.scale = scale;

  const v2 = Viewport.convert(screenCenter, {from: this.screen, to: this.viewport});
  const deltaX = v2.x - v1.x;
  const deltaY = v2.y - v1.y;
  this.viewport.x += deltaX * factor;
  this.viewport.y += deltaY * factor;
  console.log('v2 viewport is', screenCenter, this.screen, this.viewport, v2, deltaX, deltaY);
};

// make that point the same in the post-zoom viewport
CenteredPanZoom.prototype.zoomVideo = function(scale, screenCenter) {
  // const v1 = Viewport.convert(screenCenter, {from: this.screen, to: this.viewport});
  const scalechange = scale - this.scale;
  // // const oldScal = this.scale;
  // console.log('v1 viewport is ', screenCenter, this.screen, this.viewport, v1);
  // // const oldX = this.viewport.x;
  // // const oldY = this.viewport.y;
  // this.viewport.x = this.viewport.x;
  // this.viewport.y = this.viewport.y;
  this.viewport.width = this.screen.width * scale;
  this.viewport.height = this.screen.height * scale;
  this.scale = scale;

  // // const newScreenCenter = {x: screenCenter.x * scale, y: screenCenter.y * scale};
  // const v2 = Viewport.convert(screenCenter, {from: this.screen, to: this.viewport});
  // const deltaX = v2.x - v1.x;
  // const deltaY = v2.y - v1.y;
  // console.log('v2 viewport is', screenCenter, this.screen, this.viewport, v2);
  // console.log('delta viewport is', deltaX, deltaY);
  this.viewport.x -= (screenCenter.x * scalechange);
  this.viewport.y -= (screenCenter.y * scalechange);
  console.log('v2 viewport is', this.screen, this.viewport);
};

// find zoom point in pre-zoom viewport
// make that point the same in the post-zoom viewport
CenteredPanZoom.prototype.zoom = function(factor, screenCenter) {
  // const v1 = Viewport.convert(screenCenter, {from: this.screen, to: this.viewport});
  let scale = (this.scale * factor).toFixed(1);
  // const scalechange = scale - this.scale;
  // // const oldScal = this.scale;
  console.log('v1 viewport is ', screenCenter, this.screen, this.viewport, factor, this.scale, scale);
  // // const oldX = this.viewport.x;
  // // const oldY = this.viewport.y;
  // this.viewport.x = this.viewport.x;
  // this.viewport.y = this.viewport.y;
  this.viewport.width = this.screen.width * scale;
  this.viewport.height = this.screen.height * scale;

  // // const newScreenCenter = {x: screenCenter.x * scale, y: screenCenter.y * scale};
  // const v2 = Viewport.convert(screenCenter, {from: this.screen, to: this.viewport});
  // const deltaX = v2.x - v1.x;
  // const deltaY = v2.y - v1.y;
  // console.log('v2 viewport is', screenCenter, this.screen, this.viewport, v2);
  // console.log('delta viewport is', deltaX, deltaY);
  this.viewport.x -= (screenCenter.x * factor - screenCenter.x);
  this.viewport.y -= (screenCenter.y * factor - screenCenter.y);
  this.scale = scale;
  console.log('v2 viewport is', this.screen, this.viewport);
};

module.exports = CenteredPanZoom;
