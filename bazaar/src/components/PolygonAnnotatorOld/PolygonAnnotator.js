import React, { Component, PropTypes } from 'react';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { Button, Label, Icon, Dimmer, Loader } from 'semantic-ui-react';
import { ENTITY_COLORS } from '../../helpers/Utils';
// App component - represents the whole app
export default class PolygonAnnotatorOld extends Component {
  constructor(props) {
    super(props);
    console.log('PolygonAnnotator props', props);
    this.state = {
      rects: props.rects,
      rectCatMap: props.rectCatMap,
      entities: Object.keys(props.entityColorMap),
      canvasSet: false,
      imgLoad: false,
      currentRect: []
    };
    this.mousedownHandle = this.mousedownHandle.bind(this);
    // this.mousemoveHandle = this.mousemoveHandle.bind(this);
    this.mouseupHandle = this.mouseupHandle.bind(this);
    this.savePolygon = this.savePolygon.bind(this);
    this.clearPolygons = this.clearPolygons.bind(this);
    this.undoLast = this.undoLast.bind(this);
  }


  componentDidMount() {
    console.log('component did mount', this.canvas);
  }

  componentWillReceiveProps(nextProps) {
    console.log('PolygonAnnotatorOld nextprops', nextProps);
    if (nextProps.rects && nextProps.rectCatMap && (this.props.rects !== nextProps.rects)) {
      this.setState({ rects: nextProps.rects, rectCatMap: nextProps.rectCatMap, image: nextProps.image});
    }
    if (this.props.image !== nextProps.image) {
      this.setState({imgLoad: false, canvasSet: false});
    }
  }

  componentWillUnmount() {
    console.log('PolygonAnnotatorOld unmount');
    document.removeEventListener('mouseup', this.mouseupHandle);
  }


  getPoints(currentRect) {
    let points = '';
    for (let index = 0; index < currentRect.length; index ++) {
      points = points + currentRect[index][0] + ',' + currentRect[index][1] + ' ';
    }
    return points.trim();
  }

  getDecPoints(currentRect) {
    let points = '';
    for (let index = 0; index < currentRect.length; index ++) {
      console.log('getDecPointsOld ', currentRect[index]);
      points = points + Math.ceil(currentRect[index][0] * this.canvas.offsetWidth) + ',' + Math.ceil((currentRect[index][1] * this.canvas.offsetHeight) + 17) + ' ';
    }
    return points.trim();
  }

  mousedownHandle(event) {
    console.log('mousedown ', this.state, this.ctx);
    const currentRect = this.state.currentRect;
    currentRect.push([event.offsetX, event.offsetY]);
    this.setState({
      currentRect
    });
    // document.onselectstart = () => false;
  }

  // mousemoveHandle(event) {
  //   console.log('mouse move', event);
  //   // if (this.state.mouseDown) {
  //   //   const { x1, y1 } = this.state.currentRect;

  //   //   this.setState({
  //   //     currentRect: {
  //   //       x1,
  //   //       y1,
  //   //       width: event.offsetX - x1,
  //   //       height: event.offsetY - y1,
  //   //     },
  //   //   });
  //   // }
  // }

  convertCurrentRectToData(currentRect) {
    console.log('convertCurrentRectToData ', this.canvas);
    // const { offsetWidth: imageWidth, offsetHeight: imageHeight } = this.canvas;
    const { x1, y1, width, height } = currentRect;
    const rectStyleBorder = 4;
    const dataRect = {};
    if (width > 0) {
      dataRect.x1 = (x1 );
      dataRect.x2 = ((x1 + width));
    } else {
      dataRect.x2 = ((x1 - rectStyleBorder));
      dataRect.x1 = ((x1 + width - rectStyleBorder));
    }
    if (height > 0) {
      dataRect.y1 = (y1);
      dataRect.y2 = ((y1 + height));
    } else {
      dataRect.y2 = ((y1 - rectStyleBorder));
      dataRect.y1 = ((y1 + height - rectStyleBorder));
    }

    return dataRect;
  }

  convertRectDataToUIRect(rect) {
    console.log('convertRectDataToUIRect ', this.canvas);
    const { offsetWidth: imageWidth, offsetHeight: imageHeight } = this.canvas;
    const { x1, x2, y1, y2 } = rect;
    console.log('convertRectDataToUIRect rects ', imageWidth, imageHeight);
    const log = {
      x1: x1,
      width: (x2 - x1),
      y1: y1,
      height: (y2 - y1),
    };

    return log;
  }

  mouseupHandle() {
    console.log('mouseupHandle', this.state, this.props);
    if (this.state.mouseDown) {
      const nextRect = this.convertCurrentRectToData(this.state.currentRect);
      const numberOfRects = Object.keys(this.state.rects).length;
      const { rectCatMap } = this.state;
      rectCatMap[numberOfRects] = this.state.entities[0];
      this.setState({
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
    // const { x1, y1, width, height } = currentRect;
    console.log('rectToStyles ', currentRect);
    const canvas = this.canvas;
    if (!canvas) {
      return (<div />);
    }
    // const styleObject = {
    //   position: 'absolute',
    //   border: '3px dotted #000',
    // };

    // if (width > 0) {
    //   styleObject.left = x1;
    // } else {
    //   styleObject.right = canvas.offsetWidth - x1;
    // }

    // if (height > 0) {
    //   styleObject.top = y1;
    // } else {
    //   styleObject.bottom = canvas.offsetHeight - y1;
    // }

    // styleObject.width = Math.abs(width);
    // styleObject.height = Math.abs(height);
    // styleObject.zIndex = 3;

    // return styleObject;
    if (currentRect.length === 1) {
      return (<circle cx={currentRect[0][0]} cy={currentRect[0][1]} r="3" stroke="red" fill="transparent" strokeWidth="4"/>);
    } else if (currentRect.length >= 1) {
      return (<polyline points={this.getPoints(currentRect)} style={{fill: 'none', stroke: 'red', strokeWidth: 4}} />);
    }
  }


  savePolygon(category) {
    const currentRect = this.state.currentRect;
    if (currentRect[0] !== currentRect[currentRect.length - 1]) {
      currentRect.push(currentRect[0]);
    }
    const rects = this.state.rects;
    const len = Object.keys(rects).length;
    const normPoints = [];
    for (let index = 0; index < currentRect.length; index ++) {
      let xCord = currentRect[index][0];
      let yCord = currentRect[index][1] - 17;
      xCord = xCord / this.canvas.offsetWidth;
      yCord = yCord / this.canvas.offsetHeight;
      normPoints.push([ xCord, yCord]);
    }
    rects[len] = normPoints;
    const rectCatMap = this.state.rectCatMap;
    rectCatMap[len] = category;
    this.setState({ currentRect: [], rects: rects, rectCatMap}, () => {
      if (this.props.drawHandle) {
        this.props.drawHandle(this.state);
      }
    });
  }

  undoLast() {
    const currentRect = this.state.currentRect;
    currentRect.splice(-1, 1);
    this.setState({currentRect});
  }

  clearPolygons() {
    this.setState({ currentRect: [], rects: []});
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

    // const xStyle = {
    //   position: 'absolute',
    //   top: '-8px',
    //   right: '-8px',
    //   width: '15px',
    //   height: '15px',
    //   background: 'hsl(0, 0%, 0%)',
    //   lineHeight: '15px',
    //   padding: '0',
    //   display: 'block',
    //   margin: '0 auto',
    //   color: 'hsl(0, 0%, 100%)',
    //   overflow: 'hidden',
    //   textAlign: 'center',
    //   borderRadius: '100%',
    //   border: '0',
    //   outline: '0',
    //   WebkitAppearance: 'none',
    //   fontSize: '12px',
    //   cursor: 'pointer',
    // };

    const selectCategory = (event1, index) => {
      console.log('select category ', event1.target, event1.target.id, index);
      this.savePolygon(event1.target.id);
    };

    const removeRect = (event) => {
      console.log('remove rect', event.target.id, this.state);
      const index = event.target.id;
      const rectCatMap = this.state.rectCatMap;
      delete rectCatMap[index];
      const rects = this.state.rects;
      delete rects[index];
      this.setState({
        rects, rectCatMap
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

    // const getOptions = (index) => {
    //   const arrs = [];
    //   const selectedCat = this.state.rectCatMap[index];
    //   const bcolor = this.props.entityColorMap[selectedCat];
    //   let index1 = 0;
    //   for (const [key, value] of entries(this.props.entityColorMap)) {
    //     console.log('getOptions ', key, value, index);
    //     let selected = false;
    //     if (key === selectedCat) {
    //       selected = true;
    //     }
    //     // let iconC = 'hidden';
    //     // if (index1 === 0) {
    //     //   iconC = '';
    //     // }
    //     arrs.push(<option selected={selected} key={key} value={key} style={{ backgroundColor: value, color: 'white' }}>
    //       {key}
    //       </option>);
    //     index1 = index1 + 1;
    //   }
    //   return (
    //           <FormControl style={{ backgroundColor: bcolor, color: 'white' }} name={index} componentClass="select" placeholder="Select Category" onChange={selectCategory}>
    //                     {arrs}
    //           </FormControl>
    //                     );
    // };

    const renderRects = () => (
      this.state.rects.map((rect, index) => {
        console.log('render rects');
        const lineColor = ENTITY_COLORS[index];
        const points = this.getDecPoints(rect);
        console.log('rendering rects', lineColor, points);
        if (!this.canvas) {
          this.state.canvasSet = false;
          return (<div />);
        }
        return (
            <polyline key={index} points={points} style={{fill: 'lightblue', opacity: '0.5', stroke: lineColor, strokeWidth: 4}} />
        );
      })
    );

    const getMenuItems = () => {
      const arrs = [];
      let index1 = 0;
      for (const [key, value] of entries(this.props.entityColorMap)) {
        console.log('value is', key, value);
        arrs.push( <MenuItem id={key} onClick={selectCategory.bind(key)} eventKey={value}>{key}</MenuItem>);
        index1 = index1 + 1;
      }
      return ( <DropdownButton
                  disabled={this.state.currentRect.length === 0}
                  bsStyle="primary"
                  title="Close Polygon"
                > {arrs}
                      </DropdownButton>);
    };

    const getLabels = () => {
      const arrs = [];
      const {rects, rectCatMap} = this.state;
      let index = 0;
      for (const key of Object.keys(rects)) {
        arrs.push(
            <Label id={key} color={ENTITY_COLORS[index]}>
              {rectCatMap[key]}
              {this.props.drawHandle &&
              <Icon name="delete" id={index} onClick={removeRect.bind(this)} /> }
            </Label>);
        index = index + 1;
      }
      return (<div> {arrs} </div>);
    };

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
            // canvas.addEventListener('mousemove', this.mousemoveHandle);
            document.addEventListener('mouseup', this.mouseupHandle);
          }
          this.setState({ canvasSet: true});
        }
      }
    };

    console.log('polygon annotate. render state', this.state);
    return (
    <div style={{ lineHeight: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', height: '100%'}}>
      <div>
      <div style={{ lineHeight: 0, position: 'relative', display: 'inline-block' }}>
        <div>
        <img onLoad={onImgLoad} src={this.props.image} role="presentation" style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
        {!this.state.imgLoad && <Dimmer active>
                                  <Loader />
                                </Dimmer>}
      { this.state.imgLoad &&
        <div ref={(canv) => { this.canvas = canv; setFunctions(); }} style={canvasStyles}>
          { this.canvas && this.canvas.offsetWidth &&
            <div>
                <svg style={{ width: this.canvas.offsetWidth, height: this.canvas.offsetHeight }}>
                  {Object.keys(this.state.rects).length >= 0 && renderRects() }
                  {this.state.currentRect && this.rectToStyles(this.state.currentRect)}
                </svg>
            </div>
          }
        </div>
      }
        </div>
      </div>
        {getLabels()}
      </div>
      {this.props.drawHandle && this.state.imgLoad &&
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
              <div>
                  { getMenuItems()}
              </div>
                  <br />
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                <div>
                  <Button size="tiny" secondary icon labelPosition="right" onClick={this.undoLast} disabled={this.state.currentRect.length === 0}>
                    Undo
                  </Button>
                </div>
                <div style={{ width: '20px'}} />
                <div>
                  <Button size="small" secondary icon labelPosition="right" onClick={this.clearPolygons} disabled={Object.keys(this.state.rects).length === 0}>
                    Clear All
                  </Button>
                </div>
            </div>
      </div>
      }
    </div>
    );
  }
}
PolygonAnnotatorOld.propTypes = {
  image: PropTypes.string,
  drawHandle: PropTypes.func,
  entityColorMap: PropTypes.object,
  rects: PropTypes.object,
  rectCatMap: PropTypes.object
};
