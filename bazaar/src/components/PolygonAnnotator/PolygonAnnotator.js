import React, { Component, PropTypes } from 'react';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { Button, Label, Icon, Dimmer, Loader } from 'semantic-ui-react';
import { convertKeyToString } from '../../helpers/Utils';
// import PinchZoomPan from '../PinchZoomPan/PinchZoomPan';
import PanZoomElement from '../PinchZoomPan/PanZoomElement';
const Mousetrap = require('mousetrap');
// const ElementPan = require('react-element-pan');

// App component - represents the whole app
export default class PolygonAnnotator extends Component {
  constructor(props) {
    super(props);
    console.log('PolygonAnnotator props', props);
    this.state = {
      rects: props.rects,
      rectCatMap: props.rectCatMap,
      entities: Object.keys(props.entityColorMap),
      canvasSet: false,
      imgLoad: false,
      contrast: 1.0,
      brightness: 1.0,
      saturation: 1.0,
      scale: 1,
      imgLoaded: {},
      image: props.image,
      mouseHoverMap: {},
      drawButton: this.props.space ? true : false,
      toolbarHidden: false,
      currentRect: []
    };
    this.loadImages = this.loadImages.bind(this);
    this.mousedownHandle = this.mousedownHandle.bind(this);
    this.mousemoveHandle = this.mousemoveHandle.bind(this);
    this.mouseupHandle = this.mouseupHandle.bind(this);
    this.savePolygon = this.savePolygon.bind(this);
    this.clearPolygons = this.clearPolygons.bind(this);
    this.undoLast = this.undoLast.bind(this);
    this.resizeWindow = this.resizeWindow.bind(this);
  }


  componentDidMount() {
    console.log('component did mount', this.canvas);

    if (this.props.drawHandle) {
      let combo = '';
      if (this.props.shortcuts && 'undo' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.undo);
        Mousetrap.bind(combo, this.undoLast);
      }
      if (this.props.shortcuts && 'clearAll' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.clearAll);
        Mousetrap.bind(combo, this.clearPolygons);
      }
    }
    window.addEventListener('resize', this.resizeWindow);
  }

  componentWillReceiveProps(nextProps) {
    console.log('PolygonAnnotator nextprops', nextProps);
    if (nextProps.rects && nextProps.rectCatMap && (this.props.rects !== nextProps.rects)) {
      this.setState({ rects: nextProps.rects, rectCatMap: nextProps.rectCatMap, image: nextProps.image});
    }
    // if (this.props.fullScreen !== nextProps.fullScreen) {
    //   console.log('full screen change');
    //   this.setState({imgLoad: false, canvasSet: false, imgObject: undefined, image: nextProps.image + '?ts=' + new Date()});
    // }
    if (this.props.image !== nextProps.image) {
      this.setState({imgLoad: false, canvasSet: false});
      this.setState({ contrast: 1.0, brightness: 1.0, saturation: 1.0 });
    }
  }

  componentWillUnmount() {
    console.log('PolygonAnnotator unmount');
    document.removeEventListener('mouseup', this.mouseupHandle);
    window.removeEventListener('resize', this.resizeWindow);
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
      points = points + Math.ceil(currentRect[index][0] * this.canvas.offsetWidth) + ',' + (Math.ceil(currentRect[index][1] * (this.canvas.offsetHeight))) + ' ';
      console.log('getDecPoints ', currentRect[index], points);
    }
    return points.trim();
  }

  loadImages() {
    console.log('loading image');
    const imgLoaded = this.state.imgLoaded;
    for ( let index = this.props.currentIndex + 1; index < this.props.currentIndex + 2 && index < this.props.hits.length; index ++) {
      if (!(this.props.hits[index].data in imgLoaded) && this.timeout) {
        console.log('loading image', index);
        this.timeOut = null;
        const image1 = new Image(); // eslint-disable-line no-undef
        image1.src = this.props.hits[index].data;
        imgLoaded[this.props.hits[index].data] = true;
      }
    }
    this.state.imgLoaded = imgLoaded;
  }

  resetImage() {
    console.log('resize resetImage');
    if (this.state.imgObject) {
      this.setState({ imgHeight: this.state.imgObject.offsetHeight,
                                  imgWidth: this.state.imgObject.offsetWidth });
    }
    clearTimeout(this.resizeTo);
    this.setState({ imgLoad: true });
  }

  resizeWindow(e1, e2) {
    console.log('resize ', e1, e2, this.state.imgObject.offsetHeight, this.state.imgObject.offsetWidth);
    if (this.state.imgObject) {
      this.setState({ imgLoad: false, canvasSet: false });
      // this.setState({ imgHeight: this.state.imgObject.offsetHeight,
      //                             imgWidth: this.state.imgObject.offsetWidth });
    }
    // if (this.resizeTo) clearTimeout(this.resizeTo);
    this.resizeTo = setTimeout(this.resetImage.bind(this), 2000);
  }

  mousedownHandle(event) {
    console.log('mousedown polygon drag', this.state, this.ctx, event.target.nodeName);
    const mouseHoverMap = this.state.mouseHoverMap;
    if (this.state.drawButton) {
      if (this.state.currentRect.length > 0 || event.target.nodeName === 'svg') {
        for (const k in mouseHoverMap) {
          if (mouseHoverMap.hasOwnProperty(k)) {
            mouseHoverMap[k] = false;
          }
        }
        const currentRect = this.state.currentRect;
        currentRect.push([event.offsetX, event.offsetY]);
        this.setState({
          currentRect
        });
      }else if (event.target.nodeName === 'circle') {
        console.log('drag start', event.offsetX, event.offsetY, event.target.id);
        const splits = event.target.id.split('--');
        // console.log('splits are', )
        if (splits.length === 2) {
          console.log('drag point is', this.state.rects[splits[0]][splits[1]][0] * this.state.imgWidth);
          console.log('drag point is', this.state.rects[splits[0]][splits[1]][1] * this.state.imgHeight);
          this.setState({ pointDrag: true, dragRect: splits[0], dragPoint: splits[1]});
        }
      } else if (event.target.nodeName === 'polygon') {
        for (const k in mouseHoverMap) {
          if (mouseHoverMap.hasOwnProperty(k)) {
            if (k !== event.target.id) {
              mouseHoverMap[k] = false;
            }
          }
        }
        if (mouseHoverMap[event.target.id]) {
          mouseHoverMap[event.target.id] = false;
        } else {
          mouseHoverMap[event.target.id] = true;
        }
        // toggleMouseHover.bind(this, index, true)}
      }
      this.setState({ mouseHoverMap });
    }
    // document.onselectstart = () => false;
  }

  convertCurrentRectToData(currentRect) {
    console.log('convertCurrentRectToData ', this.canvas);
    // const { offsetWidth: imageWidth, offsetHeight: imageHeight } = this.canvas;
    const { x1, y1, width, height } = currentRect;
    // const rectStyleBorder = 1;
    const dataRect = {};
    if (width > 0) {
      dataRect.x1 = (x1);
      dataRect.x2 = ((x1 + width));
    } else {
      dataRect.x2 = ((x1));
      dataRect.x1 = ((x1 + width));
    }
    if (height > 0) {
      dataRect.y1 = (y1);
      dataRect.y2 = ((y1 + height));
    } else {
      dataRect.y2 = ((y1));
      dataRect.y1 = ((y1 + height));
    }

    return dataRect;
  }

  mouseupHandle(event) {
    console.log('mouseupHandle polygon', this.state, this.props);
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
    } else if (this.state.pointDrag) {
      console.log('drag start', event.offsetX, event.offsetY, event.target.id);
      const rects = this.state.rects;
      const currentRect = rects[this.state.dragRect];
      currentRect[this.state.dragPoint][0] = event.offsetX / this.canvas.offsetWidth;
      currentRect[this.state.dragPoint][1] = event.offsetY / this.canvas.offsetHeight;
      this.setState({ rects });
      this.setState({ pointDrag: false }, () => {
        if (this.props.drawHandle) {
          console.log('calling drawhandle', this.state);
          this.props.drawHandle(this.state);
        }
      });
    }
  }

  mousemoveHandle(event) {
    if (this.state.pointDrag) {
      console.log('dragging', event.offsetX, event.offsetY);
      const rects = this.state.rects;
      const currentRect = rects[this.state.dragRect];
      currentRect[this.state.dragPoint][0] = event.offsetX / this.canvas.offsetWidth;
      currentRect[this.state.dragPoint][1] = event.offsetY / this.canvas.offsetHeight;
      this.setState({ rects });
    }
  }


  rectToStyles(currentRect) {
    // const { x1, y1, width, height } = currentRect;
    console.log('rectToStyles ', currentRect);
    const canvas = this.canvas;
    if (!canvas) {
      return (<div />);
    }
    if (currentRect.length === 1) {
      return (<circle cx={currentRect[0][0]} cy={currentRect[0][1]} r="2" stroke="white" fill="lightblue" strokeWidth="1" />);
    } else if (currentRect.length >= 1) {
      return (<polyline points={this.getPoints(currentRect)} style={{fill: 'lightblue', opacity: '0.5', stroke: '#1ae04e', strokeWidth: 1}} />);
    }
  }


  savePolygon(category) {
    console.log('savePolygon ', category);
    const currentRect = this.state.currentRect;
    if (currentRect.length > 0) {
      if (currentRect[0] !== currentRect[currentRect.length - 1]) {
        currentRect.push(currentRect[0]);
      }
      const rects = this.state.rects;
      const len = Object.keys(rects).length;
      const normPoints = [];
      console.log('savePolygon ', currentRect);
      for (let index = 0; index < currentRect.length; index ++) {
        let xCord = currentRect[index][0];
        let yCord = currentRect[index][1];
        xCord = xCord / this.canvas.offsetWidth;
        yCord = yCord / (this.canvas.offsetHeight);
        normPoints.push([ xCord, yCord]);
      }
      console.log('savePolygon ', normPoints);
      rects[len] = normPoints;
      const rectCatMap = this.state.rectCatMap;
      rectCatMap[len] = category;
      const mouseHoverMap = this.state.mouseHoverMap;
      mouseHoverMap[len] = true;
      this.setState({ currentRect: [], rects: rects, mouseHoverMap, rectCatMap}, () => {
        if (this.props.drawHandle) {
          this.props.drawHandle(this.state);
        }
      });
    } else {
      let index = undefined;
      const mouseHoverMap = this.state.mouseHoverMap;
      for (const k in mouseHoverMap) {
        if (mouseHoverMap.hasOwnProperty(k) && mouseHoverMap[k] === true) {
          index = k;
        }
      }
      if (index) {
        const rectCatMap = this.state.rectCatMap;
        rectCatMap[index] = category;
        this.setState({ rectCatMap }, () => {
          if (this.props.drawHandle) {
            this.props.drawHandle(this.state);
          }
        })
      }
    }
  }

  undoLast() {
    if (this.state.currentRect.length > 0) {
      const currentRect = this.state.currentRect;
      currentRect.splice(-1, 1);
      this.setState({currentRect});
    }
  }

  clearPolygons() {
    if (Object.keys(this.state.rects).length > 0) {
      this.setState({ currentRect: [], rects: []});
    }
  }

  showButtons() {
    let nextButton = 'Next';
    let prevButton = 'Previous';
    let skipButton = 'Skip';
    if ('shortcuts' in this.props) {
      const shortcuts = this.props.shortcuts;
      if ('next' in shortcuts) {
        const combo = convertKeyToString(shortcuts.next);
        nextButton = 'Next (' + combo + ')';
        if (this.props.currentIndex >= 0) {
          Mousetrap.bind(combo, this.props.saveTagAndNextRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('previous' in shortcuts) {
        const combo = convertKeyToString(shortcuts.previous);
        prevButton = 'Previous (' + combo + ')';
        if (this.props.currentIndex > 0) {
          Mousetrap.bind(combo, this.props.getBackTopreviousRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('skip' in shortcuts) {
        const combo = convertKeyToString(shortcuts.skip);
        skipButton = 'Skip (' + combo + ')';
        console.log('setting skip shortcut', combo);
        if (this.props.currentIndex >= 0) {
          Mousetrap.bind(combo, this.props.skipRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
    }
    return (
            <div className="marginTop" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <Button size="mini" color="grey" icon onClick={this.props.getBackTopreviousRow} disabled={this.props.currentIndex <= 0}>
                      <Icon name="left arrow" />
                      {prevButton}
                    </Button>
                  </div>
                    <div style={{ height: '20px' }}/>
                  <div>
                    <Button size="mini" color="grey" icon onClick={this.props.skipRow} disabled={this.props.currentIndex < 0}>
                      <Icon name="mail forward" />
                      {skipButton}
                    </Button>
                  </div>
                    <div style={{ height: '20px' }}/>
                  <div>
                    <Button size="mini" color="blue" icon onClick={this.props.saveTagAndNextRow} disabled={this.props.currentIndex < 0}>
                      {nextButton}
                      <Icon name="right arrow" />
                    </Button>
                  </div>

            </div>
        );
  }

  render() {
    // const { image } = this.props; // logic to render when it's found
    console.log('BoxAnnotator state', this.state);
    const canvasStyles = {
      zIndex: this.state.mouseDown ? 4 : 2,
      position: 'absolute',
      display: 'block',
      top: 0,
      left: 0,
      width: this.state.imgWidth,
      height: this.state.imgHeight,
      cursor: this.state.drawButton ? 'crosshair' : 'move',
    };

    const toggleTool = (event, event1) => {
      event1.preventDefault();
      if (!event) {
        this.setState({ drawButton: false, canvasSet: false });
        this.canvas.removeEventListener('mousedown', this.mousedownHandle);
        document.removeEventListener('mouseup', this.mouseupHandle);
      } else {
        this.setState({ drawButton: true, canvasSet: false });
      }
    };

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

    // const toggleMouseHover = (index, value) => {
    //   console.log('toggleMouseHover', this.state.mouseHoverMap, index);
    //   const mouseHoverMap = this.state.mouseHoverMap;
    //   mouseHoverMap[index] = value;
    //   this.setState({ mouseHoverMap });
    // };

    const renderRects = () => (
      this.state.rects.map((rect, index) => {
        console.log('render rects');
        const lineColor = this.props.entityColorMap[this.props.rectCatMap[index]];
        const points = this.getDecPoints(rect);
        console.log('rendering rects', lineColor, points);
        if (!this.canvas) {
          this.state.canvasSet = false;
          return (<div />);
        }
        let sw = 1;
        let cursor = '';
        if (this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) {
          sw = 3;
        }
        if (this.state.currentRect.length === 0) {
          cursor = 'pointer';
        }
        if (rect.length === 1) {
          const pointSplits = points.split(',');
          return (
            <circle cx={pointSplits[0]} cy={pointSplits[1]} r="2" stroke={lineColor} strokeWidth={sw} fill={lineColor} />
            );
        }
        return (
            <polygon
              id={index} key={index} points={points}
                style={{ fill: `${lineColor}`, cursor: `${cursor}`, opacity: '0.5', stroke: '#1ae04e', strokeWidth: `${sw}` }} />
          );
      })
    );

    const renderPoints = () => (
      this.state.rects.map((rect, index) => {
        console.log('render rects');
        const pointArrs = [];
        const lineColor = this.props.entityColorMap[this.props.rectCatMap[index]];
        let sw = 1;
        let radius = (0.5 / this.state.scale);
        let style = {};
        if (this.state.currentRect.length === 0) {
          style = { cursor: '-webkit-grabbing'};
        }
        if (this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) {
          sw = 4 / this.state.scale;
          radius = 4 / this.state.scale;
        }
        for (let jindex = 0; jindex < rect.length; jindex ++) {
          const id = index + '--' + jindex;
          pointArrs.push(<circle id={id} style={style} cx={Math.ceil(rect[jindex][0] * this.canvas.offsetWidth)}
                        cy={Math.ceil(rect[jindex][1] * (this.canvas.offsetHeight))}
                        r={radius} stroke="white" strokeWidth={sw} fill={lineColor} />);
        }
        return (
          <g>
            {pointArrs}
          </g>
          );
      })
    );

    const renderCurrentPoints = () => {
      console.log('render current points', this.state.currentRect);
      const pointArrs = [];
      const lineColor = 'lightblue';
      const sw = 1;
      const radius = 1;
      // const style = { cursor: 'hand rock outline'};
      const rect = this.state.currentRect;
      for (let jindex = 0; jindex < rect.length; jindex ++) {
        const id = 'x' + '-' + jindex;
        pointArrs.push(<circle id={id} cx={Math.ceil(rect[jindex][0])}
                      cy={Math.ceil(rect[jindex][1])}
                      r={radius} stroke="white" strokeWidth={sw} fill={lineColor} />);
      }
      return (
        <g>
          {pointArrs}
        </g>
        );
    };

    const getMenuItems = () => {
      const arrs = [];
      let index1 = 0;
      let lastKey = '';
      for (const [key, value] of entries(this.props.entityColorMap)) {
        console.log('value is', key, value);
        lastKey = key;
        if (key in this.props.shortcuts) {
          const combo = convertKeyToString(this.props.shortcuts[key]);
          Mousetrap.bind(combo, this.savePolygon.bind(this, lastKey));
          arrs.push( <MenuItem id={key} onClick={selectCategory.bind(key)} eventKey={value}>{key}  ( {combo} )</MenuItem>);
        } else {
          arrs.push( <MenuItem id={key} onClick={selectCategory.bind(key)} eventKey={value}>{key}</MenuItem>);
        }
        index1 = index1 + 1;
      }
      let selectIndex = undefined;
      const mouseHoverMap = this.state.mouseHoverMap;
      for (const k in mouseHoverMap) {
        if (mouseHoverMap.hasOwnProperty(k) && mouseHoverMap[k] === true) {
          selectIndex = k;
        }
      }
      if (arrs.length === 1) {
        return (
            <Button
                  disabled={this.state.currentRect.length === 0}
                  positive
                  id={lastKey}
                  onClick={this.savePolygon.bind(this, lastKey)}
            >
            Close Polygon
            </Button>
              );
      }
      return ( <DropdownButton
                  disabled={this.state.currentRect.length === 0 && !selectIndex}
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
            <Label id={key} color={this.props.entityColorMap[rectCatMap[key]]}>
              {rectCatMap[key]}
              {this.props.drawHandle &&
              <Icon name="delete" id={index} onClick={removeRect.bind(this)} /> }
            </Label>);
        index = index + 1;
      }
      return (<div> {arrs} </div>);
    };

    const onImgLoad = ({target: img}) => {
      console.log('image loaded', img.offsetWidth);
      setTimeout(this.loadImages.bind(this), 100);
      this.timeout = this.loadImages;
      this.setState({imgHeight: img.offsetHeight, imageNaturalWidth: img.naturalWidth, imageNaturalHeight: img.naturalHeight,
                                  imgWidth: img.offsetWidth, imgObject: img, imgLoad: true});
    };

    const setFunctions = () => {
      console.log('setting functions', this.canvas);
      const canvas = this.canvas;
      if (!this.state.canvasSet && canvas) {
        if (this.state.imgLoad) {
          console.log('setting canvas');
          if (this.props.drawHandle && this.state.drawButton) {
            canvas.addEventListener('mousedown', this.mousedownHandle);
            canvas.addEventListener('mousemove', this.mousemoveHandle);
            document.addEventListener('mouseup', this.mouseupHandle);
          }
          this.setState({ canvasSet: true});
        }
      }
    };

    let clearButton = 'Clear All';
    if (this.props.shortcuts && 'clearAll' in this.props.shortcuts) {
      clearButton = clearButton + ' (' + convertKeyToString(this.props.shortcuts.clearAll) + ' )';
    }

    let undoButton = 'Undo';
    if (this.props.shortcuts && 'undo' in this.props.shortcuts) {
      undoButton = undoButton + ' (' + convertKeyToString(this.props.shortcuts.undo) + ' )';
    }
    const updateScale = (scale) => {
      console.log('updating scale', scale);
      this.setState({ scale });
    };
    const changeImageProp = (name, event) => {
      console.log('changeImageProp', name, event.target.value);
      this.setState({ [name]: event.target.value });
    }
    // let selectText = 'Draw Tool';
    // if (this.state.drawButton) {
    //   selectText = 'Select Tool';
    // }
    console.log('polygon annotate. render state', this.state);
    // if (!this.props.space) {
    //   imgStyle = { display: 'block', width: '100%' };
    // }
    let windowHeight = (window.innerHeight * 75) / 100;
    let windowWidth = (window.innerWidth * 80) / 100;
    if (!this.props.space) {
      windowHeight = (window.innerHeight * 70) / 100;
      windowWidth = (window.innerWidth * 60) / 100;
    }
    if (this.props.fullScreen) {
      windowHeight = (window.innerHeight * 95) / 100;
    }
    if (this.state.toolbarHidden && this.props.fullScreen) {
      windowWidth = (window.innerWidth * 85) / 100;
    }
    let toolCombo = undefined;
    if (this.props.space && this.props.shortcuts && 'tool' in this.props.shortcuts) {
      if ('tool' in this.props.shortcuts) {
        toolCombo = convertKeyToString(this.props.shortcuts.tool);
        Mousetrap.bind(toolCombo, toggleTool.bind(this, !this.state.drawButton));
      }
      let combo = undefined;
      const shortcuts = this.props.shortcuts;
      if ('next' in shortcuts) {
        combo = convertKeyToString(shortcuts.next);
        if (this.props.currentIndex >= 0) {
          Mousetrap.bind(combo, this.props.saveTagAndNextRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('previous' in shortcuts) {
        combo = convertKeyToString(shortcuts.previous);
        if (this.props.currentIndex > 0) {
          Mousetrap.bind(combo, this.props.getBackTopreviousRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('skip' in shortcuts) {
        combo = convertKeyToString(shortcuts.skip);
        // skipButton = 'Skip (' + combo + ')';
        if (this.props.currentIndex >= 0) {
          Mousetrap.bind(combo, this.props.skipRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
    }

    return (
    <div style={{ lineHeight: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', height: '100%'}}>
      <div style={{ display: 'flex', flexDirection: 'column'}}>
          {
            this.props.space && this.props.drawHandle &&
            <div style={{ display: 'flex', justifyContent: 'space-evenly', fontSize: 'xx-small', marginTop: '-20px' }}>
              <label>
                <span>Contrast : <b> {Math.round(this.state.contrast * 100)}%</b> </span>
                  <input type="range"  step="0.01" min="0" max="4" value={this.state.contrast} onChange={changeImageProp.bind(this, 'contrast')} />
              </label>

              <label>
                <span>Saturation : <b> {Math.round(this.state.saturation * 100)}% </b> </span>
                <input type="range" step="0.01" min="0" max="4" value={this.state.saturation} onChange={changeImageProp.bind(this, 'saturation')}/>
              </label>

              <label>
                <span>Brightness : <b> {Math.round(this.state.brightness * 100)}% </b></span>
                <input type="range" step="0.01" min="0" max="4" value={this.state.brightness} onChange={changeImageProp.bind(this, 'brightness')} />
              </label>
            </div>
          }
        <div>
          <div style={{ lineHeight: 0, position: 'relative', display: 'block' }}>
                <PanZoomElement zoomable updateScale={updateScale} image={this.state.image} setFunctions={setFunctions} drawButton={this.state.drawButton} width={windowWidth} height={windowHeight}>
                    <img
                        style={{ filter: `contrast(${this.state.contrast}) brightness(${this.state.brightness}) saturate(${this.state.saturation})`, height: '100%', width: '100%', display: 'block' }}
                        draggable="false"
                        onLoad={onImgLoad}
                        src={this.state.image}
                        />

                    { (!this.state.imgLoad || this.props.loading) && <Dimmer active>
                                              <Loader />
                                            </Dimmer>}
                      { this.state.imgLoad &&
                        <div ref={(canv) => { this.canvas = canv; setFunctions(); }} style={canvasStyles}>
                          { this.canvas && this.canvas.offsetWidth &&
                                <svg style={{ width: this.state.imgWidth, height: this.state.imgHeight }}>
                                  {Object.keys(this.state.rects).length >= 0 && renderRects() }
                                  {Object.keys(this.state.rects).length >= 0 && renderPoints() }
                                  {this.state.currentRect && this.rectToStyles(this.state.currentRect)}
                                  {this.state.currentRect && this.state.currentRect.length > 1 && renderCurrentPoints()}
                                </svg>
                          }
                        </div>
                      }
                </PanZoomElement>
            </div>
      </div>
        {getLabels()}
      </div>
      {this.props.drawHandle && this.state.imgLoad &&
      <div>
          <Button size="mini" icon onClick={ () => { if (this.state.toolbarHidden) this.setState({ toolbarHidden: false}); else this.setState({ toolbarHidden: true});}}>
            { this.state.toolbarHidden && <Icon color="blue" name="angle left" /> }
            { !this.state.toolbarHidden && <Icon color="blue" name="angle right" /> }
          </Button>
          { !this.state.toolbarHidden &&
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                  { toolCombo && <p> Alternate Between Tool using <b>{toolCombo}</b> key. </p>}
                    <div>
                      <Button size="mini" icon color={!this.state.drawButton ? 'blue' : 'grey'} onClick={toggleTool.bind(this, false)}>
                        <Icon name="move" />
                      </Button>
                    </div>
                    <div>
                      <Button size="mini" color={this.state.drawButton ? 'blue' : 'grey'} icon onClick={toggleTool.bind(this, true)}>
                        <Icon name="pencil" />
                      </Button>
                    </div>
                        <div style={{ height: '40px' }} />
                    <div>
                        { getMenuItems()}
                    </div>
                        <div style={{ height: '10px' }} />
                      <div>
                        <Button size="mini" secondary icon onClick={this.undoLast} disabled={this.state.currentRect.length === 0}>
                          {undoButton}
                        </Button>
                      </div>
                        <div style={{ height: '10px' }} />
                      <div>
                        <Button size="mini" secondary icon onClick={this.clearPolygons} disabled={Object.keys(this.state.rects).length === 0}>
                          {clearButton}
                        </Button>
                      </div>
                        <div style={{ height: '30px' }} />
                      {this.showButtons()}
                </div>
          }
      </div>
      }
    </div>
    );
  }
}
PolygonAnnotator.propTypes = {
  image: PropTypes.string,
  drawHandle: PropTypes.func,
  space: PropTypes.boolean,
  entityColorMap: PropTypes.object,
  shortcuts: PropTypes.object,
  rects: PropTypes.object,
  loading: PropTypes.boolean,
  fullScreen: PropTypes.boolean,
  menuHidden: PropTypes.boolean,
  rectCatMap: PropTypes.object,
  skipRow: PropTypes.func,
  saveTagAndNextRow: PropTypes.func,
  getBackTopreviousRow: PropTypes.func,
  currentIndex: PropTypes.int,
  hits: PropTypes.object
};
