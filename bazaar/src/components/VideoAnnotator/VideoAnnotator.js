import React, { Component, PropTypes } from 'react';
// import ListGroup from 'react-bootstrap/lib/ListGroup';
// import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import { Button, Label, Icon, Dimmer, Loader, Input } from 'semantic-ui-react';
import { convertKeyToString } from '../../helpers/Utils';
// import PinchZoomPan from '../PinchZoomPan/PinchZoomPan';
// import PanZoomElement from '../PinchZoomPan/PanZoomElement';
const Mousetrap = require('mousetrap');
import Panner from '../PinchZoomPan/CenteredPanZoom';
// const ElementPan = require('react-element-pan');
// import { Player } from 'video-react';

const SVG = require('svg.js');
// App component - represents the whole app
export default class VideoAnnotator extends Component {
  constructor(props) {
    super(props);
    console.log('VideoAnnotator props', props);
    this.state = {
      rects: props.rects,
      rectCatMap: props.rectCatMap,
      rectShapeMap: props.rectShapeMap,
      rectTimeMap: props.rectTimeMap,
      endTimeMap: props.endTimeMap,
      animationStartTime: undefined,
      hideLabelsMap: {},
      imgLoaded: {},
      entities: Object.keys(props.entityColorMap),
      canvasSet: false,
      frameTime: 1 / 25,  // can put frame rate here
      rfaMap: {},
      searchQuery: '',
      translate: {
        x: 0,
        y: 0
      },
      marginTop: 0,
      marginLeft: 0,
      currentStartTime: undefined,
      imgLoad: false,
      contrast: 1.0,
      opacity: 0.1,
      brightness: 1.0,
      saturation: 1.0,
      defaultPlaybackRate: this.props.space ? 0.4 : 0.8,
      defaultVolume: 0.0,
      dx: 0,
      dy: 0,
      scale: 1,
      video: props.video,
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
    this.zoom = this.zoom.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.load = this.load.bind(this);
    this.changeCurrentTime = this.changeCurrentTime.bind(this);
    this.seek = this.seek.bind(this);
    this.changePlaybackRateRate = this.changePlaybackRateRate.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.setMuted = this.setMuted.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.moveToNext = this.moveToNext.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
  }


  componentDidMount() {
    console.log('component did mount', this.canvas);
    // this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));
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
    console.log('VideoAnnotator nextprops', nextProps);
    if (nextProps.rects && nextProps.rectCatMap && (this.props.rects !== nextProps.rects)) {
      this.setState({ rects: nextProps.rects, endTimeMap: nextProps.endTimeMap, rectTimeMap: nextProps.rectTimeMap, rectShapeMap: nextProps.rectShapeMap, rectCatMap: nextProps.rectCatMap, image: nextProps.image});
    }
    if (this.props.video !== nextProps.video) {
      this.setState({imgLoad: false, canvasSet: false, videoLoad: false, video: nextProps.video });
      this.player.source = nextProps.video;
      this.DrawBoard = null;
    }
  }

  componentWillUnmount() {
    console.log('VideoAnnotator unmount');
    // document.removeEventListener('mouseup', this.mouseupHandle);
    window.removeEventListener('resize', this.resizeWindow);
  }

  getPoint(point) {
    console.log('point is', point);
    if (point < 0.0) { return 0.0; }
    if (point > 1.0) { return 1.0; }
    return point;
  }

  getPoints(currentRect) {
    let points = '';
    for (let index = 0; index < currentRect.length; index ++) {
      points = points + currentRect[index][0] + ',' + currentRect[index][1] + ' ';
    }
    return points.trim();
  }

  getDecPoints(currentRect) {
    // debugger;
    let points = '';
    // let timeIndex = 0;

    // let currentRectPoints = currentRect[timeIndex];
    if (currentRect) {
      for (let index = 0; index < currentRect.length; index ++) {
          points = points + Math.ceil(currentRect[index][0] * this.state.videoWidth) + ',' + (Math.ceil(currentRect[index][1] * (this.state.videoHeight))) + ' ';
      }
    }
    return points.trim();
  }

  setMuted(muted) {
    return () => {
      this.state.player.muted = muted;
    };
  }

  getWindowDimeshions() {
    let windowHeight = (window.innerHeight * 70) / 100;
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
    return { windowWidth, windowHeight };
  }

  setVolume(steps) {
    this.state.player.volume = steps;
    this.setState({ defaultVolume: steps });
  }

  getCoords = (rect) => {
    let x = this.state.videoWidth;
    let y = this.state.videoHeight;
    let xlg = 0;
    let ylg = 0;
    for (let jindex = 0; jindex < rect.length; jindex ++) {
      let currentPoint = rect[jindex];
      let currentx = currentPoint[0];
      let currenty = currentPoint[1];
      if (x > currentx) {
        x = currentx;
      }
      if (y > currenty) {
        y = currenty;
      }
      if (currentx > xlg) {
        xlg = currentx;
      }
      if (currenty > ylg) {
        ylg = currenty;
      }
    }
    let width = Math.abs(xlg - x);
    let height = Math.abs(ylg - y);
    x = x * this.canvas.offsetWidth;
    y = y * this.canvas.offsetHeight;
    width = width * this.canvas.offsetWidth;
    height = height * this.canvas.offsetHeight;
    console.log('getcoords', x, y, width, height);
    return { x, y, width, height };
  }

  convertToPoint(x, y) {
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    if (x > this.state.videoWidth) {
      x = this.state.videoWidth;
    }
    if (y > this.state.videoHeight) {
      y = this.state.videoHeight
    }
    return {x, y};
  }


  increasePlayerTime(ts) {
    if (this.state.player === undefined || this.state.player.currentTime === undefined) {
      console.log('increasePlayerTime undefined');
      window.cancelAnimationFrame(this.increasePlayerTime);
      // clearTimeout(scheduleTime);
      this.setState({ rfa: false });
      // console.log('increasePlayerTime 8 stop', flag);
      return;
    }
    let timeTraveled = (ts - (this.state.animationStartTime ? this.state.animationStartTime : window.performance.now())) / 1000;
    console.log('increasePlayerTime timeNote 1', timeTraveled, this.state.player.currentTime, ts, window.performance.now());
    let flag = false;
    let threshold = ( 0.9 / (25 * this.state.player.playbackRate));
    if (!this.DrawBoard) this.DrawBoard = SVG(this.svgId).size(this.state.videoWidth, this.state.videoHeight);
    console.log('increasePlayerTime 2 elapsed', timeTraveled, threshold, this.DrawBoard);
    // debugger;
    if ((Math.floor(threshold * 100) > Math.floor(timeTraveled * 100))) {
      if (!this.state.player.paused && this.state.player.currentTime !== this.state.player.duration) {
        window.requestAnimationFrame((ts) => { this.increasePlayerTime(ts); });
        console.log('increasePlayerTime false-start restart');
        return;
      }
    }
    // this.DrawBoard.clear();
      this.state.rects.map((rect, index) => {
        const entity = this.props.rectCatMap[index];
        const timeMap = this.props.rectTimeMap[index];
        let startTime = 0.0;
        let id = index;
        id = index + '--node';
        let endTime = this.state.player.duration;
        let shape = this.props.rectShapeMap[index];
        if (timeMap) {
          startTime = timeMap[0];
          endTime = this.props.endTimeMap[index] ? this.props.endTimeMap[index] : this.state.player.duration;
        }
        console.log('increasePlayerTime looping', this.state.player.paused, this.state.player.currentTime, startTime, endTime, entity in this.state.hideLabelsMap, ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap[entity] === false))
        if (!this.state.player.paused && (this.state.player.currentTime >= startTime && this.state.player.currentTime <= endTime) && ((!(entity in this.state.hideLabelsMap)) ||
            ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap[entity] === false))) {
          const lineColor = this.props.entityColorMap[entity];
          let timeIndex = 0;
          for (let jindex = 0; jindex < timeMap.length; jindex ++) {
            if (timeMap[jindex] && timeMap[jindex] > this.state.player.currentTime) {
              timeIndex = jindex - 1;
              break;
            } else if (timeMap[jindex]) {
              timeIndex = jindex;
            }
          }
          let currentRectPoints = rect[timeIndex];
          if (shape === 'rectangle' && currentRectPoints !== undefined) {
            let diffX = 0;
            let diffY = 0;
            let diffWidth = 0;
            let diffHeight = 0;

            let currentCoords = this.getCoords(currentRectPoints);
            // let newTimeIndex = timeIndex;
            let element = document.getElementById(id);
            if (element !== null) {
              if (this.state.player.currentTime && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined )) {
                let nextCoords = this.getCoords(rect[timeIndex + 1]);
                let difft = timeMap[timeIndex + 1] - timeMap[timeIndex];
                diffX = (nextCoords.x - currentCoords.x) / difft;
                diffY = (nextCoords.y - currentCoords.y) / difft;
                diffWidth = (nextCoords.width - currentCoords.width) / difft;
                diffHeight = (nextCoords.height - currentCoords.height) / difft;
              }
              this.state.animationStartTime = ts;
              console.log('increasePlayerTime 3 repaint', element);
              let el = SVG.adopt(element);
              let currentx = el.attr('x') - 0;
              let currenty = el.attr('y') - 0;
              let currentw = el.attr('width') - 0;
              let currenth = el.attr('height') - 0;
              let dt = timeTraveled * this.state.player.playbackRate;
              let dx = (diffX * dt)
              let dy = (dt * diffY)
              let dw = (dt * diffWidth)
              let dh = (dt * diffHeight)
              currentx = currentx + dx;
              currenty = currenty + dy;
              currentw = currentw + dw;
              currenth = currenth + dh;
              // console.log('increasePlayerTime new', currentw, currenth);
              el.attr('x', currentx);
              el.attr('y', currenty);
              el.attr('width', currentw);
              el.attr('height', currenth);
              flag = true;
            } else {
              let x = this.state.videoWidth;
              let y = this.state.videoHeight;
              let xlg = 0;
              let ylg = 0;
              // let sw = 1 / this.state.scale;
              // let cursor = '';
              // if (this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) {
              //   sw = 3 / this.state.scale;
              // }
              for (let jindex = 0; jindex < currentRectPoints.length; jindex ++) {
                let currentPoint = currentRectPoints[jindex];
                let currentx = currentPoint[0];
                let currenty = currentPoint[1];
                let diffx = 0;
                let diffy = 0;
                let difft = 1;
                if (this.state.player.currentTime && timeTraveled > 0 && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined )
                      && timeMap[timeIndex] !== undefined && ( rect[timeIndex] !== undefined && rect[timeIndex + 1] !== undefined && rect[timeIndex].length === rect[timeIndex + 1].length)) {
                  diffx = rect[timeIndex + 1][jindex][0] - rect[timeIndex][jindex][0];
                  diffy = rect[timeIndex + 1][jindex][1] - rect[timeIndex][jindex][1];
                  difft = timeMap[timeIndex + 1] - timeMap[timeIndex];
                }
                // if (diffx > 0 || diffy > 0) {
                //   newTimeIndex = timeIndex + '--' + 'temp';
                // }
                // console.log('increasePlayerTime -1', currentx, currenty);
                currentx = currentx + (this.state.player.currentTime - timeMap[timeIndex] + (timeTraveled * this.state.player.playbackRate )) * (diffx / difft);
                currenty = currenty + (this.state.player.currentTime - timeMap[timeIndex] + (timeTraveled * this.state.player.playbackRate )) * (diffy / difft);
                // console.log('increasePlayerTime -1', currentx, currenty);
                if (x > currentx) {
                  x = currentx;
                }
                if (y > currenty) {
                  y = currenty;
                }
                if (currentx > xlg) {
                  xlg = currentx;
                }
                if (currenty > ylg) {
                  ylg = currenty;
                }
              }
                let width = Math.abs(xlg - x);
                let height = Math.abs(ylg - y);
                x = x * this.canvas.offsetWidth;
                y = y * this.canvas.offsetHeight;
                flag = true;
                width = width * this.canvas.offsetWidth;
                height = height * this.canvas.offsetHeight;
                let rectResponse = this.DrawBoard.rect(width, height).id(id).attr({ x: x, y: y, fill: `${lineColor}`, cursor: 'pointer', 'fill-opacity': `${this.state.opacity}`, stroke: '#1ae04e' });
                console.log('increasePlayerTime drawTime', id, x, y, width, height, rectResponse);
              }
            } else  if (currentRectPoints !== undefined) {
              let element = document.getElementById(id);
                  // get dec points
                if (element !== null) {
                  let el = SVG.get(id)
                  if (el !== null) {
                    console.log('increasePlayerTime 1 remove node', id, el);
                    try {
                      el.remove();
                    } catch (ex) {
                      console.log('increasePlayerTime 1 remove node exception', ex);
                    }
                  }
                  // console.log('increasePlayerTime drawTime', id, x, y, width, height);
                }
                  let newPoints = [];
                let difft = 1;

                if (this.state.player.currentTime && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined )) {
                  difft = timeMap[timeIndex + 1] - timeMap[timeIndex];
                }
                // let color = '#1ae04e';
                // // let opacity = 0.2;
                // if (this.state.player.currentTime === timeMap[timeIndex] || this.state.player.currentTime === endTime) {
                //   color = 'rgb(80, 90, 206)';
                //   // opacity = 0.5;
                // }
                for (let jindex = 0; jindex < currentRectPoints.length; jindex ++) {
                  let currentPoint = currentRectPoints[jindex];
                  let currentx = currentPoint[0];
                  let currenty = currentPoint[1];
                  let diffx = 0;
                  let diffy = 0;
                  if (this.state.player.currentTime && timeTraveled > 0 && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined ) && rect[timeIndex + 1] !== undefined && rect[timeIndex] !== undefined) {
                    diffx = rect[timeIndex + 1][jindex][0] - rect[timeIndex][jindex][0];
                    diffy = rect[timeIndex + 1][jindex][1] - rect[timeIndex][jindex][1];
                    // console.log('renderRects rectangle rendering diff', diffx, difft);
                  }
                  currentx = currentx + (this.state.player.currentTime - timeMap[timeIndex] + (timeTraveled * this.state.player.playbackRate )) * (diffx / difft);
                  currenty = currenty + (this.state.player.currentTime - timeMap[timeIndex] + (timeTraveled * this.state.player.playbackRate )) * (diffy / difft);
                  newPoints.push([ currentx, currenty ]);
                }
                const points = this.getDecPoints(newPoints);
                // let points = this.getDecPoints(rect[timeIndex]);
                flag = true;
                let pol = this.DrawBoard.polygon(points).id(id).attr({fill: `${lineColor}`, cursor: 'pointer', 'fill-opacity': `${this.state.opacity}`, stroke: '#1ae04e' });
                console.log('increasePlayerTime drawing polyon', pol);
            }
        } else {
          let el = SVG.get(id)
          if (el !== null) {
            console.log('increasePlayerTime 2 remove node', id,  el);
            try {
              el.remove();
            } catch (ex) {
              console.log('increasePlayerTime 2 remove node exception', ex);
            }
          }
        }
      })

  const scheduleTime = () => {
    window.requestAnimationFrame((ts) => { this.increasePlayerTime(ts); });
  }

  if (!this.state.player.paused && this.state.player.currentTime !== this.state.player.duration && this.state.rects.length > 0) {
    this.state.animationStartTime = ts;
    // const player = this.state.player;
    // const currentTime = player.currentTime;
    // this.seek((currentTime + timeTraveled).toFixed(6));
    console.log('increasePlayerTime setting timeout');
    setTimeout(scheduleTime, (threshold * 1000));
    console.log('increasePlayerTime 6 restart');
  } else {
    window.cancelAnimationFrame(this.increasePlayerTime);
    clearTimeout(scheduleTime);
    this.setState({ rfa: false });
    console.log('increasePlayerTime 8 stop', flag);
  }
  console.log('increasePlayerTime timeNote final', window.performance.now());
}

  isSameRect(id, rect) {
    let element = document.getElementById(id);
    let ex = element.getAttribute('x') - 0;
    let ey = element.getAttribute('y') - 0;
    let ew = element.getAttribute('width') - 0;
    let eh = element.getAttribute('height') - 0;

    let coords = this.getCoords(rect);

    if (ex === coords.x && ey === coords.y && ew === coords.width && eh === coords.height) return true;
    return false;
  }

  initRect( rect ) {
    const newRect = [];
    for (let index = 0; index < rect.length; index ++) {
      newRect.push(rect[index].slice());
    }
    return newRect;
  }

  play() {
    console.log('playing')
    this.state.player.play();
    // this.setState({ animationStartTime: ts });
    if (!this.state.rfa) {
      // if (this.DrawBoard) {
      //   this.DrawBoard.clear();
      // }
      window.requestAnimationFrame((ts) => { this.state.animationStartTime = ts;  this.increasePlayerTime(ts); });
      this.state.rfa = true;
      this.setState({ rfa: true });
    }
    return false;
  }

  pause() {
    console.log('pausing');
    window.cancelAnimationFrame(this.increasePlayerTime);
    this.state.rfa = false;
    // this.setState({ paused: true });
    this.state.player.pause();
    return false;
  }

  load() {
    this.state.player.load();
  }

  changeCurrentTime(seconds) {
    console.log('change current time', seconds);
    const player = this.state.player;
    const currentTime = player.currentTime;
    this.seek((currentTime + parseFloat(seconds)).toFixed(6));
    return false;
}

  seek(seconds) {
    console.log('seek', seconds);
    // return () => {
    const player = this.state.player;
    player.currentTime = seconds;
    if (!this.state.player.paused) {
      this.pause();
    }
    this.setState({ player });
    // };
  }

  changePlaybackRateRate(steps) {
    // return () => {
    // };
    // const { player } = this.refs.player.getState();
    // const playbackRate = player.playbackRate;
    this.state.player.playbackRate = steps;
    this.setState({ defaultPlaybackRate: steps });
  }

  videoDimensions(video) {
    // Ratio of the video's intrisic dimensions
    var videoRatio = video.videoWidth / video.videoHeight;
    // The width and height of the video element
    // let width = this.state.;
    // let height = (window.innerWidth * 65) / 100;

    // this.state.windowWidth = windowWidth;
    // this.state.windowHeight = windowHeight;
    // debugger;
    var { windowWidth, windowHeight } = this.getWindowDimeshions();
    // var height = video.offsetHeight;
    // console.log('dimestions', width, height);
    // The ratio of the element's width to its height
    var elementRatio = windowWidth / windowHeight;
    // If the video element is short and wide
    if (elementRatio > videoRatio) windowWidth = windowHeight * videoRatio;
    // It must be tall and thin, or exactly equal to the original ratio
    else windowHeight = windowWidth / videoRatio;
    return {
      width: windowWidth,
      height: windowHeight
    };
  }

  changeVolume(steps) {
    return () => {
      const player = this.state.player;
      const volume = player.volume;
      this.state.player.volume = volume + steps;
      this.setState({ defaultVolume: volume + steps });
    };
  }

  handleStateChange(eventName, event) {
    // copy player state to this component's state
    console.log('videostatechange', event.target.currentTime, event, event.target, eventName);
    // if (prevState.videoHeight === 0 && state.videoHeight !== 0) {
    //   console.log('video loaded');
    //   var x = document.createElement('VIDEO');
    //   x.src = state.currentSrc;
    //   const { width, height } = this.videoDimensions(this.refs.player.video);
    //   let marginLeft = 0;
    //   let marginTop = 0;
    //   if (height !== this.state.windowHeight) {
    //     marginTop = Math.abs(height - this.state.windowHeight) / 2;
    //   }
    //   if (width !== this.state.windowWidth) {
    //     marginLeft = Math.abs(width - this.state.windowWidth) / 2;
    //   }
    //   this.setState({ videoLoad: true, videoHeight: height, marginTop, marginLeft, videoWidth: width });
    //   this.pause();
    // }
    this.state.player = event.target;
    // console.log('handle')
    // if (eventName === 'onCanPlay' && this.state.player.paused) {
    //   this.play();
    // }
    if (!this.state.rfa || this.state.player.paused || eventName !== 'onTimeUpdate') {
      this.setState({
        player: event.target
      });
    } else if (eventName === 'onTimeUpdate' && !this.state.player.paused) {
      // let pElement = document.getElementById("progressBarText");
      let pBar = document.getElementById("progressBar");
      console.log('update time', this.ptextPlay, pBar);
      if (this.ptextPlay !== null && this.state.rfa) {
        let nowTime = `${this.state.player.currentTime} / ${this.state.player.duration}`;
        nowTime = nowTime + ' ';
        this.ptextPlay.innerHTML =  nowTime;
        pBar.value = this.state.player.currentTime;
      }
    }
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

  zoom(event_offsetX, event_offsetY, deltaY) {
    let zoomFactor;
    if (deltaY < 0) {
      zoomFactor = this.state.scale * 1.03;
    } else {
      zoomFactor = this.state.scale * 0.97;
    }
    if (zoomFactor > 100) zoomFactor = 100.0;
    if (zoomFactor < -10) zoomFactor = -10;
    this._panner.zoomVideo(zoomFactor, {x: event_offsetX, y: event_offsetY});
    // const scalechange = this._panner.scale - this.state.scale;
    // const offsetX = -(event.clientX * scalechange);
    // const offsetY = -(event.clientY * scalechange);
    this._startX = event_offsetX;
    this._startY = event_offsetY;
    // console.log('onwheel', offsetX, offsetY, this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
    // // this._panner.pan(offsetX, offsetY);
    // console.log('onwheel', offsetX, offsetY, this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
    this.setState({
      translate: {
        x: this._panner.viewport.x + 0 * (this.canvas.offsetWidth * this._panner.scale),
        y: this._panner.viewport.y + 0 * (this.canvas.offsetHeight * this._panner.scale)
      },
      scale: this._panner.scale
    });
  }

  resetImage() {
    console.log('resize resetImage');
    // if (!this.state.videoLoad) {
    //   const { width, height } = this.videoDimensions(this.state.player.video);
    //   let marginLeft = 0;
    //   let marginTop = 0;
    //   if (height !== this.state.windowHeight) {
    //     marginTop = Math.abs(height - this.state.windowHeight) / 2;
    //   }
    //   if (width !== this.state.windowWidth) {
    //     marginLeft = Math.abs(width - this.state.windowWidth) / 2;
    //   }
    //   this.setState({ videoLoad: true, videoHeight: height, marginTop, marginLeft, videoWidth: width });
    // }
    clearTimeout(this.resizeTo);
    // this.setState({ imgLoad: true });
  }

  resizeWindow() {
    // console.log('resize ', e1, e2, this.state.imgObject.offsetHeight, this.state.imgObject.offsetWidth);
    if (this.state.videoLoad) {
      this.setState({ canvasSet: false, videoLoad: false, video: this.state.video + '?ts=' + new Date() });
      // this.setState({ imgHeight: this.state.imgObject.offsetHeight,
      //                             imgWidth: this.state.imgObject.offsetWidth });
    }
    if (this.resizeTo) clearTimeout(this.resizeTo);
    this.resizeTo = setTimeout(this.resetImage.bind(this), 2000);
  }

  mousedownHandle(event) {
    console.log('mousedown polygon drag', this.state, this.ctx, event.target.nodeName);
    const mouseHoverMap = this.state.mouseHoverMap;
    if (this.state.defaultClass) {
      for (const k in mouseHoverMap) {
        if (mouseHoverMap.hasOwnProperty(k)) {
          mouseHoverMap[k] = false;
        }
      }
      if (this.state.toolName === 'rectangle') {
        console.log('starting rectangle');
        if (this.state.currentRect.length === 0) {
          const currentRect = this.state.currentRect;
          currentRect.push([event.offsetX, event.offsetY]);
          this.setState({
            currentRect,
          });
        } else {
          let currentRectangle = this.state.currentRect;
          const currentPoint = currentRectangle[0];
          let newPoint = this.convertToPoint(event.offsetX, event.offsetY);
          currentRectangle = [];
          currentRectangle.push([ this.getPoint(currentPoint[0] / this.state.videoWidth), this.getPoint(currentPoint[1] / this.state.videoHeight)]);
          currentRectangle.push([ this.getPoint(currentPoint[0] / this.state.videoWidth), this.getPoint(newPoint.y / this.state.videoHeight)]);
          currentRectangle.push([ this.getPoint(newPoint.x / this.state.videoWidth), this.getPoint(currentPoint[1] / this.state.videoHeight)]);
          currentRectangle.push([ this.getPoint(newPoint.x / this.state.videoWidth), this.getPoint(newPoint.y / this.state.videoHeight)]);
          const { rectCatMap, rectShapeMap, rectTimeMap  } = this.state;
          const numberOfRects = Object.keys(rectCatMap).length;
          rectShapeMap[numberOfRects] = 'rectangle';
          rectTimeMap[numberOfRects] = [this.state.player.currentTime, undefined];
          if (this.state.defaultClass) {
            rectCatMap[numberOfRects] = this.state.defaultClass;
          }
          const mouseHoverMap = this.state.mouseHoverMap;
          mouseHoverMap[numberOfRects] = true;
          this.setState({
            rects: [
              ...this.state.rects,
              [currentRectangle]
            ],
            rectCatMap,
            rectTimeMap,
            mouseHoverMap,
            currentRect: [],
            rectShapeMap,
            defaultClass: '',
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
      } else if (this.state.toolName === 'polygon') {
        let newPoint = this.convertToPoint(event.offsetX, event.offsetY);
        if (event.target.nodeName === 'circle' &&  event.target.id.length === 3 && event.target.id[0] === 'x' && event.target.id[2] === '0') {
          if (this.state.defaultClass) {
            this.savePolygon(this.state.defaultClass);
          } else {
            this.savePolygon(this.state.entities[0]);
          }
        } else {
          const currentRect = this.state.currentRect;
          currentRect.push([newPoint.x, newPoint.y]);
          this.setState({
            currentRect,
            currentPolyPoint: []
          });
        }
      }
    } else if (event.target.nodeName === 'circle' && this.props.drawHandle) {
      console.log('drag start', event.offsetX, event.offsetY, event.target.id);
      const splits = event.target.id.split('--');
      // console.log('splits are', )
      if (splits.length >= 3) {
        let timeIndex = parseInt(splits[2], 10);
        let rectIndex = parseInt(splits[0], 10);
        let pointIndex = parseInt(splits[1], 10);
        if (mouseHoverMap[rectIndex] && mouseHoverMap[rectIndex] === true) {
          console.log('rectdrag start', event.clientX, event.clientY);
          // let sameRect = this.isSameRect(rectIndex + '--' + timeIndex + '--' + 'temp', this.state.rects[rectIndex][timeIndex]);
          if (event.target.id.endsWith('temp')) {
            let rectId = rectIndex + '--' + timeIndex + '--' + 'temp';
            let element = document.getElementById(rectId);
            let rects = this.state.rects;
            let rectTimeMap = this.state.rectTimeMap;
            let newRectangle = [];
            let ex = element.getAttribute('x') - 0;
            let ey = element.getAttribute('y') - 0;
            let ew = element.getAttribute('width') - 0;
            let eh = element.getAttribute('height') - 0;
            newRectangle.push([ex / this.canvas.offsetWidth, ey / this.canvas.offsetHeight]);
            newRectangle.push([ex / this.canvas.offsetWidth, (ey + eh) / this.canvas.offsetHeight]);
            newRectangle.push([ (ex + ew) / this.canvas.offsetWidth, ey / this.canvas.offsetHeight]);
            newRectangle.push([ (ex + ew) / this.canvas.offsetWidth, (ey + eh) / this.canvas.offsetHeight]);
            console.log('rectdrag start', this.state.rects);
            // let timeMap = this.state.rectTimeMap[rectIndex];
            // let newIndex = -1;
            // for (let index = 0; index < timeMap.length; index ++) {
            //   if (timeMap[index] && timeMap[index] > this.state.player.currentTime) {
            //     newIndex = index - 1;
            //     break;
            //   } else if (timeMap[index]) {
            //     newIndex = index;
            //   }
            // }
            rects[rectIndex].splice(timeIndex + 1, 0, newRectangle);
            rectTimeMap[rectIndex].splice(timeIndex + 1, 0, this.state.player.currentTime);
            this.state.dragTimeIndex = timeIndex + 1;
            this.setState({ rects, rectTimeMap});
            console.log('rectdrag start', event.clientX, event.clientY);
            this.setState({ pointDrag: true, dragRect: rectIndex, dragPoint: pointIndex, dragTimeIndex: timeIndex + 1});
            } else {
            console.log('drag point is', this.state.rects[rectIndex][timeIndex][pointIndex][0] * this.state.imgWidth);
            console.log('drag point is', this.state.rects[rectIndex][timeIndex][pointIndex][1] * this.state.imgHeight);
            this.setState({ pointDrag: true, dragRect: rectIndex, dragPoint: pointIndex, dragTimeIndex: timeIndex });
          }
        }
        // if (splits.length === 3) {
        // let timeIndex = parseInt(splits[2], 10);
        // let rectIndex = parseInt(splits[0], 10);
        // let pointIndex = parseInt(splits[1], 10);
        // console.log('drag point is', this.state.rects[rectIndex][timeIndex][pointIndex][0] * this.state.imgWidth);
        // console.log('drag point is', this.state.rects[rectIndex][timeIndex][pointIndex][1] * this.state.imgHeight);
        // this.setState({ pointDrag: true, dragRect: rectIndex, dragPoint: pointIndex, dragTimeIndex: timeIndex });
      }
    } else if (this.props.drawHandle && (event.target.nodeName === 'polygon' || event.target.nodeName === 'rect')) {
      const splits = event.target.id.split('--');
      if (splits.length >= 2) {
        let timeIndex = parseInt(splits[1], 10);
        let rectIndex = parseInt(splits[0], 10);
        if (mouseHoverMap[rectIndex] && mouseHoverMap[rectIndex] === true) {
          console.log('rectdrag start', event.clientX, event.clientY);
          if (event.target.nodeName === 'rect') {
            let sameRect = this.isSameRect(event.target.id, this.state.rects[rectIndex][timeIndex]);
            if (!sameRect) {
              let element = document.getElementById(event.target.id);
              let rects = this.state.rects;
              let rectTimeMap = this.state.rectTimeMap;
              let newRectangle = [];
              let ex = element.getAttribute('x') - 0;
              let ey = element.getAttribute('y') - 0;
              let ew = element.getAttribute('width') - 0;
              let eh = element.getAttribute('height') - 0;
              newRectangle.push([ex / this.canvas.offsetWidth, ey / this.canvas.offsetHeight]);
              newRectangle.push([ex / this.canvas.offsetWidth, (ey + eh) / this.canvas.offsetHeight]);
              newRectangle.push([ (ex + ew) / this.canvas.offsetWidth, ey / this.canvas.offsetHeight]);
              newRectangle.push([ (ex + ew) / this.canvas.offsetWidth, (ey + eh) / this.canvas.offsetHeight]);
              console.log('rectdrag start', this.state.rects);
              // let timeMap = this.state.rectTimeMap[rectIndex];
              // let newIndex = -1;
              // for (let index = 0; index < timeMap.length; index ++) {
              //   if (timeMap[index] && timeMap[index] > this.state.player.currentTime) {
              //     newIndex = index - 1;
              //     break;
              //   } else if (timeMap[index]) {
              //     newIndex = index;
              //   }
              // }
              rects[rectIndex].splice(timeIndex + 1, 0, newRectangle);
              rectTimeMap[rectIndex].splice(timeIndex + 1, 0, this.state.player.currentTime);
              this.state.dragTimeIndex = timeIndex + 1;
              this.setState({ rects, rectTimeMap});
              console.log('rectdrag start', event.clientX, event.clientY);
              this.setState({ rectDrag: true, dragRect: rectIndex, dragTimeIndex: timeIndex, dragPoint: [event.offsetX, event.offsetY] });
            } else {
              this.setState({ rectDrag: true, dragRect: rectIndex, dragTimeIndex: timeIndex, dragPoint: [event.offsetX, event.offsetY] });
            }
          } else {
            this.setState({ rectDrag: true, dragRect: rectIndex, dragTimeIndex: timeIndex, dragPoint: [event.offsetX, event.offsetY] });
          }
        } else {
          for (const k in mouseHoverMap) {
            if (mouseHoverMap.hasOwnProperty(k)) {
              if (k !== rectIndex) {
                mouseHoverMap[k] = false;
              }
            }
          }
          if (mouseHoverMap[rectIndex]) {
            mouseHoverMap[rectIndex] = false;
            // this.toggleTool('move');
          } else {
            mouseHoverMap[rectIndex] = true;
          }
          this.setState({ mouseHoverMap });
          // toggleMouseHover.bind(this, index, true)}
        }
      }
    } else if (event.target.nodeName === 'svg') {
      console.log('svgdrag start');
      this.setState({ svgDrag: true });
      this._startX = event.pageX;
      this._startY = event.pageY;
      this.setState({ dragPoint: [event.pageX, event.pageY]})
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
    console.log('mouseupHandle polygon', this.state, this.props, event.offsetX, event.offsetX);
    if (this.state.pointDrag) {
      console.log('pointdrag', event.offsetX, event.offsetY, event.target.id);
      const rects = this.state.rects;
      const rectTimeMap = this.state.rectTimeMap[this.state.dragRect];
      const currentRect = rects[this.state.dragRect][this.state.dragTimeIndex];
      let newRectangle = this.initRect(currentRect);
      // newRectangle = [].concat(currentRect);
      console.log('pointdrag', currentRect, this.state);
      const shape = this.state.rectShapeMap[this.state.dragRect];
      let newPoint = this.convertToPoint(event.offsetX, event.offsetY);
      const newx = this.getPoint(newPoint.x / this.state.videoWidth);
      const newy = this.getPoint(newPoint.y / this.state.videoHeight);
      newRectangle[this.state.dragPoint][0] = newx;
      newRectangle[this.state.dragPoint][1] = newy;
      if (shape === 'rectangle') {
        if (this.state.dragPoint === 0) {
          newRectangle[2][1] = newy;
          newRectangle[1][0] = newx;
        } else if (this.state.dragPoint === 2) {
          newRectangle[0][1] = newy;
          newRectangle[3][0] = newx;
        } else if (this.state.dragPoint === 1) {
          newRectangle[0][0] = newx;
          newRectangle[3][1] = newy;
        } else if (this.state.dragPoint === 3) {
          console.log('pointdrag changing 3rd');
          newRectangle[2][0] = newx;
          newRectangle[1][1] = newy;
        }
        console.log('pointdrag', shape, currentRect, newx, newy);
      }
      if (rectTimeMap) {
        if (rectTimeMap[this.state.dragTimeIndex] === this.state.player.currentTime) {
          rects[this.state.dragRect][this.state.dragTimeIndex] = newRectangle;
        } else {
          rects[this.state.dragRect].splice(this.state.dragTimeIndex + 1, 0, newRectangle);
          rectTimeMap.splice(this.state.dragTimeIndex + 1, 0, this.state.player.currentTime);
        }
      }
      this.setState({ rects });
      this.setState({ pointDrag: false }, () => {
        if (this.props.drawHandle) {
          console.log('calling drawhandle', this.state);
          this.props.drawHandle(this.state);
        }
      });
    } else if (this.state.rectDrag) {
      if (this.state.dragging) {
        const dx = (event.offsetX - this.state.dragPoint[0]) / this.state.videoWidth;
        const dy = (event.offsetY - this.state.dragPoint[1]) / this.state.videoHeight;
        const currentRect = this.state.rects[this.state.dragRect][this.state.dragTimeIndex];


        let newRectangle = this.initRect(currentRect);
        console.log('rectdrag dx', dx, dy, currentRect);
        for (let jindex = 0; jindex < newRectangle.length; jindex ++) {
          // let newPoint = this.convertToPoint(newRectangle[jindex][0] + dx, newRectangle[jindex][1] + dy);
          newRectangle[jindex][0] = this.getPoint(newRectangle[jindex][0] + dx);
          newRectangle[jindex][1] = this.getPoint(newRectangle[jindex][1] + dy);
        }
        const rects = this.state.rects;
        const rectTimeMap = this.state.rectTimeMap[this.state.dragRect];
        if (rectTimeMap) {
          if (rectTimeMap[this.state.dragTimeIndex] === this.state.player.currentTime) {
            rects[this.state.dragRect][this.state.dragTimeIndex] = newRectangle;
          } else {
            rects[this.state.dragRect].splice(this.state.dragTimeIndex + 1, 0, newRectangle);
            rectTimeMap.splice(this.state.dragTimeIndex + 1, 0, this.state.player.currentTime);
            this.state.dragTimeIndex = this.state.dragTimeIndex + 1;
          }
        }
        this.setState({ rects, dragging: false, rectDrag: false, dragPoint: undefined, dragRect: undefined, dragTimeIndex: undefined  });
        // for (let jindex = 0; jindex < currentRect.length; jindex ++) {
        //   currentRect[jindex][0] = currentRect[jindex][0] + dx;
        //   currentRect[jindex][1] = currentRect[jindex][1] + dy;
        // }
        // const rects = this.state.rects;
        // rects[this.state.dragRect][this.state.dragTimeIndex] = currentRect
        // console.log('rectdrag', event.clientX, event.clientY, event.offsetX, event.offsetY, event.target.id, this.state);
        // this.setState({ rects, dragging: false, rectDrag: false, dragPoint: undefined, dragRect: undefined });
      } else {
        const splits = event.target.id.split('--');
        if (splits.length >= 2) {
          let rectIndex = parseInt(splits[0], 10);
          const mouseHoverMap = this.state.mouseHoverMap;
          for (const k in mouseHoverMap) {
            if (mouseHoverMap.hasOwnProperty(k)) {
              if (parseInt(k, 10) !== rectIndex) {
                mouseHoverMap[k] = false;
              }
            }
          }
          if (mouseHoverMap[rectIndex]) {
            mouseHoverMap[rectIndex] = false;
            // this.toggleTool('move');
          } else {
            mouseHoverMap[rectIndex] = true;
          }
          // toggleMouseHover.bind(this, index, true)}
          this.setState({ mouseHoverMap, dragging: false, rectDrag: false, dragRect: undefined });
        }
      }
    } else if (this.state.svgDrag) {
      // const dx = (event.screenX - this.state.dragPoint[0]);
      // const dy = (event.screenY - this.state.dragPoint[1]);
      this.setState({ svgDrag: false });
    }
  }

  mousemoveHandle(event) {
    // console.log('mousemoveHandle', this.state);
    if (this.state.pointDrag) {
      // debugger;
      // console.log('dragging', event.offsetX, event.offsetY);
      const rects = this.state.rects;
      const rectTimeMap = this.state.rectTimeMap[this.state.dragRect];
      const currentRect = rects[this.state.dragRect][this.state.dragTimeIndex];
      let newRectangle = this.initRect(currentRect);
      // newRectangle = [].concat(currentRect);
      // const currentRect = rects[this.state.dragRect][this.state.dragTimeIndex];
      const newx = this.getPoint(event.offsetX / this.state.videoWidth);
      const newy = this.getPoint(event.offsetY / this.state.videoHeight);
      newRectangle[this.state.dragPoint][0] = newx;
      newRectangle[this.state.dragPoint][1] = newy;
      const shape = this.state.rectShapeMap[this.state.dragRect];
      if (shape === 'rectangle') {
        if (this.state.dragPoint === 0) {
          newRectangle[2][1] = newy;
          newRectangle[1][0] = newx;
        } else if (this.state.dragPoint === 2) {
          newRectangle[0][1] = newy;
          newRectangle[3][0] = newx;
        } else if (this.state.dragPoint === 1) {
          newRectangle[0][0] = newx;
          newRectangle[3][1] = newy;
        } else if (this.state.dragPoint === 3) {
          console.log('rectdrag changing 3rd');
          newRectangle[2][0] = newx;
          newRectangle[1][1] = newy;
        }
      }
      // debugger;
      console.log('mousemove recttime', rectTimeMap, this.state.rects, this.state.dragTimeIndex, newRectangle);
      if (rectTimeMap) {
        if (rectTimeMap[this.state.dragTimeIndex] === this.state.player.currentTime) {
          rects[this.state.dragRect][this.state.dragTimeIndex] = newRectangle;
        } else {
          rects[this.state.dragRect].splice(this.state.dragTimeIndex + 1, 0, newRectangle);
          rectTimeMap.splice(this.state.dragTimeIndex + 1, 0, this.state.player.currentTime);
          this.state.dragTimeIndex = this.state.dragTimeIndex + 1;
        }
      }
      this.setState({ rects });
    } else if (this.state.rectDrag) {
      const dx = (event.offsetX - this.state.dragPoint[0]) / this.state.videoWidth;
      const dy = (event.offsetY - this.state.dragPoint[1]) / this.state.videoHeight;
      const currentRect = this.state.rects[this.state.dragRect][this.state.dragTimeIndex];
      let newRectangle = this.initRect(currentRect);
      console.log('rectdrag dx', dx, dy, currentRect);
      for (let jindex = 0; jindex < newRectangle.length; jindex ++) {
        // let newPoint = this.convertToPoint(newRectangle[jindex][0] + dx);
        newRectangle[jindex][0] = this.getPoint(newRectangle[jindex][0] + dx);
        newRectangle[jindex][1] = this.getPoint(newRectangle[jindex][1] + dy);
      }
      const rects = this.state.rects;
      const rectTimeMap = this.state.rectTimeMap[this.state.dragRect];
      if (rectTimeMap) {
        if (rectTimeMap[this.state.dragTimeIndex] === this.state.player.currentTime) {
          rects[this.state.dragRect][this.state.dragTimeIndex] = newRectangle;
        } else {
          rects[this.state.dragRect].splice(this.state.dragTimeIndex + 1, 0, newRectangle);
          rectTimeMap.splice(this.state.dragTimeIndex + 1, 0, this.state.player.currentTime);
          this.state.dragTimeIndex = this.state.dragTimeIndex + 1;
        }
      }
      this.setState({ rects, dragging: true, dragPoint: [event.offsetX, event.offsetY] });
      // const rects = this.state.rects;
      // rects[this.state.dragRect][this.state.dragTimeIndex] = currentRect
      // console.log('rectdrag', event.clientX, event.clientY, event.offsetX, event.offsetY, event.target.id, this.state);
      // this.setState({ rects, dragging: true, dragPoint: [event.offsetX, event.offsetY] });
    } else if (this.state.toolName === 'rectangle' && this.state.currentRect.length > 0) {
      let currentRectangle = this.state.currentRect;
      const currentPoint = currentRectangle[0];
      // console.log('rectangleDraw mousemove', currentRectangle);
      let x = event.offsetX;
      let y = event.offsetY;
      if (x < 0) {
        x = 0;
      }
      if (y < 0) {
        y = 0;
      }
      if (x > this.state.videoWidth) {
        x = this.state.videoWidth;
      }
      if (y > this.state.videoHeight) {
        y = this.state.videoHeight
      }
      currentRectangle = [];
      currentRectangle.push([ currentPoint[0], currentPoint[1] ]);
      currentRectangle.push([ x, currentPoint[1] ]);
      currentRectangle.push([ currentPoint[0], y]);
      currentRectangle.push([ x, y]);
      this.setState({ currentRect: currentRectangle });
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
        scale: this._panner.scale
      });

      // console.log('svgdrag');
      // const dx = this.state.dx + (event.screenX - this.state.dragPoint[0]);
      // const dy = this.state.dy + (event.screenY - this.state.dragPoint[1]);
      // this.setState({ dx, dy });
    }
  }

  _onWheel(event) {
    event.preventDefault();
    // console.log('_onwheel', event.currentTarget.getBoundingClientRect(), event.pageX, event.pageY, event.screenX, event.screenY, event.clientX, event.clientY);
    // const currentTargetRect = event.currentTarget.getBoundingClientRect();
    // const event_offsetX = event.clientX - (currentTargetRect.left * this.state.scale);
    // const event_offsetY = event.clientY - (currentTargetRect.top * this.state.scale);
    // console.log('onWheel', event.clientX, event.clientY, event_offsetX, event_offsetY);
    // console.log('event offset', event_offsetX, event_offsetY);
    // console.log('onwheel', this._startX, this._startY, this._panner.viewport.x, this._panner.viewport.y);
    console.log('viewport onwheel', event.offsetX, event.offsetY, this._panner.viewport.x, this._panner.viewport.y, this.state.translate.x, this.state.translate.y);
    this.zoom(event.offsetX, event.offsetY, event.deltaY);
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
    if (this.state.toolName === 'polygon' && currentRect.length === 1) {
      return (<circle cx={currentRect[0][0]} cy={currentRect[0][1]} r={2 / this.state.scale} stroke="white" fill="lightblue" strokeWidth={1 / this.state.scale} />);
    } else if (this.state.toolName === 'polygon' && currentRect.length > 1) {
      return (<polyline points={this.getPoints(currentRect)} style={{fill: `${this.props.entityColorMap[this.state.defaultClass]}`, opacity: '0.5', stroke: '#1ae04e', strokeWidth: `${1 / this.state.scale}`}} />);
    } else if (this.state.toolName === 'rectangle') {
      return this.renderCurrentRectangle();
    }
  }
  moveToNext(direction) {
    console.log('move to ', direction);
    if (direction === 'next') {
      this.props.saveTagAndNextRow();
    } else if (direction === 'previous') {
      this.props.getBackTopreviousRow();
    } else if (direction === 'skip') {
      this.props.skipRow();
    }
  }
  nextElement(direction) {
    const rectTimeMap = this.state.rectTimeMap;
    const endTimeMap = this.state.endTimeMap;
    // debugger;
    for (const key of Object.keys(rectTimeMap)) {
      const timeMap = rectTimeMap[key];
      if (timeMap[1] === undefined) {
        timeMap[1] = this.state.player.duration;
        rectTimeMap[key] = timeMap;
      }
      if (endTimeMap[key] === undefined) {
        endTimeMap[key] = this.state.player.duration;
      }
    }
    this.state.rectTimeMap = rectTimeMap;
    this.state.endTimeMap = endTimeMap;
    this.props.drawHandle(this.state, this.moveToNext, direction);
    return false;
  }

  savePolygon(category) {
    console.log('savePolygon ', category, this.state.player.currentTime);
    const currentRect = this.state.currentRect;
    if (currentRect.length > 0) {
      if (currentRect[0] !== currentRect[currentRect.length - 1]) {
        currentRect.push(currentRect[0]);
      }
      // const endTime = this.state.player.currentTime;
      const startTime = this.state.currentStartTime;
      const rects = this.state.rects;
      const len = Object.keys(rects).length;
      const normPoints = [];
      console.log('savePolygon ', currentRect);
      for (let index = 0; index < currentRect.length; index ++) {
        let xCord = currentRect[index][0];
        let yCord = currentRect[index][1];
        xCord = this.getPoint(xCord / this.state.videoWidth);
        yCord = this.getPoint(yCord / (this.state.videoHeight));
        normPoints.push([ xCord, yCord]);
      }
      console.log('savePolygon ', normPoints);
      if (rects[len] === undefined) {
        rects[len] = [];
      }
      rects[len].push(normPoints);
      const rectCatMap = this.state.rectCatMap;
      const rectShapeMap = this.state.rectShapeMap;
      const mouseHoverMap = this.state.mouseHoverMap;
      const rectTimeMap = this.state.rectTimeMap;
      const hideLabelsMap = this.state.hideLabelsMap;

      rectCatMap[len] = category;
      rectShapeMap[len] = this.state.toolName;
      hideLabelsMap[len] = false;
      rectTimeMap[len] = [startTime, undefined];
      mouseHoverMap[len] = true;
      // this.toggleTool('move');
      this.setState({ currentRect: [], defaultClass: '', rects: rects, rectTimeMap, mouseHoverMap, rectCatMap, hideLabelsMap}, () => {
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
        this.setState({ rectCatMap, openMenuTool: false }, () => {
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
    return false;
  }

  clearPolygons() {
    if (Object.keys(this.state.rects).length > 0) {
      this.setState({ currentRect: [], rects: []});
    }
    return false;
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
          Mousetrap.bind(combo, this.nextElement.bind(this, 'next'));
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('previous' in shortcuts) {
        const combo = convertKeyToString(shortcuts.previous);
        prevButton = 'Previous (' + combo + ')';
        if (this.props.currentIndex > 0) {
          Mousetrap.bind(combo, this.nextElement.bind(this, 'previous'));
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('skip' in shortcuts) {
        const combo = convertKeyToString(shortcuts.skip);
        skipButton = 'Skip (' + combo + ')';
        console.log('setting skip shortcut', combo);
        if (this.props.currentIndex >= 0) {
          Mousetrap.bind(combo, this.nextElement.bind(this, 'skip'));
        } else {
          Mousetrap.unbind(combo);
        }
      }
    }
    return (
            <div className="marginTop" style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                  <div title={prevButton}>
                    <Button icon size="mini" color="grey" icon onClick={this.nextElement.bind(this, 'previous')} disabled={this.props.currentIndex <= 0}>
                      <Icon name="left arrow" />
                    </Button>
                  </div>
                  <div title={skipButton}>
                    <Button icon size="mini" color="grey" icon onClick={this.nextElement.bind(this, 'skip')} disabled={this.props.currentIndex < 0}>
                      <Icon name="mail forward" />
                    </Button>
                  </div>
                  <div title={nextButton}>
                    <Button icon size="mini" color="blue" icon onClick={this.nextElement.bind(this, 'next')} disabled={this.props.currentIndex < 0}>
                      <Icon name="right arrow" />
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
      else if (this.state.toolName === 'rectangle') value = 'polygon';
    }
    if (value === 'move') {
      this.setState({ drawButton: false, canvasSet: false });
      this.canvas.removeEventListener('mousedown', this.mousedownHandle);
      document.removeEventListener('mouseup', this.mouseupHandle);
    } else {
      this.setState({ drawButton: true, canvasSet: false, toolName: value });
    }
  }

  renderCurrentRectangle() {
    console.log('rectangleDraw renderCurrentRectangle', this.state.currentRect);
    let x = this.state.videoWidth;
    let y = this.state.videoHeight;
    let xlg = 0;
    let ylg = 0;
    const color = this.props.entityColorMap[this.state.defaultClass];
    for (let index = 0; index < this.state.currentRect.length; index ++) {
      let currentPoint = this.state.currentRect[index];
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
    const width = Math.abs(xlg - x);
    const height = Math.abs(ylg - y);
    return (<rect x={x} y={y} width={width} height={height} style={{fill: `${color}`, opacity: '0.5', stroke: '#1ae04e', strokeWidth: `${1 / this.state.scale}`}} />);
  }

  render() {
    // const { image } = this.props; // logic to render when it's found
    console.log('BoxAnnotator state', this.state, this.state.player);
    if (this.state.player) {
      console.log('dimensions', this.videoDimensions(this.state.player));
      // if (this.state.videoLoad && this.DrawBoard) {
      //   this.DrawBoard.clear();
      // }
    }
    const canvasStyles = {
      zIndex: this.state.mouseDown ? 4 : 2,
      position: 'absolute',
      display: 'block',
      top: 0,
      left: 0,
      marginTop: this.state.marginTop,
      marginLeft: this.state.marginLeft,
      width: this.state.player ? this.state.videoWidth : 0,
      height: this.state.player ? this.state.videoHeight : 0,
      cursor: this.state.defaultClass ? 'crosshair' : 'move',
    };
    const cBar = document.getElementsByClassName('video-react-control-bar');
    if (cBar.length > 0) {
      console.log('hide bar', cBar);
      cBar[0].style.display = 'none';
      // cBar.style = `{ display: 'none' }`;
    }
    const selectCategory = (event1, index) => {
      console.log('select category ', event1, index);
      if (this.state.currentRect && this.state.currentRect.length > 0) {
        this.savePolygon(event1);
      } else {
        if (this.state.defaultClass !== event1) {
          this.setState({ defaultClass: event1 });
          // this.toggleTool(this.state.toolName);
          this.setState({ currentStartTime: this.state.player.currentTime });
        } else {
          this.setState({ defaultClass: '', currentStartTime: undefined });
        }
      }
      return false;
    };

    const removeRect = (event) => {
      // console.log('remove rect', event.target.id, this.state);
      let index = undefined;
      const mouseHoverMap = this.state.mouseHoverMap;
      if (event && event.target && event.target.id) {
        index = event.target.id;
      } else {
        for (const key of Object.keys(mouseHoverMap)) {
          if (mouseHoverMap[key]) { index = parseInt(key, 10); mouseHoverMap[key] = false; break; }
        }
      }
      const rectCatMap = this.state.rectCatMap;
      const rectShapeMap = this.state.rectShapeMap;
      const hideLabelsMap = this.state.hideLabelsMap;
      const rectTimeMap = this.state.rectTimeMap;
      const endTimeMap = this.state.endTimeMap;
      delete rectCatMap[index];
      delete endTimeMap[index];
      const rects = this.state.rects;
      delete rects[index];
      delete rectShapeMap[index];
      delete hideLabelsMap[index];
      delete rectTimeMap[index];
      this.setState({
        rects, rectCatMap, rectShapeMap, rectTimeMap, hideLabelsMap, openMenuTool: false
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

    const renderRects = (data, event) => (
      this.state.rects.map((rect, index) => {
        console.log('renderRects rectangle rendering start', data, event, window.performance.now());
        const shape = this.state.rectShapeMap[index];
        // debugger;
        // window.cancelAnimationFrame(increasePlayerTime);
        // this.state.rfaMap[index] = undefined;
        if (!this.state.player.paused && shape === 'rectangle') {
          if (!this.state.rfa) {
            this.state.rfa = true
            // this.DrawBoard.clear();
            console.log('increasePlayerTime request');
            window.requestAnimationFrame((ts) => { this.state.animationStartTime = ts;  this.increasePlayerTime(ts); });
          }
          return (null);
        }
        const entity = this.props.rectCatMap[index];
        const timeMap = this.props.rectTimeMap[index];
        let startTime = 0.0;
        let endTime = this.state.player.duration;
        if (timeMap) {
          console.log('timeMap', timeMap);
          startTime = timeMap[0];
          endTime = this.props.endTimeMap[index] ? this.props.endTimeMap[index] : this.state.player.duration;
        }
        console.log('render rects', entity, (!(entity in this.state.hideLabelsMap)) || ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap.entity === false))
        if ((this.state.player.currentTime >= startTime && this.state.player.currentTime <= endTime) && ((!(entity in this.state.hideLabelsMap)) ||
            ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap[entity] === false))) {
          const lineColor = this.props.entityColorMap[entity];
          console.log('renderRects', shape);
          let sw = 1 / this.state.scale;
          let cursor = '';
          if (this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) {
            sw = 1 / this.state.scale;
          }
          let timeIndex = 0;
          for (let jindex = 0; jindex < timeMap.length; jindex ++) {
            if (timeMap[jindex] !== undefined) {
              if (timeMap[jindex] && timeMap[jindex] > this.state.player.currentTime) {
                timeIndex = jindex - 1;
                break;
              } else if (timeMap[jindex]) {
                timeIndex = jindex;
              }
            }
          }
          let currentRectPoints = rect[timeIndex];
          let timeTraveled = this.state.player.currentTime - timeMap[timeIndex];
          console.log('renderRects rectangle rendering 2', timeMap, timeIndex, currentRectPoints, this.state.player.currentTime, this.state.rects);
          if (this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) {
            sw = 1 / this.state.scale;
            cursor = 'alias';
          }
          if (this.state.defaultClass) {
            cursor = 'crosshair';
          }
          if (currentRectPoints !== undefined && (!shape || shape === 'polygon')) {
            let newPoints = [];
            let difft = 1;

            if (this.state.player.currentTime && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined )) {
              difft = timeMap[timeIndex + 1] - timeMap[timeIndex];
            }
            let color = '#1ae04e';
            // let opacity = 0.2;
            if (this.state.player.currentTime === timeMap[timeIndex] || this.state.player.currentTime === endTime) {
              color = 'rgb(80, 90, 206)';
              // opacity = 0.5;
            }
              for (let jindex = 0; jindex < currentRectPoints.length; jindex ++) {
              let currentPoint = currentRectPoints[jindex];
              let currentx = currentPoint[0];
              let currenty = currentPoint[1];
              let diffx = 0;
              let diffy = 0;
              if (rect[timeIndex + 1] !== undefined && this.state.player.currentTime && timeTraveled > 0 && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined )) {
                diffx = rect[timeIndex + 1][jindex][0] - rect[timeIndex][jindex][0];
                diffy = rect[timeIndex + 1][jindex][1] - rect[timeIndex][jindex][1];
                // console.log('renderRects rectangle rendering diff', diffx, difft);
              }
              currentx = currentx + (timeTraveled * (diffx / difft));
              currenty = currenty + (timeTraveled * (diffy / difft));
              newPoints.push([ currentx, currenty ]);
            }
            const points = this.getDecPoints(newPoints);
            console.log('rendering rects', lineColor, points);
            if (!this.canvas ) {
              this.state.canvasSet = false;
              return (<div />);
            }
            const pointSplits = points.split(',');
            if (this.state.player.paused) {
              let id = index + '--' + timeIndex;
              if (pointSplits.length === 2) {
                return (
                  <circle cx={pointSplits[0]} cy={pointSplits[1]} r="2" stroke={lineColor} strokeWidth={sw} fill={lineColor} />
                  );
              }
              return (<polygon
                        id={id} key={index} points={points}
                          style={{ fill: `${lineColor}`, cursor: `${cursor}`, fillOpacity: `${this.state.opacity}`, stroke: `${color}`, strokeWidth: `${sw}` }} />);
            }
          } else if (currentRectPoints !== undefined && shape === 'rectangle') {
            let x = this.state.videoWidth;
            let y = this.state.videoHeight;
            let xlg = 0;
            let ylg = 0;
            let difft = 1;
            let diffX = 0;
            let diffY = 0;
            let diffWidth = 0;
            let diffHeight = 0;

            let currentCoords = this.getCoords(currentRectPoints);
            let nextCoords = {};
            if (this.state.player.currentTime && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined )) {
              nextCoords = this.getCoords(rect[timeIndex + 1]);
              difft = timeMap[timeIndex + 1] - timeMap[timeIndex];
              diffX = nextCoords.x - currentCoords.x;
              diffY = nextCoords.y - currentCoords.y;
              diffWidth = nextCoords.width - currentCoords.width;
              diffHeight = nextCoords.height - currentCoords.height;
            }
            let newTimeIndex = timeIndex;
            for (let jindex = 0; jindex < currentRectPoints.length; jindex ++) {
              let currentPoint = currentRectPoints[jindex];
              let currentx = currentPoint[0];
              let currenty = currentPoint[1];
              let diffx = 0;
              let diffy = 0;
              if (rect[timeIndex] !== undefined && rect[timeIndex + 1] !== undefined && this.state.player.currentTime && timeTraveled > 0 && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined )) {
                diffx = rect[timeIndex + 1][jindex][0] - rect[timeIndex][jindex][0];
                diffy = rect[timeIndex + 1][jindex][1] - rect[timeIndex][jindex][1];
                // console.log('renderRects rectangle rendering diff', diffx, difft);
              }
              if (Math.abs(diffx > 0) || Math.abs(diffy > 0)) {
                newTimeIndex = timeIndex + '--' + 'temp';
              }
              console.log('renderRects rectangle rendering 6', currentx, timeIndex, timeTraveled, diffx, diffy, difft);
              currentx = currentx + (timeTraveled * (diffx / difft));
              currenty = currenty + (timeTraveled * (diffy / difft));
              // console.log('increasePlayerTime -1', currentx, currenty);
              if (x > currentx) {
                x = currentx;
              }
              if (y > currenty) {
                y = currenty;
              }
              if (currentx > xlg) {
                xlg = currentx;
              }
              if (currenty > ylg) {
                ylg = currenty;
              }
            }
            let id = index + '--' + newTimeIndex;
            if (!this.state.player.paused && this.state.player.currentTime !== this.state.player.duration && !this.state.rfaMap[index]) {
              // this.state.animationStartTime = window.performance.now();
              this.state.rfaMap[index] = {id, diffX: (diffX / difft), diffY: (diffY / difft), diffWidth: (diffWidth / difft), diffHeight: (diffHeight / difft)};
              if (!this.state.rfa) {
                this.state.rfa = true
                // this.DrawBoard.clear();
                console.log('increasePlayerTime request');
                window.requestAnimationFrame((ts) => { this.state.animationStartTime = ts;  this.increasePlayerTime(ts); });
              }
            } else {
              this.state.rfaMap[index] = undefined;
            }
            console.log('renderRects rectangle rendering 5', x, y, xlg, ylg);
            let width = Math.abs(xlg - x);
            let height = Math.abs(ylg - y);
            x = x * this.canvas.offsetWidth;
            y = y * this.canvas.offsetHeight;
            width = width * this.canvas.offsetWidth;
            height = height * this.canvas.offsetHeight;
            // if (this.state.player.currentTime !== this.state.player.duration && timeIndex !== newTimeIndex &&
            //     (!this.state.player.paused && document.getElementById(id) !== null)) {
            let element = document.getElementById(id);
            // let initialTranslate = 0;
            // if (element !== null) {
            //   element.style.transform = `translate(${initialTranslate}px, ${initialTranslate}px)`;
            // }
            //   return (<rect id={id} x={currentCoordx} y={currentCoordy} width={currentCoordWidth} height={currentCoordHeight} style={{fill: `${lineColor}`, transform: 'translateX(0px, 0px)', cursor: 'pointer', opacity: '0.5', stroke: '#1ae04e', strokeWidth: `${sw}`  }} />);
            // }
            console.log('renderRects rectangle rendering 3 increasePlayerTime original 11', currentCoords, element);
            if (element === null || this.state.player.paused || this.state.player.currentTime === timeMap[timeIndex]) {
              let color = '#1ae04e';
              // let opacity = 0.2;
              if (this.state.player.currentTime === timeMap[timeIndex] || this.state.player.currentTime === endTime) {
                color = 'rgb(80, 90, 206)';
                // opacity = 0.5;
              }
              console.log('renderRects rectangle rendering 4', x, y, width, height);
              return (
                <rect id={id} x={x} y={y} width={width} height={height} style={{ fill: `${lineColor}`, cursor: 'pointer', fillOpacity: `${this.state.opacity}`, stroke: `${color}`, strokeWidth: `${sw}`  }} />
              );
            }
            let el = SVG.adopt(element);
            let currentCoordx = el.attr('x') - 0;
            let currentCoordy = el.attr('y') - 0;
            let currentCoordWidth = el.attr('width') - 0;
            let currentCoordHeight = el.attr('height') - 0;
            // let currentCoordx = element.getAttribute('x') - 0;
            // let currentCoordy = element.getAttribute('y') - 0;
            // let currentCoordWidth = element.getAttribute('width') - 0;
            // let currentCoordHeight = element.getAttribute('height') - 0;
              return (
                <rect id={id} x={currentCoordx} y={currentCoordy} width={currentCoordWidth} height={currentCoordHeight} style={{ fill: `${lineColor}`, cursor: 'pointer', opacity: '0.5', stroke: '#1ae04e', strokeWidth: `${sw}`  }} />
              );
            // }
          }
        }
      })
    );

    const renderPoints = () => (
      this.state.rects.map((rect, index) => {
        console.log('render rects', rect);
        const pointArrs = [];
        const entity = this.props.rectCatMap[index];
        const lineColor = this.props.entityColorMap[entity];
        // const shape = this.state.rectShapeMap[index];
        let sw = 1;
        let radius = 0.5;
        let style = {};
        const timeMap = this.props.rectTimeMap[index];
        let startTime = 0.0;
        let endTime = this.state.player.duration;
        // debugger;
        if (timeMap) {
          console.log('timeMap', timeMap);
          startTime = timeMap[0];
          endTime = this.props.endTimeMap[index] ? this.props.endTimeMap[index] : this.state.player.duration;
        }
        if ((this.state.player.currentTime >= startTime && this.state.player.currentTime <= endTime) &&
            ((!(entity in this.state.hideLabelsMap)) || ( entity in this.state.hideLabelsMap && this.state.hideLabelsMap[entity] === false))) {
          if (this.state.currentRect.length === 0) {
            style = { cursor: '-webkit-grabbing'};
          }
          if (this.state.mouseHoverMap && index in this.state.mouseHoverMap && this.state.mouseHoverMap[index]) {
            sw = 4 / this.state.scale;
            radius = 4 / this.state.scale;
          }
          let timeIndex = 0;
          for (let jindex = 0; jindex < timeMap.length; jindex ++) {
            if (timeMap[jindex] !== undefined) {
              if (timeMap[jindex] && timeMap[jindex] > this.state.player.currentTime) {
                timeIndex = jindex - 1;
                break;
              } else if (timeMap[jindex]) {
                timeIndex = jindex;
              }
            }
          }
          if (rect[timeIndex] === undefined) return (<div />);
          let currentRectPoints = rect[timeIndex];
          for (let jindex = 0; jindex < currentRectPoints.length; jindex ++) {
            let id = index + '--' + jindex + '--' + timeIndex;
            let cx = currentRectPoints[jindex][0];
            let cy = currentRectPoints[jindex][1];
            // debugger;
            if (rect[timeIndex + 1] !== undefined && this.state.player.currentTime && (timeMap[timeIndex] !== this.state.player.currentTime && timeMap[timeIndex + 1] !== undefined )) {
              id = id + '--' + 'temp';
              let diffx = rect[timeIndex + 1][jindex][0] - rect[timeIndex][jindex][0];
              let diffy = rect[timeIndex + 1][jindex][1] - rect[timeIndex][jindex][1];
              let difft = timeMap[timeIndex + 1] - timeMap[timeIndex];
              let timeTraveled = this.state.player.currentTime - timeMap[timeIndex];
              cx = cx + timeTraveled * (diffx / difft);
              cy = cy + timeTraveled * (diffy / difft);
            }
            pointArrs.push(<circle id={id} style={style} cx={Math.ceil(cx * (this.canvas.offsetWidth))}
                          cy={Math.ceil(cy * (this.canvas.offsetHeight))}
                          r={radius} stroke="white" strokeWidth={sw} fill={lineColor} />);
          }
          return (
            <g>
              {pointArrs}
            </g>
            );
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
      const radius = 1;
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
        } else {
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
    }

    const getMenuItems = () => {
      const arrs = [];
      let index1 = 0;
      let jindex = 0;
      // let lastKey = '';
      for (const [key, value] of entries(this.props.entityColorMap)) {
        // console.log('value is', key, value);
        // lastKey = key;
        if (!this.state.searchQuery || this.state.searchQuery.length === 0 || key.includes(this.state.searchQuery)) {
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
            <div className="disable_text_highlighting text-center" onClick={selectCategory.bind(this, key)} tabIndex={jindex} key={key} id={key} eventKey={value} style={{ cursor: 'pointer', backgroundColor: `${bgC}`, minHeight: '30px', marginBottom: '3px', padding: '3px', marginTop: '3px', display: 'flex', justifyContent: 'space-around' }}>
                   { ((key in this.state.hideLabelsMap) && (this.state.hideLabelsMap[key] === true)) &&
                    <div title="Show Labels" style={{ marginTop: '2px' }}>
                      <Button size="mini" icon style={{ backgroundColor: 'white', cursor: 'pointer' }} onClick={(event) => toggleEyeStatus(key, false, event)}>
                        <Icon name="low vision" style={{ color: `${this.props.entityColorMap[key]}`}} />
                      </Button>
                    </div>
                  }
                    { ((!(key in this.state.hideLabelsMap)) || (key in this.state.hideLabelsMap && this.state.hideLabelsMap[key] === false)) &&
                    <div title="Hide Labels" style={{ marginTop: '2px' }}>
                      <Button size="mini" icon style={{ backgroundColor: 'white', cursor: 'pointer' }} onClick={(event) => toggleEyeStatus(key, true, event)}>
                        <Icon name="eye" style={{ color: `${this.props.entityColorMap[key]}`}} />
                      </Button>
                    </div>
                    }
                <div style={{ cursor: 'pointer' }}>
                  <div>
                    <Label id={key} size="mini" style={{ boxShadow: '1px 1px 1px', color: 'white', backgroundColor: `${this.props.entityColorMap[key]}` }}> {key}</Label>
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
                  style={{ display: 'flex', backgroundColor: 'white', overflow: 'auto', flexDirection: 'column', height: '200px'}}
                  bsStyle="primary"
                >
                <div>
                  <Input size="mini" value={this.state.searchQuery} onChange={(event) => this.setState({searchQuery: event.target.value })} placeholder="Search..." />
                </div>
                <div>
                  {arrs}
                </div>
                      </div>);
    };

    // const getLabels = () => {
    //   const arrs = [];
    //   const {rects, rectCatMap} = this.state;
    //   let index = 0;
    //   for (const key of Object.keys(rects)) {
    //     let size = 'mini';
    //     if (this.state.mouseHoverMap[key]) {
    //       size = 'medium';
    //     }
    //     arrs.push(
    //         <Label size={size} id={key} style={{ color: 'white', backgroundColor: `${this.props.entityColorMap[rectCatMap[key]]}` }}>
    //           {rectCatMap[key]}
    //           {this.props.drawHandle &&
    //           <Icon name="delete" id={index} onClick={removeRect.bind(this)} /> }
    //         </Label>);
    //     index = index + 1;
    //   }
    //   return (<div> {arrs} </div>);
    // };

    const toFixedDec = (num) => {
      // console.log('toFixedDec', num);
      return num.toFixed(6);
    };
    const onImgLoad = () => {
      // console.log('image loaded', img.offsetWidth);
      let { windowWidth, windowHeight } = this.getWindowDimeshions();
      // let windowHeight = (window.innerHeight * 60) / 100;
      // let windowWidth = (window.innerWidth * 70) / 100;
      // if (!this.props.space) {
      //   windowHeight = window.innerHeight;
      // }
      // if (this.props.fullScreen) {
      //   windowHeight = (window.innerHeight * 95) / 100;
      // }
      // if (this.state.toolbarHidden && this.props.fullScreen) {
      //   windowWidth = (window.innerWidth * 85) / 100;
      // }
      this._panner = new Panner({
        screenWidth: windowWidth,
        screenHeight: windowHeight
      });
      this.setState({ translate: {
        x: this._panner.viewport.x,
        y: this._panner.viewport.y
      }, scale: this._panner.scale });
      this.setState({imgLoad: true});
    };

    const setFunctions = () => {
      console.log('setting functions', this.canvas);
      const canvas = this.canvas;
      if (!this.state.canvasSet && canvas && this.state.videoLoad) {
        console.log('setting canvas');
          // if (this.props.drawHandle && this.state.drawButton) {
          // }
        canvas.addEventListener('mousedown', this.mousedownHandle);
        canvas.addEventListener('mousemove', this.mousemoveHandle);
        canvas.addEventListener('mouseup', this.mouseupHandle);
        canvas.addEventListener('wheel', this._onWheel);
        this.setState({ canvasSet: true});
        // this.changePlaybackRateRate(-1);
        // this.changePlaybackRateRate(-1);
        console.log('playing video');
        onImgLoad();
        this.setVolume(this.state.defaultVolume);
        this.changePlaybackRateRate(this.state.defaultPlaybackRate);
        console.log('state is', this.state);
        // this.play();
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
        this.zoom(250, 250, this.state.scale - event.target.value);
      } else {
        this.setState({ [name]: event.target.value });
      }
    }
    const saveEndTime = (id) => {
      const endTime = this.state.player.currentTime;
      const endTimeMap = this.state.endTimeMap;
      // const cu = rectTimeMap[id];
      // cu[1] = endTime;
      endTimeMap[id] = endTime;
      this.setState({ endTimeMap });
      if (this.props.drawHandle) this.props.drawHandle(this.state);
    }
    const setTime = (id, time, index) => {
      this.seek(time);
      if (index < 0) {
        const endTimeMap = this.state.endTimeMap;
        endTimeMap[id] = time;
        this.setState({ endTimeMap });
        return;
      }
      const rectTimeMap = this.state.rectTimeMap;
      const timeMap = rectTimeMap[id];
      timeMap[index] = time;
      rectTimeMap[id] = timeMap;
      this.setState({ rectTimeMap });
      if (this.props.drawHandle) this.props.drawHandle(this.state);
    }
    const getTimePoints = (id, timemap) => {
      let renderArrs = [];
      for (let index = 0; index < timemap.length; index ++) {
        let time = timemap[index];
        if (time !== undefined) {
          renderArrs.push(
            (<div>
               <Label style={{ cursor: 'pointer' }} onClick={this.seek.bind(this, time)} size="mini"> {time} </Label>
             </div>)
          )
        }
      }
      return <div> {renderArrs} </div>;
    }
    const renderCurrentLabel = () => {
      let color = undefined;
      let startTime = undefined;
      let endTime = undefined;
      let tag = this.state.defaultClass;
      let id = undefined;
      let timeMap = undefined;
      for (const key of Object.keys(this.state.mouseHoverMap)) {
        if (this.state.mouseHoverMap[key]) {
          tag = this.state.rectCatMap[key];
          color = this.props.entityColorMap[tag];
          timeMap = this.state.rectTimeMap[key];
          id = key;
          if (timeMap) {
            startTime = timeMap[0];
            endTime = this.state.endTimeMap[key];
          }
          break;
        }
      }

      if (id !== undefined) {
        return (
          <div className="well compact ui text-center" style={{ position: 'relative' }}>
            <Label size="mini" attached="top left">Current Label</Label>
            <Label className="text-left" size="mini" style={{ color: 'white', backgroundColor: `${color}` }}>
              {tag}
            </Label>
            <br />
            <div className="well compact" style={{ display: 'flex', flexDirection: 'row' }}>
              <div>
                <p style={{ fontSize: 'xx-small' }}> Start Time: </p>
                  { this.props.drawHandle && (parseFloat(startTime) - (0.001 * this.state.player.playbackRate)) > 0 && <Icon style={{ cursor: 'pointer' }} onClick={setTime.bind(this, id, toFixedDec(parseFloat(startTime) - (0.001 * this.state.player.playbackRate)), 0)} size="mini" name="minus" /> }
                    <Label style={{ cursor: 'pointer' }} onClick={this.seek.bind(this, startTime)} size="mini"> {startTime} </Label>
                  { this.props.drawHandle && (parseFloat(startTime) + (0.001 * this.state.player.playbackRate)) <= this.state.player.duration && (endTime !== undefined && (parseFloat(startTime) + (0.001 * this.state.player.playbackRate)) <= endTime) &&
                    <Icon style={{ cursor: 'pointer' }} onClick={setTime.bind(this, id, toFixedDec(parseFloat(startTime) + (0.001 * this.state.player.playbackRate)), 0)} size="mini" name="plus" /> }
              </div>
              { endTime === undefined && <Button style={{ cursor: 'pointer' }} disabled={this.state.player.currentTime < startTime } compact onClick={saveEndTime.bind(this, id)} size="mini" color="red"> End </Button> }
              { endTime !== undefined &&
                <div> <p style={{ fontSize: 'xx-small'}}> End Time: </p>
                     { this.props.drawHandle && ((parseFloat(endTime) - (0.001 * this.state.player.playbackRate)) >= 0 && (parseFloat(endTime) - (0.001 * this.state.player.playbackRate)) >= startTime) && <Icon style={{ cursor: 'pointer' }} onClick={setTime.bind(this, id, toFixedDec(parseFloat(endTime) - (0.001 * this.state.player.playbackRate)), -1)} size="mini" name="minus" /> }
                        <Label style={{ cursor: 'pointer' }} onClick={this.seek.bind(this, endTime)} size="mini"> {endTime} </Label>
                     { this.props.drawHandle && (parseFloat(endTime) + (0.001 * this.state.player.playbackRate)) <= this.state.player.duration  &&
                       <Icon style={{ cursor: 'pointer' }} onClick={setTime.bind(this, id, toFixedDec(parseFloat(endTime) + (0.001 * this.state.player.playbackRate)), -1)} size="mini" name="plus" /> }
                </div>
              }
            </div>
            <br />
            { timeMap && timeMap.length >= 1 &&
              <div className="well compact" style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <p>Timeline</p>
                {getTimePoints(id, timeMap)}
              </div>
            </div>}
          </div>
          );
      }
    }
    const setHover = (key) => {
      const mouseHoverMap = this.state.mouseHoverMap;
      for (const k in mouseHoverMap) {
        if (mouseHoverMap.hasOwnProperty(k)) {
          if (k !== key) {
            mouseHoverMap[k] = false;
          }
        }
      }
      if (mouseHoverMap[key]) {
        mouseHoverMap[key] = false;
        // this.toggleTool('move');
      } else {
        mouseHoverMap[key] = true;
      }
      this.setState({ mouseHoverMap });
    }
    const renderCompleteLabels = () => {
      const renderarrs = [];
      for (const key of Object.keys(this.state.rectTimeMap)) {
        const cat = this.state.rectCatMap[key];
        const endTime = this.state.endTimeMap[key];
        const color = this.props.entityColorMap[cat];
        const mouseHoverMap = this.state.mouseHoverMap;
        // debugger;
        // const timeMap = this.state.rectTimeMap.key;
        // const startTime = this.state.rectTimeMap[key][0];
        // const endTime = timeMap[timeMap.length - 1];
        let size = 'mini';
        if (mouseHoverMap[key]) {
          size = 'small';
        }
        console.log('renderCompleteLabels', endTime);
          renderarrs.push(
            <Label style={{ cursor: 'pointer', color: 'white', backgroundColor: `${color}` }} size={size} id={key} onClick={setHover.bind(this, key)}>
              {cat} { this.props.drawHandle && <Icon name="delete" id={key} onClick={removeRect.bind(this)} /> }
            </Label>)
      }
      if (renderarrs.length > 0) {
        return (
          <div className="well" style={{ position: 'relative' }}>
            <Label size="mini" attached="top left">Completed Labels</Label>
            {renderarrs}
          </div>);
      }
    }
    // let selectText = 'Draw Tool';
    // if (this.state.drawButton) {
    //   selectText = 'Select Tool';
    // }
    console.log('polygon annotate. render state', this.state);
    // if (!this.props.space) {
    //   imgStyle = { display: 'block', width: '100%' };
    // }
    const { windowWidth, windowHeight } = this.getWindowDimeshions();
    this.state.windowWidth = windowWidth;
    this.state.windowHeight = windowHeight;
    // let toolCombo = undefined;
    if (this.props.space && this.props.shortcuts) {
      // if ('tool' in this.props.shortcuts) {
      //   toolCombo = convertKeyToString(this.props.shortcuts.tool);
      //   Mousetrap.bind(toolCombo, this.toggleTool.bind(this, 'shift'));
      // }
      let combo = undefined;
      const shortcuts = this.props.shortcuts;
      if (this.state.player && this.state.player.paused) {
        Mousetrap.bind('space', this.play.bind(this));
      } else if (this.state.player) {
        Mousetrap.bind('space', this.pause.bind(this));
      }
      if ('forward' in shortcuts) {
        combo = convertKeyToString(shortcuts.forward);
        if (this.state.player && this.state.player.paused) {
          Mousetrap.bind(combo, this.changeCurrentTime.bind(this, 1 / 25));
        } else if (this.state.player) {
          Mousetrap.unbind(combo);
        }
      }
      if ('backward' in shortcuts) {
        combo = convertKeyToString(shortcuts.backward);
        if (this.state.player && this.state.player.paused) {
          Mousetrap.bind(combo, this.changeCurrentTime.bind(this, - 1 / 25));
        } else if (this.state.player) {
          Mousetrap.unbind(combo);
        }
      }
      if ('fast_forward' in shortcuts) {
        combo = convertKeyToString(shortcuts.fast_forward);
        if (this.state.player && this.state.player.paused) {
          Mousetrap.bind(combo, this.changeCurrentTime.bind(this, 10 / 25));
        } else if (this.state.player) {
          Mousetrap.unbind(combo);
        }
      }
      if ('fast_backward' in shortcuts) {
        combo = convertKeyToString(shortcuts.fast_backward);
        if (this.state.player && this.state.player.paused) {
          Mousetrap.bind(combo, this.changeCurrentTime.bind(this, -10 / 25));
        } else if (this.state.player) {
          Mousetrap.unbind(combo);
        }
      }
      if ('next' in shortcuts) {
        combo = convertKeyToString(shortcuts.next);
        if (this.props.currentIndex >= 0) {
          Mousetrap.bind(combo, this.nextElement.bind(this, 'next'));
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('previous' in shortcuts) {
        combo = convertKeyToString(shortcuts.previous);
        if (this.props.currentIndex > 0) {
          Mousetrap.bind(combo, this.nextElement.bind(this, 'previous'));
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('skip' in shortcuts) {
        combo = convertKeyToString(shortcuts.skip);
        // skipButton = 'Skip (' + combo + ')';
        if (this.props.currentIndex >= 0) {
          Mousetrap.bind(combo, this.nextElement.bind(this, 'skip'));
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('delete' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.delete);
        Mousetrap.bind(combo, removeRect.bind(this, undefined));
      }
    }
    return (
    <div style={{ lineHeight: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', height: '100%'}}>
      <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#E0E0E0', padding: '1rem' }}>
        <div>
          <div style={{ lineHeight: 0, display: 'block', position: 'relative' }}>
                <div className="pan-zoom-element" style={{width: windowWidth, height: windowHeight}}>
                  <div className="content-container noselect" style={{ transform: `translate(${this.state.translate.x}px, ${this.state.translate.y}px) scale(${this.state.scale})`, transformOrigin: '0 0', position: 'relative' }}>
            <video
              ref={(player) => { this.player = player; this.state.player = player; }}
              aspectRatio="16:9"
              onLoadedMetadata={(e1, e2, e3) => {
                        console.log('meta data loaded', e1, e2, e3, this.player, this.player.width, this.player.video, this.state.player );
                        const { width, height } = this.videoDimensions(this.player);
                        let marginLeft = 0;
                        let marginTop = 0;
                        if (height !== this.state.windowHeight) {
                          marginTop = Math.abs(height - this.state.windowHeight) / 2;
                        }
                        if (width !== this.state.windowWidth) {
                          marginLeft = Math.abs(width - this.state.windowWidth) / 2;
                        }
                        this.setState({ loading: false, videoLoad: true, videoHeight: height, marginTop, marginLeft, videoWidth: width });
                      }}
                      onLoadStart={this.handleStateChange.bind(this, 'onLoadStart')}
                      onWaiting={this.handleStateChange.bind(this, 'onWaiting')}
                      onCanPlay={this.handleStateChange.bind(this, 'onCanPlay')}
                      onCanPlayThrough={this.handleStateChange.bind(this, 'onCanPlayThrough')}
                      onPlaying={this.handleStateChange.bind(this, 'onPlaying')}
                      onEnded={this.handleStateChange.bind(this, 'onEnded')}
                      onSeeking={this.handleStateChange.bind(this, 'onSeeking')}
                      onSeeked={this.handleStateChange.bind(this, 'onSeeked')}
                      onPlay={this.handleStateChange.bind(this, 'onPlay')}
                      onPause={this.handleStateChange.bind(this, 'onPause')}
                      onProgress={this.handleStateChange.bind(this, 'onProgress')}
                      onDurationChange={this.handleStateChange.bind(this, 'onDurationChange')}
                      onError={this.handleStateChange.bind(this, 'onError')}
                      onSuspend={this.handleStateChange.bind(this, 'onSuspend')}
                      onAbort={this.handleStateChange.bind(this, 'onAbort')}
                      onEmptied={this.handleStateChange.bind(this, 'onEmptied')}
                      onStalled={this.handleStateChange.bind(this, 'onStalled')}
                      onLoadedData={this.handleStateChange.bind(this, 'onLoadedData')}
                      onTimeUpdate={this.handleStateChange.bind(this, 'onTimeUpdate')}
                      onRateChange={this.handleStateChange.bind(this, 'onRateChange')}
                      onVolumeChange={this.handleStateChange.bind(this, 'onVolumeChange')}
              width={windowWidth} height={windowHeight}
              preload="auto"
              fluid={false}
              src={this.state.video}
            />
                    { (this.props.loading || !this.state.videoLoad) && <Dimmer active>
                                              <Loader />
                                            </Dimmer>}
                      { this.state.videoLoad &&
                        <div ref={(canv) => { this.canvas = canv; setFunctions();}} style={canvasStyles}>
                          { this.canvas && this.canvas.offsetWidth &&
                                <svg id="drawing" ref={(id) => {  this.svgId = id }} style={{ width: this.state.videoWidth, height: this.state.videoHeight }}>
                                  {Object.keys(this.state.rects).length >= 0 && renderRects() }
                                  {this.state.player.paused && this.props.drawHandle && Object.keys(this.state.rects).length >= 0 && renderPoints() }
                                  {this.state.currentRect && this.props.drawHandle && this.state.currentRect.length > 0 && this.rectToStyles(this.state.currentRect)}
                                  {this.state.player.paused && this.props.drawHandle && this.state.currentRect && this.state.currentRect.length > 1 && renderCurrentPoints()}
                                </svg>
                          }
                        </div>
                      }
                    </div>
                  </div>
            </div>
      </div>
        {this.state.videoLoad &&
          <div>
            { this.state.player.paused &&
              <p ref={ (ptext) => this.ptext = ptext} id="progressBarText" className="text-center" style={{ fontSize: 'xx-small'}}>
                {this.state.player.currentTime} / {this.state.player.duration}
              </p>
            }
            { !this.state.player.paused &&
              <p ref={ (ptext) => this.ptextPlay = ptext} id="progressBarTextPlay" className="text-center" style={{ fontSize: 'xx-small'}}>
                {this.state.player.currentTime} / {this.state.player.duration}
              </p>
            }
            <input id="progressBar" title="Progress" style={{ padding: '2px' }} className="ui range" onChange={(event, data) => { console.log('onSeekChange', event.target.value, data); this.seek(event.target.value); }} min={0} step={0.0001} max={this.state.player.duration} type="range" value={this.state.player.currentTime} />

              <Button title="Fast Backward" icon size="mini" onClick={this.changeCurrentTime.bind(this, -10 / 25)}> <Icon name="fast backward" /></Button>
            <Button title="Backward" icon size="mini" onClick={this.changeCurrentTime.bind(this, -1 / 25)}> <Icon name="backward" /></Button>
            {this.state.player.paused &&
                        <Button title="Play" icon size="mini" onClick={this.play}> <Icon name="play" /></Button>}
            {!this.state.player.paused &&
              <Button title="Pause" icon size="mini" onClick={this.pause}> <Icon name="pause" /></Button>}
            <Button title="Forward" icon size="mini" onClick={this.changeCurrentTime.bind(this, 1 / 25)}> <Icon name="forward" /></Button>
            <Button title="Fast Forward" icon size="mini" onClick={this.changeCurrentTime.bind(this, 10 / 25)}> <Icon name="fast forward" /></Button>
            { this.state.player.volume === 0 && <Icon name="volume off" />}
            { this.state.player.volume !== 0 && <Icon name="volume up" />}
            <input style={{ width: '10%', display: 'inline-block'}} title="Volume" className="range" onChange={(event, data) => { console.log('change volume', event.target.value, data); this.setVolume(parseFloat(event.target.value)); }} type="range" min={0} step={0.1} max={1} value={this.state.player.volume} />

            <p>Playback Speed : <b>{this.state.player.playbackRate}x</b></p>
            <input title="PlayBack Rate" className="ui range" onChange={(event, data) => { console.log('changePlaybackRateRate', event.target.value, data); this.changePlaybackRateRate(parseFloat(event.target.value)); }} min={0} step={0.01} max={2} type="range" value={this.state.player.playbackRate} />

          </div>
        }
      </div>
      {
      <div style={{ flexGrow: 1.5 }}>
          {/*
          <Button size="mini" icon onClick={ () => { if (this.state.toolbarHidden) this.setState({ toolbarHidden: false}); else this.setState({ toolbarHidden: true});}}>
            { this.state.toolbarHidden && <Icon color="blue" name="angle left" /> }
            { !this.state.toolbarHidden && <Icon color="blue" name="angle right" /> }
          </Button>
        */}
          { !this.state.toolbarHidden &&
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                    {
                    <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                      <div title="Click to draw Polygon">
                        <Button size="mini" color={this.state.toolName === 'polygon' ? 'blue' : 'grey'} icon onClick={this.toggleTool.bind(this, 'polygon')}>
                          <Icon name="star outline" />
                          <p style={{ fontSize: '0.4rem' }}>Polygon</p>
                        </Button>
                      </div>
                          <div style={{ height: '10px' }} />
                      <div title="Click to draw Rectangle">
                        <Button size="mini" color={this.state.toolName === 'rectangle' ? 'blue' : 'grey'} icon onClick={this.toggleTool.bind(this, 'rectangle')}>
                          <Icon name="square outline" />
                          <p style={{ fontSize: '0.4rem' }}>Rectangle</p>
                        </Button>
                      </div>
                    </div>
                      }
                      {
                        this.props.drawHandle &&
                        <div style={{ marginLeft: '10px', marginRight: '10px', display: 'flex', flexDirection: 'initial', marginTop: '10px', justifyContent: 'space-evenly', fontSize: 'xx-small' }}>
                          <label>
                                <input type="range"  step="0.01" min="0" max="1" value={this.state.opacity} onChange={changeImageProp.bind(this, 'opacity')} />
                                <br />
                                <span>Box Opacity : <b> {Math.round(this.state.opacity * 100)}%</b> </span>
                            </label>
                        </div>
                      }
                    { this.state.rects.length > 0 &&
                      <div id="currentLabel" style={{ marginLeft: '15px', height: '300px', overflow: 'auto' }}>
                        {renderCurrentLabel()}
                      </div>
                    }
                    { this.state.rects.length > 0 &&
                      <div id="completeLabel" style={{ height: '100px', marginLeft: '15px', overflow: 'auto' }}>
                        {renderCompleteLabels()}
                      </div>
                    }
                        <div style={{ height: '20px' }} />
                    {this.props.drawHandle &&
                      <div style={{ position: 'relative', marginLeft: '15px', border: '1px solid #eaf2f4', backgroundColor: '#f5f9fa', boxSizing: 'border-box' }}>
                        <Label size="mini" attached="top left">
                          Select Entity
                        </Label>
                        { getMenuItems()}
                    </div>}
                        <div style={{ height: '30px' }} />
                      { this.props.drawHandle &&
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
                      </div>}
                      {this.props.space && this.showButtons()}
                </div>
          }
      </div>
      }
    </div>
    );
  }
}
VideoAnnotator.propTypes = {
  video: PropTypes.string,
  drawHandle: PropTypes.func,
  space: PropTypes.bool,
  entityColorMap: PropTypes.object,
  rectTimeMap: PropTypes.object,
  rectShapeMap: PropTypes.object,
  shortcuts: PropTypes.object,
  rects: PropTypes.array,
  loading: PropTypes.bool,
  defaultShape: PropTypes.string,
  fullScreen: PropTypes.bool,
  menuHidden: PropTypes.bool,
  rectCatMap: PropTypes.object,
  skipRow: PropTypes.func,
  endTimeMap: PropTypes.object,
  saveTagAndNextRow: PropTypes.func,
  getBackTopreviousRow: PropTypes.func,
  currentIndex: PropTypes.int,
  hits: PropTypes.array
};
