import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
import { uploadDataForm, setCurrentHit, updateProjectDetails, setCurrentProject, getProjectDetails } from 'redux/modules/dataturks';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
import { fetchHitsDetails, getUidToken, addHits } from '../../helpers/dthelper';
import { push, goBack } from 'react-router-redux';
import { Table, Label, Dropdown, Button, Icon, Divider, Segment, Breadcrumb } from 'semantic-ui-react';

import { getDetaultShortcuts, checkVideoURL, convertKeyToString, VIDEO_CLASSIFICATION, VIDEO_BOUNDING_BOX, IMAGE_CLASSIFICATION, POS_TAGGING_GENERIC, DOCUMENT_ANNOTATION, IMAGE_POLYGON_BOUNDING_BOX, IMAGE_POLYGON_BOUNDING_BOX_V2, IMAGE_BOUNDING_BOX, createEntitiesJson, createDocEntityColorMap, TEXT_MODERATION, POS_TAGGING, TEXT_SUMMARIZATION, TEXT_CLASSIFICATION } from '../../helpers/Utils';
import BoxAnnotator from '../../components/BoxAnnotator/BoxAnnotator';
import BoxAnnotatorOld from '../../components/BoxAnnotatorOld/BoxAnnotator';
import PolygonAnnotator from '../../components/PolygonAnnotator/PolygonAnnotator';
import PolygonAnnotatorOld from '../../components/PolygonAnnotatorOld/PolygonAnnotator';
import DocumentAnnotator from '../../components/DocumentAnnotator/DocumentAnnotator';
import PolygonAnnotatorV2 from '../../components/PolygonAnnotatorV2/PolygonAnnotator';
import { Player, ControlBar, ForwardControl, PlaybackRateMenuButton } from 'video-react';
import VideoAnnotator from '../../components/VideoAnnotator/VideoAnnotator';

const Mousetrap = require('mousetrap');

const styles = require('./TaggerOveriew.scss');

@connect(
  state => ({user: state.auth.user,
    currentPathOrg: state.dataturksReducer.currentPathOrg,
    currentPathProject: state.dataturksReducer.currentPathProject,
   currentProject: state.dataturksReducer.currentProject, projectDetails: state.dataturksReducer.projectDetails }),
  dispatch => bindActionCreators({ uploadDataForm, pushState: push, goBack, getProjectDetails, setCurrentHit, updateProjectDetails, setCurrentProject }, dispatch))
export default class TaggerOveriew extends Component {
  static propTypes = {
    user: PropTypes.object,
    uploadDataForm: PropTypes.func,
    currentProject: PropTypes.string,
    pushState: PropTypes.func,
    setCurrentHit: PropTypes.func,
    updateProjectDetails: PropTypes.func,
    goBack: PropTypes.func,
    projectDetails: PropTypes.object,
    params: PropTypes.object,
    orgName: PropTypes.string,
    projectName: PropTypes.string,
    setCurrentProject: PropTypes.func,
    getProjectDetails: PropTypes.func,
    location: PropTypes.object,
    query: PropTypes.object,
    type: PropTypes.string,
    label: PropTypes.string,
    currentPathProject: PropTypes.string,
    currentPathOrg: PropTypes.string
  }

  constructor(props) {
    super(props);
    let type = 'all';
    if (props.location && props.location.query && props.location.query.type) {
      type = props.location.query.type;
    }
    let label = undefined;
    if (props.location && props.location.query && props.location.query.label) {
      label = props.location.query.label;
    }
    let contributorId = undefined;
    if (props.location && props.location.query && props.location.query.contributorId) {
      contributorId = props.location.query.contributorId;
    }
    this.loadProjectDetails = this.loadProjectDetails.bind(this);
    this.projectDetailsFetched = this.projectDetailsFetched.bind(this);
    this.showTagLine = this.showTagLine.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);
    this.editHit = this.editHit.bind(this);
    this.hitAddCallback = this.hitAddCallback.bind(this);
    this.state = {
      hitsDetails: null,
      type,
      label,
      contributorId,
      projectDetails: this.props.projectDetails,
      entities: [],
      mouseState: {},
      shortcuts: {},
      start: 0,
      count: 50,
      currentCount: 50,
      loading: false
    };
  }

  componentWillMount() {
    console.log('TaggerStats componentWillMount');
  }

  componentDidMount() {
    console.log('Did mount TaggerOverview ', this.state.hitsDetails);
    if (!this.state.hitsDetails && this.props.currentProject) {
      if (!this.props.projectDetails) {
        this.props.getProjectDetails(this.props.currentProject, getUidToken());
      }
      this.loadProjectDetails(this.props.currentProject, this.state.start, this.state.count);
    } else if ((this.props.params.orgName && this.props.params.projectName &&
      (!this.props.projectDetails || (this.props.projectDetails.name !== this.props.params.projectName || this.props.projectDetails.orgName !== this.props.params.orgName))) ||
    !this.props.currentProject) {
      this.props.setCurrentProject({orgName: this.props.params.orgName, projectName: this.props.params.projectName}, getUidToken());
    }
    // this.loadData()
    // .then((data) => {
    //   console.log('Data loaded');
    //   this.setState({
    //     data: data,
    //     loading: false
    //   });
    // });
  }
  componentWillReceiveProps(nextProps) {
    console.log('next props in TaggerOveriew', this.props, nextProps, this.state);
    if (this.props.currentProject !== nextProps.currentProject) {
      this.props.getProjectDetails(nextProps.currentProject, getUidToken());
      this.setState({ loading: true });
    }
    if (!this.props.projectDetails && nextProps.projectDetails ||
      (this.props.location !== nextProps.location)) {
      if (nextProps.location && nextProps.location.query && nextProps.location.query.type) {
        this.state.type = nextProps.location.query.type;
      }
      if (nextProps.location && nextProps.location.query && nextProps.location.query.label) {
        this.state.label = nextProps.location.query.label;
      }
      if (nextProps.location && nextProps.location.query && nextProps.location.query.contributorId) {
        this.state.contributorId = nextProps.location.query.contributorId;
      }

      this.loadProjectDetails(nextProps.currentProject, this.state.start, this.state.count);
    }
  }

  componentWillUnmount() {
    console.log('unmounting Component');
    this.setState({ hitsDetails: undefined });
  }

 onMouseEnter(id) {
   const mouseState = this.state.mouseState;
   mouseState[id] = true;
   this.setState({ mouseState });
 }

 onMouseLeave(id) {
   const mouseState = this.state.mouseState;
   mouseState[id] = false;
   this.setState({ mouseState });
 }

 getUrl(type, contributorId, entity) {
   console.log('entity is', type, contributorId, entity, this.state);
   let url = '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/overview?';
   if (type) {
     url = url + 'type=' + type;
   }
   if (contributorId) {
     url = url + '&contributorId=' + contributorId;
   }
   if (entity) {
     url = url + '&label=' + entity;
   }
   return url;
 }

 getContributors(contributorDetails) {
   const options = [];
   let selected = '';
   if (contributorDetails) {
     for (let index = 0; index < contributorDetails.length && index < 50; index ++) {
       // let active = false;
       if (this.state.contributorId === contributorDetails[index].userDetails.uid) {
         // active = true;
         selected = contributorDetails[index].userDetails.uid;
       }
       options.push({
         text: contributorDetails[index].userDetails.firstName,
         value: contributorDetails[index].userDetails.uid,
         image: { avatar: true, src: contributorDetails[index].userDetails.profilePic},
         onClick: () => { this.state.start = 0; this.props.pushState(this.getUrl(this.state.type, contributorDetails[index].userDetails.uid, this.state.label));}
       });
     }
     console.log('options are', options);
     return (
        <Dropdown value={selected} placeholder="Select Contributor" selection options={options} />
      );
   }
 }

  loadNextPage() {
    const newCount = this.state.currentCount + this.state.count;
    console.log(' loading next page ', this.state, newCount);
    this.setState({ loading: true, currentCount: newCount });
    this.loadProjectDetails(this.props.currentProject, this.state.start, newCount);
  }

  editHit(hit) {
    console.log(' edit hit 1', this.props.params.orgName);
    this.props.updateProjectDetails(this.state.projectDetails);
    this.props.setCurrentHit(hit);
    let url;
    if (this.state.type === 'skipped') {
      url = '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/space?type=skipped';
    } else {
      url = '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/space?type=done';
    }
    if (this.state.label) {
      url = url + '&label=' + this.state.label;
    }
    if (this.state.contributorId) {
      url = url + '&contributorId=' + this.state.contributorId;
    }
    this.props.pushState(url);
  }

  projectDetailsFetched(error, response) {
    console.log(' project details fetched ', error, response);
    if (!error) {
      // const projectDetails = response.body.projectDetails;
      let projectDetails = undefined;
      if (response.body.projectDetails) {
        projectDetails = response.body.projectDetails;
      } else if (this.props.projectDetails) {
        projectDetails = this.props.projectDetails;
      }
      let entities = [];
      let entityColorMap = {};
      if (projectDetails.task_type === POS_TAGGING ||
       projectDetails.task_type === IMAGE_BOUNDING_BOX || projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX ||
        projectDetails.task_type === TEXT_CLASSIFICATION || projectDetails.task_type === IMAGE_CLASSIFICATION || projectDetails.task_type === VIDEO_CLASSIFICATION ||
        projectDetails.task_type === DOCUMENT_ANNOTATION || projectDetails.task_type === POS_TAGGING_GENERIC ||
        projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 || projectDetails.task_type === VIDEO_BOUNDING_BOX) {
        entities = createEntitiesJson(projectDetails.taskRules).entities;
        entityColorMap = createDocEntityColorMap(entities);
      }
      const rules = JSON.parse(projectDetails.taskRules);
      let shortcuts = getDetaultShortcuts(projectDetails.task_type, entities);
      if ('shortcuts' in rules) {
        shortcuts = rules.shortcuts;
      }
      let scrollCompleted = false;
      if (response.body.hits.length < this.state.currentCount) {
        scrollCompleted = true;
      }
      if (projectDetails.task_type === IMAGE_BOUNDING_BOX || projectDetails.task_type === IMAGE_BOUNDING_BOX || projectDetails.task_type === IMAGE_CLASSIFICATION) {
        const images = [];
        for ( let index = 0; index < response.body.hits.length; index ++) {
          const image1 = new Image(); // eslint-disable-line no-undef
          image1.src = response.body.hits[index].data;
          images.push(image1);
        }
      }

      this.setState({ loading: false, shortcuts, scrollCompleted, entities, entityColorMap, hitsDetails: response.body.hits });
    }
  }


  loadProjectDetails(pid, start, count) {
    this.setState({loading: true});
    fetchHitsDetails(pid, start, count, this.projectDetailsFetched, this.state.type, this.state.label, this.state.contributorId);
  }

  tagClick() {
    console.log('tag clicked');
  }

 showTags = (entiti) => {
   const renderArrs = [];
   for (let index = 0; index < entiti.length; index ++) {
     const entity = entiti[index];
     const color = this.state.entityColorMap[entity];
     let onClickFn = undefined;
     if (this.state.label === entity) {
       onClickFn = () => { this.state.label = undefined; this.props.pushState(this.getUrl(this.state.type, this.state.contributorId, null));};
     } else {
       onClickFn = () => {this.state.start = 0; this.props.pushState(this.getUrl(this.state.type, this.state.contributorId, entity));};
     }
     renderArrs.push(
       <Label size="large" as="a"
        onClick={() => onClickFn()}
        style={{ padding: '5px', color: 'white', backgroundColor: color}} name={entity} key={index}>
           {entity}
           { this.state.label === entity &&
            <Icon name="delete" />
           }
      </Label>
    );
   }

   return (
          <div>
            {renderArrs}
          </div>
        );
 };


  showTagLine(hit) {
    let tagLine = hit.data;
    let data = hit.data;
    if (hit.hitResults && hit.hitResults.length > 0) {
      tagLine = hit.hitResults[0].result;
    }
    const id = hit.id;
    const renderArrs = [];

    try {
      const resultJson = JSON.parse(tagLine);
      const labelMap = {};
      let words = data.split(" ");
      for (let index = 0; index < resultJson.length; index ++) {
        const points = resultJson[index].points;
        const text = points[0].text;
        const entity = resultJson[index].label[0];
        labelMap[text] = entity;
      }
      for (let index = 0; index < words.length; index ++) {
        let color = 'grey';
        let entity = '';
        if (words[index] in labelMap) {
          color = this.state.entityColorMap[labelMap[words[index]]];
          entity = labelMap[words[index]];
        }
        const word = words[index].trim();

        renderArrs.push(
            <Label size="large"
                name={index} style={{ color: 'white', backgroundColor: color}} key={index}>
              <span name={index} key={index}>
                {word}
              </span>
              {entity !== '' &&
              <p className={styles.entityTag} style={{display: 'inline', fontSize: '1rem'}}>
               &nbsp; &nbsp; &nbsp; &nbsp; {entity}
              </p>
              }

            </Label>
          );
      }
    } catch (exception) {
      // statements
        const splits = tagLine.split(' ');
        for (let index = 0; index < splits.length; index++) {
          let word = splits[index].trim();
          if (word.length > 0) {
            const wordSplits = word.split('____');
            let color = 'grey';
            let entity = '';
            if (wordSplits.length > 1) {
              color = this.state.entityColorMap[wordSplits[1]];
              entity = wordSplits[1];
              word = wordSplits[0];
            }
            renderArrs.push(
                <Label size="large"
                    name={index} style={{ color: 'white', backgroundColor: color}} key={index}>
                  <span name={index} key={index}>
                    {word}
                  </span>
                  {entity !== '' &&
                  <p className={styles.entityTag} style={{display: 'inline', fontSize: '1rem'}}>
                   &nbsp; &nbsp; &nbsp; &nbsp; {entity}
                  </p>
                  }

                </Label>
              );
          }
        }
      }

    //   const splits = tagLine.split(" ");
    //   for (let index = 0; index < splits.length; index++) {
    //     const word = splits[index];
    //     const wordSplits = word.split("____");
    //     if (wordSplits.length > 1) {
    //       clickedColor[index] = this.state.entityColorMap[wordSplits[1]];
    //       taggedEntity[index] = wordSplits[1];
    //       words[index] = wordSplits[0];
    //     } else {
    //       clickedColor[index] = "";
    //       taggedEntity[index] = "__";
    //       words[index] = splits[index];
    //     }
    //   }
    // }

    let buttonC = 'hidden';
    let tagC = 'text-left tagArea';
    if (this.state.mouseState[id] && this.state.mouseState[id] === true) {
      buttonC = '';
      tagC = 'text-left highlightedTagArea';
    }

    return (
      <div className={`${tagC}`} onMouseEnter={this.onMouseEnter.bind(this, id)} onMouseLeave={this.onMouseLeave.bind(this, id)}>
        {
          renderArrs
        }
         <Button icon size="mini" primary className={buttonC + ' pull-right'} onClick={this.editHit.bind(this, hit)}>
                          <Icon name="edit" />
                        </Button>
      </div>
      );
  }

  openExport = () => {
    this.props.pushState('/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/export');
  }

 showHits = (hitsDetails) => {
   console.log('show hits details ', hitsDetails);
   const renderArrs = [];
   for (let index = 0; index < hitsDetails.length; index++) {
     renderArrs.push(
      this.showTagLine(hitsDetails[index])
    );
   }
   return renderArrs;
 }

 previousElement(event) {
   console.log('event', event);
   if (this.state.start > 0) {
     this.setState({ start: this.state.start - 1});
   }
 }

 nextElement(event) {
   console.log('event', event, this.state);
   if (this.state.start < this.state.currentCount - 1) {
     this.setState({ start: this.state.start + 1});
   } else {
     const newCount = this.state.currentCount + this.state.count;
     this.setState({ loading: true, currentCount: newCount });
     this.loadProjectDetails(this.props.currentProject, 0, newCount);
   }
 }

editElement(event) {
  console.log('event', event);
  console.log(' edit hit ', this.state.projectDetails);
  this.props.updateProjectDetails(this.state.projectDetails);
  this.props.setCurrentHit(this.state.hitsDetails[this.state.start]);
  let url;
  if (this.state.type === 'skipped') {
    url = '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/space?type=skipped';
  } else {
    url = '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/space?type=done';
  }
  if (this.state.label) {
    url = url + '&label=' + this.state.label;
  }
  if (this.state.contributorId) {
    url = url + '&contributorId=' + this.state.contributorId;
  }
  this.props.pushState(url);
}

hitAddCallback(error, response) {
  console.log('hitAddCallback', error, response);
  this.setState({ loading: false });
  if (!error) {
    const hitsDetails = this.state.hitsDetails;
    hitsDetails.splice(this.state.start, 1);
    let start = this.state.start - 1;
    if (start === -1) start = 0;
    this.setState({ hitsDetails, start });
    this.props.getProjectDetails(this.props.currentProject, getUidToken());
  } else {
    alert('Error in adding hit, please try again ');
  }
}

moveToDone() {
  console.log('event', event);
  console.log(' edit hit ', this.state.projectDetails);
  // this.props.updateProjectDetails(this.state.projectDetails);
  // this.props.setCurrentHit(this.state.hitsDetails[this.state.start]);
  // let url;
  const currentHit = this.state.hitsDetails[this.state.start];
  let result = '';
  let timeTakenToLabelInSec = 1;
  if (currentHit.hitResults && currentHit.hitResults.length > 0) {
    result = currentHit.hitResults[0].result;
    timeTakenToLabelInSec = currentHit.hitResults[0].timeTakenToLabelInSec;
  }
  this.setState({ loading: true });
  addHits(currentHit.id, { result, timeTakenToLabelInSec }, this.props.currentProject, this.hitAddCallback);
  // if (this.state.type === 'skipped') {
  //   url = '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/space?type=skipped';
  // } else {
  //   url = '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/space?type=done';
  // }
  // if (this.state.label) {
  //   url = url + '&label=' + this.state.label;
  // }
  // if (this.state.contributorId) {
  //   url = url + '&contributorId=' + this.state.contributorId;
  // }
  // this.props.pushState(url);
}

showCurrentTags(tags) {
  console.log(' show current tags ', this.state);
  const { entityColorMap } = this.state;
  const renderArrs = [];
  for (const ent of tags) {
    console.log('show current tag', ent, entityColorMap[ent]);
    renderArrs.push(
      <Label key={ent} style={{ padding: '5px', color: 'white', backgroundColor: entityColorMap[ent]}}> {ent}
      </Label>
    );
  }
  return (<div> {renderArrs} </div>);
}

showClassifications = (hitsDetails) => {
  if (hitsDetails && hitsDetails.length === 0) {
    return (
      <h2>No Sample HITs</h2>
    );
  }
  const currentHit = hitsDetails[this.state.start];
  const data = currentHit.data;
  let result = '';
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0].result.length > 0) {
    result = currentHit.hitResults[0].result;
  }
  let currentTags = [];
  let currentNote = '';
  console.log('result is', result);
  try {
    const resultJson = JSON.parse(result);
    if (resultJson.labels) {
      currentTags = new Set(resultJson.labels);
    } else {
      currentTags = result;
    }
    if (resultJson.note) {
      currentNote = resultJson.note;
    }
  } catch (exception) {
    // statements
    console.log('exception', exception);
    if (currentHit.hitResults && currentHit.hitResults.length > 0) {
      currentTags = new Set(currentHit.hitResults[0].result.split('____'));
    }
  }
  return (
    <div>
      <div className={styles.dataArea}>
        <p>
          {data}
        </p>
        <br />
        {this.showCurrentTags(currentTags)}
        <br />
      </div>
      <br />
        {currentNote && currentNote.length > 0 &&
                            <div>
                              <p size="tiny" style={{whiteSpace: 'pre-wrap', marginLeft: '10%'}}>
                                <Icon color="teal" name="sticky note" /> {currentNote}
                              </p>
                            </div>}
      <br />
      <br />
        {this.showButtons()}
    </div>
  );
}

showButtons = () => {
  console.log('setting shortcuts', this.state);
  if ('shortcuts' in this.state) {
    const shortcuts = this.state.shortcuts;
    if ('next' in shortcuts) {
      const combo = convertKeyToString(shortcuts.next);
      if (this.state.start >= 0) {
        Mousetrap.bind(combo, this.nextElement.bind(this, 'next'));
      } else {
        Mousetrap.unbind(combo);
      }
    }
    if ('previous' in shortcuts) {
      const combo = convertKeyToString(shortcuts.previous);
      if (this.state.start > 0) {
        Mousetrap.bind(combo, this.previousElement.bind(this, 'previous'));
      } else {
        Mousetrap.unbind(combo);
      }
    }
    if ('skip' in shortcuts) {
      const combo = convertKeyToString(shortcuts.skip);
      if (this.state.start >= 0) {
        Mousetrap.bind(combo, this.editElement.bind(this, 'skip'));
      } else {
        Mousetrap.unbind(combo);
      }
    }
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
    <div>
      <Button size="mini" color="grey" icon labelPosition="left" onClick={this.previousElement.bind(this, 'pervious')} disabled={this.state.start === 0}>
        <Icon name="left arrow" />
        Previous
      </Button>
    </div>
    <div>
      <Button size="mini" color="grey" icon labelPosition="left" onClick={this.editElement.bind(this, 'edit')}>
        <Icon name="edit" />
        edit
      </Button>
    </div>
    { this.state.type === 'skipped' &&
    <div>
      <Button size="mini" color="green" icon labelPosition="left" onClick={this.moveToDone.bind(this, 'move')}>
        <Icon name="check" />
        Move to Completed
      </Button>
    </div>
    }
    <div>
      <Button size="mini" color="blue" loading={this.state.loading} icon labelPosition="right" onClick={this.nextElement.bind(this, 'right')} disabled={this.state.start < 0 || (this.state.scrollCompleted && this.state.start === this.state.hitsDetails.length - 1)}>
        Next
        <Icon name="right arrow" />
      </Button>
    </div>
  </div>);
}

showBoundedImages = (hitsDetails) => {
  if (hitsDetails && hitsDetails.length === 0) {
    return (
      <h2>No Sample HITs</h2>
    );
  }
  const currentHit = hitsDetails[this.state.start];
  let result = '{}';
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0].result.length > 0) {
    result = currentHit.hitResults[0].result;
  }

  console.log('bounded images are ', currentHit);
  const data = currentHit.data;
  console.log('show text', this.state);
  const rects = [];
  const rectCatMap = {};
  const noteMap = {};
  const bbmap = JSON.parse(result);
  let notes = 'new';
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0] && currentHit.hitResults[0].notes) {
    notes = currentHit.hitResults[0].notes;
  }
  if (bbmap) {
    for (let index = 0; index < bbmap.length; index ++) {
      const points = {};
      points.x1 = bbmap[index].points[0].x;
      points.x2 = bbmap[index].points[1].x;

      points.y1 = bbmap[index].points[0].y;
      points.y2 = bbmap[index].points[1].y;

      rects.push(points);
      rectCatMap[index] = bbmap[index].label;
      noteMap[index] = bbmap[index].notes;
    }
  }
  return (
    <div>
      { notes === 'new' && <BoxAnnotator space={false} rects={rects} notes={noteMap} rectCatMap={rectCatMap} image={data} entityColorMap={this.state.entityColorMap}/> }
      { notes === 'old' && <BoxAnnotatorOld rects={rects} rectCatMap={rectCatMap} image={data} entityColorMap={this.state.entityColorMap}/> }
      <br />
      <br />
      <br />
      {this.showButtons()}
    </div>
  );
}
showClassificationTags = (classificationResult) => {
  const renderArrs = [];
  for (let index = 0; index < classificationResult.length; index ++) {
    const classification = classificationResult[index];
    const classes = classification.classes;
    const classArrs = [];
    for (let jindex = 0; jindex < classes.length; jindex ++) {
      classArrs.push(<Label size="mini">{classes[jindex]} </Label>)
    }
    renderArrs.push(
      <div className="well well-sm">
        <label>{classification.name}</label>
        <br />
        {classArrs}
      </div>
      );
  }
  return (<div> {renderArrs} </div>);
}

showDocs = (hitsDetails) => {
  if (hitsDetails && hitsDetails.length === 0) {
    return (
      <h2>No Sample HITs</h2>
    );
  }
  const currentHit = hitsDetails[this.state.start];
  let result = '{}';
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0].result.length > 0) {
    result = currentHit.hitResults[0].result;
  }
  let classificationObj = undefined;
  if (this.state.projectDetails && this.state.projectDetails.taskRules) {
    let ruleJson = JSON.parse(this.state.projectDetails.taskRules);
    if ('classification' in ruleJson) {
      classificationObj = ruleJson.classification;
    }
  }

  console.log('bounded images are ', currentHit);
  const data = currentHit.data;
  console.log('show text', this.state);
  const annotations = [];
  let classificationResult = undefined;
  let bbmap = undefined;
  console.log('show showPolygonImages', result);
  if (result.length > 0) {
    const resultObject = JSON.parse(result);
    if (classificationObj) {
      if ('annotationResult' in resultObject) {
        bbmap = resultObject.annotationResult;
        classificationResult = resultObject.classificationResult;
      } else {
        bbmap = resultObject;
      }
    } else {
      bbmap = resultObject;
    }
    if (bbmap) {
      for (let index = 0; index < bbmap.length; index ++) {
        const bb = bbmap[index];
        const colors = [];
        for (let jindex = 0; jindex < bb.label.length; jindex ++) {
          colors.push(this.state.entityColorMap[bb.label[jindex]]);
        }
        annotations.push({ category: bb.label, start: bb.points[0].start, end: bb.points[0].end, text: bb.points[0].text, id: bb.points[0].start + '-' + bb.points[0].end,
        color: colors});
      }
    }
  }
  return (
    <div>
      { classificationResult && this.showClassificationTags(classificationResult)}
                                                          <h3> Entities </h3>
                                                          {this.showTags(this.state.entities)}
                                                          <br />
      <DocumentAnnotator annotations={annotations} documentText={data} entityColorMap={this.state.entityColorMap}/>
      <br />
      <div>
        <div className="col-md-6 col-xs-4">
          <Button size="mini" color="grey" icon labelPosition="left" onClick={this.previousElement.bind(this, 'pervious')} disabled={this.state.start === 0}>
            <Icon name="left arrow" />
            Previous
          </Button>
        </div>
        <div className="col-xs-4">
        </div>
        <div className="col-md-6 col-xs-4">
          <Button size="mini" color="blue" icon labelPosition="right" onClick={this.nextElement.bind(this, 'right')} disabled={this.state.start < 0 || (this.state.start >= this.state.hitsDetails.length - 1)}>
            Next
            <Icon name="right arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
}


showVideoAnnotation = (hitsDetails) => {
  if (hitsDetails && hitsDetails.length === 0) {
    return (
      <h2>No Sample HITs</h2>
    );
  }
  const currentHit = hitsDetails[this.state.start];
  let result = '{}';
  console.log('currentHit', currentHit);
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0].result.length > 0) {
    result = currentHit.hitResults[0].result;
  }
  // const result = currentHit.hitResults[0].result;

  console.log('bounded images are ', currentHit);
  const data = currentHit.data;
  console.log('show text', this.state);
  const rects = [];
  // let notes = 'new';
  // if (currentHit.hitResults[0] && currentHit.hitResults[0].notes) {
  //   notes = currentHit.hitResults[0].notes;
  // }
  const rectCatMap = {};
  const rectShapeMap = {};
  const rectTimeMap = {}
  console.log('show showPolygonImages', result);
  if (result.length > 0) {
    const bbmap = JSON.parse(result);
    if (bbmap) {
      for (let index = 0; index < bbmap.length; index ++) {
        rects[index] = bbmap[index].positions[0].points;
        rectCatMap[index] = bbmap[index].label;
        if (bbmap[index].shape) {
          rectShapeMap[index] = bbmap[index].shape;
        }
        if (bbmap[index].startTime && bbmap[index].endTime) {
          rectTimeMap[index] = [bbmap[index].startTime, bbmap[index].endTime];
        }
      }
    }
  }
  return (
    <div>
      {
          <VideoAnnotator
            rects={rects} rectCatMap={rectCatMap}
            rectShapeMap={rectShapeMap}
            rectTimeMap={rectTimeMap}
            video={data} entityColorMap={this.state.entityColorMap}
          />
      }
      <br />
      <br />
      <br />
      <div>
        <div className="col-md-6 col-xs-4">
          <Button size="mini" color="grey" icon labelPosition="left" onClick={this.previousElement.bind(this, 'pervious')} disabled={this.state.start === 0}>
            <Icon name="left arrow" />
            Previous
          </Button>
        </div>
        <div className="col-xs-4">
        </div>
        <div className="col-md-6 col-xs-4">
          <Button size="mini" color="blue" icon labelPosition="right" onClick={this.nextElement.bind(this, 'right')} disabled={this.state.start < 0 || (this.state.start >= this.state.hitsDetails.length - 1)}>
            Next
            <Icon name="right arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
}

showPolygonV2Images = (hitsDetails) => {
  if (hitsDetails && hitsDetails.length === 0) {
    return (
      <h2>No Sample HITs</h2>
    );
  }
  const currentHit = hitsDetails[this.state.start];
  let result = '{}';
  console.log('currentHit', currentHit);
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0].result.length > 0) {
    result = currentHit.hitResults[0].result;
  }

  console.log('bounded images are ', currentHit);
  const data = currentHit.data;
  console.log('show text', this.state);
  const rects = [];
  const rectCatMap = {};
  const bbmap = JSON.parse(result);
  const rectShapeMap = {};
  // let notes = 'new';
  // if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0] && currentHit.hitResults[0].notes) {
  //   notes = currentHit.hitResults[0].notes;
  // }
  if (bbmap) {
    for (let index = 0; index < bbmap.length; index ++) {
      rects[index] = bbmap[index].points;
      rectCatMap[index] = bbmap[index].label;
      if (bbmap[index].shape) {
        rectShapeMap[index] = bbmap[index].shape;
      }
    }
  }
  return (
    <div>
      { <PolygonAnnotatorV2 rectShapeMap={rectShapeMap} space={false} rects={rects} rectCatMap={rectCatMap} image={data} entityColorMap={this.state.entityColorMap}/>}
      <br />
      <br />
      <br />
      {this.showButtons()}
    </div>
  );
}

showPolygonImages = (hitsDetails) => {
  if (hitsDetails && hitsDetails.length === 0) {
    return (
      <h2>No Sample HITs</h2>
    );
  }
  const currentHit = hitsDetails[this.state.start];
  let result = '{}';
  console.log('currentHit', currentHit);
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0].result.length > 0) {
    result = currentHit.hitResults[0].result;
  }

  console.log('bounded images are ', currentHit);
  const data = currentHit.data;
  console.log('show text', this.state);
  const rects = [];
  const rectCatMap = {};
  const bbmap = JSON.parse(result);
  let notes = 'new';
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0] && currentHit.hitResults[0].notes) {
    notes = currentHit.hitResults[0].notes;
  }
  if (bbmap) {
    for (let index = 0; index < bbmap.length; index ++) {
      rects[index] = bbmap[index].points;
      rectCatMap[index] = bbmap[index].label;
    }
  }
  return (
    <div>
      { notes === 'new' && <PolygonAnnotator space={false} rects={rects} rectCatMap={rectCatMap} image={data} entityColorMap={this.state.entityColorMap}/>}
      { notes === 'old' && <PolygonAnnotatorOld rects={rects} rectCatMap={rectCatMap} image={data} entityColorMap={this.state.entityColorMap}/> }
      <br />
      <br />
      <br />
      {this.showButtons()}
    </div>
  );
}

showClassificationImages = (hitsDetails) => {
  if (hitsDetails && hitsDetails.length === 0) {
    return (
      <h2>No Sample HITs</h2>
    );
  }
  const currentHit = hitsDetails[this.state.start];
  const data = currentHit.data;
  let result = '{"labels":[]}';
  if (currentHit.hitResults && currentHit.hitResults.length > 0 && currentHit.hitResults[0].result.length > 0) {
    result = currentHit.hitResults[0].result;
  }
  let currentTags = [];
  let currentNote = '';
  console.log('result is', result);
  try {
    const resultJson = JSON.parse(result);
    if (resultJson.labels) {
      currentTags = new Set(resultJson.labels);
    } else {
      currentTags = result;
    }
    if (resultJson.note) {
      currentNote = resultJson.note;
    }
  } catch (exception) {
    // statements
    console.log('exception', exception);
    currentTags = new Set(currentHit.hitResults[0].result.split('____'));
  }
  return (
    <div>
      <div className={styles.dataArea}>
          { !checkVideoURL(data) && <img className="img-respons" src={data} />}
          { checkVideoURL(data) && <Player
              preload="auto"
              autoPlay
              poster="/assets/poster.png"
              src={data}
            >
              <ControlBar autoHide={false}>
                <ForwardControl seconds={5} order={3.1} />
                <ForwardControl seconds={10} order={3.2} />
                <ForwardControl seconds={30} order={3.3} />
                <PlaybackRateMenuButton
                  rates={[5, 3, 1.5, 1, 0.5, 0.1]}
                  order={7.1}
                />
              </ControlBar>
            </Player>}
        <br />
        {this.showCurrentTags(currentTags)}
        <br />
      </div>
      <br />
        {currentNote && currentNote.length > 0 &&
                            <div>
                              <p size="tiny" style={{whiteSpace: 'pre-wrap', marginLeft: '10%'}}>
                                <Icon color="teal" name="sticky note" /> {currentNote}
                              </p>
                            </div>}
      <br />
      <br />
      {this.showButtons()}
    </div>
  );
}

 showSummaries = (hitsDetails) => {
   if (hitsDetails && hitsDetails.length === 0) {
     return (
       <h2>No Sample HITs</h2>
     );
   }
   console.log('show hits details ', hitsDetails);
   const currentHit = hitsDetails[this.state.start];
   const data = currentHit.data;
   let result = '';
   if (currentHit.hitResults) {
     result = currentHit.hitResults[0].result;
   }
   return (
    <div>
      <Segment basic>
        <h5>Text</h5>
        <p className={styles.dataArea}>
          {data}
        </p>
      </Segment>
      <br />
      <div style={{ paddingBottom: '5%' }}>
        <h5>Summary</h5>
        <p className={styles.resultArea}>
          {result}
        </p>
      </div>
      {this.showButtons()}
    </div>
    );
 }

   showExtra = (extra) => {
     console.log('extra data is', extra);
     const arrs = [];
     for (const k1 of Object.keys(extra)) {
       arrs.push(
          <Table.Row>
            <Table.Cell textAlign="left" className="h5 bold">{k1}</Table.Cell>
            <Table.Cell className="h6">{extra[k1]}</Table.Cell>
          </Table.Row>
      );
     }

     return (
     <Table celled color="blue" key="blue" size="small" compact="very" collapsing>
        <Table.Body>
          {arrs}
        </Table.Body>
      </Table>
   );
   }

  render() {
    console.log('TaggerOveriew props are ', this.props, this.state);
    const { hitsDetails, entities } = this.state;
    const { projectDetails } = this.props;
    let buttonC = '';
    if (this.state.scrollCompleted) {
      buttonC = 'hidden';
    }
    let extra = '';
    if (hitsDetails && hitsDetails.length > 0 && hitsDetails.length > this.state.start && this.state.start >= 0 && hitsDetails[this.state.start].extras) {
      extra = JSON.parse(hitsDetails[this.state.start].extras);
    }
    let pageTitle = 'Overview';
    let pageDescription = 'Just upload your data, invite your team members and start tagging. The best way to tag training/evaluation data for your machine learning projects.';
    if (projectDetails) {
      pageTitle = projectDetails.name + ' ' + pageTitle;
      if (projectDetails.shortDescription) {
        pageDescription = projectDetails.shortDescription;
      }
      if (projectDetails.subtitle) {
        pageTitle = projectDetails.subtitle + ' ' + pageTitle;
      }
    }

    return (
      <div className="taggerPages">
          <Helmet title={pageTitle}>
            <meta property="og:title" content={pageTitle} />
            <meta name="description" content={pageDescription} />
            <meta property="og:description" content={pageDescription} />
          </Helmet>
                                {
                          <div>
                            <Segment vertical size="large" className={styles.title} loading={this.state.loading}>
                                <div>
                                    <div className="col-md-3">
                                      <Button className="pull-left" onClick={() => this.props.pushState('/projects/' + this.props.params.orgName + '/' + this.props.params.projectName)} compact><Icon name="arrow left" />Project</Button>
                                    </div>
                                          <div className="text-center col-md-6">
                                            <Breadcrumb size="big">
                                              <Breadcrumb.Section link onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName)}>{this.props.params.orgName}</Breadcrumb.Section>
                                              <Breadcrumb.Divider />
                                              <Breadcrumb.Section active link onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName + '/' + this.props.params.projectName)}>
                                                {this.props.params.projectName}
                                              </Breadcrumb.Section>
                                            </Breadcrumb>
                                          </div>
                              <div className="col-md-3">
                             { projectDetails && projectDetails.permissions && projectDetails.permissions.canDownloadData &&
                              <Button primary size="small" onClick={this.openExport} className="pull-right">
                                <Icon name="download"/> Download
                              </Button>
                             }
                             </div>
                             </div>
                           </Segment>
                          </div>
                      }
          <div style={{ height: '50px'}} />
          {
            projectDetails && hitsDetails && hitsDetails.length >= 0 &&
            <div className="marginTopExtra">
                { projectDetails.task_type === POS_TAGGING &&
                  hitsDetails && hitsDetails.length > 0 &&
                  <div>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                        <div>
                        <h6> Entities </h6>
                        {this.showTags(entities)}
                        </div>
                        <div>
                          <h6> Contributors </h6>
                          {this.getContributors(this.props.projectDetails.contributorDetails)
                          }
                        </div>
                      </div>
                  <br />
                  <br />
                    <br />
                  <div>
                    { this.state.type === 'all' && <h3> HITs Done </h3>}
                    { this.state.type === 'skipped' && <h3> HITs Skipped </h3>}
                    <div className={styles.content}>
                                      { extra &&
                  <div>
                    {this.showExtra(extra)}
                  </div>
                }
                      {this.showHits(hitsDetails)}
                      <Divider hidden />
                      <Button primary fluid onClick={this.loadNextPage} loading={this.state.loading} className={buttonC}>
                        Load more
                      </Button>
                    </div>
                  </div>
                  </div>
                  }

                  {
                    (projectDetails.task_type === TEXT_SUMMARIZATION || projectDetails.task_type === TEXT_MODERATION) &&
                    hitsDetails && hitsDetails.length > 0 &&
                    <div style={{ paddingBottom: '5%'}}>
                                      { extra &&
                  <div>
                    {this.showExtra(extra)}
                  </div>
                }
                      {this.showSummaries(hitsDetails)}
                    </div>
                  }
                  {
                    (projectDetails.task_type === TEXT_CLASSIFICATION) && hitsDetails && hitsDetails.length >= 0 &&
                    <div style={{ paddingBottom: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                        <div>
                        <h6> Entities </h6>
                        {this.showTags(entities)}
                        </div>
                        <div>
                          <h6> Contributors </h6>
                          {this.getContributors(this.props.projectDetails.contributorDetails)
                          }
                        </div>
                      </div>
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                        {this.showButtons()}
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                      <div>
                          { extra &&
                            <div>
                              {this.showExtra(extra)}
                            </div>
                          }
                        {this.showClassifications(hitsDetails)}
                      </div>
                    </div>
                  }
                  {
                    (projectDetails.task_type === IMAGE_CLASSIFICATION || projectDetails.task_type === VIDEO_CLASSIFICATION) && hitsDetails && hitsDetails.length >= 0 &&
                    <div style={{ paddingBottom: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                        <div>
                        <h6> Entities </h6>
                        {this.showTags(entities)}
                        </div>
                        <div>
                          <h6> Contributors </h6>
                          {this.getContributors(this.props.projectDetails.contributorDetails)
                          }
                        </div>
                      </div>
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                        {this.showButtons()}
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                      <div>
                                      { extra &&
                  <div>
                    {this.showExtra(extra)}
                  </div>
                }
                        {this.showClassificationImages(hitsDetails)}
                      </div>
                    </div>
                  }

                  {
                    (projectDetails.task_type === IMAGE_BOUNDING_BOX) && hitsDetails && hitsDetails.length >= 0 &&
                    <div style={{ paddingBottom: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                        <div>
                        <h6> Entities </h6>
                        {this.showTags(entities)}
                        </div>
                        <div>
                          <h6> Contributors </h6>
                          {this.getContributors(this.props.projectDetails.contributorDetails)
                          }
                        </div>
                      </div>
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                        {this.showButtons()}
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                      <div className="text-center">
                                      { extra &&
                  <div>
                    {this.showExtra(extra)}
                  </div>
                }
                        {this.showBoundedImages(hitsDetails)}
                      </div>
                    </div>
                  }

                  {
                    (projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX) && hitsDetails && hitsDetails.length >= 0 &&
                    <div style={{ paddingBottom: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                        <div>
                        <h6> Entities </h6>
                        {this.showTags(entities)}
                        </div>
                        <div>
                          <h6> Contributors </h6>
                          {this.getContributors(this.props.projectDetails.contributorDetails)
                          }
                        </div>
                      </div>
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                        {this.showButtons()}
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                      <div className="text-center">
                                      { extra &&
                  <div>
                    {this.showExtra(extra)}
                  </div>
                }
                        {this.showPolygonImages(hitsDetails)}
                      </div>
                    </div>
                  }

{
                    (projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2) && hitsDetails && hitsDetails.length >= 0 &&
                    <div style={{ paddingBottom: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                        <div>
                        <h6> Entities </h6>
                        {this.showTags(entities)}
                        </div>
                        <div>
                          <h6> Contributors </h6>
                          {this.getContributors(this.props.projectDetails.contributorDetails)
                          }
                        </div>
                      </div>
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                        {this.showButtons()}
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                      <div className="text-center">
                                      { extra &&
                  <div>
                    {this.showExtra(extra)}
                  </div>
                }
                        {this.showPolygonV2Images(hitsDetails)}
                      </div>
                    </div>
                  }
{
                    (projectDetails.task_type === VIDEO_BOUNDING_BOX) && hitsDetails && hitsDetails.length >= 0 &&
                    <div style={{ paddingBottom: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                        <div>
                        <h6> Entities </h6>
                        {this.showTags(entities)}
                        </div>
                        <div>
                          <h6> Contributors </h6>
                          {this.getContributors(this.props.projectDetails.contributorDetails)
                          }
                        </div>
                      </div>
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                        {this.showButtons()}
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                      <div className="text-center">
                                      { extra &&
                  <div>
                    {this.showExtra(extra)}
                  </div>
                }
                        {this.showVideoAnnotation(hitsDetails)}
                      </div>
                    </div>
                  }
                  {
                    (projectDetails.task_type === DOCUMENT_ANNOTATION || projectDetails.task_type === POS_TAGGING_GENERIC) &&
                    hitsDetails && hitsDetails.length >= 0 &&
                    <div style={{ paddingBottom: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                        <div>
                          <h6> Contributors </h6>
                          {this.getContributors(this.props.projectDetails.contributorDetails)
                          }
                        </div>
                      </div>
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                        {this.showButtons()}
                      <br />
                        <div style={{ height: '20px'}} />
                      <br />
                                      { extra &&
                  <div>
                    {this.showExtra(extra)}
                  </div>
                }
                        {this.showDocs(hitsDetails)}
                    </div>
                  }

            </div>
              }
      </div>

    );
  }
}
