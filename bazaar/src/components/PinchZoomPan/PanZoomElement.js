import React from 'react';
import Component from 'react-es6-component';
import Panner from './CenteredPanZoom';

class PanZoomElement extends Component {

  static propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  }

  constructor() {
    super(...arguments);
    this._startX = 0;
    this._startY = 0;
    this._panner = new Panner({
      screenWidth: this.props.width,
      screenHeight: this.props.height
    });
    this.state = {
      drawButton: this.props.drawButton,
      scale: this._panner.scale,
      translate: {
        x: this._panner.viewport.x,
        y: this._panner.viewport.y
      }
    };
  }

  componentDidMount() {
    document.addEventListener('onDragStart', (event1) => { event1.preventDefault(); return false; });
  }

  componentWillReceiveProps(nextProps) {
    console.log('pan-zoom-element nextprops', this.props, nextProps);
    if (this.props.drawButton !== nextProps.drawButton) {
      const element = this.element;
      if (this.state.elementSet && element) {
        console.log('remove element functions');
        element.removeEventListener('mousedown', this._onMouseDown);
        element.removeEventListener('wheel', this._onWheel);
        nextProps.setFunctions();
        this.setState({ elementSet: false});
      } else if (element) {
        console.log('setting element functions');
        element.addEventListener('mousedown', this._onMouseDown);
        element.addEventListener('wheel', this._onWheel);
        this.setState({ elementSet: false});
      }
      this.setState({ drawButton: nextProps.drawButton, elementSet: false });
    } else if (this.props.image !== nextProps.image) {
      this._panner = new Panner({
        screenWidth: this.props.width,
        screenHeight: this.props.height
      });
      this.setState({ scale: this._panner.scale, translate: {
        x: this._panner.viewport.x,
        y: this._panner.viewport.y
      } });
    }
  }

  componentWillUnmount() {
    console.log('pan-zoom-element unmount');
  }

  _onMouseDown(event) {
    console.log('onmousedown', Object.keys(event), event.pageX, event.pageY, event.screenX, event.screenY, event.clientX, event.clientY);
    this._startX = event.pageX;
    this._startY = event.pageY;
    document.addEventListener('mouseup', this._onMouseUp, true);
    document.addEventListener('mousemove', this._onMouseMove, true);
  }

  _onMouseUp() {
    console.log('onmouseup', Object.keys(event), event.pageX, event.pageY, event.screenX, event.screenY, event.clientX, event.clientY);
    document.removeEventListener('mouseup', this._onMouseUp, true);
    document.removeEventListener('mousemove', this._onMouseMove, true);
  }

  _onMouseMove(event) {
    console.log('mouse move');
    console.log('onmousemove', Object.keys(event), event.pageX, event.pageY, event.screenX, event.screenY, event.clientX, event.clientY);
    this._panner.panFrom(
      {
        x: this._startX,
        y: this._startY
      },
      {
        x: event.pageX,
        y: event.pageY
      });
    this._startX = event.pageX;
    this._startY = event.pageY;
    this.setState({
      translate: {
        x: this._panner.viewport.x,
        y: this._panner.viewport.y
      },
      scale: this._panner.scale
    });
  }

  _onWheel(event) {
    console.log('_onwheel', event.target.className);
    if (this.props.zoomable) {
      event.preventDefault();
      console.log('_onwheel', event.currentTarget.getBoundingClientRect(), event.pageX, event.pageY, event.screenX, event.screenY, event.clientX, event.clientY);
      const currentTargetRect = event.currentTarget.getBoundingClientRect();
      const event_offsetX = event.clientX - currentTargetRect.left;
      const event_offsetY = event.clientY - currentTargetRect.top;
      console.log('event offset', event_offsetX, event_offsetY);
      let zoomFactor;
      if (event.deltaY < 0) {
        zoomFactor = this.state.scale * 1.05;
      } else {
        zoomFactor = this.state.scale * 0.95;
      }
      if (zoomFactor > 100) zoomFactor = 100.0;
      if (zoomFactor < -10) zoomFactor = -10;
      console.log('onwheel', this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
      this._panner.zoomVideo(zoomFactor, {x: event_offsetX, y: event_offsetY});
      const scalechange = this._panner.scale - this.state.scale;
      const offsetX = - (event.clientX * scalechange);
      const offsetY = - (event.clientY * scalechange);
      this._startX = event_offsetX;
      this._startY = event_offsetY;
      console.log('onwheel', offsetX, offsetY, this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
      // this._panner.pan(offsetX, offsetY);
      console.log('onwheel', offsetX, offsetY, this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
      this.setState({
        translate: {
          x: this._panner.viewport.x + 0 * (this.props.width * this._panner.scale),
          y: this._panner.viewport.y + 0 * (this.props.height * this._panner.scale)
        },
        scale: this._panner.scale
      });
      if (this.props.updateScale) {
        this.props.updateScale(this._panner.scale, [this.state.translate.x, this.state.translate.y]);
      }
    }
  }


  render() {
    console.log('rerender', this.state, this._startX, this._startY, this.props);
    // const transformOrigin = '"' + this._startX + 'px ' + this._startY + 'px"';
    console.log('transform origin', this.state.translate);
    let translatex = this.state.translate.x;
    let translatey = this.state.translate.y;
    if (this.props.dx) {
      translatex = this.props.dx;
      translatey = this.props.dy;
    }
    const style = {
      transform: `translate(${translatex}px, ${translatey}px) scale(${this.state.scale})`,
      transformOrigin: '0 0',
      position: 'relative'
    };

    const setFunctions = () => {
      console.log('setting functions element', this.element);
      const element = this.element;
      if (!this.state.elementSet && element) {
        console.log('setting element');
        element.addEventListener('wheel', this._onWheel);
        if (!this.state.drawButton) {
          element.addEventListener('mousedown', this._onMouseDown);
          // canvas.addEventListener('mousemove', this.mousemoveHandle);
        }
        this.setState({ elementSet: true});
      }
    };
    return (
      <div className="pan-zoom-element"
           ref={(element) => { console.log('element creation'); this.element = element; setFunctions(); }}
           style={{width: this.props.width, height: this.props.height}} >
        <div ref="content" className="content-container noselect"
             style={style}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

PanZoomElement.propTypes = {
  children: React.PropTypes.func.isRequired,
  drawButton: React.PropTypes.boolean,
  setFunctions: React.PropTypes.func,
  updateScale: React.PropTypes.func,
  image: React.PropTypes.string,
  zoomable: React.PropTypes.boolean,
  dx: React.PropTypes.double,
  dy: React.PropTypes.double
};

export default PanZoomElement;
