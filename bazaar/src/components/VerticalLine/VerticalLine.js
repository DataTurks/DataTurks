import React, { Component, PropTypes } from 'react';

export default class VerticalLine extends Component {
  static propTypes = {
    y: PropTypes.number,
    x: PropTypes.number,
    imageProps: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.props = props;
    this.calculateLeft = this.calculateLeft.bind(this);
    this.DIV_BORDER = 1;
  }

  calculateLeft() {
    const left = Math.max(0, this.props.x - this.props.imageProps.offsetX);
    return Math.min(this.props.imageProps.width, left);
  }

  render() {
    return (
      <div id="verticalLine" className="line" style={{
        left: this.calculateLeft(),
        height: this.props.imageProps.height
      }}></div>
    );
  }
}
