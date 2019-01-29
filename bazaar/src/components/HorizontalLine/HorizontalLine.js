import React, { Component, PropTypes } from 'react';

export default class HorizontalLine extends Component {
  static propTypes = {
    y: PropTypes.number,
    imageProps: PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.props = props;
    this.calculateTop = this.calculateTop.bind(this);
    this.DIV_BORDER = 1;
  }

  calculateTop() {
    const top = Math.max(0, this.props.y - this.props.imageProps.offsetY);
    return Math.min(this.props.imageProps.height, top);
  }

  render() {
    return (
      <div id="horizontalLine" className="line" style={{
        top: this.calculateTop(),
        width: this.props.imageProps.width
      }}></div>
    );
  }
}
