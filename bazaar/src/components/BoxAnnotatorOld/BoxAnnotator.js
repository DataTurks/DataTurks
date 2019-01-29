import React, { Component, PropTypes } from 'react';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Dimmer, Loader } from 'semantic-ui-react';

// App component - represents the whole app
export default class BoxAnnotatorOld extends Component {
  constructor(props) {
    super(props);
    console.log('BoxAnnotator props', props);
    this.state = {
      rects: props.rects,
      rectCatMap: props.rectCatMap,
      entities: Object.keys(props.entityColorMap),
      canvasSet: false
    };
    this.mousedownHandle = this.mousedownHandle.bind(this);
    this.mousemoveHandle = this.mousemoveHandle.bind(this);
    this.mouseupHandle = this.mouseupHandle.bind(this);
  }


  componentDidMount() {
    console.log('component did mount', this.canvas);
  }

  componentWillReceiveProps(nextProps) {
    console.log('BoxAnnotator nextprops', nextProps);
    if (nextProps.rects && nextProps.rectCatMap && (this.props.rects !== nextProps.rects)) {
      this.setState({ rects: nextProps.rects, rectCatMap: nextProps.rectCatMap, image: nextProps.image});
    }
    if (this.props.image !== nextProps.image) {
      this.setState({imgLoad: false, canvasSet: false});
    }
  }

  componentWillUnmount() {
    console.log('BoxAnnotator unmount');
    document.removeEventListener('mouseup', this.mouseupHandle);
  }

  mousedownHandle(event) {
    console.log('mousedown ', this.state);
    this.setState({
      mouseDown: true,
    });
    this.setState({
      currentRect: {
        x1: event.offsetX,
        y1: event.offsetY,
        width: 1,
        height: 1,
      },
    });
    document.onselectstart = () => false;
  }

  mousemoveHandle(event) {
    if (this.state.mouseDown) {
      const { x1, y1 } = this.state.currentRect;

      this.setState({
        currentRect: {
          x1,
          y1,
          width: event.offsetX - x1,
          height: event.offsetY - y1,
        },
      });
    }
  }

  convertCurrentRectToData(currentRect) {
    console.log('convertCurrentRectToData ', this.canvas);
    const { offsetWidth: imageWidth, offsetHeight: imageHeight } = this.canvas;
    const { x1, y1, width, height } = currentRect;
    const rectStyleBorder = 4;
    const dataRect = {};
    if (width > 0) {
      dataRect.x1 = (x1 / imageWidth);
      dataRect.x2 = ((x1 + width) / imageWidth);
    } else {
      dataRect.x2 = ((x1 - rectStyleBorder) / imageWidth);
      dataRect.x1 = ((x1 + width - rectStyleBorder) / imageWidth);
    }
    if (height > 0) {
      dataRect.y1 = ((y1 - 17) / imageHeight);
      dataRect.y2 = ((y1 + height - 17) / imageHeight);
    } else {
      dataRect.y2 = ((y1 - rectStyleBorder) / imageHeight);
      dataRect.y1 = ((y1 + height - rectStyleBorder) / imageHeight);
    }

    return dataRect;
  }

  convertRectDataToUIRect(rect) {
    console.log('convertRectDataToUIRect ', this.canvas);
    const { offsetWidth: imageWidth, offsetHeight: imageHeight } = this.canvas;
    const { x1, x2, y1, y2 } = rect;
    console.log('convertRectDataToUIRect rects ', imageWidth, imageHeight);
    const log = {
      x1: x1 * imageWidth,
      width: (x2 - x1) * imageWidth,
      y1: y1 * imageHeight + 17,
      height: (y2 - y1) * imageHeight,
    };

    return log;
  }

  mouseupHandle() {
    console.log('mouseupHandle', this.state, this.props);
    if (this.state.mouseDown) {
      const nextRect = this.convertCurrentRectToData(this.state.currentRect);
      const numberOfRects = this.state.rects.length;
      const { rectCatMap } = this.state;
      rectCatMap[numberOfRects] = this.state.entities[0];
      this.setState({
        currentRect: null,
        rects: [
          ...this.state.rects,
          nextRect
        ],
        rectCatMap,
        mouseDown: false,
        showList: true
      }, () => {
        if (this.props.drawHandle) {
          console.log('calling drawhandle', this.state);
          this.props.drawHandle(this.state);
        }
      });
    }
  }

  rectToStyles(currentRect) {
    const { x1, y1, width, height } = currentRect;
    const canvas = this.canvas;

    const styleObject = {
      position: 'absolute',
      border: '3px dotted #000',
    };

    if (width > 0) {
      styleObject.left = x1;
    } else {
      styleObject.right = canvas.offsetWidth - x1;
    }

    if (height > 0) {
      styleObject.top = y1;
    } else {
      styleObject.bottom = canvas.offsetHeight - y1;
    }

    styleObject.width = Math.abs(width);
    styleObject.height = Math.abs(height);
    styleObject.zIndex = 3;
    console.log('style object is', styleObject);
    return styleObject;
  }


  render() {
    // const { image } = this.props; // logic to render when it's found
    console.log('BoxAnnotator state', this.state);
    const canvasStyles = {
      zIndex: this.state.mouseDown ? 4 : 2,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      cursor: 'crosshair',
    };

    const xStyle = {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      width: '15px',
      height: '15px',
      background: 'hsl(0, 0%, 0%)',
      lineHeight: '15px',
      padding: '0',
      display: 'block',
      margin: '0 auto',
      color: 'hsl(0, 0%, 100%)',
      overflow: 'hidden',
      textAlign: 'center',
      borderRadius: '100%',
      border: '0',
      outline: '0',
      WebkitAppearance: 'none',
      fontSize: '12px',
      cursor: 'pointer',
    };

    const selectCategory = (event1, index) => {
      console.log('select category ', event1.target.value, event1.target.name, index);
      const { rectCatMap } = this.state;
      rectCatMap[event1.target.name] = event1.target.value;
      this.setState({ rectCatMap });
      if (this.props.drawHandle) {
        this.props.drawHandle(this.state);
      }
    };

    const removeRect = (index) => {
      this.setState({
        rects: [
          ...this.state.rects.slice(0, index),
          ...this.state.rects.slice(index + 1),
        ],
      }, () => {
        if (this.props.drawHandle) {
          this.props.drawHandle(this.state);
        }
      });
    };

    // using a generator function
    function* entries(obj) {
      for (const key of Object.keys(obj)) {
        yield [key, obj[key]];
      }
    }

    const getOptions = (index) => {
      const arrs = [];
      const selectedCat = this.state.rectCatMap[index];
      const bcolor = this.props.entityColorMap[selectedCat];
      let index1 = 0;
      for (const [key, value] of entries(this.props.entityColorMap)) {
        let selected = false;
        if (key === selectedCat) {
          selected = true;
        }
        // let iconC = 'hidden';
        // if (index1 === 0) {
        //   iconC = '';
        // }
        arrs.push(<option selected={selected} key={key} value={key} style={{ backgroundColor: value, color: 'white' }}>
          {key}
          </option>);
        index1 = index1 + 1;
      }
      return (
              <FormControl style={{ backgroundColor: bcolor, color: 'white' }} name={index} componentClass="select" placeholder="Select Category" onChange={selectCategory}>
                        {arrs}
              </FormControl>
                        );
    };

    const renderRects = () => (
      this.state.rects.map((rect, index) => {
        console.log('rendering rects', this.canvas, this.state);
        if (!this.canvas) {
          this.state.canvasSet = false;
          return (<div />);
        }
        const style = this.rectToStyles(this.convertRectDataToUIRect(rect));
        return (
          <div>
            <div key={index} style={style}>
              {this.props.drawHandle &&
              <button style={xStyle} onClick={() => { removeRect(index); }}>×</button>
              }
              {
              <FormGroup controlId="formControlsSelect">
                {getOptions(index)}
            </FormGroup>}
            </div>
          </div>
        );
      })
    );
    const onImgLoad = ({target: img}) => {
      console.log('image loaded');
      this.setState({imgHeight: img.offsetHeight,
                                  imgWidth: img.offsetWidth, imgLoad: true});
    };
    const setFunctions = () => {
      const canvas = this.canvas;
      if (!this.state.canvasSet) {
        if (this.state.imgLoad) {
          console.log('setting canvas');
          if (this.props.drawHandle) {
            canvas.addEventListener('mousedown', this.mousedownHandle);
            canvas.addEventListener('mousemove', this.mousemoveHandle);
            document.addEventListener('mouseup', this.mouseupHandle);
          }
          this.setState({ canvasSet: true});
        }
      }
    };
    return (
      <div style={{ lineHeight: 0, position: 'relative', display: 'inline-block' }}>
        <img onLoad={onImgLoad} src={this.props.image} role="presentation" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        {!this.state.imgLoad && <Dimmer active>
                                  <Loader />
                                </Dimmer>}
        { this.state.imgLoad &&
        <div ref={(canv) => { this.canvas = canv; setFunctions(); }} style={canvasStyles} /> }
        { this.state.imgLoad && renderRects() }
        { this.state.imgLoad && this.state.currentRect && <div style={this.rectToStyles(this.state.currentRect)} /> }
      </div>
    );
  }
}
BoxAnnotatorOld.propTypes = {
  image: PropTypes.string,
  drawHandle: PropTypes.func,
  entityColorMap: PropTypes.object,
  rects: PropTypes.array,
  rectCatMap: PropTypes.object
};
