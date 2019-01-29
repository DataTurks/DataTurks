
import React from 'react';

const MIN_SCALE = -10;
const MAX_SCALE = 100;
const SETTLE_RANGE = 0.001;
const ADDITIONAL_LIMIT = 0.2;
// const DOUBLE_TAP_THRESHOLD = 300;
const ANIMATION_SPEED = 0.01;
const RESET_ANIMATION_SPEED = 0.08;
const INITIAL_X = 0;
const INITIAL_Y = 0;
const INITIAL_SCALE = 1;

const settle = (val, target, range) => {
  const lowerRange = val > target - range && val < target;
  const upperRange = val < target + range && val > target;
  return lowerRange || upperRange ? target : val;
};

const inverse = (x) => x * -1;

const getPointFromTouch = (touch, element) => {
  const rect = element.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
};

const getMidpoint = (pointA, pointB) => ({
  x: (pointA.x + pointB.x) / 2,
  y: (pointA.y + pointB.y) / 2,
});

const getDistanceBetweenPoints = (pointA, pointB) => (
  Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2))
);

const between = (min, max, value) => Math.min(max, Math.max(min, value));

class PinchZoomPan extends React.Component {
  constructor() {
    super(...arguments);
    this.state = this.getInititalState();

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  getInititalState() {
    return {
      x: INITIAL_X,
      y: INITIAL_Y,
      scale: INITIAL_SCALE,
      width: this.props.width,
      height: this.props.height,
    };
  }

  reset() {
    const frame = () => {
      if (this.state.scale === INITIAL_SCALE && this.state.x === INITIAL_X && this.state.y === INITIAL_Y) return null;
      const distance = INITIAL_SCALE - this.state.scale;
      const distanceX = INITIAL_X - this.state.x;
      const distanceY = INITIAL_Y - this.state.y;

      const targetScale = settle(this.state.scale + (RESET_ANIMATION_SPEED * distance), INITIAL_SCALE, SETTLE_RANGE);
      const targetX = settle(this.state.x + (RESET_ANIMATION_SPEED * distanceX), INITIAL_X, SETTLE_RANGE);
      const targetY = settle(this.state.y + (RESET_ANIMATION_SPEED * distanceY), INITIAL_Y, SETTLE_RANGE);

      const nextWidth = this.props.width * targetScale;
      const nextHeight = this.props.height * targetScale;

      this.setState({
        x: targetX,
        y: targetY,
        scale: targetScale,
        width: nextWidth,
        height: nextHeight,
      }, () => {
        this.animation = requestAnimationFrame(frame);
      });
    };

    this.animation = requestAnimationFrame(frame);
  }

  zoomTo(scale, midpoint) {
    const frame = () => {
      console.log('zoom to', this.state);
      if (this.state.scale === scale) return null;

      const distance = scale - this.state.scale;
      const targetScale = this.state.scale + (ANIMATION_SPEED * distance);

      this.zoom(settle(targetScale, scale, SETTLE_RANGE), midpoint);
      // this.animation = requestAnimationFrame(frame);
    };

    this.animation = requestAnimationFrame(frame);
  }

  handleTouchStart(e) {
    console.log('handleTouchStart', e, Object.keys(e), Object.keys(event.target));
    this.handleTapStart(event);


    //     // If we have multiple child nodes, use the scroll[Height/Width]
    //     // If we have no child-nodes, use bounds to find size of inner content
    // let bounds = event.currentTarget || event.target;
    // const target = event.currentTarget || event.target;
    // if (target.childNodes.length > 1) {
    //   bounds = { width: target.scrollWidth, height: target.scrollHeight };
    // } else {
    //   bounds = event.target.getBoundingClientRect();
    // }

    // // Find start position of drag based on touch/mouse coordinates
    // var startX = typeof event.clientX === 'undefined' ? e.changedTouches[0].clientX : e.clientX,
    //     startY = typeof e.clientY === 'undefined' ? e.changedTouches[0].clientY : e.clientY;

    // var state = {
    //     dragging: true,

    //     elHeight: this.el.clientHeight,
    //     elWidth: this.el.clientWidth,

    //     startX: startX,
    //     startY: startY,

    //     scrollX: this.el.scrollLeft,
    //     scrollY: this.el.scrollTop,

    //     maxX: bounds.width,
    //     maxY: bounds.height
    // };

    // this.setState(state);

    // if (this.props.onPanStart) {
    //     this.props.onPanStart(state);
    // }

    // // if (this.animation) {
    //   cancelAnimationFrame(this.animation);
    // }
    // if (event.touches.length === 2) this.handlePinchStart(event);
    // if (event.touches.length === 1) this.handleTapStart(event);
  }

  handleTouchMove(event) {
    console.log('handleTouchMove', Object.keys(event), Object.keys(event.target),
      event.clientX, event.clientY, event.screenX, event.screenY);
    // if (event.touches.length === 2) this.handlePinchMove(event);
    // if (event.touches.length === 1) this.handlePanMove(event);
  }

  handleTouchEnd(event) {
    event.preventDefault();
    console.log('hanlde wheel', this.state, Object.keys(event), event.deltaMode,
      event.deltaX, event.deltaWheel, event.wheelDetal, event.deltaY, event.deltaZ, event.screenX, event.screenY);
    console.log('handlewheel', event.pageX, event.pageY, event.deltaX, event.deltaY, event.screenX, event.screenY);
    // const scale = between(MIN_SCALE - ADDITIONAL_LIMIT, MAX_SCALE + ADDITIONAL_LIMIT, this.state.scale * (distance / this.lastDistance));
    let scale = this.state.scale;
    if (event.deltaY < 0) {
      scale = scale + (0 - event.deltaY);
    } else {
      scale = scale - event.deltaY;
    }
    if (scale > MAX_SCALE) scale = MAX_SCALE;
    else if (scale < MIN_SCALE) scale = MIN_SCALE;
    // this.state.scale = scale;
    this.zoomTo(scale, {x: event.screenX, y: event.screenY});
    // return false;
    // if (event.touches.length > 0) return null;

    // if (this.state.scale > MAX_SCALE) return this.zoomTo(MAX_SCALE, this.lastMidpoint);
    // if (this.state.scale < MIN_SCALE) return this.zoomTo(MIN_SCALE, this.lastMidpoint);

    // if (this.lastTouchEnd && this.lastTouchEnd + DOUBLE_TAP_THRESHOLD > event.timeStamp) {
    //   this.reset();
    // }

    // this.lastTouchEnd = event.timeStamp;
  }

  handleTapStart(event) {
    this.lastPanPoint = getPointFromTouch(event.touches[0], this.container);
  }

  handlePanMove(event) {
    if (this.state.scale === 1) return null;

    event.preventDefault();

    const point = getPointFromTouch(event.touches[0], this.container);
    const nextX = this.state.x + point.x - this.lastPanPoint.x;
    const nextY = this.state.y + point.y - this.lastPanPoint.y;

    this.setState({
      x: between(this.props.width - this.state.width, 0, nextX),
      y: between(this.props.height - this.state.height, 0, nextY),
    });

    this.lastPanPoint = point;
  }

  handlePinchStart(event) {
    const pointA = getPointFromTouch(event.touches[0], this.container);
    const pointB = getPointFromTouch(event.touches[1], this.container);
    this.lastDistance = getDistanceBetweenPoints(pointA, pointB);
  }

  handlePinchMove(event) {
    event.preventDefault();
    const pointA = getPointFromTouch(event.touches[0], this.container);
    const pointB = getPointFromTouch(event.touches[1], this.container);
    const distance = getDistanceBetweenPoints(pointA, pointB);
    const midpoint = getMidpoint(pointA, pointB);
    const scale = between(MIN_SCALE - ADDITIONAL_LIMIT, MAX_SCALE + ADDITIONAL_LIMIT, this.state.scale * (distance / this.lastDistance));

    this.zoom(scale, midpoint);

    this.lastMidpoint = midpoint;
    this.lastDistance = distance;
  }

  zoom(scale, midpoint) {
    console.log('zoom ', scale, midpoint, this.state.x, this.state.y);
    const nextWidth = this.props.width * scale;
    const nextHeight = this.props.height * scale;
    const nextX = this.state.x + (inverse(midpoint.x * scale) * (nextWidth - this.state.width) / nextWidth);
    const nextY = this.state.y + (inverse(midpoint.y * scale) * (nextHeight - this.state.height) / nextHeight);
    // debugger;
    console.log('zoom', nextX, nextY);
    this.setState({
      width: nextWidth,
      height: nextHeight,
      x: nextX,
      y: nextY,
      scale,
    });
  }

  render() {
    console.log('PinchZoomPan ', this.state, this.props);
    return (
      <div
        ref={(ref) => this.container = ref}
        onDragStart={this.handleTouchStart}
        onDrag={this.handleTouchMove}
        onDragEnd={this.handleTouchEnd}
        onWheel={this.handleTouchEnd}
        style={{
          overflow: 'hidden',
          width: this.props.width,
          height: this.props.height,
        }}
      >
        {this.props.children(this.state.x, this.state.y, this.state.scale)}
      </div>
    );
  }
}

PinchZoomPan.propTypes = {
  children: React.PropTypes.func.isRequired,
  width: React.PropTypes.double,
  height: React.PropTypes.double
};

export default PinchZoomPan;
