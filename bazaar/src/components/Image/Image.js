import React, { Component, PropTypes } from 'react';

export default class Image extends Component {
  static propTypes = {
    imageURL: PropTypes.string,
    x: PropTypes.string,
    imageProps: PropTypes.object,
    setImageProps: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.props = props;
    this.onImgLoad = this.onImgLoad.bind(this);
    this.setDimensions = this.setDimensions.bind(this);
  }

   /**
   * Add event listener
   */
  componentDidMount() {
    window.addEventListener('resize', this.setDimensions);
  }

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.setDimensions);
  }


  onImgLoad({ target: img }) {
    console.log('Image loaded');
    this.height = img.offsetHeight;
    this.width = img.offsetWidth;
    this.setDimensions();
  }

  setDimensions() {
    const { offsetX, offsetY } = this.calculateOffset();
    this.props.setImageProps(this.height, this.width, offsetX, offsetY);
  }

  getDocumentRelativeElementOffset(el) {
    const rootEl = this.getRootOfEl(el);
    const { left: docLeft, top: docTop } = rootEl.getBoundingClientRect();

    const {
      left: elLeft,
      top: elTop,
      width: w,
      height: h
    } = el.getBoundingClientRect();

    return {
      x: Math.abs(docLeft) + elLeft,
      y: Math.abs(docTop) + elTop,
      h,
      w
    };
  }

  getRootOfEl(el) {
    if (el.parentElement) {
      return this.getRootOfEl(el.parentElement);
    }
    return el;
  }

  calculateOffset() {
    // from react-cursor-position
    // https://github.com/ethanselzer/react-cursor-position/blob/master/src/ReactCursorPosition.js
    const { x, y } = this.getDocumentRelativeElementOffset(this.el);
    return { offsetX: x, offsetY: y };
  }


  render() {
    return (
      <img
        id="LabelViewImg"
        className="unselectable"
        src={this.props.imageURL}
        alt=""
        onLoad={this.onImgLoad}
        ref={el => (this.el = el)}
      />
    );
  }
}
