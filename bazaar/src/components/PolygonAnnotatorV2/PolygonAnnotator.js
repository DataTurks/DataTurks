import React, { Component, PropTypes } from 'react';
// import ListGroup from 'react-bootstrap/lib/ListGroup';
// import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import { Image, Button, Label, Dropdown, Checkbox, Icon, Dimmer, Loader, Input } from 'semantic-ui-react';
import { convertKeyToString } from '../../helpers/Utils';
// import PinchZoomPan from '../PinchZoomPan/PinchZoomPan';
// import PanZoomElement from '../PinchZoomPan/PanZoomElement';
const Mousetrap = require('mousetrap');
import Panner from '../PinchZoomPan/CenteredPanZoom';
// const ElementPan = require('react-element-pan');
import Modal from 'react-bootstrap/lib/Modal';

// App component - represents the whole app
export default class PolygonAnnotatorV2 extends Component {
  constructor(props) {
    super(props);
    console.log('PolygonAnnotator props', props);
    this.state = {
      rects: props.rects,
      rectCatMap: props.rectCatMap,
      rectShapeMap: props.rectShapeMap,
      hideLabelsMap: {},
      imageHoverMap: {},
      hideRectMap: {},
      menuOpenMap: {},
      imgLoaded: {},
      currentPolyPoint: [],
      opacity: 0.4,
      openNote: false,
      disableZoomAnim: false,
      entities: Object.keys(props.entityColorMap),
      canvasSet: false,
      searchQuery: '',
      translate: {
        x: 0,
        y: 0
      },
      notes: props.notes,
      imgWidth: undefined,
      imgHeight: undefined,
      imgLoad: false,
      contrast: 1.0,
      brightness: 1.0,
      saturation: 1.0,
      dx: 0,
      dy: 0,
      scale: 1,
      image: props.image,
      mouseHoverMap: {},
      toolName: this.props.defaultShape,
      drawButton: true,
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
    this._onWheel = this._onWheel.bind(this);
    this.onMouseOutHandler = this.onMouseOutHandler.bind(this);
    this.zoom = this.zoom.bind(this);
    this.resetScale = this.resetScale.bind(this);
    this.removeShape = this.removeShape.bind(this);
    this.getPoints = this.getPoints.bind(this);
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
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
      if (this.props.shortcuts && 'delete' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.delete);
        Mousetrap.bind(combo, this.removeShape.bind(this, undefined));
      }
    }
    window.addEventListener('resize', this.resizeWindow);
  }

  componentWillReceiveProps(nextProps) {
    console.log('PolygonAnnotator nextprops', nextProps);
    if (nextProps.rects && nextProps.rectCatMap && (this.props.rects !== nextProps.rects)) {
      this.setState({ rects: nextProps.rects, notes: nextProps.notes, rectShapeMap: nextProps.rectShapeMap, rectCatMap: nextProps.rectCatMap, image: nextProps.image});
    }
    // if (this.props.fullScreen !== nextProps.fullScreen) {
    //   console.log('full screen change');
    //   this.setState({imgLoad: false, canvasSet: false, imgObject: undefined, image: nextProps.image + '?ts=' + new Date()});
    // }
    if (this.props.image !== nextProps.image) {
      this.setState({imgLoad: false, canvasSet: false, imgWidth: undefined, imgHeight: undefined});
      this.setState({ scale: 1.0, translate: {x: 0, y: 0},  contrast: 1.0, hideRectMap: {}, brightness: 1.0, saturation: 1.0 });
    }
  }

  componentWillUnmount() {
    console.log('PolygonAnnotator unmount');
    // document.removeEventListener('mouseup', this.mouseupHandle);
    window.removeEventListener('resize', this.resizeWindow);
    if (this.props.drawHandle) {
      let combo = '';
      if (this.props.shortcuts && 'undo' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.undo);
        Mousetrap.unbind(combo);
      }
      if (this.props.shortcuts && 'clearAll' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.clearAll);
        Mousetrap.unbind(combo);
      }
      if (this.props.shortcuts && 'delete' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.delete);
        Mousetrap.unbind(combo);
      }
    }
  }

  onMouseOutHandler(event) {
    event.stopPropagation();
    console.log('impEvents onMouseOutHandler ', event);
    this.setState({ svgDrag: false, mouseDown: false });
    return false;
  }

  getPoint(point) {
    console.log('point is', point);
    if (point < 0.0) { return 0.0; }
    if (point > 1.0) { return 1.0; }
    return point;
  }

  getOffsets(e) {
    // const target1 = this.parentDiv;
    // const target2 = this.canvas;
    // const target3 = this.parentDiv2;
    // // const target4 = this.parentDiv3;
    // // const rect = target1.getBoundingClientRect();
    // // const rect2 = target2.getBoundingClientRect();
    // const rect3 = target3.getBoundingClientRect();
    // // const rect4 = target4.getBoundingClientRect();
    // // const offsetX = e.clientX - this.state.translate.x;
    // // const offsetY = e.clientY - this.state.translate.y;
    // // const offsetX2 = e.clientX - (this.state.translate.x > 0 ? this.state.translate.x : rect2.left);
    // // const offsetY2 = e.clientY - (this.state.translate.y > 0 ? this.state.translate.y : rect2.top);
    //
    // const offsetX3 = (e.clientX - rect3.left - this.state.translate.x) / this.state.scale;
    // const offsetY3 = (e.clientY - rect3.top - this.state.translate.y) / this.state.scale;

    // const offsetX4 = e.clientX - rect4.left;
    // const offsetY4 = e.clientY - rect4.top;
    // console.log('getOffsets', e.offsetX, e.offsetY, rect, rect2, offsetX, offsetY, offsetX2, offsetY2, offsetX3, offsetY3, offsetX4, offsetY4);
    return [e.offsetX, e.offsetY];
  }

  // getOffsets(evt) {
  //   var el = evt.target;
  //   var offset = { x: 0, y: 0 };

  //   while (el.offsetParent) {
  //     offset.x += el.offsetLeft;
  //     offset.y += el.offsetTop;
  //     el = el.offsetParent;
  //   }

  //   offset.x = evt.pageX - offset.x;
  //   offset.y = evt.pageY - offset.y;

  //   return [offset.x, offset.y];
  // }

  getPoints(currentRect) {
    let points = '';
    for (let index = 0; index < currentRect.length; index ++) {
      points = points + currentRect[index][0] + ',' + currentRect[index][1] + ' ';
    }
    // if (this.state.currentPolyPoint && this.state.currentPolyPoint.length === 2) {
    //   points = points + this.state.currentPolyPoint[0] + ',' + this.state.currentPolyPoint[1];
    // }
    return points.trim();
  }

  getDecPoints(currentRect, shape) {
    let points = '';
    if (!shape || shape === 'polygon') {
      for (let index = 0; index < currentRect.length; index ++) {
        points = points + Math.ceil(currentRect[index][0] * this.state.imgWidth) + ',' + (Math.ceil(currentRect[index][1] * (this.state.imgHeight))) + ' ';
        // console.log('getDecPoints ', currentRect[index], points);
      }
    } else if (shape && shape === 'rectangle') {
      let x = currentRect[0][0];
      let y = currentRect[0][1];
      let xlg = currentRect[3][0];
      let ylg = currentRect[3][1];
      for (let jindex = 0; jindex < currentRect.length; jindex ++) {
        const currentPoint = currentRect[jindex];
        if (x > currentPoint[0]) {
          x = currentPoint[0];
        }
        if (y > currentPoint[1]) {
          y = currentPoint[1];
        }
        if (currentPoint[0] > xlg) {
          xlg = currentPoint[0];
        }
        if (currentPoint[1] > ylg) {
          ylg = currentPoint[1];
        }
      }
      x = x * this.state.imgWidth;
      y = y * this.state.imgHeight;
      xlg = xlg * this.state.imgWidth;
      ylg = ylg * this.state.imgHeight;

      points = x + "," + ylg + " " + xlg + "," + ylg + " " + xlg + "," + y + " " + x + "," + y;
      // for (let index = 0; index < currentRect.length; index ++) {
      //   points = points + Math.ceil(currentRect[index][0] * this.state.imgWidth) + ',' + (Math.ceil(currentRect[index][1] * (this.state.imgHeight))) + ' ';
      //   // console.log('getDecPoints ', currentRect[index], points);
      // }
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

  resetScale() {
    console.log('reset scale');
    this.setState({ disableZoomAnim: false });
    // this.setState({
    //   imgWidth: this.state.imgWidth * this.state.zoomFactor,
    //   imgHeight: this.state.imgHeight * this.state.zoomFactor,
    //   scale: 1.0
    // }, () => {this.setState({ disableZoomAnim: false });});
  }

  zoom(event_offsetX, event_offsetY, deltaY, zoomF) {
    let zoomFactor;
    if (deltaY < 0 && !zoomF) {
      zoomFactor = 1.07;
    } else if (deltaY > 0 && !zoomF) {
      zoomFactor = 0.93;
    } else if (zoomF) {
      zoomFactor = zoomF;
    }
    const mouseHoverMap = this.state.mouseHoverMap;
    for (const k in mouseHoverMap) {
      if (mouseHoverMap.hasOwnProperty(k)) {
        mouseHoverMap[k] = false;
      }
    }
    // if (zoomFactor > 100) zoomFactor = 100.0;
    // if (zoomFactor < -10) zoomFactor = -10;
    this._panner.zoom(zoomFactor, {x: event_offsetX, y: event_offsetY});
    // const scalechange = this._panner.scale - this.state.scale;
    // const offsetX = -(event.clientX * scalechange);
    // const offsetY = -(event.clientY * scalechange);
    this._startX = event_offsetX;
    this._startY = event_offsetY;
    // console.log('onwheel', offsetX, offsetY, this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
    // // this._panner.pan(offsetX, offsetY);
    console.log('onwheel setting state');
    // debugger;
    let newZoomF = this._panner.scale / this.state.scale;
    // this.state.scale = this._panner.scale;
    this.state.translate = {
      x: this._panner.viewport.x,
      y: this._panner.viewport.y
    };
    let { currentRect } = this.state;
    if (currentRect && currentRect.length > 0) {
      for (let jindex = 0; jindex < currentRect.length; jindex++) {
        currentRect[jindex][0] = currentRect[jindex][0] * zoomFactor;
        currentRect[jindex][1] = currentRect[jindex][1] * zoomFactor;
      }
    }
    // this.canvas.offsetWidth = this.canvas.offsetWidth * zoomFactor;
    // this.canvas.offsetHeight = this.canvas.offsetHeight * zoomFactor;
    this.setState({ zoomFactor: newZoomF, disableZoomAnim: true })
    this.setState({
      imgWidth: this.state.imgWidth * zoomFactor,
      imgHeight: this.state.imgHeight * zoomFactor,
      scale: 1,
      currentRect
    });
    clearTimeout(this.resetScale);
    setTimeout(this.resetScale, 10);
  }

  closeModal(index) {
    console.log('closemodal', this.state, index);
    this.setState({ openNote: false, noteIndex: -1 });
  }

  saveModal(index) {
    console.log('closemodal', this.state, index);
    this.setState({ openNote: false, noteIndex: -1 });
    if (this.props.drawHandle) {
      this.props.drawHandle(this.state);
    }
  }

  handleNoteChange(event) {
    const { notes } = this.state;
    notes[this.state.noteIndex] = event.target.value;
    this.setState({ notes });
  }

  resetImage() {
    console.log('resize resetImage');
    if (this.state.imgObject) {
      this.setState({ imgHeight: this.state.imgObject.offsetHeight,
                                  imgWidth: this.state.imgObject.offsetWidth, translate: {x: 0, y: 0} });
      this._panner = new Panner({
        screenWidth: this.state.imgObject.offsetWidth,
        screenHeight: this.state.imgObject.offsetHeight
      });
  }
    clearTimeout(this.resizeTo);
    this.setState({ imgLoad: true });
  }

  resizeWindow(e1, e2) {
    console.log('resize ', e1, e2);
    if (this.state.imgObject) {
      this.setState({ imgLoad: false, canvasSet: false });
      // this.setState({ imgHeight: this.state.imgObject.offsetHeight,
      //                             imgWidth: this.state.imgObject.offsetWidth });
    }
    // if (this.resizeTo) clearTimeout(this.resizeTo);
    this.resizeTo = setTimeout(this.resetImage.bind(this), 2000);
  }

  handleKeyDown(event) {
    console.log('keydown ', event.keyCode);
    if (this.state.openNote) {
      if (event.keyCode === 13) {
        // enter
        this.saveModal();
      } else if (event.keyCode === 27) {
        // escape
        this.closeModal();
      }
    }
    return false;
  }

  mousedownHandle(event) {
    event.preventDefault();
    const [offsetX, offsetY] = this.getOffsets(event);
    console.log('mousedown polygon drag', event.offsetX, event.offsetY, offsetX, offsetY, this.state, event.target.nodeName, event.target.id);
    const mouseHoverMap = this.state.mouseHoverMap;
    if (this.state.defaultClass) {
      for (const k in mouseHoverMap) {
        if (mouseHoverMap.hasOwnProperty(k)) {
          mouseHoverMap[k] = false;
        }
      }
      if (this.state.toolName === 'polygon') {
        if (event.target.nodeName === 'circle' &&  event.target.id.length === 3 && event.target.id[0] === 'x' && event.target.id[2] === '0') {
          if (this.state.defaultClass) {
            this.savePolygon(this.state.defaultClass);
          } else {
            this.savePolygon(this.state.entities[0]);
          }
        } else {
          const currentRect = this.state.currentRect;
          currentRect.push([offsetX, offsetY]);
          this.setState({
            currentRect,
            currentPolyPoint: []
          });
        }
      } else if (this.state.toolName === 'point') {
        if (event.target.nodeName === 'circle') {
          if (this.state.defaultClass) {
            this.savePolygon(this.state.defaultClass);
          } else {
            this.savePolygon(this.state.entities[0]);
          }
        } else {
          const currentRect = [];
          currentRect.push([this.getPoint(offsetX / this.state.imgWidth), this.getPoint(offsetY / this.state.imgHeight)]);
          const { rectCatMap, rectShapeMap } = this.state;
          const numberOfRects = Object.keys(rectCatMap).length;
          rectShapeMap[numberOfRects] = 'point';
          if (this.state.defaultClass) {
            rectCatMap[numberOfRects] = [this.state.defaultClass];
          }
          mouseHoverMap[numberOfRects] = true;
          let defaultClass = this.state.defaultClass;
          if (!this.props.keepEntitySelected) {
            defaultClass = '';
          }
          this.setState({
            rects: [
              ...this.state.rects,
              currentRect
            ],
            rectCatMap,
            mouseHoverMap,
            currentRect: [],
            rectShapeMap,
            defaultClass,
            openMenuTool: true,
            mouseDown: false,
            showList: true
          }, () => {
            if (this.props.drawHandle) {
              console.log('calling drawhandle', this.state);
              this.props.drawHandle(this.state);
            }
          });
        }
      } else if (this.state.toolName === 'rectangle') {
        console.log('starting rectangle', event.offsetX, event.offsetY, event.target.nodeName, this.state.currentRect);
        if (this.state.currentRect.length === 0) {
          const currentRect = this.state.currentRect;
          currentRect.push([offsetX, offsetY]);
          this.setState({
            currentRect,
          });
        } else {
          let currentRectangle = this.state.currentRect;
          if (event.target.nodeName === 'svg') {
            const currentPoint = currentRectangle[0];
            currentRectangle = [];
            currentRectangle.push([ this.getPoint(currentPoint[0] / this.state.imgWidth), this.getPoint(currentPoint[1] / this.state.imgHeight)]);
            currentRectangle.push([ this.getPoint(offsetX / this.state.imgWidth), this.getPoint(currentPoint[1] / this.state.imgHeight)]);
            currentRectangle.push([ this.getPoint(offsetX / this.state.imgWidth), this.getPoint(offsetY / this.state.imgHeight)]);
            currentRectangle.push([ this.getPoint(currentPoint[0] / this.state.imgWidth), this.getPoint(offsetY / this.state.imgHeight)]);
          } else {
            const currentPoint = currentRectangle[0];
            const nextPoint = currentRectangle[3];
            currentRectangle = [];
            currentRectangle.push([ this.getPoint(currentPoint[0] / this.state.imgWidth), this.getPoint(currentPoint[1] / this.state.imgHeight)]);
            currentRectangle.push([ this.getPoint(nextPoint[0] / this.state.imgWidth), this.getPoint(currentPoint[1] / this.state.imgHeight)]);
            currentRectangle.push([ this.getPoint(nextPoint[0] / this.state.imgWidth), this.getPoint(nextPoint[1] / this.state.imgHeight)]);
            currentRectangle.push([ this.getPoint(currentPoint[0] / this.state.imgWidth), this.getPoint(nextPoint[1] / this.state.imgHeight)]);
          }
          const { rectCatMap, rectShapeMap } = this.state;
          const numberOfRects = Object.keys(rectCatMap).length;
          rectShapeMap[numberOfRects] = 'rectangle';
          if (this.state.defaultClass) {
            rectCatMap[numberOfRects] = [this.state.defaultClass];
          }
          let defaultClass = this.state.defaultClass;
          if (!this.props.keepEntitySelected) {
            defaultClass = '';
          }
          mouseHoverMap[numberOfRects] = true;
          this.setState({
            rects: [
              ...this.state.rects,
              currentRectangle
            ],
            rectCatMap,
            mouseHoverMap,
            currentRect: [],
            rectShapeMap,
            defaultClass,
            openMenuTool: true,
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
    } else if (event.target.nodeName === 'circle' && this.props.drawHandle) {
      console.log('drag start', event.offsetX, event.offsetY, event.target.id);
      const splits = event.target.id.split('--');
      // console.log('splits are', )
      if (splits.length === 2) {
        console.log('drag point is', this.state.rects[splits[0]][splits[1]][0] * this.state.imgWidth);
        console.log('drag point is', this.state.rects[splits[0]][splits[1]][1] * this.state.imgHeight);
        const rectIndex = parseInt(splits[0], 10);
        const rectShape = this.state.rectShapeMap[rectIndex];
        if (rectShape === 'point') {
          for (const k in mouseHoverMap) {
            if (mouseHoverMap.hasOwnProperty(k)) {
              mouseHoverMap[k] = false;
            }
          }
          mouseHoverMap[rectIndex] = true;
        }
        this.setState({ pointDrag: true, dragRect: rectIndex, mouseHoverMap, dragPoint: parseInt(splits[1], 10)});
      } else if (splits.length === 3) {
        const rects = this.state.rects;
        const rect = this.state.rects[parseInt(splits[0], 10)];
        const firstIndex = parseInt(splits[1], 10);
        const nextIndex = parseInt(splits[2], 10);
        const middleX = (rect[firstIndex][0] + rect[nextIndex][0]) / 2;
        const middleY = (rect[firstIndex][1] + rect[nextIndex][1]) / 2;
        console.log('middle point is', middleX, middleY);
        rect.splice(firstIndex + 1, 0, [middleX, middleY]);
        rects[parseInt(splits[0], 10)] = rect;
        this.state.rects = rects;
        this.setState({ rects: rects, pointDrag: true, dragRect: parseInt(splits[0], 10), dragPoint: parseInt(splits[1], 10) + 1});
      }
    } else if (this.props.drawHandle && (event.target.nodeName === 'polygon' || event.target.nodeName === 'rect')) {
      if (mouseHoverMap[event.target.id] && mouseHoverMap[event.target.id] === true) {
        console.log('rectdrag start', event.clientX, event.clientY);
        this.setState({ rectDrag: true, dragRect: event.target.id, dragPoint: [offsetX, offsetY] });
      } else {
        for (const k in mouseHoverMap) {
          if (mouseHoverMap.hasOwnProperty(k)) {
            if (k !== event.target.id) {
              mouseHoverMap[k] = false;
            }
          }
        }
        if (mouseHoverMap[event.target.id]) {
          mouseHoverMap[event.target.id] = false;
          // this.toggleTool('move');
        } else {
          mouseHoverMap[event.target.id] = true;
        }
        this.setState({ mouseHoverMap });
        // toggleMouseHover.bind(this, index, true)}
      }
    } else if (event.target.nodeName === 'svg') {
      console.log('svgdrag start');
      this.setState({ svgDrag: true });
      this._startX = event.pageX;
      this._startY = event.pageY;
      this.setState({ dragPoint: [event.pageX, event.pageY]});
    }
    return false;
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
    // debugger;
    console.log('mouseupHandle polygon', event.target.nodeName, event.offsetX, event.offsetY);
    const [offsetX, offsetY] = this.getOffsets(event);
    if (this.state.pointDrag) {
      event.preventDefault();
      console.log('pointdrag', event.offsetX, event.offsetY, event.target.id);
      const rects = this.state.rects;
      const currentRect = rects[this.state.dragRect];
      console.log('pointdrag', currentRect, this.state, offsetX, offsetY);
      const shape = this.state.rectShapeMap[this.state.dragRect];
      const newx = this.getPoint(offsetX / this.state.imgWidth);
      const newy = this.getPoint(offsetY / this.state.imgHeight);
      currentRect[this.state.dragPoint][0] = newx;
      currentRect[this.state.dragPoint][1] = newy;
      if (shape === 'rectangle') {
        let oldx = currentRect[this.state.dragPoint][0];
        let oldy = currentRect[this.state.dragPoint][1];
        for (let jindex = 0; jindex < currentRect.length; jindex ++) {
          if (currentRect[jindex][0] === oldx) {
            currentRect[jindex][0] = newx
          }
          if (currentRect[jindex][1] === oldy) {
            currentRect[jindex][1] = newy
          }
        }

        // if (this.state.dragPoint === 0) {
        //   currentRect[1][1] = newy;
        //   currentRect[3][0] = newx;
        // } else if (this.state.dragPoint === 1) {
        //   currentRect[0][1] = newy;
        //   currentRect[2][0] = newx;
        // } else if (this.state.dragPoint === 2) {
        //   currentRect[1][0] = newx;
        //   currentRect[3][1] = newy;
        // } else if (this.state.dragPoint === 3) {
        //   console.log('pointdrag changing 3rd');
        //   currentRect[0][0] = newx;
        //   currentRect[2][1] = newy;
        // }
        console.log('pointdrag', shape, currentRect, newx, newy);
      }
      rects[this.state.dragRect] = currentRect;
      this.setState({ rects });
      this.setState({ pointDrag: false }, () => {
        if (this.props.drawHandle) {
          console.log('calling drawhandle', this.state);
          this.props.drawHandle(this.state);
        }
      });
    } else if (this.state.rectDrag) {
      event.preventDefault();
      if (this.state.dragging) {
        const dx = (offsetX - this.state.dragPoint[0]) / this.state.imgWidth;
        const dy = (offsetY - this.state.dragPoint[1]) / this.state.imgHeight;
        const currentRect = this.state.rects[this.state.dragRect];
        for (let jindex = 0; jindex < currentRect.length; jindex ++) {
          currentRect[jindex][0] = currentRect[jindex][0] + dx;
          currentRect[jindex][1] = currentRect[jindex][1] + dy;
        }
        const rects = this.state.rects;
        rects[this.state.dragRect] = currentRect;
        console.log('rectdrag', event.clientX, event.clientY, event.offsetX, event.offsetY, event.target.id, this.state);
        this.setState({ rects, dragging: false, rectDrag: false, dragPoint: undefined, dragRect: undefined },
          () => {
            if (this.props.drawHandle) {
              console.log('calling drawhandle', this.state);
              this.props.drawHandle(this.state);
            }
          });
      } else {
        event.preventDefault();
        const mouseHoverMap = this.state.mouseHoverMap;
        for (const k in mouseHoverMap) {
          if (mouseHoverMap.hasOwnProperty(k)) {
            if (k !== event.target.id) {
              mouseHoverMap[k] = false;
            }
          }
        }
        if (mouseHoverMap[event.target.id]) {
          mouseHoverMap[event.target.id] = false;
          // this.toggleTool('move');
        } else {
          mouseHoverMap[event.target.id] = true;
        }
        // toggleMouseHover.bind(this, index, true)}
        this.setState({ mouseHoverMap, dragging: false, rectDrag: false, dragRect: undefined });
      }
    } else if (this.state.svgDrag) {
      // const dx = (event.screenX - this.state.dragPoint[0]);
      // const dy = (event.screenY - this.state.dragPoint[1]);
      event.preventDefault();
      this.setState({ svgDrag: false });
    }
    // return false;
  }

  mousemoveHandle(event) {
    event.preventDefault();
    const [offsetX, offsetY] = this.getOffsets(event);
    // console.log('mousemoveHandle ', event.offsetX, event.offsetY, offsetX, offsetY, event.target);
    if (this.state.pointDrag) {
      console.log('mousemoveHandle', event.target.nodeName, event.offsetX, event.offsetY, event.pageX, event.pageY);
      // console.log('dragging', event.offsetX, event.offsetY);
      const rects = this.state.rects;
      const currentRect = rects[this.state.dragRect];
      const newx = this.getPoint(offsetX / this.state.imgWidth);
      const newy = this.getPoint(offsetY / this.state.imgHeight);
      let oldx = currentRect[this.state.dragPoint][0];
      let oldy = currentRect[this.state.dragPoint][1];
      currentRect[this.state.dragPoint][0] = newx;
      currentRect[this.state.dragPoint][1] = newy;
      const shape = this.state.rectShapeMap[this.state.dragRect];
      if (shape === 'rectangle') {
        for (let jindex = 0; jindex < currentRect.length; jindex ++) {
          if (currentRect[jindex][0] === oldx) {
            currentRect[jindex][0] = newx
          }
          if (currentRect[jindex][1] === oldy) {
            currentRect[jindex][1] = newy
          }
        }
        // if (this.state.dragPoint === 0) {
        //   currentRect[3][0] = newx;
        //   currentRect[1][1] = newy;
        // } else if (this.state.dragPoint === 1) {
        //   currentRect[0][1] = newy;
        //   currentRect[2][0] = newx;
        // } else if (this.state.dragPoint === 2) {
        //   currentRect[1][0] = newx;
        //   currentRect[3][1] = newy;
        // } else if (this.state.dragPoint === 3) {
        //   console.log('rectdrag changing 3rd');
        //   currentRect[0][0] = newx;
        //   currentRect[2][1] = newy;
        // }
      }
      this.setState({ rects });
    } else if (this.state.rectDrag && this.state.dragRect) {
      const dx = (offsetX - this.state.dragPoint[0]) / this.state.imgWidth;
      const dy = (offsetY - this.state.dragPoint[1]) / this.state.imgHeight;
      const currentRect = this.state.rects[this.state.dragRect];
      console.log('rectdrag dx', dx, dy, currentRect);
      for (let jindex = 0; jindex < currentRect.length; jindex ++) {
        currentRect[jindex][0] = currentRect[jindex][0] + dx;
        currentRect[jindex][1] = currentRect[jindex][1] + dy;
      }
      const rects = this.state.rects;
      rects[this.state.dragRect] = currentRect;
      console.log('rectdrag', event.clientX, event.clientY, event.offsetX, event.offsetY, event.target.id, this.state);
      this.setState({ rects, dragging: true, dragPoint: [offsetX, offsetY] });
    } else if (this.state.toolName === 'rectangle' && this.state.currentRect.length > 0 && event.target.nodeName !== 'circle') {
      let currentRectangle = this.state.currentRect;
      const currentPoint = currentRectangle[0];
      // console.log('rectangleDraw mousemove', currentRectangle);
      currentRectangle = [];
      currentRectangle.push([ currentPoint[0], currentPoint[1] ]);
      currentRectangle.push([ offsetX, currentPoint[1] ]);
      currentRectangle.push([ currentPoint[0], offsetY]);
      currentRectangle.push([ offsetX, offsetY]);
      this.setState({ currentRect: currentRectangle });
    } else if (this.state.toolName === 'polygon' && this.state.currentRect.length > 0) {
      // let currentRectangle = this.state.currentRect;
      // const currentPoint = currentRectangle[0];
      // console.log('rectangleDraw mousemove', currentRectangle);
      // currentRectangle = [];
      // currentRectangle.push([ currentPoint[0], currentPoint[1] ]);
      // currentRectangle.push([ offsetX, currentPoint[1] ]);
      // currentRectangle.push([ currentPoint[0], offsetY]);
      // currentRectangle.push([ offsetX, offsetY]);
      this.setState({ currentPolyPoint: [offsetX, offsetY]});
    } else if (this.state.svgDrag) {
      console.log('lets move svg');
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
      });

      // console.log('svgdrag');
      // const dx = this.state.dx + (event.screenX - this.state.dragPoint[0]);
      // const dy = this.state.dy + (event.screenY - this.state.dragPoint[1]);
      // this.setState({ dx, dy });
    }
    return false;
  }

  pan(distancex, distancey) {
    console.log('lets move svg');
    this._panner.panFrom(
      {
        x: 0,
        y: 0
      },
      {
        x: distancex,
        y: distancey
      });
    this._startX = 0;
    this._startY = 0;
    this.setState({
      translate: {
        x: this._panner.viewport.x,
        y: this._panner.viewport.y
      },
    });
  }

  _onWheel(event) {
    event.preventDefault();
    const [offsetX, offsetY] = this.getOffsets(event);
    console.log('_onWheel', event, offsetX, offsetY, event.deltaY);
    // console.log('_onwheel', event.currentTarget.getBoundingClientRect(), event.pageX, event.pageY, event.screenX, event.screenY, event.clientX, event.clientY);
    // const currentTargetRect = event.currentTarget.getBoundingClientRect();
    // const event_offsetX = event.clientX - (currentTargetRect.left * this.state.scale);
    // const event_offsetY = event.clientY - (currentTargetRect.top * this.state.scale);
    // console.log('onWheel', event.clientX, event.clientY, event_offsetX, event_offsetY);
    // console.log('event offset', event_offsetX, event_offsetY);
    // console.log('onwheel', this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
    console.log('viewport onwheel', event.offsetX, event.offsetY, this._panner.viewport.x, this._panner.viewport.y, this.state.translate.x, this.state.translate.y);
    if (!event.deltaY) {
      this.zoom(offsetX, offsetY, -5, 1.20);
    } else {
      this.zoom(offsetX, offsetY, event.deltaY);
    }
    // this._panner.zoom(zoomFactor, {x: event_offsetX, y: event_offsetY});
    // // const scalechange = this._panner.scale - this.state.scale;
    // // const offsetX = -(event.clientX * scalechange);
    // // const offsetY = -(event.clientY * scalechange);
    // this._startX = event_offsetX;
    // this._startY = event_offsetY;
    // // console.log('onwheel', offsetX, offsetY, this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
    // // // this._panner.pan(offsetX, offsetY);
    // // console.log('onwheel', offsetX, offsetY, this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
    // this.setState({
    //   translate: {
    //     x: this._panner.viewport.x + 0 * (this.canvas.offsetWidth * this._panner.scale),
    //     y: this._panner.viewport.y + 0 * (this.canvas.offsetHeight * this._panner.scale)
    //   },
    //   scale: this._panner.scale
    // });
  }

  rectToStyles(currentRect) {
    // const { x1, y1, width, height } = currentRect;
    console.log('rectToStyles ', currentRect, this.state.toolName);
    const canvas = this.canvas;
    if (!canvas) {
      return (<div />);
    }
    // debugger;
    if (this.state.toolName === 'polygon' && currentRect.length === 1) {
      return (<circle cx={currentRect[0][0]} cy={currentRect[0][1]} r={2} stroke="white" fill="lightblue" strokeWidth={2}  style={{fill: `${this.props.entityColorMap[this.state.defaultClass]}`, fillOpacity: `${this.state.opacity}`, stroke: '#1ae04e', strokeWidth: `${1 / this.state.scale}`}} />);
    } else if (this.state.toolName === 'polygon' && currentRect.length > 1) {
      return (<polyline points={this.getPoints(currentRect)} style={{fill: `${this.props.entityColorMap[this.state.defaultClass]}`, fillOpacity: `${this.state.opacity}`, stroke: '#1ae04e', strokeWidth: `${1 / this.state.scale}`}} />);
    } else if (this.state.toolName === 'rectangle') {
      return this.renderCurrentRectangle();
    }
  }


  savePolygon(category) {
    console.log('savePolygon ', category);
    const currentRect = this.state.currentRect;
    if (currentRect.length > 0) {
      // if (currentRect[0] !== currentRect[currentRect.length - 1]) {
      //   currentRect.push(currentRect[0]);
      // }
      const rects = this.state.rects;
      const len = Object.keys(rects).length;
      const normPoints = [];
      console.log('savePolygon ', currentRect);
      for (let index = 0; index < currentRect.length; index ++) {
        let xCord = currentRect[index][0];
        let yCord = currentRect[index][1];
        xCord = this.getPoint(xCord / this.state.imgWidth);
        yCord = this.getPoint(yCord / (this.state.imgHeight));
        normPoints.push([ xCord, yCord]);
      }
      console.log('savePolygon ', normPoints);
      rects[len] = normPoints;
      const rectCatMap = this.state.rectCatMap;
      const rectShapeMap = this.state.rectShapeMap;
      rectCatMap[len] = [category];
      rectShapeMap[len] = this.state.toolName;
      const hideLabelsMap = this.state.hideLabelsMap;
      hideLabelsMap[len] = false;
      const mouseHoverMap = this.state.mouseHoverMap;
      let defaultClass = this.state.defaultClass;
      if (!this.props.keepEntitySelected) {
        defaultClass = '';
      }
      // mouseHoverMap[len] = true;
      // this.toggleTool('move');
      this.setState({ currentRect: [], currentPolyPoint: [], defaultClass, rects: rects, mouseHoverMap, rectCatMap, hideLabelsMap}, () => {
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
        rectCatMap[index] = [category];
        this.setState({ rectCatMap, openMenuTool: false }, () => {
          if (this.props.drawHandle) {
            this.props.drawHandle(this.state);
          }
        });
      }
    }
  }

  undoLast() {
    if (this.state.currentRect.length > 0) {
      const currentRect = this.state.currentRect;
      currentRect.splice(-1, 1);
      this.setState({currentRect});
    }
    return false;
  }

  clearPolygons() {
    if (window.confirm('Are you sure you wish to clear all tagged items?')) {
      if (Object.keys(this.state.rects).length > 0) {
        this.setState({ currentRect: [], rects: []});
      }
    }
  }

  showButtons() {
    let nextButton = 'Next';
    let prevButton = 'Previous';
    let skipButton = 'Skip';
    let saveButton = 'Move to Done';
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
        // console.log('setting skip shortcut', combo);
        if (this.props.currentIndex >= 0) {
          Mousetrap.bind(combo, this.props.skipRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('moveToDone' in shortcuts) {
        const combo = convertKeyToString(shortcuts.moveToDone);
        saveButton = 'Move To Done (' + combo + ')';
        // console.log('setting skip shortcut', combo);
        Mousetrap.bind(combo, this.props.saveRow.bind(this, 'saveToDone'));
      }
    }
    return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="marginTop" style={{ marginTop: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                  <div title={prevButton}>
                    <Button icon size="mini" color="grey" icon onClick={this.props.getBackTopreviousRow} disabled={this.props.currentIndex <= 0}>
                      <Icon name="left arrow" />
                    </Button>
                  </div>
                  <div title={skipButton}>
                    <Button icon size="mini" color="grey" icon onClick={this.props.skipRow} disabled={this.props.currentIndex < 0}>
                      <Icon name="mail forward" />
                    </Button>
                  </div>
                  <div title={nextButton}>
                    <Button icon size="mini" color="blue" icon onClick={this.props.saveTagAndNextRow} disabled={this.props.currentIndex < 0}>
                      <Icon name="right arrow" />
                    </Button>
                  </div>
            </div>
              <br />
                  <div title={saveButton} className="text-center">
                    <Button size="mini" color="blue" icon onClick={this.props.saveRow.bind(this, 'saveToDone')}>
                      {saveButton}
                    </Button>
                  </div>
          </div>
        );
  }

  toggleTool(event, event1) {
    if (event1) event1.preventDefault();
    let value = event;
    if (event === 'shift') {
      if (this.state.toolName === 'polygon') value = 'rectangle';
      else if (this.state.toolName === 'rectangle') value = 'point';
      else if (this.state.toolName === 'point') value = 'polygon';
    }
    if (value === 'move') {
      this.setState({ drawButton: false, canvasSet: false });
      this.canvas.removeEventListener('mousedown', this.mousedownHandle);
      document.removeEventListener('mouseup', this.mouseupHandle);
    } else {
      this.setState({ drawButton: true, canvasSet: false, toolName: value });
    }
    return false;
  }

  removeShape(index) {
    console.log('removeShape', index);
    let deleteIndex = index;
    const mouseHoverMap = this.state.mouseHoverMap;
    if (!deleteIndex) {
      for (const key of Object.keys(mouseHoverMap)) {
        if (mouseHoverMap[key]) { deleteIndex = parseInt(key, 10); mouseHoverMap[key] = false; break; }
      }
    }
    if (deleteIndex === undefined) return;
    const rectCatMap = this.state.rectCatMap;
    const rectShapeMap = this.state.rectShapeMap;
    const hideLabelsMap = this.state.hideLabelsMap;
    const hideRectMap = this.state.hideRectMap;
    delete rectCatMap[deleteIndex];
    const rects = this.state.rects;
    delete rects[deleteIndex];
    delete rectShapeMap[deleteIndex];
    delete hideLabelsMap[deleteIndex];
    delete hideRectMap[deleteIndex];
    this.setState({
      rects, rectCatMap, mouseHoverMap, rectShapeMap, hideLabelsMap, hideRectMap, openMenuTool: false
    }, () => {
      if (this.props.drawHandle) {
        this.props.drawHandle(this.state);
      }
    });
  }

  renderCurrentRectangle() {
    console.log('rectangleDraw renderCurrentRectangle', this.state.currentRect);
    let x = this.state.imgWidth;
    let y = this.state.imgHeight;
    let xlg = 0;
    let ylg = 0;
    const color = this.props.entityColorMap[this.state.defaultClass];
    for (let index = 0; index < this.state.currentRect.length; index ++) {
      const currentPoint = this.state.currentRect[index];
      if (x > currentPoint[0]) {
        x = currentPoint[0];
      }
      if (y > currentPoint[1]) {
        y = currentPoint[1];
      }
      if (currentPoint[0] > xlg) {
        xlg = currentPoint[0];
      }
      if (currentPoint[1] > ylg) {
        ylg = currentPoint[1];
      }
    }
    let points = x + "," + ylg + " " + xlg + "," + ylg + " " + xlg + "," + y + " " + x + "," + y;
    // const width = Math.abs(xlg - x);
    // const height = Math.abs(ylg - y);
    return (<polygon points={points} style={{fill: `${color}`, fillOpacity: `${this.state.opacity}`, stroke: '#1ae04e', strokeWidth: `${2 / this.state.scale}`}} />);
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
      transform: `translate3d(${this.state.translate.x}px, ${this.state.translate.y}px, 0px) scale(1)`,
      cursor: this.state.defaultClass ? 'crosshair' : 'move',
    };

    const selectCategory = (event1, index) => {
      console.log('select category ', event1, index);
      if (this.state.currentRect && this.state.currentRect.length > 0) {
        this.savePolygon(event1);
      } else {
        if (this.state.defaultClass !== event1) {
          this.setState({ defaultClass: event1 });
          this.toggleTool(this.state.toolName);
        } else {
          this.setState({ defaultClass: '' });
        }
      }
      return false;
    };

    const removeRect = (event) => {
      console.log('remove rect', event.target.id, this.state);
      const index = event.target.id;
      this.removeShape(index);
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
        if ( index in this.state.hideRectMap && this.state.hideRectMap[index] === true) {
          return (<div />);
        }
        console.log('render rects', this.state);
        const entity = this.props.rectCatMap[index];
        console.log('render rects', entity, (!(entity in this.state.hideLabelsMap)) || ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap.entity === false));
        if ((!(entity in this.state.hideLabelsMap)) || ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap[entity] === false)) {
          const lineColor = this.props.entityColorMap[entity];
          const shape = this.state.rectShapeMap[index];
          console.log('renderRects', shape);
          let sw = 1 / this.state.scale;
          let cursor = '';
          if (this.state.currentRect.length === 0) {
            cursor = 'pointer';
          }
          if (this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) {
            sw = 3 / this.state.scale;
            cursor = 'alias';
          }
          if (this.state.defaultClass) {
            cursor = 'crosshair';
          }
          if (!shape || shape === 'polygon') {
            console.log('timeTrack poly1', new Date().getTime())
            const points = this.getDecPoints(rect, 'polygon');
            console.log('rendering rects', lineColor, points);
            if (!this.canvas) {
              this.state.canvasSet = false;
              return (<div />);
            }
            if (rect.length === 1) {
              const pointSplits = points.split(',');
              return (
                <circle cx={pointSplits[0]} cy={pointSplits[1]} r="2" stroke={lineColor} strokeWidth={sw} fill={lineColor} />
                );
            }
            console.log('timeTrack poly2', new Date().getTime())
            return (<polygon
                      id={index} key={index} points={points}
                      style={{ fill: `${lineColor}`, cursor: `${cursor}`, fillOpacity: `${this.state.opacity}`, stroke: '#1ae04e', strokeWidth: `${sw}` }} />);
          } else if (shape === 'rectangle') {
            console.log('timeTrack rect1', new Date().getTime())
            // let x = rect[0][0];
            // let y = rect[0][1];
            // let xlg = rect[3][0];
            // let ylg = rect[3][1];
            // if (x > xlg) {
            //   let temp = x;
            //   x = xlg;
            //   xlg = temp;
            // }
            // if (y > ylg) {
            //   let temp = y;
            //   y = ylg;
            //   ylg = temp;
            // }
            // // for (let jindex = 0; jindex < rect.length; jindex ++) {
            // //   const currentPoint = rect[jindex];
            // //   if (x > currentPoint[0]) {
            // //     x = currentPoint[0];
            // //   }
            // //   if (y > currentPoint[1]) {
            // //     y = currentPoint[1];
            // //   }
            // //   if (currentPoint[0] > xlg) {
            // //     xlg = currentPoint[0];
            // //   }
            // //   if (currentPoint[1] > ylg) {
            // //     ylg = currentPoint[1];
            // //   }
            // // }
            // let width = Math.abs(xlg - x);
            // let height = Math.abs(ylg - y);
            // x = x * this.state.imgWidth;
            // y = y * this.state.imgHeight;
            // width = width * this.state.imgWidth;
            // height = height * this.state.imgHeight;
            // console.log('renderRects rectangle rendering', x, y, width, height);
            const points = this.getDecPoints(rect, 'rectangle');
            // console.log('rendering rects', lineColor, points);
            // const pointSplits = points.split(',');
            console.log('timeTrack rect2', new Date().getTime())
            // let dpath = "M" + rect[0][0] * this.state.imgWidth + " " + rect[0][1] * this.state.imgHeight + " L " + rect[1][0] * this.state.imgWidth + " " + rect[1][1] * this.state.imgHeight + " L " + rect[2][0] * this.state.imgWidth + " " + rect[2][1] * this.state.imgHeight + ", " + rect[3][0] * this.state.imgWidth + " " + rect[3][1] * this.state.imgHeight;
            return (<polygon id={index} key={index} points={points} style={{fill: `${lineColor}`, cursor: `${cursor}`, fillOpacity: `${this.state.opacity}`, stroke: '#1ae04e', strokeWidth: `${sw}` }} />);
          }
        }
      })
    );

    const renderPoints = () => (
      this.state.rects.map((rect, index) => {
        console.log('render rects', rect);
        if ( index in this.state.hideRectMap && this.state.hideRectMap[index] === true) {
          return (<div />);
        }
        const pointArrs = [];
        const entity = this.props.rectCatMap[index];
        const lineColor = this.props.entityColorMap[entity];
        const shape = this.state.rectShapeMap[index];
        let sw = 1;
        let radius = 0.5;
        let style = {};
        // if (this.props.boundaryDrawingMode) {
        //   radius = 3 / this.state.scale;
        //   style = { cursor: 'pointer' }
        // }
        if (shape === 'point') {
          radius = 5;
          sw = 0;
        }
        let circle_c = '';
        if ((!(entity in this.state.hideLabelsMap)) || ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap[entity] === false)) {
          if (this.state.currentRect.length === 0) {
            circle_c = 'circle_grab';
          }
          if ((this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) || shape === 'point') {
            if (shape === 'point') {
              radius = 5;
            } else {
              radius = 4;
            }
            for (let jindex = 0; jindex < rect.length; jindex ++) {
              const id = index + '--' + jindex;
              pointArrs.push(<circle id={id} className={circle_c} style={style} cx={Math.ceil(rect[jindex][0] * this.state.imgWidth)}
                            cy={Math.ceil(rect[jindex][1] * (this.state.imgHeight))}
                            r={radius} stroke="white" strokeWidth={sw} fill={lineColor} />);
            }
          }
          return (
            <g>
              {pointArrs}
            </g>
            );
        }
      })
    );

    const getDistance = (point1, point2) => {
      console.log('getDistance', point1, point2);
      return Math.sqrt( Math.pow((point1[0] * this.state.imgWidth - point2[0] * this.state.imgWidth), 2) + Math.pow((point1[1] * this.state.imgHeight - point2[1] * this.state.imgHeight), 2)) * this.state.scale;
    };

    const renderHalfPoints = () => (
      this.state.rects.map((rect, index) => {
        console.log('render rects', rect);
        if ( index in this.state.hideRectMap && this.state.hideRectMap[index] === true) {
          return (<div />);
        }
        const pointArrs = [];
        const entity = this.props.rectCatMap[index];
        const mouseHoverMap = this.state.mouseHoverMap;
        const shape = this.state.rectShapeMap[index];
        let radius = 0.5;
        let circle_c = '';
        if ((!shape || shape === 'polygon') && (!this.state.pointDrag && (!this.state.rectDrag || index !== this.state.dragRect) && mouseHoverMap[index])) {
          if ((!(entity in this.state.hideLabelsMap)) || ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap[entity] === false)) {
            if (this.state.currentRect.length === 0) {
              circle_c = 'circle_grab';
            }
            if (this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) {
              radius = 4 / this.state.scale;
            }
            for (let jindex = 0; jindex < rect.length; jindex ++) {
              let nextIndex = jindex + 1;
              if (jindex === rect.length - 1) {
                nextIndex = 0;
              }
              const distance = getDistance(rect[jindex], rect[nextIndex]);
              console.log('distance is', distance);
              const id = index + '--' + jindex + '--' + nextIndex;
              if (distance.toFixed(2) >= 30) {
                const x = (rect[jindex][0] + rect[nextIndex][0]) / 2;
                const y = (rect[jindex][1] + rect[nextIndex][1]) / 2;
                pointArrs.push(<circle style={{ fillOpacity: '0.7' }} id={id}
                              className={circle_c} cx={Math.ceil(x * this.state.imgWidth)}
                              cy={Math.ceil(y * (this.state.imgHeight))}
                              r={radius} stroke="white" fill="white" />);
              }
            }
            return (
              <g>
                {pointArrs}
              </g>
              );
          }
        }
      })
    );

    const renderCurrentPoints = () => {
      console.log('render current points', this.state.currentRect);
      const pointArrs = [];
      let lineColor = 'lightblue';
      if (this.state.defaultClass) {
        lineColor = this.props.entityColorMap[this.state.defaultClass];
      }
      const sw = 2;
      const radius = 0.5;
      // const style = { cursor: 'hand rock outline'};
      const rect = this.state.currentRect;
      for (let jindex = 0; jindex < rect.length; jindex ++) {
        const id = 'x' + '-' + jindex;
        if (jindex === 0 && this.state.toolName === 'polygon') {
          pointArrs.push(<circle id={id} cx={Math.ceil(rect[jindex][0])}
                        cy={Math.ceil(rect[jindex][1])} title="Click to close"
                        onClick={this.savePolygon.bind(this, this.state.defaultClass)}
                        style={{ cursor: 'pointer' }}
                        r={(radius + 3) / this.state.scale} stroke="white" strokeWidth={sw / this.state.scale} fill={lineColor} />);
        } else if (this.state.toolName === 'polygon') {
          pointArrs.push(<circle id={id} cx={Math.ceil(rect[jindex][0])}
                        cy={Math.ceil(rect[jindex][1])}
                        r={radius / this.state.scale} stroke="white" strokeWidth={sw / this.state.scale} fill={lineColor} />);
        }
      }

      return (
        <g>
          {pointArrs}
        </g>
        );
    };

    const toggleEyeStatus = (key, value, event) => {
      event.stopPropagation();
      // console.log('toggleEyeStatus', key, value);
      const hideLabelsMap = this.state.hideLabelsMap;
      hideLabelsMap[key] = value;
      this.setState({ hideLabelsMap });
    };

    const setImageHover = (key, value, event) => {
      event.stopPropagation();
      // console.log('toggleEyeStatus', key, value);
      const imageHoverMap = this.state.imageHoverMap;
      imageHoverMap[key] = value;
      this.setState({ imageHoverMap });
    };

    const getMenuItems = () => {
      const arrs = [];
      let index1 = 0;
      let jindex = 0;
      // let height = '60%';
      // let lastKey = '';
      for (const [key, value] of entries(this.props.entityColorMap)) {
        // console.log('value is', key, value);
        // lastKey = key;
        if (!this.state.searchQuery || this.state.searchQuery.length === 0 || key.toUpperCase().includes(this.state.searchQuery.toUpperCase())) {
          let bgC = 'white';
          if (this.state.defaultClass === key) {
            bgC = 'grey';
          }
          let combo = undefined;
          if (key in this.props.shortcuts) {
            combo = convertKeyToString(this.props.shortcuts[key]);
            Mousetrap.bind(combo, selectCategory.bind(this, key));
          }
          // console.log('eyestatus', key, key in this.state.hideLabelsMap, this.state.hideLabelsMap[key] === true);
          arrs.push(
            <div className="disable_text_highlighting text-center" onClick={selectCategory.bind(this, key)} tabIndex={jindex} key={key} id={key} eventKey={value} style={{ cursor: 'pointer', backgroundColor: `${bgC}`, minHeight: '30px', marginBottom: '3px', padding: '3px', marginTop: '3px', display: 'flex', justifyContent: 'space-around', overflow: 'auto', width: '220px' }}>
                   { ((key in this.state.hideLabelsMap) && (this.state.hideLabelsMap[key] === true)) &&
                    <div title="Show Labels" style={{ marginTop: '2px', overflow: 'initial'   }}>
                      <Button size="mini" icon style={{ backgroundColor: 'white', cursor: 'pointer' }} onClick={(event) => toggleEyeStatus(key, false, event)}>
                        <Icon name="low vision" style={{ color: `${this.props.entityColorMap[key]}`}} />
                      </Button>
                    </div>
                  }
                    { ((!(key in this.state.hideLabelsMap)) || (key in this.state.hideLabelsMap && this.state.hideLabelsMap[key] === false)) &&
                    <div title="Hide Labels" style={{ marginTop: '2px', overflow: 'initial' }}>
                      <Button size="mini" icon style={{ backgroundColor: 'white', cursor: 'pointer' }} onClick={(event) => toggleEyeStatus(key, true, event)}>
                        <Icon name="eye" style={{ color: `${this.props.entityColorMap[key]}`}} />
                      </Button>
                    </div>
                    }
                    {
                      this.props.entitiesObject && key in this.props.entitiesObject &&
                      <div style={{ overflow: 'initial' }}>
                        <Image onMouseOver={setImageHover.bind(this, key, true)} onMouseOut={setImageHover.bind(this, key, false)} src={this.props.entitiesObject[key]} avatar />
                        { this.state.imageHoverMap && this.state.imageHoverMap[key] &&
                         <img src={this.props.entitiesObject[key]} style={{ position: 'absolute', left: '50%', top: '30%' }} /> }
                      </div>
                    }
                <div style={{ cursor: 'pointer', overflow: 'initial', width: '50%' }}>
                  <div>
                    <Label id={key} size="mini" style={{ whiteSpace: 'inherit', boxShadow: '1px 1px 1px', color: 'white', backgroundColor: `${this.props.entityColorMap[key]}` }}>
                      {key}
                    </Label>
                  </div>
                  <div>
                    { combo && <p style={{ fontSize: '0.6rem' }}> {combo}</p> }
                  </div>
                </div>
              </div>);
          // } else {
          //   arrs.push(
          //     <div tabIndex={jindex} id={key} onClick={selectCategory.bind(this, key)} eventKey={value} style={{ backgroundColor: `${bgC}`, padding: '2px 10px', minHeight: '30px', borderBottom: '1px solid black', cursor: 'pointer' }}>
          //       <div>
          //         <Label id={key} size="mini" style={{ color: 'white', backgroundColor: `${this.props.entityColorMap[key]}`, boxShadow: '1px 1px 1px'}}> {key} </Label>
          //       </div>
          //     </div>);
          // }
          jindex = jindex + 1;
        }
        index1 = index1 + 1;
      }
      // let selectIndex = undefined;
      // const mouseHoverMap = this.state.mouseHoverMap;
      // for (const k in mouseHoverMap) {
      //   if (mouseHoverMap.hasOwnProperty(k) && mouseHoverMap[k] === true) {
      //     selectIndex = k;
      //   }
      // }
      return ( <div
                  style={{ display: 'flex', backgroundColor: 'white', overflow: 'auto', flexDirection: 'column'}}
                  bsStyle="primary"
                >
                <div style={{ boxShadow: '4px 4px 4px rgba(85,85,85,0.1)' }}>
                  <Input value={this.state.searchQuery} onChange={(event) => this.setState({searchQuery: event.target.value })} placeholder="Search..." />
                </div>
                <div>
                  {arrs}
                </div>
                      </div>);
    };

    // const labelClick = (index, event) => {
    //   console.log('labelClick ', index, event.clientX, event.clientY);
    //   const menuOpenMap = this.state.menuOpenMap;
    //   menuOpenMap[index] = true;
    //   this.setState({ menuOpenMap, menuX: event.clientX, menuY: window.height - event.clientY });
    // }

    const changeLabel = (key, index, event) => {
      console.log('changeLabel', key, index, event.target.checked, event.target);
      const { entities, rectCatMap } = this.state;
      const currentData = rectCatMap[key];
      const jindex = currentData.indexOf(entities[index]);
      if (jindex !== -1) currentData.splice(jindex, 1);
      else currentData.push(entities[index]);
      if (currentData.length === 0) {
        this.removeShape(key);
        return;
      }
      rectCatMap[key] = currentData;
      this.setState({ rectCatMap });
      this.state.rectCatMap = rectCatMap;
      this.setState({
        rectCatMap
      }, () => {
        if (this.props.drawHandle) {
          this.props.drawHandle(this.state);
        }
      });
    };

    const toggleEyeRectStatus = (key, value, event) => {
      event.stopPropagation();
      // console.log('toggleEyeStatus', key, value);
      const hideRectMap = this.state.hideRectMap;
      hideRectMap[key] = value;
      this.setState({ hideRectMap });
    };

    const getLabels = () => {
      const arrs = [];
      const {rects, rectCatMap, entities, notes} = this.state;
      let index = 0;
      let width = '20%';
      for (const key of Object.keys(rects)) {
        let boxShadow = '';
        if (this.state.mouseHoverMap[key]) {
          boxShadow = '2px 2px 2px 2px black';
        }
        // let trigger = (<Icon style={{ cursor: 'pointer' }} color="white" size="small" name="angle up" />);
        if (rectCatMap[key].length > 0) {
          const entitySet = new Set(rectCatMap[key]);
          const options = [];
          for (let jindex = 0; jindex < entities.length; jindex ++) {
            if (entitySet.has(entities[jindex])) {
              options.push({ key: entities[jindex], text: ( <Checkbox checked onChange={changeLabel.bind(this, key, jindex)} label={entities[jindex]} /> ) });
            } else {
              options.push({ key: entities[jindex], text: ( <Checkbox onChange={changeLabel.bind(this, key, jindex)} label={entities[jindex]} /> ) });
            }
          }
          if (!this.props.drawHandle) {
            if (notes && key in notes && notes[key].length > 0) {
              options.push({ key: 'note', text: notes[key] });
            }
          } else {
            if (notes && key in notes && notes[key].length > 0) {
              options.push({ key: 'note', text: (<Button size="mini" onClick={() => this.setState({ openNote: true, noteIndex: key })}> Edit Note </Button>)});
            } else {
              options.push({ key: 'note', text: (<Button size="mini" onClick={() => this.setState({ openNote: true, noteIndex: key })}> Add Note </Button>)});
            }
          }
            arrs.push(
            <div style={{ maxWidth: `${width}`, wordBreak: 'break-word', borderRadius: '7px', boxShadow: `${boxShadow}`, padding: '2px', display: 'flex', marginRight: '2px', marginBottom: '5px', color: 'white', backgroundColor: `${this.props.entityColorMap[rectCatMap[key][0]]}` }}>
              { ((index in this.state.hideRectMap) && (this.state.hideRectMap[key] === true)) &&
                <Icon size="small" name="low vision" style={{ cursor: 'pointer', color: `${this.props.entityColorMap[key]}`}} onClick={(event) => toggleEyeRectStatus(key, false, event)} />
              }
              { ((!(index in this.state.hideRectMap)) || (index in this.state.hideRectMap && this.state.hideRectMap[key] === false)) &&
                <Icon name="eye" style={{ cursor: 'pointer', color: `${this.props.entityColorMap[key]}`}} onClick={(event) => toggleEyeRectStatus(key, true, event)} />
              }
              {this.props.drawHandle &&
                <Icon style={{ cursor: 'pointer' }} name="delete" id={index} onClick={removeRect.bind(this)} /> }
              <Dropdown floating inline upward button compact className="icon" style={{ fontSize: 'xx-small', backgroundColor: `${this.props.entityColorMap[rectCatMap[key][0]]}` }} labeled text={rectCatMap[key].join(",")} scrolling options={options} />
            </div>);
        }
        index = index + 1;
      }
      return (<div style={{ marginTop: '5px', alignContent: 'flex-start', display: 'flex', flexDirection: 'row', flexWrap: 'wrap-reverse', justifyContent: 'center' }}> {arrs} </div>);
    };

    const onImgLoad = ({target: img}) => {
      console.log('image loaded', img.offsetWidth, img.offsetHeight, img.width, img.naturalWidth, img.height, img.naturalHeight);
      // let windowHeight = (window.innerHeight * 75) / 100;
      // let windowWidth = (window.innerWidth * 80) / 100;
      // if (!this.props.space) {
      //   windowHeight = (window.innerHeight * 75) / 100;
      //   windowWidth = (window.innerWidth * 60) / 100;
      // }
      // if (this.props.fullScreen) {
      //   windowHeight = (window.innerHeight * 95) / 100;
      // }
      // if (this.state.toolbarHidden && this.props.fullScreen) {
      //   windowWidth = (window.innerWidth * 85) / 100;
      // }
      let imgWidth = img.offsetWidth;
      let imgHeight = img.offsetHeight;
      // if (imgHeight > windowHeight) {
      //   imgHeight = windowHeight
      // }
      // if (imgWidth > windowWidth) {
      //   imgWidth = imgHeight * (img.naturalWidth / img.naturalHeight)
      //   // imgHeight = windowWidth * (img.naturalHeight / img.naturalWidth)
      // }
      this._panner = new Panner({
        screenWidth: imgWidth,
        screenHeight: imgHeight
      });
      this.setState({imgHeight, imgWidth, imageNaturalWidth: img.naturalWidth, imageNaturalHeight: img.naturalHeight, imgObject: img, imgLoad: true});
    };

    const setFunctions = () => {
      // console.log('setting functions', this.canvas);
      const canvas = this.canvas;
      if (!this.state.canvasSet && canvas) {
        if (this.state.imgLoad) {
          console.log('setting canvas');
          // if (this.props.drawHandle && this.state.drawButton) {
          // }
          canvas.addEventListener('mousedown', this.mousedownHandle);
          canvas.addEventListener('mousemove', this.mousemoveHandle);
          canvas.addEventListener('mouseup', this.mouseupHandle);
          canvas.addEventListener('wheel', this._onWheel);
          canvas.addEventListener('dblclick', this._onWheel);
          canvas.addEventListener('mouseleave', this.onMouseOutHandler, false);
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
    // const updateScale = (scale, translate) => {
    //   console.log('updating scale', scale, translate);
    //   this.setState({ scale, dx: translate[0], dy: translate[1] });
    // };
    const changeImageProp = (name, event) => {
      console.log('changeImageProp', name, event.pageX, event.offsetY, event.target.value, event.offsetX, event.offsetY, event.deltaY);
      if (name === 'scale') {
        this.zoom(250, 250, this._panner.scale - event.target.value);
      } else {
        this.setState({ [name]: event.target.value });
      }
    };
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
      windowWidth = (window.innerWidth * 80) / 100;
    }
    let toolCombo = undefined;
    if (this.props.drawHandle && this.props.shortcuts && 'tool' in this.props.shortcuts) {
      if ('tool' in this.props.shortcuts) {
        toolCombo = convertKeyToString(this.props.shortcuts.tool);
        Mousetrap.bind(toolCombo, this.toggleTool.bind(this, 'shift'));
      }
      if (this.props.space) {
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
    }
    let menuHeight = windowHeight * 0.8;
    if (this.props.defaultShape === 'rectangle') {
      menuHeight = windowHeight;
    }
    // const tapStart = () => {
    //   console.log('tapStart');
    //   this.pan(-5, 0);
    //   // this.tapInterval = setInterval(this.pan.bind(this, -5, 0), 500);
    // }
    //
    // const tapEnd = () => {
    //   console.log('tapEnd', this.tapInterval);
    //   clearInterval(this.tapInterval);
    // }

    let classes = "content-container noselect";
    if (this.state.disableZoomAnim) {
      classes = "content-container noselect leaflet-zoom-anim";
    }
    let classes2 = "no-flickr leaflet-zoom-animated";
    if (this.state.disableZoomAnim) {
      classes2 = "no-flickr leaflet-zoom-animated1";
    }

    return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', height: '100%', overflow: 'auto'}}>
      <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#E0E0E0', padding: '0.5rem' }}>
          {
            this.props.drawHandle &&
            <div style={{ display: 'flex', justifyContent: 'space-evenly', fontSize: 'xx-small' }}>
              <label>
                  <span>Contrast : <b> {Math.round(this.state.contrast * 100)}%</b> </span>
                  <input type="range" className="ui range" step="0.01" min="0" max="10" value={this.state.contrast} onChange={changeImageProp.bind(this, 'contrast')} />
              </label>

              <label>
                <span>Saturation : <b> {Math.round(this.state.saturation * 100)}% </b> </span>
                <input type="range" step="0.01" min="0" max="4" value={this.state.saturation} onChange={changeImageProp.bind(this, 'saturation')}/>
              </label>

              <label>
                <span>Brightness : <b> {Math.round(this.state.brightness * 100)}% </b></span>
                <input type="range" step="0.01" min="0" max="4" value={this.state.brightness} onChange={changeImageProp.bind(this, 'brightness')} />
              </label>

              { this._panner && this._panner.scale &&
                <label>
                  <span>Zoom : <b> {Math.round(this._panner.scale * 100)}%</b> </span>

                  <input type="range" step="0.01" min="0" max="20" value={this._panner.scale} onChange={changeImageProp.bind(this, 'scale')} />
                </label>
              }
              <label>
                  <span>Box Opacity : <b> {Math.round(this.state.opacity * 100)}%</b> </span>
                  <input type="range" className="ui range" step="0.01" min="0" max="1" value={this.state.opacity} onChange={changeImageProp.bind(this, 'opacity')} />
              </label>
            </div>
          }
        <div>
          <div ref={(parentDiv) => this.parentDiv = parentDiv} style={{ lineHeight: 0, display: 'block', position: 'relative' }}>
                <div ref={(parentDiv) => this.parentDiv2 = parentDiv} className="pan-zoom-element" style={{width: windowWidth, height: windowHeight}}>
                  <div ref={(parentDiv) => this.parentDiv3 = parentDiv} className={classes} style={{ position: 'relative'}}>
                    <img
                        className={classes2}
                        style={{ filter: `contrast(${this.state.contrast})
                                brightness(${this.state.brightness})
                                saturate(${this.state.saturation})`,
                                maxHeight: this.state.imgLoad ? 'none' :  `${windowHeight}`,
                                maxWidth: this.state.imgLoad ? 'none' : `${windowWidth}`,
                                transform: `translate3d(${this.state.translate.x}px, ${this.state.translate.y}px, 0px) scale(1)`,
                                width: this.state.imgLoad ? this.state.imgWidth : 'auto',
                                height: this.state.imgLoad ? this.state.imgHeight : 'auto',
                                display: 'block' }}
                        draggable="false"
                        onLoad={onImgLoad}
                        src={this.state.image}
                        />

                    { (!this.state.imgLoad || this.props.loading) && <Dimmer active>
                                              <Loader />
                                            </Dimmer>}
                          { this.state.imgLoad &&
                                <svg className={classes2} ref={(canv) => { this.canvas = canv; setFunctions(); }} style={canvasStyles}>
                                  {Object.keys(this.state.rects).length >= 0 && renderRects() }
                                  {Object.keys(this.state.rects).length >= 0 && renderPoints() }
                                  {Object.keys(this.state.rects).length >= 0 && renderHalfPoints()}
                                  {this.state.currentRect && this.state.currentRect.length > 0 && this.rectToStyles(this.state.currentRect)}
                                  {this.state.currentRect && this.state.currentRect.length > 0 && renderCurrentPoints()}
                                </svg>
                          }
                    </div>
                    { this.props.drawHandle &&
                    <div style={{ position: 'absolute', bottom: 0, right: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', fontSize: 'large' }}>
                      <Button size="mini" icon onClick={this.pan.bind(this, -5, 0)}>
                        <Icon name="angle left" />
                      </Button>
                      <div style={{ display: 'flex', flexDirection: 'column'}}>
                        <Button size="mini" icon onClick={this.pan.bind(this, 0, -5)}>
                          <Icon name="angle up" />
                        </Button>
                        <Button size="mini" icon onClick={this.pan.bind(this, 0, 5)}>
                          <Icon name="angle down" />
                        </Button>
                      </div>
                      <Button size="mini" icon onClick={this.pan.bind(this, 5, 0)}>
                        <Icon name="angle right" />
                      </Button>
                    </div>
                    }
                  </div>
            </div>
      </div>
        {getLabels()}
      </div>
      {this.props.drawHandle && this.state.imgLoad &&
      <div style={{ width: '20%' }}>
          {/*
          <Button size="mini" icon onClick={ () => { if (this.state.toolbarHidden) this.setState({ toolbarHidden: false}); else this.setState({ toolbarHidden: true});}}>
            { this.state.toolbarHidden && <Icon color="blue" name="angle left" /> }
            { !this.state.toolbarHidden && <Icon color="blue" name="angle right" /> }
          </Button>
        */}
          { !this.state.toolbarHidden &&
              <div style={{ marginTop: '5px', marginRight: '1%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                    {this.props.defaultShape !== 'rectangle' &&
                      <div style={{ marginTop: '5px', marginBottom: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                      <div title="Click to draw Polygon">
                        <Button size="mini" color={this.state.toolName === 'polygon' ? 'blue' : 'grey'} icon onClick={this.toggleTool.bind(this, 'polygon')}>
                          <Icon name="star outline" />
                          <p style={{ fontSize: '0.4rem' }}>Polygon</p>
                        </Button>
                      </div>

                      <div title="Click to draw Rectangle">
                        <Button size="mini" color={this.state.toolName === 'rectangle' ? 'blue' : 'grey'} icon onClick={this.toggleTool.bind(this, 'rectangle')}>
                          <Icon name="square outline" />
                          <p style={{ fontSize: '0.4rem' }}>Rectangle</p>
                        </Button>
                      </div>

                      <div title="Click to draw Points">
                        <Button size="mini" color={this.state.toolName === 'point' ? 'blue' : 'grey'} icon onClick={this.toggleTool.bind(this, 'point')}>
                          <Icon name="point" />
                          <p style={{ fontSize: '0.4rem' }}>Point</p>
                        </Button>
                      </div>

                    </div>}
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '15px', border: '1px solid #eaf2f4', backgroundColor: '#f5f9fa', boxSizing: 'border-box', height: `${menuHeight}` }}>
                        <p style={{ padding: '5px' }}>
                          Select Entity
                        </p>
                        { getMenuItems()}
                    </div>
                        <div style={{ height: '10px' }} />
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                        <div title={undoButton}>
                          <Button icon size="mini" secondary icon onClick={this.undoLast} disabled={this.state.currentRect.length === 0}>
                            <Icon name="undo" />
                          </Button>
                        </div>
                        <div title={clearButton}>
                          <Button icon size="mini" secondary icon onClick={this.clearPolygons} disabled={Object.keys(this.state.rects).length === 0}>
                            <Icon name="remove" />
                          </Button>
                        </div>
                      </div>
                      {this.props.space && this.showButtons()}
                </div>
          }
      </div>
      }
              {
          this.state.openNote && this.props.drawHandle &&
                <div className="static-modal">
                  <Modal.Dialog>
                    <Modal.Header>
                      <Modal.Title>Add a Note
                      <Icon onClick={this.closeModal.bind(this)} className="pull-right" name="close" />
                      </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                      <input type="textarea" value={this.state.notes[this.state.noteIndex]} onChange={this.handleNoteChange.bind(this)} autoFocus className="form-control" id="note" />
                    </Modal.Body>

                    <Modal.Footer>
                      <Button type="submit" positive onClick={this.saveModal.bind(this)}>Save</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </div>
        }
    </div>
    );
  }
}
PolygonAnnotatorV2.propTypes = {
  image: PropTypes.string,
  drawHandle: PropTypes.func,
  space: PropTypes.boolean,
  keepEntitySelected: PropTypes.boolean,
  notes: PropTypes.object,
  entityColorMap: PropTypes.object,
  rectShapeMap: PropTypes.object,
  shortcuts: PropTypes.object,
  rects: PropTypes.array,
  loading: PropTypes.boolean,
  defaultShape: PropTypes.string,
  fullScreen: PropTypes.boolean,
  menuHidden: PropTypes.boolean,
  rectCatMap: PropTypes.object,
  entitiesObject: PropTypes.object,
  skipRow: PropTypes.func,
  saveTagAndNextRow: PropTypes.func,
  getBackTopreviousRow: PropTypes.func,
  saveRow: PropTypes.func,
  currentIndex: PropTypes.int,
  hits: PropTypes.object
};
