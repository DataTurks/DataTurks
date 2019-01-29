import React, {Component, PropTypes} from 'react';
import {Button, Dropdown, Label, Icon} from 'semantic-ui-react';
import {convertKeyToString} from '../../helpers/Utils';
import rangy from 'rangy';

// import { ENTITY_COLORS } from '../../helpers/Utils';
// import Modal from 'react-bootstrap/lib/Modal';
// import Checkbox from 'react-bootstrap/lib/Checkbox';
// import FormGroup from 'react-bootstrap/lib/FormGroup';
const Mousetrap = require('mousetrap');

const UNKNOWN_CAT = 'UNKNOWN';
const UNKNOWN_COLOR = 'grey';
// App component - represents the whole app
export default class DocumentAnnotator extends Component {
  constructor(props) {
    super(props);
    console.log('DocumentAnnotator props', props);
    this.handleSelection = this.handleSelection.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
    this.saveCategory = this.saveCategory.bind(this);
    // this.closeModal = this.closeModal.bind(this);
    let documentText = this.props.documentText;
    if (this.props.urlData) {
      documentText = this.getDocumentText(this.props.documentText);
    }
    this.state = {
      annotations: props.annotations,
      documentText,
      annotationCatMap: props.annotationCatMap,
      entities: Object.keys(props.entityColorMap),
      newEntities: [],
      undoAnnotations: [],
      autoLabel: props.autoLabel,
      postitionAnnotationMap: {},
      firstTime: false
    };
  }

  componentDidMount() {
    console.log('component did mount');
    if (this.props.annotateCallback) {
      let combo = '';
      if (this.props.shortcuts && 'save' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.save);
        Mousetrap.bind(combo, this.saveCategory);
      }
      if (this.props.shortcuts && 'close' in this.props.shortcuts) {
        combo = convertKeyToString(this.props.shortcuts.close);
        Mousetrap.bind(combo, this.saveCategory);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('DocAnnotator nextprops', nextProps);
    if (nextProps.annotations && (this.props.documentText !== nextProps.documentText)) {
      this.setState({
        annotations: nextProps.annotations,
        autoLabel: nextProps.autoLabel,
        newEntities: [],
        menuOpen: false,
        showModal: false,
        showAnnotation: {},
        top: 0
      });
      if (nextProps.urlData) {
        this.setState({ documentText: this.getDocumentText(nextProps.documentText) });
      } else {
        this.setState({ documentText: nextProps.documentText });
      }
    }
    this.setState({newEntities: [], autoLabel: nextProps.autoLabel});
  }

  componentWillUnmount() {
    console.log('DocAnnotator unmount');
    document.removeEventListener('mouseup', this.mouseupHandle);
  }

  getDocumentText(url) {
    fetch(url)
      .then(function(response) {
        // console.log(url + " -> " + response.ok);
        if (response.ok) {
          return response.text();
        }
        throw new Error('Error message.');
      })
      .then(function(data) {
        console.log("data: ", data);
        this.setState({ documentText: data });
      }.bind(this))
      .catch(function(err) {
        alert(' Error in Accessing Text File');
        console.log("failed to load ", url, err);
      });
  }
  getOffsets(e) {
    // const target1 = this.parentDiv;
    // const target2 = this.canvas;
    // // const target4 = this.parentDiv3;
    // // const rect = target1.getBoundingClientRect();
    // // const rect2 = target2.getBoundingClientRect();
    // const rect4 = target4.getBoundingClientRect();
    // const offsetX = e.clientX - this.state.translate.x;
    // const offsetY = e.clientY - this.state.translate.y;
    // const offsetX2 = e.clientX - (this.state.translate.x > 0 ? this.state.translate.x : rect2.left);
    // const offsetY2 = e.clientY - (this.state.translate.y > 0 ? this.state.translate.y : rect2.top);

    const target3 = this.parentDiv;
    const rect3 = target3.getBoundingClientRect();
    // /projects/akilesh, large number of entities
    const offsetY3 = (e.clientY - rect3.top);

    // const offsetX4 = e.clientX - rect4.left;
    // const offsetY4 = e.clientY - rect4.top;
    // console.log('getOffsets', e.offsetX, e.offsetY, rect, rect2, offsetX, offsetY, offsetX2, offsetY2, offsetX3, offsetY3, offsetX4, offsetY4);
    return offsetY3;
  }

  getLabels() {
    const arrs = [];
    const {annotations} = this.state;
    console.log('getLabels', annotations);
    let index = 0;
    for (let index = 0; index < annotations.length; index++) {
      let size = 'mini';
      // if (this.state.mouseHoverMap[key]) {
      //   size = 'medium';
      // }
      arrs.push(<Label size={size} id={index} style={{
          color: 'white',
          overflow: 'auto',
          marginBottom: '0.4rem',
          padding: '0.4rem',
          backgroundColor: `${annotations[index].color[0]}`
        }}>
        {annotations[index].category.join()}
        <br/>
        <p style={{
            fontSize: 'xx-small'
          }}>
          {annotations[index].start}
          to {annotations[index].end}
          <br/> {annotations[index].text}</p>
        {this.props.annotateCallback && <Icon name="delete" id={index} onClick={this.removeLabel.bind(this, index)}/>}
      </Label>);
    }
    return (<div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
      {arrs}
    </div>);
  }

  getSelectionCharOffsetsWithin(element) {
    let start = 0;
    let end = 0;
    const sel = document.selection;
    let range;
    let priorRange;
    if (typeof window.getSelection !== 'undefined') {
      range = window.getSelection().getRangeAt(0);
      priorRange = range.cloneRange();
      priorRange.selectNodeContents(element);
      priorRange.setEnd(range.startContainer, range.startOffset);
      start = priorRange.toString().length;
      end = start + range.toString().length;
    } else if (typeof sel !== 'undefined' && sel.type !== 'Control') {
      range = sel.createRange();
      priorRange = document.body.createTextRange();
      priorRange.moveToElementText(element);
      priorRange.setEndPoint('EndToStart', range);
      start = priorRange.text.length;
      end = start + range.text.length;
    }
    return {start: start, end: end};
  }

  getCharOffsetRelativeTo(container, node, offset, fnode, foffset) {
    console.log('getCharOffsetRelativeTo', Object.keys(node), node.parentNode, node, offset, fnode, foffset);
    // debugger;
    const range = rangy.createRange();
    // var selection = window.getSelection();
    range.selectNodeContents(container);
    range.setEnd(fnode, foffset);
    console.log('rangy selection', rangy.getSelection(), rangy.getSelection().isBackwards());
    if (rangy.getSelection().isBackwards()) {
      range.setEnd(fnode, foffset);
      console.log('getCharOffsetRelativeTo 1', range, range.toString());
      return range.toString().length;
    }
    range.setEnd(node, offset);
    console.log('getCharOffsetRelativeTo 2', range, range.toString());
    return range.toString().length;
  }

  removeLabel(index) {
    const annotations = this.state.annotations;
    annotations[index] = {};
    annotations.splice(index, 1);
    this.setState({
      annotations
    }, () => {
      if (this.props.annotateCallback) {
        console.log('calling drawhandle', this.state);
        this.props.annotateCallback(this.state);
      }
    });
    // this.props.annotateCallback(this.state);
  }

  clearAll() {
    if (window.confirm('Are you sure you wish to clear all tagged items?')) {
      this.setState({annotations: [], annotationCatMap: {}});
    }
  }

  handleSelection(event) {
    if (!this.props.annotateCallback) {
      return;
    }
    if (window.getSelection().toString().length > 0 && window.getSelection().toString() !== ' ') {
      // const myElement = document.getElementById('annotationDoc');
      // console.log('handle selection', Object.keys(event), Object.keys(event.target), window.anchorNode, event.target.offsetTop, window.getSelection().anchorOffset, myElement.attributes,
      // myElement, myElement.selectionStart, myElement.selectionEnd);
      const top = this.getOffsets(event);
      // const rect = event.target.getBoundingClientRect();
      // console.log('scroll top', window.scrollY, window.pageYOffset, rect.top, document.body.scrollTop, event.pageY, event.screenY, event.clientY);
      // const start = window.getSelection().anchorOffset;
      const selectedText = window.getSelection().toString();
      const parentText = document.querySelector('.document').innerText;
      // console.log('selected text is', selectedText);
      // const start = parentText.indexOf(selectedText);
      const indices = [];
      let startIndex = 0;
      let index = 0;
      if (this.props.autoLabel) {
        index = parentText.indexOf(selectedText, startIndex);
        // debugger;
        while (index > -1) {
          indices.push(index);
          startIndex = index + selectedText.length;
          index = parentText.indexOf(selectedText, startIndex);
        }
      } else {
        const sel = window.getSelection();
        console.log('getCharOffsetRelativeTo 0', sel, sel.getRangeAt(0).toString(), sel.getRangeAt(0).startOffset, sel.getRangeAt(0).endOffset);
        const pre = document.getElementById('annotationDoc');
        let offset = this.getCharOffsetRelativeTo(pre, sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);
        // let range =  sel.getRangeAt(0);
        //  let offset = range.startOffset;
        // let node = range.startContainer;
        //  console.log('getCharOffsetRelativeTo 0', range, range.startContainer, range.startContainer.nodeName, range.startContainer.startOffset);
        // if (node.parentNode.id  !== 'annotationDoc') {
        //    node = node.parentNode.getRangeAt(0);
        //   let sid = node.parentNode.dataset.id;
        //   let splits = sid.split('-');
        //   let startIndex = parseInt(splits[0], 10);
        //   let endIndex = parseInt(splits[1], 10);
        //   let spanText = this.props.documentText.substring(startIndex, endIndex + 1);
        //   let currentText = node.data;
        //   let currentOffset = spanText.indexOf(currentText);
        //   if (currentOffset < 0) {
        //     alert('error');
        //   }
        // offset = offset + currentOffset + startIndex;
        // node = node.parentNode;
        // }
        // if (range.startContainer.nodeName === 'PRE') {
        //   offset = sel.getRangeAt(0).startOffset;
        // } else {
        //   console.log('getCharOffsetRelativeTo 0-1', range.startContainer)
        //   offset = sel.getRangeAt(0).startOffset + range.startContainer.nodeName + range.startContainer.startOffset;
        // }
        indices.push(offset);
      }
      // console.log('found indices are ', indices);
      // const start = window.getSelection().anchorOffset;
      // const end = parseInt(start + selectedText.length - 1, 10);
      // const text = window.getSelection().toString();
      // const end = parseInt(start + text.length - 1, 10);
      let annotations = this.state.annotations;
      const newAnnotations = [];
      const undoAnnotations = [];
      const postitionAnnotationMap = this.state.postitionAnnotationMap;
      var new_array = annotations.map(function(e) {
        return e.id;
      });
      const existingAnnotationSet = new Set(new_array);
      const annotationSet = new Set();
      for (index = 0; index < indices.length; index++) {
        const start = parseInt(indices[index], 10);
        const end = parseInt(start + selectedText.length - 1, 10);
        if (end >= start) {
          const category = [];
          const color = [];
          if (this.state.entities.length === 1) {
            category.push(this.state.entities[0]);
            color.push(this.props.entityColorMap[this.state.entities[0]]);
          } else {
            category.push(UNKNOWN_CAT);
            color.push(UNKNOWN_COLOR);
          }
          const id = start + '-' + end;
          if (!existingAnnotationSet.has(id)) {
            annotationSet.add(id);
            newAnnotations.push({
              start,
              end,
              text: selectedText,
              category,
              color,
              id
            });
            if (this.state.entities.length === 1) {
              annotations.push({
                start,
                end,
                text: selectedText,
                category,
                color,
                id
              });
              undoAnnotations.push(id);
            }
            for (let jindex = start; jindex <= end; jindex++) {
              // if (jindex in postitionAnnotationMap) {
              //   const currenvalue = postitionAnnotationMap[jindex];
              //   currenvalue.push({ id, color });
              //   postitionAnnotationMap[jindex] = currenvalue;
              // } else {
              const currenvalue = [
                {
                  id,
                  color
                }
              ];
              postitionAnnotationMap[jindex] = currenvalue;
              // }
            }
          }
        }
      }
      if (this.state.entities.length !== 1) {
        annotations = annotations.concat(newAnnotations);
      }
      // const {start, end} = this.getSelectionCharOffsetsWithin(event.target);
      // console.log('start end are', start, end);
      // const annotations = this.state.annotations;
      // const text = window.getSelection().toString();
      // if (end > start) {
      //   const category = [];
      //   category.push(this.state.entities[0]);
      //   const color = [];
      //   color.push(this.props.entityColorMap[category]);
      //   const id = start + '-' + end;
      //   annotations.push({ start, end: end - 1, text, category, color, id});
      // }
      // this.setState({ annotations, selecting: true, postitionAnnotationMap, menuOpen: true, showModal: true, firstTime: true, showAnnotation: {
      //   annotation: newAnnotations[0],
      //   annotationSet,
      //   undoAnnotations,
      //   top } });
      // debugger;
      if (this.state.entities.length === 1) {
        // this.setState({ undoAnnotations: undoAnnotations}, () => { this.saveCategory(); })
        this.setState({
          annotations,
          undoAnnotations,
          postitionAnnotationMap,
          menuOpen: false,
          showModal: false,
          showAnnotation: {}
        }, () => {
          this.props.annotateCallback(this.state);
        });
        // this.saveCategory();
      } else {
        this.setState({
          annotations,
          selecting: true,
          undoAnnotations,
          postitionAnnotationMap,
          menuOpen: true,
          showModal: true,
          firstTime: true,
          showAnnotation: {
            annotation: newAnnotations[0],
            annotationSet,
            top
          }
        });
        this.props.annotateCallback(this.state);
      }
      console.log(
        'undoAnnotations', this.state.undoAnnotations, this.state.annotations[0]
        ? this.state.annotations[0]
        : '');
    }
  }

  handleMarkerClick(event) {
    event.preventDefault();
    if (!this.props.annotateCallback) {
      return;
    }
    console.log('handleMarkerClick first ', window.getSelection().toString().length, event.target.offsetTop, event.target.dataset.id);
    // const doc = document.querySelector('.document');
    if (event.target.nodeName === 'SPAN' && window.getSelection().toString().length === 0) {
      const annotation = this.state.annotations.filter((annotation1) => {
        console.log('handleMarkerClick ', annotation1.id, event.target.dataset.id);
        if (event.target.dataset.id === annotation1.id) {
          return annotation1;
        }
      });
      console.log('mark clicekd ', annotation);
      if (annotation) {
        const annotationSet = new Set();
        annotationSet.add(annotation[0].id);
        const top = this.getOffsets(event);
        // const top = event.target.offsetTop;
        this.setState({
          showModal: true,
          firstTime: false,
          showAnnotation: {
            annotation: annotation[0],
            top,
            annotationSet
          }
        });
      }
    } else if (this.dropDown && !this.state.selecting) {
      this.saveCategory();
    }
  }

  undo() {
    console.log('undoing');
    const newAnnotations = []
    // let spliced = 0;
    // debugger;
    for (let index = 0; index < this.state.annotations.length; index++) {
      if (this.state.undoAnnotations.indexOf(this.state.annotations[index].id) < 0) {
        newAnnotations.push(this.state.annotations[index]);
      }
    }
    this.setState({
      annotations: newAnnotations,
      undoAnnotations: []
    }, () => {
      this.props.annotateCallback(this.state);
    });
  }

  saveCategory(callbackFlag) {
    console.log('save Category');
    const annotations = this.state.annotations;
    const newAnnotations = [];
    // const undoAnnotations = [];
    for (let index1 = 0; index1 < annotations.length; index1++) {
      if (annotations[index1].color.length !== 0 && (annotations[index1].color.indexOf(UNKNOWN_COLOR) < 0)) {
        newAnnotations.push(annotations[index1]);
      }
    }
    if (callbackFlag) {
      this.state.annotations = newAnnotations;
      this.setState({ showModal: false, showAnnotation: {} })
      this.props.annotateCallback(this.state);
    } else {
      this.setState({
        showModal: false,
        showAnnotation: {},
        annotations: newAnnotations
      }, () => {
        this.props.annotateCallback(this.state);
      });
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
        if (this.props.currentIndex >= 0 && !this.state.showModal) {
          Mousetrap.bind(combo, this.props.saveTagAndNextRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('previous' in shortcuts) {
        const combo = convertKeyToString(shortcuts.previous);
        prevButton = 'Previous (' + combo + ')';
        if (this.props.currentIndex > 0 && !this.state.showModal) {
          Mousetrap.bind(combo, this.props.getBackTopreviousRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('skip' in shortcuts) {
        const combo = convertKeyToString(shortcuts.skip);
        skipButton = 'Skip (' + combo + ')';
        // console.log('setting skip shortcut', combo);
        if (this.props.currentIndex >= 0 && !this.state.showModal) {
          Mousetrap.bind(combo, this.props.skipRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ('moveToDone' in shortcuts) {
        const combo = convertKeyToString(shortcuts.moveToDone);
        saveButton = 'Move To Done (' + combo + ')';
        console.log('setting move to done shortcut', combo);
        if (this.state.showModal) {
          Mousetrap.unbind(combo);
        } else {
          Mousetrap.bind(combo, this.props.saveRow.bind(this, 'saveToDone'));
        }
      }
    }
    return (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: "space-between" }}>
                  <div title={prevButton}>
                    <Button size="mini" color="grey" icon onClick={this.props.getBackTopreviousRow} disabled={this.props.currentIndex <= 0 || this.state.showModal}>
                      <Icon name="left arrow" />
                      {prevButton}
                    </Button>
                  </div>
                  <div title={skipButton}>
                    <Button size="mini" color="grey" icon onClick={this.props.skipRow} disabled={this.props.currentIndex < 0 || this.state.showModal}>
                      <Icon name="mail forward" />
                      {skipButton}
                    </Button>
                  </div>
                  <div title={saveButton} className="text-center">
                    <Button size="mini" color="blue" icon onClick={this.props.saveRow.bind(this, 'saveToDone')} disabled={this.props.currentIndex < 0 || this.state.showModal}>
                      {saveButton}
                    </Button>
                  </div>
                  <div title={nextButton}>
                    <Button size="mini" color="blue" icon onClick={this.props.saveTagAndNextRow} disabled={this.props.currentIndex < 0 || this.state.showModal}>
                      <Icon name="right arrow" />
                      {nextButton}
                    </Button>
                  </div>
          </div>
        );
  }

  render() {
    // function* entries(obj) {
    //   for (const key of Object.keys(obj)) {
    //     yield [key, obj[key]];
    //   }
    // }

    const highlightAnnotationsdoc = (doc, annotations, postitionAnnotationMap, offset) => {
      let highlighted = '';
      const tempAnnotations = [];
      const tempPosnAnnotationMap = {};
      annotations.sort(function(aa, bb) {
        if (aa.start === bb.start) {
          return bb.end - aa.end;
        }
        return bb.start - aa.start;
      });
      for (let jindex = 0; jindex < annotations.length; jindex++) {
        if (annotations[jindex].color.length > 0) {
          tempAnnotations.push(annotations[jindex]);
          const start = annotations[jindex].start;
          const end = annotations[jindex].end;
          const id = annotations[jindex].id;
          const color = annotations[jindex].color;
          for (let kindex = start; kindex <= end; kindex++) {
            if (kindex in tempPosnAnnotationMap) {
              const currenvalue = tempPosnAnnotationMap[kindex];
              currenvalue.push({id, color});
              tempPosnAnnotationMap[kindex] = currenvalue;
            } else {
              const currenvalue = [
                {
                  id,
                  color
                }
              ];
              tempPosnAnnotationMap[kindex] = currenvalue;
            }
          }
        }
      }
      tempAnnotations.sort(function(aa, bb) {
        if (aa.start === bb.start) {
          return bb.end - aa.end;
        }
        return aa.start - bb.start;
      });
      console.log('get highlightAnnotationsdoc ');
      // console.table(tempAnnotations);
      // console.table(tempPosnAnnotationMap);
      // let prevCursor = 0;
      let spanCount = 0;
      let lastDiv = '';
      for (let cursor = 0; cursor < doc.length; cursor++) {
        let endIsZero = 0;
        if (cursor > 0) {
          if (doc[cursor] === '\n' && spanCount > 0) {
            console.log('continuing last div');
            highlighted += '</span>' + doc[cursor] + lastDiv;
          } else {
            highlighted += doc[cursor];
          }
        } else {
          console.log('cursor mismatch', cursor);
        }
        const removeIds = [];
        tempAnnotations.forEach((annotation, index) => {
          let start = annotation.start;
          const end = annotation.end;
          const posnAnnotation = tempPosnAnnotationMap[start];
          const nextAnnotation = tempPosnAnnotationMap[end + 1];
          // const color = annotation.category;
          start = (start !== 0)
            ? start - offset
            : start;
          if (cursor === start && posnAnnotation && posnAnnotation.length > 0 && posnAnnotation[0].color.length > 0) {
            // console.log('going for annotation ', index, cursor, posnAnnotation, nextAnnotation);
            // console.log('posistionColor map start', posnAnnotation, start, spanCount, index);
            let height = 1.4 - spanCount * 0.5;
            if (height < 0.6) {
              height = 0.6;
            }
            lastDiv = `<span data-id="${annotation.id}" class="annotated-span" style="display:inline; background-color:${ (annotation.color[0])}; color: white; font-size:${height}rem">`;
            highlighted += lastDiv;
            spanCount = spanCount + 1;
            if (start === end && end === 0) {
              endIsZero = endIsZero + 1;
            }
          }
          if (cursor === end && annotation.color.length > 0 && end !== 0) {
            console.log('going for annotation ', index, cursor, posnAnnotation, nextAnnotation);
            // console.log('posistionColor map end', nextAnnotation, end, spanCount);
            for (let jindex = 0; jindex < spanCount; jindex++) {
              // console.log('posistionColor map end in loop', cursor);
              highlighted += '</span>';
            }
            /* remove the annotation from the array after it's not needed.
            ** This help with performance for subsequent runs through the loop
            */
            removeIds.push(annotation.id);
            spanCount = spanCount - 1;
            // console.log('splicing', removeIds, spanCount);
            let height = 1.6 - spanCount * 0.2;
            if (height < 0.6) {
              height = 0.6;
            }
            for (let jindex = 0; jindex < spanCount; jindex++) {
              if (nextAnnotation && nextAnnotation.length > 0 && nextAnnotation[0].color.length > 0) {
                // console.log('posistionColor map end-start in loop', cursor);
                // increment = false;
                lastDiv = `<span data-id="${nextAnnotation[0].id}" class="annotated-span" style="display:inline; background-color:${ (nextAnnotation[0].color)[0]}; color: white; font-size:${height}rem">`;
                highlighted += lastDiv;
              }
            }
          }
        });

        for (let kindex = 0; kindex < removeIds.length; kindex++) {
          for (let yindex = 0; yindex < tempAnnotations.length; yindex++) {
            if (removeIds[kindex] === tempAnnotations[yindex].id) {
              tempAnnotations.splice(yindex, 1);
            }
          }
          console.log('spliced');
          // console.table(tempAnnotations);
        }
        if (cursor === 0) {
          highlighted += doc[cursor];
          for (let kindex = 0; kindex < endIsZero; kindex++) {
            highlighted += '</span>';
            spanCount = spanCount - 1;
          }
          endIsZero = 0;
        }
        // prevCursor = cursor;
        // if (increment) { cursor = cursor + 1;}
      }

      return highlighted;
    };

    const selectCategory = (event1, index) => {
      console.log('select category ', event1.target.id, index, this.state);
      // const id = event1.target.id;
      const values = index.value;
      const showAnnotation = this.state.showAnnotation;
      const annotation = showAnnotation.annotation;
      // const currentCat = annotation.category;
      // const currentCol = annotation.color;
      const newCats = [];
      const newCols = [];
      const undoAnnotations = [];
      // const col = this.props.entityColorMap[id];
      for (let index1 = 0; index1 < values.length; index1++) {
        if (values[index1] !== UNKNOWN_CAT) {
          newCats.push(values[index1]);
          if (values[index1] in this.props.entityColorMap) {
            newCols.push(this.props.entityColorMap[values[index1]]);
          } else {
            newCols.push('brown');
          }
        }
      }
      // if (currentCat.length > 1) {
      //   const catIndex = currentCat.indexOf(UNKNOWN_CAT);
      //   const colIndex = currentCol.indexOf(UNKNOWN_COLOR);
      //   if (catIndex > -1) {
      //     currentCat.splice(catIndex, 1);
      //   }
      //   if (colIndex > -1) {
      //     currentCol.splice(colIndex, 1);
      //   }
      // }
      annotation.category = newCats;
      annotation.color = newCols;
      showAnnotation.annotation = annotation;
      const annotationSet = this.state.showAnnotation.annotationSet;
      const annotations = this.state.annotations;
      const postitionAnnotationMap = this.state.postitionAnnotationMap;
      for (let index1 = 0; index1 < annotations.length; index1++) {
        if (annotationSet.has(annotations[index1].id)) {
          console.log('updating id ', annotations[index1]);
          annotations[index1].category = [].concat(annotation.category);
          annotations[index1].color = [].concat(annotation.color);
          const start = annotations[index1].start;
          const end = annotations[index1].end;
          undoAnnotations.push(annotations[index1].id);
          for (let jindex = start; jindex <= end; jindex++) {
            // if (jindex in postitionAnnotationMap) {
            //   const currenvalue = postitionAnnotationMap[jindex];
            //   currenvalue.push({ id: annotations[index1].id, color: annotations[index1].color });
            //   postitionAnnotationMap[jindex] = currenvalue;
            // } else {
            const currenvalue = [
              {
                id: annotations[index1].id,
                color: annotations[index1].color
              }
            ];
            postitionAnnotationMap[jindex] = currenvalue;
            // }
          }
        }
      }

      this.setState({showAnnotation, annotations, undoAnnotations, postitionAnnotationMap, selecting: false});
      if (this.props.autoClose) {
        this.saveCategory();
      }
    };
    const handleAddition = (event, {value}) => {
      console.log('handleAddition', value, this.props);
      this.setState({
        entities: [
          ...this.state.entities,
          value
        ],
        newEntities: [
          ...this.state.newEntities,
          value
        ]
      }, () => {
      if (this.props.annotateCallback) {
        console.log('calling drawhandle', this.state);
        this.props.annotateCallback(this.state);
      }
    });
    };
    const getOptions = (index) => {
      const arrs = [];
      const values = [];
      let index1 = 0;
      console.log('getOptions', this.state);
      const categories = this.state.showAnnotation.annotation.category;
      for (index1 = 0; index1 < categories.length; index1++) {
        if (categories[index] !== UNKNOWN_CAT) {
          values.push(categories[index1]);
        }
      }
      index1 = 0;
      for (index1 = 0; index1 < this.state.entities.length; index1++) {
        const key = this.state.entities[index1];
        arrs.push({key: index1, text: key, value: key});
      }
      // for (const [key, value] of entries(this.props.entityColorMap)) {
      //    console.log('value is', key, value, index);
      //    const checked = annotation.category.indexOf(key) >= 0 ? true : false;
      // }
      console.log('values', values);
      // return ( <FormGroup>
      //               {arrs}
      //           </FormGroup>);
      return (<Dropdown tabIndex="1" ref={node => this.dropDown = node} closeOnChange="closeOnChange" closeOnBlur={false} open={this.state.menuOpen} selectOnNavigation="selectOnNavigation" scrolling="scrolling" allowAdditions="allowAdditions" additionPosition="bottom" fluid="fluid" multiple="multiple" selection="selection" className="tiny" onAddItem={handleAddition} onChange={selectCategory} options={arrs} value={values} search={this.state.menuOpen} searchInput={{
          autoFocus: this.state.menuOpen
        }} placeholder="Add Labels" id={index} onClose={() => {
          console.log('onclose');
          this.setState({menuOpacity: '0.4', menuOpen: false});
        }} onFocus={() => {
          console.log('onfocus');
          this.setState({menuOpacity: '1.0', menuOpen: true});
        }} button="button" additionLabel="New Item: "/>);
    };
    // const { image } = this.props;  logic to render when it's found
    console.log('DocumentAnnotator state', this.state, this.props);
    let annotated = ''
    if (this.state.documentText) {
      annotated = highlightAnnotationsdoc(this.state.documentText, this.state.annotations, this.state.postitionAnnotationMap, 1);
    }
    let saveButton = 'Save';
    if (this.props.shortcuts && 'save' in this.props.shortcuts) {
      saveButton = saveButton + ' (' + convertKeyToString(this.props.shortcuts.save) + ' )';
    }

    let closeButton = '';
    if (this.props.shortcuts && 'close' in this.props.shortcuts) {
      closeButton = closeButton + ' (' + convertKeyToString(this.props.shortcuts.close) + ' )';
    }
    for (let index = 0; index < this.state.annotations.length; index++) {
      console.log('render annotation', this.state.annotations[index]);
    }

    return (<div style={{
        minHeight: '300px'
      }}>
      <div>
        {
          (this.state.showModal && this.state.showAnnotation && this.state.showAnnotation.annotation && this.state.showAnnotation.annotation.id)
            ? <div className="annotation-modal col-xs-8 col-sm-6 col-md-4 col-lg-4" style={{
                  top: this.state.showAnnotation.top,
                  left: this.state.showAnnotation.left
                }}>
                <Button className="annotation-modal-save" onClick={this.saveCategory} style={{
                    backgroundColor: 'white'
                  }}>
                  <Icon name="save"/>{saveButton}
                </Button>
                <Button className="annotation-modal-close" onClick={this.saveCategory} style={{
                    backgroundColor: 'white'
                  }}>
                  <Icon name="close"/> {closeButton}
                </Button>
                <div className="annotation" key={this.state.showAnnotation.annotation.id}>
                  <span className="annotation-text">
                    <p className="annotation-text">{this.state.showAnnotation.annotation.text}</p>
                  </span>
                  {getOptions()}
                </div>
              </div>
            : false
        }
        <pre id="annotationDoc" ref={(parentDiv) => this.parentDiv = parentDiv} className="document" style={{ lineHeight: '2.0rem', wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }} onMouseDown={ (event) => { if (event.detail > 1) { console.log('mouse down event', event); event.preventDefault(); }}} onClick={ this.handleMarkerClick } onMouseUp={ this.handleSelection }
            dangerouslySetInnerHTML = {
              {
                __html: annotated
              }
            }>
        </pre>
        </div>
        {this.props.space && this.showButtons()}
      </div>);
  }
}
DocumentAnnotator.propTypes = {
  documentText: PropTypes.string,
  annotateCallback: PropTypes.func,
  entityColorMap: PropTypes.object,
  shortcuts: PropTypes.object,
  annotations: PropTypes.array,
  space: PropTypes.bool,
  autoLabel: PropTypes.bool,
  autoClose: PropTypes.bool,
  urlData: PropTypes.bool,
  annotationCatMap: PropTypes.object,
  skipRow: PropTypes.func,
  saveTagAndNextRow: PropTypes.func,
  getBackTopreviousRow: PropTypes.func,
  saveRow: PropTypes.func,
  currentIndex: PropTypes.int,
  hits: PropTypes.object
};
