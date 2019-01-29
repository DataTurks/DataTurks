import React, { Component, PropTypes } from 'react';
// import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Dimmer, Loader, Dropdown, Icon, Button, Label } from 'semantic-ui-react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import Modal from 'react-bootstrap/lib/Modal';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Rnd from 'react-rnd';
import { convertKeyToString } from '../../helpers/Utils';
import PanZoomElement from '../PinchZoomPan/PanZoomElement';
const Mousetrap = require('mousetrap');

// App component - represents the whole app
@connect(
  state => ({ menuHidden: state.dataturksReducer.menuHidden}),
  dispatch => bindActionCreators({}, dispatch))
export default class BoxAnnotator extends Component {
  constructor(props) {
    super(props);
    console.log('BoxAnnotator props', props);
    this.state = {
      rects: props.rects,
      rectCatMap: props.rectCatMap,
      image: props.image,
      entities: Object.keys(props.entityColorMap),
      canvasSet: false,
      menuOpacity: {},
      newEntities: [],
      contrast: 1.0,
      brightness: 1.0,
      zoomable: true,
      saturation: 1.0,
      imgLoaded: {},
      scale: 1,
      menuOpen: {},
      drawButton: this.props.drawHandle ? true : false,
      toolbarHidden: false,
      hideRectMap: {},
      hideLabelsMap: {},
      notes: props.notes,
    };
    this.mousedownHandle = this.mousedownHandle.bind(this);
    this.mousemoveHandle = this.mousemoveHandle.bind(this);
    this.mouseupHandle = this.mouseupHandle.bind(this);
    this.resizeWindow = this.resizeWindow.bind(this);
    this.loadImages = this.loadImages.bind(this);
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  componentDidMount() {
    console.log('component did mount', this.canvas);
    window.addEventListener('resize', this.resizeWindow.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    console.log('BoxAnnotator nextprops', this.props.fullScreen, nextProps.fullScreen);
    if (nextProps.rects && nextProps.rectCatMap && (this.props.rects !== nextProps.rects)) {
      this.setState({ rects: nextProps.rects, notes: nextProps.notes, newEntities: [], rectCatMap: nextProps.rectCatMap, image: nextProps.image});
    }
    // if (this.props.menuHidden !== nextProps.menuHidden || this.props.fullScreen !== nextProps.fullScreen) {
    //   console.log('resetting screen');
    //   this.setState({ rects: nextProps.rects, notes: nextProps.notes, newEntities: [], rectCatMap: nextProps.rectCatMap,
    //    image: nextProps.image + '?ts=' + new Date(), canvasSet: false, imgLoad: false, imgObject: undefined });
    // }
    if (this.props.hideLabels !== nextProps.hideLabelsls) {
      this.setState({ rects: nextProps.rects, notes: nextProps.notes, newEntities: [], rectCatMap: nextProps.rectCatMap});
    }
    if (this.props.image !== nextProps.image) {
      this.timeout = null
      if (this.props.drawHandle) {
        console.log('new image reset');
        this.setState({ drawButton: true, scale: 1 });
        this.setState({ contrast: 1.0, brightness: 1.0, saturation: 1.0 });
      }
      this.setState({imgLoad: false, notes: nextProps.notes, canvasSet: false, newEntities: []});
    }
  }

  componentWillUnmount() {
    console.log('BoxAnnotator unmount');
    // document.removeEventListener('mouseup', this.mouseupHandle);
    window.removeEventListener('resize', this.resizeWindow);
  }

  getPoint(point) {
    console.log('point is', point);
    if (point < 0.0) { return 0.0; }
    if (point > 1.0) { return 1.0; }
    return point;
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
  }


  mousedownHandle(event) {
    console.log('mouse down', event);
    this.setState({
      mouseDown: true,
      mouseDownTime: Math.floor(Date.now() / 1000)
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
    console.log('mousedown ', this.state);
  }

  mousemoveHandle(event) {
    if (this.state.mouseDown) {
      const { x1, y1 } = this.state.currentRect;
      this.setState({
        mouseDrag: true,
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
    const { imgWidth: imageWidth, imgHeight: imageHeight } = this.state;
    const { x1, y1, width, height } = currentRect;
    // const rectStyleBorder = 1;
    const dataRect = {};
    if (width > 0) {
      dataRect.x1 = this.getPoint(x1 / imageWidth);
      dataRect.x2 = this.getPoint((x1 + width) / imageWidth);
    } else {
      dataRect.x2 = this.getPoint((x1) / imageWidth);
      dataRect.x1 = this.getPoint((x1 + width) / imageWidth);
    }
    if (height > 0) {
      dataRect.y1 = this.getPoint((y1) / imageHeight);
      dataRect.y2 = this.getPoint((y1 + height) / imageHeight);
    } else {
      dataRect.y2 = this.getPoint((y1) / imageHeight);
      dataRect.y1 = this.getPoint((y1 + height) / imageHeight);
    }

    return dataRect;
  }

  convertRectDataToUIRect(rect) {
    console.log('convertRectDataToUIRect ', this.canvas);
    const { imgWidth: imageWidth, imgHeight: imageHeight } = this.state;
    const { x1, x2, y1, y2 } = rect;
    console.log('convertRectDataToUIRect rects ', imageWidth, imageHeight);
    const log = {
      x1: x1 * imageWidth,
      width: (x2 - x1) * imageWidth,
      y1: y1 * imageHeight,
      height: (y2 - y1) * imageHeight,
    };

    return log;
  }

  mouseupHandle() {
    console.log('mouseupHandle', this.state, this.props, Math.floor(Date.now() / 1000), this.state.mouseDownTime);
    if (this.state.mouseDrag && Math.floor(Date.now() / 1000) > this.state.mouseDownTime) {
      const nextRect = this.convertCurrentRectToData(this.state.currentRect);
      const numberOfRects = this.state.rects.length;
      const { rectCatMap, notes } = this.state;
      const menuOpen = this.state.menuOpen;
      const menuOpacity = this.state.menuOpacity;
      const hideLabelsMap = this.state.hideLabelsMap;
      for (let index = 0; index < numberOfRects; index ++) {
        menuOpacity[index] = 0.4;
        menuOpen[index] = false;
        hideLabelsMap[index] = true;
      }
      if (this.state.entities.length === 1) {
        rectCatMap[numberOfRects] = [this.state.entities[0]];
        menuOpen[numberOfRects] = false;
        menuOpacity[numberOfRects] = 0.4;
        hideLabelsMap[numberOfRects] = true;
      } else {
        rectCatMap[numberOfRects] = [];
        menuOpen[numberOfRects] = true;
        menuOpacity[numberOfRects] = 1.0;
        hideLabelsMap[numberOfRects] = true;
      }
      notes[numberOfRects] = '';
      this.setState({
        currentRect: null,
        rects: [
          ...this.state.rects,
          nextRect
        ],
        rectCatMap,
        notes,
        menuOpen,
        menuOpacity,
        mouseDown: false,
        mouseDrag: false,
        showList: true
      }, () => {
        if (this.props.drawHandle) {
          console.log('calling drawhandle', this.state);
          this.props.drawHandle(this.state);
        }
      });
    } else if (this.state.mouseDown) {
      const numberOfRects = this.state.rects.length;
      const menuOpen = this.state.menuOpen;
      const menuOpacity = this.state.menuOpacity;
      for (let index = 0; index < numberOfRects; index ++) {
        menuOpacity[index] = 0.4;
        menuOpen[index] = false;
      }
      this.setState({ mouseDown: false, mouseDrag: false, menuOpen, menuOpacity, currentRect: null });
    }
  }

  rectToStyles(currentRect) {
    const { x1, y1, width, height } = currentRect;
    const canvas = this.canvas;
    console.log('rectToStyles', this.parentDiv.offsetWidth, this.parentDiv.offsetHeight, canvas.offsetHeight, canvas.offsetWidth);
    const strokeWidth = 1 / this.state.scale;
    const styleObject = {
      position: 'absolute',
      border: `${strokeWidth}` + 'px solid #1ae04e',
    };
    console.log('current rect', x1, y1, width, height);
    if (width > 0) {
      styleObject.left = x1;
    } else {
      styleObject.left = x1 - (- width);
    }

    if (height > 0) {
      styleObject.top = y1;
    } else {
      styleObject.top = y1 - (-height);
    }

    styleObject.width = Math.abs(width);
    styleObject.height = Math.abs(height);
    styleObject.zIndex = 3;
    console.log('style object is', styleObject);
    return styleObject;
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

  // _onWheel(event) {
  //   console.log('_onWheelBOX', event.target.nodeName);
  // }

  render() {
    // const { image } = this.props; // logic to render when it's found
    console.log('BoxAnnotator state', this.state, this.props);
    const canvasStyles = {
      zIndex: this.state.mouseDown ? 4 : 2,
      position: 'absolute',
      top: 0,
      left: 0,
      width: this.state.imgWidth,
      height: this.state.imgHeight,
      cursor: this.state.drawButton ? 'crosshair' : 'move',
    };

    const xStyle = {
      position: 'absolute',
      zIndex: 5,
      top: '-8px',
      right: '-8px',
      width: '15px',
      height: '15px',
      transform: `scale(${1 / this.state.scale})`,
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


    const yStyle = {
      position: 'absolute',
      zIndex: 5,
      bottom: '-8px',
      left: '-8px',
      transform: `scale(${1 / this.state.scale})`,
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
      console.log('select category ', event1.target.value, event1.target.name, index.id, index.value, index);
      const { rectCatMap } = this.state;
      // const currentCats = [];
      const values = index.value;
      rectCatMap[index.id] = values;
      this.setState({ rectCatMap });
      if (this.props.drawHandle) {
        this.props.drawHandle(this.state);
      }
    };

    const handleAddition = (event, { value }) => {
      console.log('handleAddition', value, this.props);
      this.setState({
        entities: [...this.state.entities, value],
        newEntities: [...this.state.newEntities, value]
      });
      if (this.props.drawHandle) {
        this.props.drawHandle(this.state);
      }
    };

    const removeRect = (index) => {
      const rcm = {};
      const newNotes = {};
      for ( const [key, value] of entries(this.state.rectCatMap)) {
        if (key < index) {
          rcm[key] = value;
        } else if (key > index) {
          rcm[key - 1] = this.state.rectCatMap[key];
        }
      }
      for ( const [key, value] of entries(this.state.notes)) {
        if (key < index) {
          newNotes[key] = value;
        } else if (key > index) {
          newNotes[key - 1] = this.state.notes[key];
        }
      }
      const hideRectMap = this.state.hideRectMap;
      hideRectMap[index] = false;
      console.log('removerect', this.state.rects, this.state.rectCatMap, rcm);
      this.setState({
        rects: [
          ...this.state.rects.slice(0, index),
          ...this.state.rects.slice(index + 1),
        ],
        hideRectMap,
        zoomable: true,
        rectCatMap: rcm,
        notes: newNotes
      }, () => {
        if (this.props.drawHandle) {
          this.props.drawHandle(this.state);
        }
      });
    };

    const toggleEyeStatus = (key, value, event) => {
      event.stopPropagation();
      // console.log('toggleEyeStatus', key, value);
      const hideRectMap = this.state.hideRectMap;
      hideRectMap[key] = value;
      this.setState({ hideRectMap });
    };

    const showLabels = () => {
      const renderArrs = [];
      const { rectCatMap } = this.state;
      let index = 0;
      for ( const [key, value] of entries(rectCatMap)) {
        renderArrs.push(
          <Label key={key} style={{ padding: '5px', color: 'white', backgroundColor: this.props.entityColorMap[value]}}>
            { ((key in this.state.hideRectMap) && (this.state.hideRectMap[key] === true)) &&
              <Icon size="small" name="low vision" style={{ color: `${this.props.entityColorMap[key]}`}} onClick={(event) => toggleEyeStatus(key, false, event)} />
            }
            { ((!(key in this.state.hideRectMap)) || (key in this.state.hideRectMap && this.state.hideRectMap[key] === false)) &&
              <Icon name="eye" style={{ color: `${this.props.entityColorMap[key]}`}} onClick={(event) => toggleEyeStatus(key, true, event)} />
            }
                {value}
            <Icon name="delete" onClick={removeRect.bind(this, index)} />
          </Label>
        );
        index = index + 1;
      }
      return (<div>{renderArrs}</div>);
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
      let opa = 0.4;
      let icon = '';
      if (index in this.state.menuOpacity) {
        opa = this.state.menuOpacity[index];
      }
      const menuOpacity = {opacity: opa, whiteSpace: 'nowrap'};
      let fluid = true;
      console.log('menuOpacity', menuOpacity, menuOpacity.opacity);
      if (menuOpacity.opacity === 1) {
        fluid = false;
        icon = 'angle down';
      }
      // const bcolor = this.props.entityColorMap[selectedCat];
      // const values = [];
      // let selectedLabel = '';
      for (let index1 = 0; index1 < this.state.entities.length; index1 ++) {
        const key = this.state.entities[index1];
        if (this.props.shortcuts && this.props.drawHandle && key in this.props.shortcuts) {
          const combo = convertKeyToString(this.props.shortcuts[key]);
          Mousetrap.bind(combo, selectCategory.bind(this, null, { id: index, value: key }));
        }
        arrs.push(
          { key: index1, text: key, value: key});
      }
      // for (const [key] of entries(this.props.entityColorMap)) {
      //   // let selected = false;
      //   // if (selectedCat.has(key)) {
      //   //   // selected = true;
      //   //   values.push(key);
      //   //   // selectedLabel = key;
      //   // }
      //   // let iconC = 'hidden';
      //   // if (index1 === 0) {
      //   //   iconC = '';
      //   // }
      //   arrs.push(
      //     { key: index1, text: key, value: key, size: 'tiny' });
      //   index1 = index1 + 1;
      // const renderLabel = (item: DropdownItemProps, index: number, label: LabelProps) => ({
      //   color: 'blue',
      //   content: `Customized label - ${label.text}`,
      //   icon: 'check',
      // });
      let renderLabel = (label) => ({
        color: this.props.entityColorMap[label.text],
        content: label.text,
      });

      if (selectedCat.length > 1 && this.props.drawHandle) {
        if (!this.state.menuOpen[index]) {
          renderLabel = (label) => ({
            color: this.props.entityColorMap[label.text],
            content: label.text.charAt(0),
          });
        }
      }
      let closeOnChange = false;
      if (this.props.autoClose) {
        closeOnChange = true;
      }
      const dropdownFocus = (index1) => {
        console.log('focus index is ', index1);
        console.log('onDropdownfocus', this.state, index1);
        const menuOpen = this.state.menuOpen;
        menuOpen[index1] = true;
        console.log('onDropdownfocus', menuOpen);
        const menuOpacityV = this.state.menuOpacity;
        menuOpacityV[index1] = 1.0;
        console.log('onDropdownfocus', menuOpen, this.state.menuOpen);
        this.setState({menuOpacity: menuOpacityV, menuOpen, zoomable: false});
        console.log('onDropdownfocus', this.state);
      };
      console.log('arrs values', icon, arrs, menuOpacity, fluid);
      return (
            <Dropdown scrolling icon={icon} openOnFocus closeOnChange={closeOnChange} closeOnBlur={false}
            disabled={!this.props.drawHandle}
            open={this.state.menuOpen[index]}
            tabIndex="1"
            selectOnNavigation
            allowAdditions additionPosition="bottom"
            search={this.state.menuOpen[index]}
            searchInput={{ autoFocus: this.state.menuOpen[index] }}
            fluid={fluid} multiple selection
            className="mini" onAddItem={handleAddition} onChange={selectCategory} options={arrs}
            value={selectedCat}
            id = {index}
            renderLabel={renderLabel.bind(this.state.menuOpen[index])}
            style={menuOpacity}
            onClose={() => {
              console.log('onDropdownclose');
              const menuOpen = this.state.menuOpen;
              menuOpen[index] = false;
              const menuOpacityV = this.state.menuOpacity;
              menuOpacityV[index] = 0.4;
              const hideLabelsMap = this.state.hideLabelsMap;
              hideLabelsMap[index] = true;
              this.setState({menuOpacity: menuOpacityV, menuOpen, hideLabelsMap, zoomable: true});
              console.log('onDropdownclose', this.state);
            }
            }
            onFocus={dropdownFocus.bind(this, index)}
            button additionLabel="New Item: "/>
                        );
    };

    const getTooltip = (index) => {
      return (
      <Tooltip id="tooltip" style={{marginTop: '-70px'}}>
        {this.state.notes[index]}
      </Tooltip>);
    };

    const startDragging = (index) => {
      console.log('start dragging', this.state.rects[0]);
      if (!this.state.menuOpen[index]) {
        const currentRect = this.state.rects[index];
        const dragRect = {};
        dragRect.x1 = currentRect.x1 * this.state.imgWidth;
        dragRect.x2 = currentRect.x2 * this.state.imgWidth;
        dragRect.y1 = currentRect.y1 * this.state.imgHeight;
        dragRect.y2 = currentRect.y2 * this.state.imgHeight;
        this.setState({ dragging: true, dragRect, dragRectIndex: index });
      }
    };

    const adjustRectPosition = (index, xco, yco) => {
      console.log('dragging going', this.state.rects[0]);
      if (!this.state.menuOpen[index]) {
        const dragRect = this.state.dragRect;
        dragRect.x1 = dragRect.x1 + xco;
        dragRect.x2 = dragRect.x2 + xco;
        dragRect.y1 = dragRect.y1 + yco;
        dragRect.y2 = dragRect.y2 + yco;
        console.log('dragging ', dragRect);
        this.state.dragRect = dragRect;
        this.setState({ dragRect });
      }
    };

    const stopDragging = (index) => {
      console.log('stop dragging', this.state.rects[0]);
      if (!this.state.menuOpen[index]) {
        const dragRect = this.state.dragRect;
        const rects = this.state.rects;
        const x1 = this.getPoint(dragRect.x1 / this.state.imgWidth);
        const x2 = this.getPoint(dragRect.x2 / this.state.imgWidth);
        const y1 = this.getPoint(dragRect.y1 / this.state.imgHeight);
        const y2 = this.getPoint(dragRect.y2 / this.state.imgHeight);

        rects[index] = {x1, x2, y1, y2};
        this.setState({ rects: rects});
        this.setState({ dragging: false, dragRect: {}, dragRectIndex: -1 });
        if (this.props.drawHandle) {
          console.log('calling drawhandle', this.state);
          this.props.drawHandle(this.state);
        }
      }
    };

    const adjustRectSize = (index, ele, position, delta) => {
      const rects = this.state.rects;
      const dragRect = rects[index];
      console.log('presize', dragRect, ele.offsetWidth, ele.offsetHeight, position);
      dragRect.x1 = this.getPoint(position.x / this.state.imgWidth);
      dragRect.y1 = this.getPoint(position.y / this.state.imgHeight);
      dragRect.x2 = this.getPoint(( position.x + ele.offsetWidth ) / this.state.imgWidth);
      dragRect.y2 = this.getPoint(( position.y + ele.offsetHeight ) / this.state.imgHeight);
      // if (position.x === 0) {
      //   dragRect.x2 = dragRect.x1 + (ele.clientWidth / this.state.imgWidth);
      // } else {
      //   dragRect.x1 = dragRect.x1 + (position.x / this.state.imgWidth);
      // }
      // if (position.y === 0) {
      //   dragRect.y2 = dragRect.y1 + (ele.clientHeight / this.state.imgHeight);
      // } else {
      //   dragRect.y1 = dragRect.y1 + (position.y / this.state.imgHeight);
      // }
      // dragRect.x1 = dragRect.x1 + (position.x / this.state.imgWidth);
      // dragRect.y1 = dragRect.y1 + (position.y / this.state.imgHeight);
      rects[index] = dragRect;
      console.log('postsize', dragRect, delta);
      this.setState({ rects });
      if (this.props.drawHandle) {
        console.log('calling drawhandle', this.state);
        this.props.drawHandle(this.state);
      }
    };

    const resizingProperty = { top: false, right: true, bottom: true, left: false, topRight: false, bottomRight: true, bottomLeft: false, topLeft: false };

    const renderRects = () => (
      this.state.rects.map((rect, index) => {
        console.log('rendering rects', rect, this.state);
        if (!this.canvas) {
          this.state.canvasSet = false;
          return (<div />);
        }
        if ( index in this.state.hideRectMap && this.state.hideRectMap[index] === true) {
          return (<div />);
        }
        let style;
        let log;
        if (this.state.dragging && index === this.state.dragRectIndex) {
          const dr = this.state.dragRect;
          const width = dr.x2 - dr.x1;
          const height = dr.y2 - dr.y1;
          log = { x1: dr.x1, y1: dr.y1, width, height};
        } else {
          log = this.convertRectDataToUIRect(rect);
        }
        style = this.rectToStyles(log);
        let scale = this.state.scale;
        if (this.state.scale > 1) {
          scale = 1 / this.state.scale;
        }
        if (!this.props.drawHandle) {
          scale = 0.7;
        }
        if (!this.props.drawHandle) {
          return (
          <div>
            <div key={index} style={style}>
              {this.props.drawHandle &&
              <button style={xStyle} onClick={() => { removeRect(index); }}>×</button>
              }
              { this.props.noteSettings &&
                <OverlayTrigger placement="top" overlay={getTooltip(index)}>
                        <Icon name="sticky note"
                        onClick={() => { this.setState({ openNote: true, noteIndex: index }); }} style={yStyle} />
                </OverlayTrigger>
              }
              {
              <FormGroup controlId="formControlsSelect" style={{ transform: `scale(${scale})`}}>
                {getOptions(index)}
            </FormGroup>}
            </div>
          </div>
          );
        }
        const strokeWidth = 1 / this.state.scale;
        return (
              <Rnd
                style={{ position: 'absolute', border: `${strokeWidth}` + 'px solid #1ae04e', zIndex: 3}}
                size={{ width: log.width, height: log.height }}
                position={{ x: log.x1, y: log.y1 }}
                bounds=".canvas-div"
                scale={this.state.scale}
                resizeGrid={[ 0.0001, 0.0001]}
                dragGrid={[ 0.0001, 0.0001 ]}
                extendsProps={{
                  onMouseEnter: (event) => {
                    console.log('mouseenter event ', event);
                    const hideLabelsMap = this.state.hideLabelsMap;
                    hideLabelsMap[index] = false;
                    this.setState({ hideLabelsMap });
                  },
                  onMouseLeave: (event) => {
                    console.log('mouseleave event ', event);
                    const hideLabelsMap = this.state.hideLabelsMap;
                    hideLabelsMap[index] = true;
                    this.setState({ hideLabelsMap, zoomable: true });
                  }
                }}
                onDragStart={() => { console.log('onDragStart', this.state); startDragging(index); }}
                onDrag={(en, dn) => { console.log('onDrag', this.state); adjustRectPosition(index, dn.deltaX, dn.deltaY); }}
                onDragStop={(en, dn) => { console.log('onDragStop', this.state); adjustRectPosition(index, dn.deltaX, dn.deltaY); stopDragging(index); }}
                enableResizing={ (!this.state.menuOpen[index] && this.state.scale < 2.0 ) ? resizingProperty : {}}
                disableDragging={this.state.menuOpen[index]}
                onResizeStop={(__, ___, ele, delta, pos) => {
                  console.log('resize', __, ___, delta, ele.offsetWidth, ele.offsetHeight, pos.x, pos.y);
                  adjustRectSize(index, ele, pos, delta);
                }}
                >
              {this.props.drawHandle &&
              <button style={xStyle} onClick={() => { removeRect(index); }}>×</button>
              }
              { (!this.props.hideLabels || index === this.state.rects.length - 1) && this.props.noteSettings &&
                <OverlayTrigger placement="top" overlay={getTooltip(index)}>
                        <Icon name="sticky note"
                        onClick={() => { this.setState({ openNote: true, noteIndex: index }); }} style={yStyle} />
                </OverlayTrigger>
              }
              { ((!this.props.hideLabels) || (this.props.hideLabels && !this.state.hideLabelsMap[index])) &&
              <FormGroup controlId="formControlsSelect" style={{ transform: `scale(${scale})`}}>
                {getOptions(index)}
            </FormGroup> }
          </Rnd>
        );
      })
    );
    const onImgLoad = ({target: img}) => {
      console.log('image loaded', img.width, img.height, img.offsetWidth);
      setTimeout(this.loadImages.bind(this), 100);
      this.timeout = this.loadImages;
      this.setState({imgHeight: img.offsetHeight,
                                  imgWidth: img.offsetWidth, imageNaturalWidth: img.naturalWidth, imageNaturalHeight: img.naturalHeight, imgObject: img, imgLoad: true});
    };
    const setFunctions = () => {
      const canvas = this.canvas;
      if (!this.state.canvasSet && canvas) {
        if (this.state.imgLoad) {
          console.log('setting canvas', this.canvas);
          if (this.props.drawHandle) {
            canvas.addEventListener('mousedown', this.mousedownHandle);
            canvas.addEventListener('mousemove', this.mousemoveHandle);
            canvas.addEventListener('mouseup', this.mouseupHandle);
            // canvas.addEventListener('wheel', this._onWheel);
          }
          this.setState({ canvasSet: true});
        }
      }
    };
    const toggleTool = (event, event1) => {
      console.log('toggleTool', event, event1);
      event1.preventDefault();
      if (!event) {
        this.setState({ drawButton: event });
        this.canvas.removeEventListener('mousedown', this.mousedownHandle);
        this.canvas.removeEventListener('mousemove', this.mousemoveHandle);
        this.canvas.removeEventListener('mouseup', this.mouseupHandle);
      } else {
        this.setState({ drawButton: event, canvasSet: false });
      }
    };
    const updateScale = (scale) => {
      console.log('updating scale', scale);
      this.setState({ scale });
    };
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
    if (this.props.drawHandle && this.props.shortcuts && 'tool' in this.props.shortcuts) {
      toolCombo = convertKeyToString(this.props.shortcuts.tool);
      Mousetrap.bind(toolCombo, toggleTool.bind(this, !this.state.drawButton));
    }

    const changeImageProp = (name, event) => {
      console.log('changeImageProp', name, event.target.value);
      this.setState({ [name]: event.target.value });
    }
    return (
      <div ref={(parentDiv) => this.parentDiv = parentDiv} style={{ position: 'relative', display: 'block' }}>
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
          {this.props.drawHandle &&
            <div style={{ display: 'flex', justifyContent: 'space-evenly', fontSize: 'xx-small' }}>
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
              {(!this.state.imgLoad || this.props.loading ) && <Dimmer active>
                                        <Loader />
                                      </Dimmer>}
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                      <div>
                        <PanZoomElement zoomable={this.state.zoomable} updateScale={updateScale} image={this.state.image} setFunctions={setFunctions} drawButton={this.state.drawButton} width={windowWidth} height={windowHeight}>
                          { !this.props.loading && !this.props.drawHandle &&
                            <img ref={ (image) => { this.imageRef = image; }} onLoad={onImgLoad} src={this.state.image} role="presentation"
                              style={{
                                width: 'auto', maxWidth: `${windowWidth}`,
                                height: 'auto', maxHeight: `${windowHeight}`,
                                display: 'block' }} />
                          }
                          { !this.props.loading && this.props.drawHandle &&
                            <img ref={ (image) => { this.imageRef = image; }} onLoad={onImgLoad} src={this.state.image} role="presentation"
                              style={{ filter: `contrast(${this.state.contrast}) brightness(${this.state.brightness}) saturate(${this.state.saturation})`,
                              width: 'auto', maxWidth: `${windowWidth}`,
                              height: 'auto', maxHeight: `${windowHeight}`,
                              display: 'block' }} />
                          }
                          { this.state.imgLoad &&
                          <div ref={(canv) => { this.canvas = canv; setFunctions(); }} style={canvasStyles} className="canvas-div" /> }
                          { this.state.imgLoad && renderRects() }
                          { this.state.imgLoad && this.state.currentRect && <div ref={(ref) => { this.rectsRef = ref; }} style={this.rectToStyles(this.state.currentRect)} /> }
                        </PanZoomElement>
                      </div>

                      { this.props.drawHandle &&
                          <div style={{ alignItems: 'flex-start', textAlign: 'center' }}>
                                  <Button size="mini" icon onClick={ () => { if (this.state.toolbarHidden) this.setState({ toolbarHidden: false}); else this.setState({ toolbarHidden: true});}}>
                                    { this.state.toolbarHidden && <Icon color="blue" name="angle left" /> }
                                    { !this.state.toolbarHidden && <Icon color="blue" name="angle right" /> }
                                  </Button>
                                  { !this.state.toolbarHidden &&
                                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '5%', paddingBottom: '15%'}}>
                                        { toolCombo && <p> Alternate Between Tools using <b>{toolCombo}</b> key. </p>}
                                        <div>
                                          <Button id="move" icon color={!this.state.drawButton ? 'blue' : 'grey'} onClick={toggleTool.bind(this, false)}>
                                            <Icon name="move" />
                                          </Button>
                                        </div>
                                        <div style={{ height: '20px'}} />
                                        <div>
                                          <Button id="draw" color={this.state.drawButton ? 'blue' : 'grey'} icon onClick={toggleTool.bind(this, true)}>
                                            <Icon name="pencil" />
                                          </Button>
                                        </div>
                                        <div style={{ height: '20px'}} />
                                        <div style={{ height: '20px'}} />
                                        <div style={{ height: '20px'}} />
                                          {this.props.space && this.showButtons()}
                                      </div>
                                  }
                          </div>
                      }
                    </div>
                      <div style={{ height: '20px' }} />
                      {
                        this.props.drawHandle &&
                          <div>
                            {showLabels()}
                          </div>
                      }
      </div>
    );
  }
}
BoxAnnotator.propTypes = {
  image: PropTypes.string,
  drawHandle: PropTypes.func,
  menuHidden: PropTypes.boolean,
  entityColorMap: PropTypes.object,
  rects: PropTypes.array,
  notes: PropTypes.object,
  noteSettings: PropTypes.boolean,
  space: PropTypes.boolean,
  hits: PropTypes.object,
  count: PropTypes.int,
  loading: PropTypes.boolean,
  rectCatMap: PropTypes.object,
  autoClose: PropTypes.boolean,
  hideLabels: PropTypes.boolean,
  fullScreen: PropTypes.boolean,
  skipRow: PropTypes.func,
  saveTagAndNextRow: PropTypes.func,
  getBackTopreviousRow: PropTypes.func,
  currentIndex: PropTypes.int,
  shortcuts: PropTypes.object
};
