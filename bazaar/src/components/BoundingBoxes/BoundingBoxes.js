import React, { Component, PropTypes } from 'react';
import BoundingBox from '../BoundingBox/BoundingBox';

/**
 * Presentational component:
 * Renders `BoundingBox`s passed in through props.
 * Renders `BoundingBox`s passed in through props.
 */
export default class BoundingBoxes extends Component {
  static propTypes = {
    boxes: PropTypes.array,
    isDrawing: PropTypes.bool,
  }
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    // make BoundingBox component for each box that needs to
    // be rendered
    const boxesToRender = this.props.boxes.map((box, index) => {
      console.log('index box render', index);
      return <BoundingBox key={box.id} isDrawing={this.props.isDrawing} box={box} />;
    });
    return (
      <div id="BoundingBoxes">
        {boxesToRender.length > 0 && boxesToRender}
      </div>
    );
  }
}
