import React, { Component, PropTypes } from 'react';
import VerticalLine from '../VerticalLine/VerticalLine';
import HorizontalLine from '../HorizontalLine/HorizontalLine';

export default class Crosshair extends Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    imageProps: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.props = props;
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseOverHandler = this.mouseOverHandler.bind(this);
  }

  mouseMoveHandler() {
    // console.log('move');
  }

  mouseOverHandler() {
    // console.log('over');
  }

  render() {
    return (
      <div
        id="Crosshair"
        className="unselectable"
        onMouseOver={this.mouseOverHandler}
        onMouseMove={this.mouseMoveHandler}
      >
        <VerticalLine x={this.props.x} imageProps={this.props.imageProps} />
        <HorizontalLine y={this.props.y} imageProps={this.props.imageProps} />
      </div>
    );
  }
}
