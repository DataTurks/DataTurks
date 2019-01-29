import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  tagData,
  nextRow,
  previousRow,
  updateProjectDetails,
  setCurrentHit,
  setCurrentProject,
  getProjectDetails
} from "redux/modules/dataturks";
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
import Popover from "react-bootstrap/lib/Popover";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
// import Well from 'react-bootstrap/lib/Well';
import {
  Label,
  Table,
  Icon,
  Button,
  Segment,
  Input,
  Dropdown,
  Accordion,
  Form,
  TextArea,
  Dimmer,
  Card,
  Loader,
  Checkbox
} from "semantic-ui-react";
import {
  fetchHits,
  addHits,
  skipHits,
  getUidToken,
  logEvent,
  editProject,
  updateHitStatus,
  addHitEvaluation,
  refreshUidToken
} from "../../helpers/dthelper";
import { push, goBack } from "react-router-redux";
import BoxAnnotator from "../../components/BoxAnnotator/BoxAnnotator";
import PolygonAnnotator from "../../components/PolygonAnnotator/PolygonAnnotator";
import PolygonAnnotatorV2 from "../../components/PolygonAnnotatorV2/PolygonAnnotator";
import VideoAnnotator from "../../components/VideoAnnotator/VideoAnnotator";
import DocumentAnnotator from "../../components/DocumentAnnotator/DocumentAnnotator";
import {
  createDocEntityColorMap,
  VIDEO_BOUNDING_BOX,
  DOCUMENT_ANNOTATION,
  POS_TAGGING_GENERIC,
  IMAGE_POLYGON_BOUNDING_BOX,
  IMAGE_POLYGON_BOUNDING_BOX_V2,
  IMAGE_CLASSIFICATION,
  VIDEO_CLASSIFICATION,
  ENTITY_COLORS,
  createEntities,
  createEntitiesJson,
  getDetaultShortcuts,
  convertKeyToString,
  POS_TAGGING,
  TEXT_SUMMARIZATION,
  IMAGE_BOUNDING_BOX,
  TEXT_CLASSIFICATION,
  HIT_STATE_SKIPPED,
  HIT_STATE_DONE,
  HIT_STATE_NOT_DONE,
  HIT_STATE_DELETED,
  HIT_STATE_PRE_TAGGED,
  HIT_STATE_REQUEUED,
  TEXT_MODERATION,
  checkVideoURL,
  getClassificationResponse,
  timeConverter,
  hitStateNameMap,
  captureException,
  getClassificationResult,
  HIT_EVALUATION_CORRECT,
  HIT_EVALUATION_INCORRECT,
} from "../../helpers/Utils";
import PanZoomElement from "../../components/PinchZoomPan/PanZoomElement";
import Fullscreen from "react-fullscreen-crossbrowser";
import {
  Player,
  ControlBar,
  ForwardControl,
  PlaybackRateMenuButton
} from "video-react";
// const entities = [
//   'NN', 'NP', 'NMP', 'NNRS'
// ];

// const INITIAL_COUNT = 10;
const styles = require("./TaggerSpace.scss");

const Mousetrap = require("mousetrap");

@connect(
  state => ({
    currentHit: state.dataturksReducer.currentHit,
    menuHidden: state.dataturksReducer.menuHidden,
    currentProject: state.dataturksReducer.currentProject,
    projectDetails: state.dataturksReducer.projectDetails
  }),
  dispatch =>
    bindActionCreators(
      {
        tagData,
        nextRow,
        getProjectDetails,
        previousRow,
        goBack,
        setCurrentProject,
        setCurrentHit,
        updateProjectDetails,
        pushState: push
      },
      dispatch
    )
)
export default class TaggerSpace extends Component {
  static propTypes = {
    projectDetails: PropTypes.object,
    tagData: PropTypes.func,
    nextRow: PropTypes.func,
    menuHidden: PropTypes.boolean,
    previousRow: PropTypes.func,
    currentProject: PropTypes.string,
    updateProjectDetails: PropTypes.func,
    getProjectDetails: PropTypes.func,
    pushState: PropTypes.func,
    currentHit: PropTypes.object,
    setCurrentHit: PropTypes.func,
    goBack: PropTypes.func,
    params: PropTypes.object,
    orgName: PropTypes.string,
    projectName: PropTypes.string,
    setCurrentProject: PropTypes.func,
    location: PropTypes.object,
    query: PropTypes.object,
    type: PropTypes.string,
    label: PropTypes.string,
    contributorId: PropTypes.string
  };

  constructor(props) {
    console.log("TaggerSpace props are ", props);
    super(props);
    let type = "notDone";
    if (props.location && props.location.query && props.location.query.type) {
      type = props.location.query.type;
    }
    if (type === "all") {
      type = "done";
    }
    let label = undefined;
    if (props.location && props.location.query && props.location.query.label) {
      label = props.location.query.label;
    }
    let evaluationType = undefined;
    if (props.location && props.location.query && props.location.query.evaluationType) {
      evaluationType = props.location.query.evaluationType;
    }
    let contributorId = undefined;
    if (
      props.location &&
      props.location.query &&
      props.location.query.contributorId
    ) {
      contributorId = props.location.query.contributorId;
    }
    this.showTagLine = this.showTagLine.bind(this);
    this.tagAreaClick = this.tagAreaClick.bind(this);
    this.setTagClick = this.setTagClick.bind(this);
    this.saveTagAndNextRow = this.saveTagAndNextRow.bind(this);
    this.skipRow = this.skipRow.bind(this);
    this.projectDetailsFetched = this.projectDetailsFetched.bind(this);
    this.hitAddCallback = this.hitAddCallback.bind(this);
    this.addHitinState = this.addHitinState.bind(this);
    this.openProjectStats = this.openProjectStats.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.showTags = this.showTags.bind(this);
    this.showImages = this.showImages.bind(this);
    this.getBackTopreviousRow = this.getBackTopreviousRow.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.showClassifyTags = this.showClassifyTags.bind(this);
    this.showButtons = this.showButtons.bind(this);
    this.getCurrentResult = this.getCurrentResult.bind(this);
    this.moveToDone = this.moveToDone.bind(this);
    // this.getClassificationQuestions = this.getClassificationQuestions.bind(this);
    // this.state.isFullscreenEnabled = false;
    if (
      this.props.projectDetails &&
      this.props.currentHit &&
      this.props.projectDetails.task_type === POS_TAGGING
    ) {
      const rules = JSON.parse(this.props.projectDetails.taskRules);
      const entities = createEntitiesJson(this.props.projectDetails.taskRules).entities;
      const entityColorMap = createDocEntityColorMap(entities, ENTITY_COLORS);
      let shortcuts = getDetaultShortcuts(
        this.props.projectDetails.task_type,
        entities
      );
      if ("shortcuts" in rules) {
        shortcuts = rules.shortcuts;
      }
      const hits = [];
      hits.push(this.props.currentHit);
      let tagLine = this.props.currentHit.data;
      if (
        this.props.currentHit.hitResults &&
        this.props.currentHit.hitResults.length > 0
      ) {
        tagLine = this.props.currentHit.hitResults[0].result.trim();
      }
      let clickedColor = {};
      let taggedEntity = {};
      let words = [];

      try {
        const resultJson = JSON.parse(tagLine);
        const labelMap = {};
        if (this.props.currentHit.data) {
          words = this.props.currentHit.data.split(" ");
        }
        for (let index = 0; index < resultJson.length; index ++) {
          const points = resultJson[index].points;
          const text = points[0].text;
          const entity = resultJson[index].label[0];
          labelMap[text] = entity;
        }
        for (let index = 0; index < words.length; index ++) {
          if (words[index] in labelMap) {
            clickedColor[index] = entityColorMap[labelMap[words[index]]];
            taggedEntity[index] = labelMap[words[index]];
          } else {
            clickedColor[index] = "";
            taggedEntity[index] = "__";
          }
        }
      } catch (exception) {
        // statements
        const splits = tagLine.split(" ");
        for (let index = 0; index < splits.length; index++) {
          const word = splits[index];
          const wordSplits = word.split("____");
          if (wordSplits.length > 1) {
            clickedColor[index] = entityColorMap[wordSplits[1]];
            taggedEntity[index] = wordSplits[1];
            words[index] = wordSplits[0];
          } else {
            clickedColor[index] = "";
            taggedEntity[index] = "__";
            words[index] = splits[index];
          }
        }
      }


      // this.setState({
      //   tagLine: data ? data : tagLine,
      //   clickedColor,
      //   taggedEntity,
      //   words,
      //   selectIds: [],
      //   changesInSession: 0,
      //   startTime: new Date().getTime()
      // });

      // const clickedColor = {};
      // const taggedEntity = {};
      // const words = [];
      // for (let index = 0; index < splits.length; index++) {
      //   const word = splits[index];
      //   const wordSplits = word.split("____");
      //   if (wordSplits.length > 1) {
      //     clickedColor[index] = entityColorMap[wordSplits[1]];
      //     taggedEntity[index] = wordSplits[1];
      //     words[index] = wordSplits[0];
      //   } else {
      //     clickedColor[index] = "";
      //     taggedEntity[index] = "__";
      //     words[index] = splits[index];
      //   }
      // }
      const ch = this.props.currentHit;
      this.state = {
        type,
        contributorId,
        label,
        tagLine,
        clickedColor,
        evaluationType,
        taggedEntity,
        words,
        selectIds: [],
        shortcuts,
        rules,
        entityColorMap,
        currentIndex: 0,
        hits,
        currentHit: ch,
        entities,
        changesInSession: 0,
        projectDetails: this.props.projectDetails,
        loading: false,
        currentStart: 0,
        currentCount: 1,
        startTime: new Date().getTime()
      };
    } else if (
      this.props.projectDetails &&
      this.props.currentHit &&
      (this.props.projectDetails.task_type === TEXT_SUMMARIZATION ||
        this.props.projectDetails.task_type === TEXT_MODERATION)
    ) {
      const rules = JSON.parse(this.props.projectDetails.taskRules);
      let shortcuts = getDetaultShortcuts(this.props.projectDetails.task_type);
      if ("shortcuts" in rules) {
        shortcuts = rules.shortcuts;
      }
      const hits = [];
      hits.push(this.props.currentHit);
      const ch = this.props.currentHit;
      let result = "";
      if (ch.hitResults) {
        result = ch.hitResults[0].result;
      }
      this.state = {
        type,
        contributorId,
        label,
        selectIds: [],
        evaluationType,
        rules,
        currentIndex: 0,
        hits,
        shortcuts,
        currentHit: ch,
        changesInSession: 0,
        textSummary: result,
        projectDetails: this.props.projectDetails,
        loading: false,
        currentStart: 0,
        currentCount: 1,
        startTime: new Date().getTime()
      };
    } else if (
      this.props.projectDetails &&
      this.props.currentHit &&
      (this.props.projectDetails.task_type === TEXT_CLASSIFICATION ||
        this.props.projectDetails.task_type === VIDEO_CLASSIFICATION ||
        this.props.projectDetails.task_type === IMAGE_CLASSIFICATION)
    ) {
      const rules = JSON.parse(this.props.projectDetails.taskRules);
      const entities = createEntitiesJson(this.props.projectDetails.taskRules).entities;
      let shortcuts = getDetaultShortcuts(
        this.props.projectDetails.task_type,
        entities
      );
      if ("shortcuts" in rules) {
        shortcuts = rules.shortcuts;
      }
      const entityColorMap = createDocEntityColorMap(entities, ENTITY_COLORS);
      const hits = [];
      hits.push(this.props.currentHit);
      const ch = this.props.currentHit;
      let currentTags = new Set();
      let currentNote = "";
      if (ch.hitResults) {
        const result = ch.hitResults[0].result;
        try {
          const resultJson = JSON.parse(result);
          currentTags = new Set(resultJson.labels);
          currentNote = resultJson.note;
        } catch (exception) {
          // statements
          console.log("exception", exception);
          currentTags = new Set(result.split("____"));
        }
        // currentTags = new Set(ch.hitResults[0].result.split('____'));
      }
      this.state = {
        type,
        contributorId,
        label,
        selectIds: [],
        entities,
        evaluationType,
        entityColorMap,
        currentTags,
        rules,
        currentIndex: 0,
        hits,
        shortcuts,
        currentHit: ch,
        changesInSession: 0,
        currentNote,
        projectDetails: this.props.projectDetails,
        loading: false,
        currentStart: 0,
        currentCount: 1,
        startTime: new Date().getTime()
      };
    } else if (
      this.props.projectDetails &&
      this.props.currentHit &&
      (this.props.projectDetails.task_type === IMAGE_BOUNDING_BOX ||
        this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX ||
        this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 ||
        this.props.projectDetails.task_type === VIDEO_BOUNDING_BOX ||
        this.props.projectDetails.task_type === DOCUMENT_ANNOTATION ||
        this.props.projectDetails.task_type === POS_TAGGING_GENERIC)
    ) {
      const rules = JSON.parse(this.props.projectDetails.taskRules);
      const entities = createEntities(this.props.projectDetails.taskRules).entities;
      const entityColorMap = createDocEntityColorMap(entities, ENTITY_COLORS);
      const hits = [];
      let shortcuts = getDetaultShortcuts(
        this.props.projectDetails.task_type,
        entities
      );
      let autoClose = true;
      let notes = false;
      let classification = undefined;
      let defaultShape = "polygon";
      if ("shortcuts" in rules) {
        shortcuts = rules.shortcuts;
      }
      if ("autoClose" in rules) {
        autoClose = rules.autoClose;
      }
      if ("notes" in rules) {
        notes = rules.notes;
      }
      if ("defaultShape" in rules) {
        defaultShape = rules.defaultShape;
      }
      hits.push(this.props.currentHit);
      const ch = this.props.currentHit;
      let boundingBoxMap = {};
      let classificationResponse = [];
      if (ch.hitResults[0].result.length > 0) {
        if ("classification" in rules) {
          classification = rules.classification;
          if (ch.hitResults) {
            const resultObject = JSON.parse(ch.hitResults[0].result);
            if ("annotationResult" in resultObject) {
              boundingBoxMap = resultObject.annotationResult;
              classificationResponse = getClassificationResponse(
                resultObject.classificationResult
              );
            } else {
              boundingBoxMap = JSON.parse(ch.hitResults[0].result);
            }
          }
        } else {
          if (ch.hitResults) {
            boundingBoxMap = JSON.parse(ch.hitResults[0].result);
          }
        }
      }
      if (
        this.props.projectDetails.task_type === IMAGE_BOUNDING_BOX ||
        this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX ||
        this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2
      ) {
        ch.data = ch.data + "?ts=" + new Date();
      }
      this.state = {
        type,
        defaultShape,
        classification,
        classificationResponse,
        contributorId,
        evaluationType,
        label,
        selectIds: [],
        entities,
        entityColorMap,
        boundingBoxMap,
        shortcuts,
        autoLabel: true,
        autoClose,
        notes,
        rules,
        currentIndex: 0,
        hits,
        newEntities: [],
        currentHit: ch,
        changesInSession: 0,
        projectDetails: this.props.projectDetails,
        loading: false,
        currentStart: 0,
        currentCount: 1,
        startTime: new Date().getTime()
      };
    } else {
      this.state = {
        tagLine: "",
        clickedColor: {},
        taggedEntity: {},
        entities: [],
        words: [],
        hits: [],
        type,
        searchQuery: '',
        evaluationType,
        label,
        contributorId,
        rules: {},
        autoLabel: true,
        autoClose: true,
        defaultShape: "polygon",
        notes: false,
        hideLabels: false,
        tagSelected: false,
        selectIds: [],
        loading: false,
        hitsCompleted: false,
        currentIndex: -1,
        currentTags: new Set(),
        entityColorMap: {},
        currentStart: 0,
        currentCount: this.getDefaultCount(),
        DEFAULT_COUNT: this.getDefaultCount(),
        activeIndex: -1,
        action: "",
        startTime: new Date().getTime(),
        changesInSession: 0,
        shortcuts: {},
        isFullscreenEnabled: false
      };
    }
    this.props.setCurrentHit(undefined);
  }

  componentWillMount() {
    console.log("TaggerSpace componentWillMount");
    // document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  componentDidMount() {
    console.log("Did mount TaggerSpace ", this.state, this.props);
    if (
      (this.props.params.orgName &&
        this.props.params.projectName &&
        (!this.props.projectDetails ||
          (this.props.projectDetails.name !== this.props.params.projectName ||
            this.props.projectDetails.orgName !==
              this.props.params.orgName))) ||
      !this.props.currentProject
    ) {
      this.props.setCurrentProject(
        {
          orgName: this.props.params.orgName,
          projectName: this.props.params.projectName
        },
        getUidToken()
      );
    } else if (!this.props.currentHit) {
      this.loadProjectDetails(this.props.currentProject);
    }
    if (this.state.type !== "notDone" && this.props.currentProject) {
      this.props.getProjectDetails(this.props.currentProject, getUidToken());
    }
    // if (this.props.currentProject && (!this.state.projectDetails || !this.state.hits || !this.props.currentHit)) {
    //   this.loadProjectDetails();
    // }
    const editor = document.getElementById("write_text");
    console.log("editor is ", editor);
    if (editor !== null) {
      editor.setAttribute("data-gramm", "false");
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

  componentWillReceiveProps(props) {
    console.log("TaggerSpace received props ", this.props, props, this.state);
    if (
      (!this.state.hits || this.state.hits.length === 0) &&
      !this.state.currentHit &&
      props.currentProject &&
      this.props.currentProject !== props.currentProject
    ) {
      console.log("load project details");
      this.loadProjectDetails(props.currentProject);
      this.props.getProjectDetails(props.currentProject, getUidToken());
    } else if (this.props.menuHidden !== props.menuHidden) {
      this.setState({ menuHidden: props.menuHidden });
      this.loadProjectDetails(props.currentProject);
    }
    if (this.props.location !== props.location) {
      if (props.location && props.location.query && props.location.query.type) {
        this.state.type = props.location.query.type;
      }
      if (
        props.location &&
        props.location.query &&
        props.location.query.label
      ) {
        this.state.label = props.location.query.label;
      }
      if (
        props.location &&
        props.location.query &&
        props.location.query.contributorId
      ) {
        this.state.contributorId = props.location.query.contributorId;
      }
      if (
        props.location &&
        props.location.query &&
        props.location.query.evaluationType
      ) {
        this.state.evaluationType = props.location.query.evaluationType;
      }
      this.state.hitsCompleted = false;
      this.loadProjectDetails(
        props.currentProject,
        this.state.start,
        this.state.count
      );
    }
    if (!this.props.projectDetails && props.projectDetails) {
      this.props.getProjectDetails(props.currentProject, getUidToken());
      this.setState({ projectDetails: props.projectDetails });
    }
    if (props.projectDetails && props.projectDetails.contributorDetails) {
      this.setState({
        contributorDetails: props.projectDetails.contributorDetails,
        contributorDetailsMap: this.getContributorDetailsMap(
          props.projectDetails.contributorDetails
        )
      });
    }
    // window.addEventListener('resize', this.resizeWindow);
  }

  componentDidUpdate() {
    const editor = document.getElementById("write_text");
    console.log("editor is ", editor);
    if (editor !== null) {
      editor.setAttribute("data-gramm", "false");
    }
  }

  componentWillUnmount() {
    console.log("unmounting Component");
    document.removeEventListener("keydown", this.handleKeyDown);
    this.setState({ hits: undefined });
  }

  getDefaultCount() {
    if (this.props.projectDetails && this.props.projectDetails.task_type) {
      switch (this.props.projectDetails.task_type) {
        case POS_TAGGING:
        case TEXT_MODERATION:
        case TEXT_SUMMARIZATION:
        case TEXT_CLASSIFICATION:
        case IMAGE_CLASSIFICATION:
        case VIDEO_CLASSIFICATION:
          return 10;
        case POS_TAGGING_GENERIC:
        case IMAGE_POLYGON_BOUNDING_BOX:
        case VIDEO_BOUNDING_BOX:
        case DOCUMENT_ANNOTATION:
        case IMAGE_POLYGON_BOUNDING_BOX_V2:
        case IMAGE_BOUNDING_BOX:
          return 10;
      }
    }
    return 10;
  }

  getContributorDetailsMap(contributorDetails) {
    let contributorDetailsMap = {};
    for (let index = 0; index < contributorDetails.length; index++) {
      contributorDetailsMap[contributorDetails[index].userDetails.uid] =
        contributorDetails[index].userDetails;
    }
    return contributorDetailsMap;
  }

  setTagClick(event, data) {
    console.log(" setTagClick state is ", this.state, data);
    if (this.state.tagSelected && this.state.selectIds.length > 0) {
      const currentClickState = this.state.clickedColor;
      const selectIds = this.state.selectIds;
      let changesInSession = this.state.changesInSession;
      changesInSession = changesInSession + 1;
      for (let index = 0; index < selectIds.length; index++) {
        currentClickState[selectIds[index]] = this.state.entityColorMap[
          data.name
        ];
        const currententities = this.state.taggedEntity;
        currententities[selectIds[index]] = data.name;
      }
      this.setState({
        clickedColor: currentClickState,
        tagSelected: false,
        selectIds: [],
        changesInSession
      });
    }
  }

  getBackTopreviousRow(event, data) {
    console.log(" previousRow ", event, data, this.state);
    let tagString = "";
    const latency = (
      (new Date().getTime() - this.state.startTime) /
      1000
    ).toPrecision(3);
    logEvent("buttons", "Prev hit");
    if (this.state.changesInSession > 0) {
      logEvent("buttons", "Labeled Data");
    }
    this.setState({ hitsCompleted: false });
    if (this.state.newEntities && this.state.newEntities.length > 0) {
      logEvent("buttons", "New Entities");
      console.log("edit", this.state.newEntities);
      const { taskRules } = this.props.projectDetails;
      const rulesJson = JSON.parse(taskRules);
      rulesJson.tags = [...this.state.entities, ...this.state.newEntities].join(
        ","
      );
      editProject(
        this.props.currentProject,
        { rules: JSON.stringify(rulesJson) },
        this.projectEditedCallback.bind(this)
      );
      this.setState({ loading: true, newEntities: [] });
    }

    const resultString = this.getCurrentResult();
    if (this.state.changesInSession > 0) {
      if (this.state.classification && this.state.classification.length > 0) {
        if (Object.keys(this.state.classificationResponse).length === 0) {
          alert("Please choose atleast one classification");
          return false;
        }
      }
      tagString = tagString.trim();
      console.log(" tagged String is ", tagString);
      this.state.currentHit.result = resultString;
      this.setState({
        loading: true,
        action: "previous",
        changesInSession: 0
      });
      addHits(
        this.state.currentHit.id,
        { result: resultString, timeTakenToLabelInSec: latency },
        this.props.currentProject,
        this.hitAddCallback
      );
    } else {
      this.setState({
        action: "previous",
        changesInSession: 0,
        loading: true
      });
      console.log("No Tag Found, moving to previous", this.state);
      this.hitAddCallback(undefined, "Ok", "previous");
    }
    return false;
    // if (this.state.currentIndex > 0) {
    //   const hit = this.state.hits[this.state.currentIndex - 1];
    //   this.addHitinState(hit.result ? hit.result : hit.data);
    //   this.setState({ currentHit: hit, currentIndex: this.state.currentIndex - 1, tagSelected: false, loading: false, selectIds: [] });
    // }
  }

  setClassification(entity, event) {
    event.preventDefault();
    console.log("setClassification", entity, event);
    const { currentTags, changesInSession } = this.state;
    console.log("setClassification", entity);
    if (currentTags.has(entity)) {
      currentTags.delete(entity);
    } else {
      currentTags.add(entity);
    }
    this.setState({ currentTags, changesInSession: changesInSession + 1 });
  }

  getKeyboardShortcuts(shortcuts) {
    console.log("shortcuts", shortcuts);
    const shorts = Object.keys(shortcuts);
    let completeContent = "";
    if (shorts) {
      for (let index = 0; index < shorts.length; index++) {
        console.log("shorts", shorts[index]);
        const content = convertKeyToString(shortcuts[shorts[index]]);
        completeContent =
          completeContent + shorts[index] + ":" + content + "\n";
      }
    }
    return completeContent;
  }

  getClassificationQuestions() {
    const renderArrs = [];
    let name = "";
    let displayName = "";
    let classification = this.state.classification;
    // const shortcuts = this.state.shortcuts;
    // const entiti = this.state.entities;
    for (let index = 0; index < classification.length; index++) {
      displayName = classification[0].displayName
        ? classification[0].displayName
        : classification[0].name;
      name = classification[0].name;
      let classes = classification[0].classes;
      // let combo = '';
      // if (entity in shortcuts) {
      //   combo = convertKeyToString(shortcuts[entity]);
      //   if (this.state.projectDetails.task_type === POS_TAGGING) {
      //     Mousetrap.bind(combo, this.setTagClick.bind(this, null, {name: entity}));
      //   } else {
      //     if (this.state.currentIndex >= 0) {
      //       Mousetrap.bind(combo, this.setClassification.bind(this, entity));
      //     }
      //   }
      // }
      for (let jindex = 0; jindex < classes.length; jindex++) {
        let checked = false;
        let selected = [];
        if (name in this.state.classificationResponse) {
          selected = this.state.classificationResponse[name];
        }
        if (selected.indexOf(classes[jindex]) > -1) {
          checked = true;
        }
        renderArrs.push(
          <Form.Field
            checked={checked}
            onChange={this.handleClassificationCheckBoxChange.bind(
              this,
              name,
              classes[jindex]
            )}
            label={classes[jindex]}
            control="input"
            type="checkbox"
          />
        );
      }
    }
    if (name.length > 0 && renderArrs.length > 0) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <Form
            size="mini"
            style={{
              border: "2px solid",
              padding: "2em",
              backgroundColor: "white"
            }}
          >
            <label style={{ fontSize: "large" }}>{displayName}</label>
            <br />
            {renderArrs}
          </Form>
        </div>
      );
    }
  }

  getUrl(type, contributorId, entity, evaluationType) {
    console.log("entity is", type, contributorId, entity, this.state);
    let url =
      "/projects/" +
      this.props.params.orgName +
      "/" +
      this.props.params.projectName +
      "/space?";
    if (type) {
      url = url + "type=" + type;
    }
    if (contributorId) {
      url = url + "&contributorId=" + contributorId;
    }
    if (entity) {
      url = url + "&label=" + entity;
    }
    if (evaluationType) {
      url = url + "&evaluationType=" + evaluationType;
    }
    return url;
  }

  getHitStates() {
    const options = [];
    let selected = this.state.type;
    options.push({
      text: "Done HITs",
      value: HIT_STATE_DONE,
      onClick: () => {
        this.resetFilterState();
        logEvent("buttons", "Select Done");
        this.props.pushState(
          this.getUrl(HIT_STATE_DONE, this.state.contributorId, this.state.label, this.state.evaluationType)
        );
      }
    });
    options.push({
      text: "Skipped HITs",
      value: HIT_STATE_SKIPPED,
      onClick: () => {
        logEvent("buttons", "Select Skipped");
        this.resetFilterState();
        this.props.pushState(
          this.getUrl(HIT_STATE_SKIPPED)
        );
      }
    });
    options.push({
      text: "Deleted HITs",
      value: HIT_STATE_DELETED,
      onClick: () => {
        logEvent("buttons", "Select Deleted");
        this.resetFilterState();
        this.props.pushState(
          this.getUrl(HIT_STATE_DELETED)
        );
      }
    });
    options.push({
      text: "Pre-Tagged HITs",
      value: HIT_STATE_PRE_TAGGED,
      onClick: () => {
        logEvent("buttons", "Select Pre-Tagged");
        this.resetFilterState();
        this.props.pushState(
          this.getUrl(HIT_STATE_PRE_TAGGED)
        );
      }
    });
    options.push({
      text: "Re-Tagging Queue",
      value: HIT_STATE_REQUEUED,
      onClick: () => {
        logEvent("buttons", "Select Re-queued");
        this.resetFilterState();
        this.props.pushState(
          this.getUrl(HIT_STATE_REQUEUED)
        );
      }
    });
    return (
      <Dropdown
        value={selected}
        placeholder="Select State"
        selection
        options={options}
      />
    );
  }

  getEvaluations() {
    const options = [];
    let selected = this.state.evaluationType;
    options.push({
      text: "Correct",
      value: "correct",
      onClick: () => {
        logEvent("buttons", "Select Correct");
        this.resetFilterState();
        this.state.label = undefined;
        this.state.contributorId = undefined;
        this.props.pushState(
          this.getUrl(this.state.type, undefined, undefined, HIT_EVALUATION_CORRECT)
        );
      }
    });
    options.push({
      text: "Incorrect",
      value: "incorrect",
      onClick: () => {
        logEvent("buttons", "Select InCorrect");
        this.resetFilterState();
        this.state.label = undefined;
        this.state.contributorId = undefined;
        this.props.pushState(
          this.getUrl(this.state.type, undefined, undefined, HIT_EVALUATION_INCORRECT)
        );
      }
    });
    options.push({
      text: "Not Evaluated",
      value: "none",
      onClick: () => {
        logEvent("buttons", "Select None");
        this.resetFilterState();
        this.state.label = undefined;
        this.state.contributorId = undefined;
        this.props.pushState(
          this.getUrl(this.state.type, undefined, undefined, 'NONE')
        );
      }
    });
    options.push({
      text: "All",
      value: undefined,
      onClick: () => {
        logEvent("buttons", "Select All Evaluation");
        this.resetFilterState();
        this.state.evaluationType = undefined;
        this.props.pushState(
          this.getUrl(this.state.type, undefined, undefined, undefined)
        );
      }
    });
    return (
      <Dropdown
        compact
        value={selected}
        placeholder="Filter By Evaluation Status"
        selection
        options={options}
      />
    );
  }

  getContributors(contributorDetails) {
    const options = [];
    let selected = "";
    if (contributorDetails) {
      for (
        let index = 0;
        index < contributorDetails.length && index < 50;
        index++
      ) {
        // let active = false;
        if (
          this.state.contributorId === contributorDetails[index].userDetails.uid
        ) {
          // active = true;
          selected = contributorDetails[index].userDetails.uid;
        }
        options.push({
          text: contributorDetails[index].userDetails.firstName ? contributorDetails[index].userDetails.firstName : '',
          value: contributorDetails[index].userDetails.uid ? contributorDetails[index].userDetails.uid : '',
          image: {
            avatar: true,
            src: contributorDetails[index].userDetails.profilePic ? contributorDetails[index].userDetails.profilePic : ''
          },
          onClick: () => {
            logEvent("buttons", "Select Contributor");
            this.resetFilterState();
            this.props.pushState(
              this.getUrl(
                this.state.type,
                contributorDetails[index].userDetails.uid,
                this.state.label, this.state.evaluationType
              )
            );
          }
        });
      }
      options.push({
        text: 'All',
        value: 'all',
        onClick: () => {
          this.resetFilterState();
          this.state.contributorId = undefined;
          this.props.pushState(
            this.getUrl(
              this.state.type,
              undefined,
              this.state.label, this.state.evaluationType
            )
          );
        }
      });
      console.log("options are", options);
      return (
        <Dropdown
          value={selected}
          placeholder="Filter by Contributor"
          selection
          options={options}
        />
      );
    }
  }

  getHitInfo(hit) {
    if (hit) {
      const fileName = hit.fileName;
      const status = hit.status;
      return (
        <div>
            {fileName && <Label title="File Name" size="mini">{fileName}</Label>}
            {status && <Label title="HIT status" style={{ textTransform: 'capitalize' }} size="mini">{hitStateNameMap[status]}</Label>}
        </div>
      );
    }
  }

  getHitDetails(hit) {
    if (hit && hit.hitResults && this.state.contributorDetailsMap) {
      const hr = hit.hitResults[0];
      const fileName = hit.fileName;
      const status = hit.status;
      const evaluation = hit.evaluation;
      const userName = this.state.contributorDetailsMap[hr.userId] && this.state.contributorDetailsMap[hr.userId].firstName ? this.state.contributorDetailsMap[hr.userId].firstName : '';
      const userEmail = this.state.contributorDetailsMap[hr.userId] && this.state.contributorDetailsMap[hr.userId].email ? this.state.contributorDetailsMap[hr.userId].email : '';
      return (
        <div>
        <Card color="teal" style={{ minHeight: '15em', maxHeight: '15em', overflowY: 'auto', overflowX: 'hidden' }}>
          <Card.Content>
            <Card.Header style={{ fontSize: "smaller" }} content={userEmail} />
            {userName && (
              <Card.Meta style={{ fontSize: "small" }} content={userName} />
            )}
            <Card.Description style={{ fontSize: "x-small" }}>
              {fileName && <p style={{ fontSize: "x-small", width: 'min-content' }}>
              File Name: <b> {fileName} </b> </p>}

              <p style={{ fontSize: "x-small" }}>
                {" "}
                Last Updated{" "}
                <b> {timeConverter(hit.hitResults[0].updatedTimestamp / 1000)} </b>
              </p>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            {status && <Label size="mini">{hitStateNameMap[status]}</Label>}
            {evaluation && <Label style={{ textTransform: 'capitalize' }} color="green" size="mini">{evaluation}</Label>}
          <Label size="mini" color="teal" attached="top right">
            Annotator Info
          </Label>
          </Card.Content>
        </Card>
        </div>
      );
    }
  }

  getEntities(entities) {
    const options = [];
    let selected = "";
    if (entities) {
      for (let index = 0; index < entities.length; index++) {
        // let active = false;
        if (this.state.label === entities[index]) {
          // active = true;
          selected = entities[index];
        }
        options.push({
          text: entities[index],
          value: entities[index],
          onClick: () => {
            this.resetFilterState();
            logEvent("buttons", "Select Entity");
            this.props.pushState(
              this.getUrl(
                this.state.type,
                this.state.contributorId,
                entities[index],
                this.state.evaluationType
              )
            );
          }
        });
      }
      options.push({
        text: 'All',
        value: 'All',
        onClick: () => {
          this.resetFilterState();
          this.state.label = undefined;
          this.props.pushState(
            this.getUrl(
              this.state.type,
              this.state.contributorId,
              undefined,
              this.state.evaluationType
            )
          );
        }
      });
      console.log("options are", options);
      return (
        <Dropdown
          value={selected}
          placeholder="Filter by Tagged Entity"
          selection
          options={options}
        />
      );
    }
  }

  getCurrentResult() {
    console.log("getCurrentResult ", this.state);
    if (this.state.projectDetails.task_type === POS_TAGGING) {
      let tagString = "";
      for (let index = 0; index < this.state.words.length; index++) {
        if (
          this.state.taggedEntity[index] &&
          this.state.taggedEntity[index] !== "__"
        ) {
          tagString =
            tagString +
            " " +
            this.state.words[index] +
            "____" +
            this.state.taggedEntity[index];
        } else {
          tagString = tagString + " " + this.state.words[index];
        }
      }
      return tagString.trim();
    } else if (
      this.state.projectDetails.task_type === TEXT_SUMMARIZATION ||
      this.state.projectDetails.task_type === TEXT_MODERATION
    ) {
      return this.state.textSummary;
    } else if (
      this.state.projectDetails.task_type === TEXT_CLASSIFICATION ||
      this.state.projectDetails.task_type === IMAGE_CLASSIFICATION ||
      this.state.projectDetails.task_type === VIDEO_CLASSIFICATION
    ) {
      const tags = [...this.state.currentTags];
      const result = {};
      result.labels = tags;
      result.note = this.state.currentNote;
      return JSON.stringify(result);
    } else if (
      this.state.projectDetails.task_type === IMAGE_BOUNDING_BOX ||
      this.state.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX ||
      this.state.projectDetails.task_type === VIDEO_BOUNDING_BOX ||
      this.state.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 ||
      this.state.projectDetails.task_type === DOCUMENT_ANNOTATION ||
      this.state.projectDetails.task_type === POS_TAGGING_GENERIC
    ) {
      const boundingBoxMap = this.state.boundingBoxMap;
      if (
        this.state.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX ||
        this.state.projectDetails.task_type ===
          IMAGE_POLYGON_BOUNDING_BOX_V2 ||
        this.state.projectDetails.task_type === IMAGE_BOUNDING_BOX
      ) {
        if ( boundingBoxMap.imageWidth && boundingBoxMap.imageHeight && (
          boundingBoxMap.imageWidth === 0 ||
          boundingBoxMap.imageHeight === 0)
        ) {
          if (window.Raven) {
            if (__DEVELOPMENT__) {
              alert("image annotation error, please refresh");
            }
            window.Raven.captureException(
              "Error while annotating image, hit is :  " +
                JSON.stringify(this.state.currentHit)
            );
          }
        }
      }
      let resultString = "";
      if (this.state.classification && this.state.classification.length > 0) {
        const classificationResult = getClassificationResult(
          this.state.classificationResponse
        );
        const resultObject = {
          classificationResult,
          annotationResult: boundingBoxMap
        };
        resultString = JSON.stringify(resultObject);
      } else {
        resultString = JSON.stringify(boundingBoxMap);
      }
      return resultString;
    }
  }

  resetFilterState() {
    this.setState({
      hits: [],
      currentIndex: -1,
      currentStart: 0,
      start: 0,
      currentHit: undefined,
      currentCount: this.state.DEFAULT_COUNT,
      hitsCompleted: false,
      changesInSession: 0
    });
  }

  saveElementCallback(err, response) {
    console.log('saveElementCallback', err, response);
    if (!err) {
      this.setState({
        hits: [],
        currentIndex: this.state.currentIndex - 1,
        currentHit: undefined,
        hitsCompleted: false,
        changesInSession: 0
      });
      this.loadProjectDetails(this.props.currentProject);
    } else {
      this.setState({ loading: false });
      captureException(err);
    }
  }

  evaluationCallback(value, err, response) {
    console.log('saveElementCallback', err, response, value);
    if (!err) {
      const {currentHit, hits, currentIndex} = this.state;
      currentHit.evaluation = value;
      hits[currentIndex].evaluation = value;
      this.setState({ loading: false, currentHit, hits });
    } else {
      this.setState({ loading: false });
      captureException(err);
    }
  }

  moveToDoneCallback(err, response) {
    console.log('moveToDoneCallback', err, response);
    if (!err) {
      this.setState({ loading: false });
      if (this.state.newEntities && this.state.newEntities.length > 0) {
        logEvent("buttons", "New Entities");
        console.log("edit", this.state.newEntities);
        const { taskRules } = this.props.projectDetails;
        const rulesJson = JSON.parse(taskRules);
        rulesJson.tags = [...this.state.entities, ...this.state.newEntities].join(
          ","
        );
        editProject(
          this.props.currentProject,
          { rules: JSON.stringify(rulesJson) },
          this.projectEditedCallback.bind(this)
        );
        this.setState({ loading: true, newEntities: [] });
      }
      this.props.getProjectDetails(this.props.currentProject, getUidToken());
      this.hitAddCallback(undefined, "Hit moved to done", this.state.action ? this.state.action : 'moveToDone');
    } else {
      this.setState({ loading: false });
      if (response && response.body && response.body.code && response.body.code === 401) {
        refreshUidToken(() => { console.log('token refreshed'); this.setState({ loading: false })});
      } else {
        captureException(err);
      }
    }
  }

  moveToDone(action) {
    console.log('move to done', action);
    logEvent("buttons", 'Done');
    logEvent("Mark As", 'Done');
    const { currentHit, changesInSession } = this.state;
    console.log('saveElement', currentHit.id);
    let result = '';
    if (changesInSession > 0) {
      result = this.getCurrentResult();
    } else if (currentHit.hitResults && currentHit.hitResults.length > 0) {
      result = currentHit.hitResults[0].result;
    }
    this.state.currentHit.result = result;
    this.state.currentHit.status = 'done';
    if (this.state.classification && this.state.classification.length > 0) {
      if (Object.keys(this.state.classificationResponse).length === 0) {
        alert("Please choose atleast one classification");
        return false;
      }
    }
    this.state.action = action ? action : 'moveToDone';
    this.state.changesInSession = 0;
    this.setState({ loading: true, action: action ? action : 'moveToDone' });
    updateHitStatus(currentHit.id, this.props.currentProject, HIT_STATE_DONE, result, this.moveToDoneCallback.bind(this));
  }

  moveToSkip() {
    console.log('move to done');
    logEvent("buttons", 'Skip');
    logEvent("Mark As", 'Skip');
    const { currentHit, changesInSession } = this.state;
    console.log('saveElement', currentHit.id);
    let result = '';
    if (changesInSession > 0) {
      result = this.getCurrentResult();
    } else if (currentHit.hitResults && currentHit.hitResults.length > 0) {
      result = currentHit.hitResults[0].result;
    }
    if (this.state.classification && this.state.classification.length > 0) {
      if (Object.keys(this.state.classificationResponse).length === 0) {
        alert("Please choose atleast one classification");
        return false;
      }
    }
    this.setState({ loading: true, action: 'moveToDone' });
    updateHitStatus(currentHit.id, this.props.currentProject, HIT_STATE_SKIPPED, result, this.moveToDoneCallback.bind(this));
  }

  saveElement() {
    const { currentHit, changesInSession } = this.state;
    console.log('saveElement', currentHit.id);
    let result = '';
    if (changesInSession > 0) {
      if (this.docAnnotator) {
        this.docAnnotator.saveCategory(true);
      }
      result = this.getCurrentResult();
    } else if (currentHit.hitResults && currentHit.hitResults.length > 0) {
      result = currentHit.hitResults[0].result;
    }
    if (this.state.classification && this.state.classification.length > 0) {
      if (Object.keys(this.state.classificationResponse).length === 0) {
        alert("Please choose atleast one classification");
        return false;
      }
    }
    this.setState({ loding: true });
    updateHitStatus(currentHit.id, this.props.currentProject, currentHit.status, result, this.saveElementCallback.bind(this));
  }

  handleClassificationCheckBoxChange(name, e1, e2) {
    console.log("handleClassificationCheckBoxChange", e1, e2.target.checked);
    let classificationResponseObj = [];
    const classificationResponse = this.state.classificationResponse;
    if (name in this.state.classificationResponse) {
      classificationResponseObj = classificationResponse[name];
      delete classificationResponse[name];
    }
    if (e2.target.checked) {
      classificationResponseObj.push(e1);
    } else {
      var index = classificationResponseObj.indexOf(e1);
      if (index > -1) {
        classificationResponseObj.splice(index, 1);
      }
    }
    if (classificationResponseObj.length > 0) {
      classificationResponse[name] = classificationResponseObj;
    }
    this.setState({ classificationResponse, changesInSession: this.state.changesInSession + 1 });
  }

  resizeWindow(event) {
    console.log("resize widow", event);
    this.loadProjectDetails(this.props.currentProject);
  }

  addHitinState(tagLine, data) {
    console.log("addHitinState");
    let clickedColor = {};
    let taggedEntity = {};
    let words = [];

    try {
      const resultJson = JSON.parse(tagLine);
      const labelMap = {};
      if (data) {
        words = data.split(" ");
      }
      for (let index = 0; index < resultJson.length; index ++) {
        const points = resultJson[index].points;
        const text = points[0].text;
        const entity = resultJson[index].label[0];
        labelMap[text] = entity;
      }
      for (let index = 0; index < words.length; index ++) {
        if (words[index] in labelMap) {
          clickedColor[index] = this.state.entityColorMap[labelMap[words[index]]];
          taggedEntity[index] = labelMap[words[index]];
        } else {
          clickedColor[index] = "";
          taggedEntity[index] = "__";
        }
      }
    } catch (exception) {
      // statements
      const splits = tagLine.split(" ");
      for (let index = 0; index < splits.length; index++) {
        const word = splits[index];
        const wordSplits = word.split("____");
        if (wordSplits.length > 1) {
          clickedColor[index] = this.state.entityColorMap[wordSplits[1]];
          taggedEntity[index] = wordSplits[1];
          words[index] = wordSplits[0];
        } else {
          clickedColor[index] = "";
          taggedEntity[index] = "__";
          words[index] = splits[index];
        }
      }
    }


    this.setState({
      tagLine: data ? data : tagLine,
      clickedColor,
      taggedEntity,
      words,
      selectIds: [],
      changesInSession: 0,
      startTime: new Date().getTime()
    });
  }

  projectDetailsFetched(error, response) {
    console.log(" project details fetched ", error, response);
    if (!error) {
      if (response.body.hits.length < this.state.currentCount) {
        this.setState({ hitScrollCompleted: true });
      }
      let projectDetails = this.props.projectDetails;
      if (response.body.projectDetails) {
        this.props.updateProjectDetails(response.body.projectDetails);
        projectDetails = response.body.projectDetails;
      }
      const rules = JSON.parse(projectDetails.taskRules);
      const entitiesObject = createEntitiesJson(projectDetails.taskRules);
      const entities = entitiesObject.entities;
      const entityJson = entitiesObject.entityJson;
      let shortcuts = getDetaultShortcuts(projectDetails.task_type, entities);
      const entityColorMap = createDocEntityColorMap(entities, ENTITY_COLORS);
      this.state.entityColorMap = entityColorMap;
      if ("shortcuts" in rules) {
        shortcuts = rules.shortcuts;
      }
      let currentHits = this.state.hits;
      let currentIndex = this.state.currentIndex;
      currentIndex = currentIndex + 1;
      currentHits = [...currentHits, ...response.body.hits];
      const currentHit = currentHits[currentIndex];
      if (response.body.hits.length === 0 || !currentHit) {
        this.setState({
          hits: currentHits,
          currentIndex: currentHits.length - 1,
          entityColorMap,
          entities,
          entityJson,
          startTime: new Date().getTime(),
          projectDetails,
          loading: false,
          action: ""
        });
        if ((!this.state.type || this.state.type === "notDone")) {
          this.setState({ hitsCompleted: true });
        }
      } else {
          if (projectDetails.task_type === POS_TAGGING) {
            if (response.body.hits.length > 0) {
              this.addHitinState(
                currentHit.hitResults
                  ? currentHit.hitResults[0].result
                  : currentHit.data, currentHit.data
              );
              this.setState({
                startTime: new Date().getTime(),
                rules,
                shortcuts,
                entityColorMap,
                currentIndex,
                hits: currentHits,
                currentHit,
                entities,
                projectDetails,
                loading: false,
                action: ""
              });
            }
          } else if (
            projectDetails.task_type === TEXT_SUMMARIZATION ||
            projectDetails.task_type === TEXT_MODERATION
          ) {
            if (response.body.hits.length > 0) {
              let textSummary = "";
              if (currentHit.hitResults !== null) {
                textSummary = currentHit.hitResults[0].result;
              }
              this.setState({
                rules,
                shortcuts,
                currentIndex,
                hits: currentHits,
                currentHit,
                textSummary,
                projectDetails,
                loading: false,
                action: ""
              });
            }
          } else if (projectDetails.task_type === TEXT_CLASSIFICATION) {
            if (response.body.hits.length > 0) {
              let currentTags = new Set();
              let currentNote = "";
              if (currentHit.hitResults !== null) {
                const result = currentHit.hitResults[0].result;
                try {
                  const resultJson = JSON.parse(result);
                  currentTags = new Set(resultJson.labels);
                  currentNote = resultJson.note;
                } catch (exception) {
                  // statements
                  console.log("exception", exception);
                  currentTags = new Set(result.split("____"));
                }
              }
              this.setState({
                currentTags,
                shortcuts,
                currentNote,
                rules,
                entities,
                entityColorMap,
                currentIndex,
                hits: currentHits,
                currentHit,
                projectDetails,
                loading: false,
                action: ""
              });
            }
          } else if (
            projectDetails.task_type === IMAGE_CLASSIFICATION ||
            projectDetails.task_type === VIDEO_CLASSIFICATION
          ) {
            if (response.body.hits.length > 0) {
              let currentTags = new Set();
              let currentNote = "";
              if (
                currentHit.hitResults !== null &&
                currentHit.hitResults[0].result.length > 0
              ) {
                const result = currentHit.hitResults[0].result;
                try {
                  const resultJson = JSON.parse(result);
                  currentTags = new Set(resultJson.labels);
                  currentNote = resultJson.note;
                } catch (exception) {
                  // statements
                  console.log("exception", exception);
                  currentTags = new Set(result.split("____"));
                }
              }
              const image1 = new Image(); // eslint-disable-line no-undef
              image1.src = currentHit.data;
              setTimeout(this.loadImages.bind(this), 10000);
              this.setState({
                currentTags,
                shortcuts,
                rules,
                currentNote,
                entities,
                entityColorMap,
                currentIndex,
                hits: currentHits,
                currentHit,
                projectDetails,
                loading: false,
                action: ""
              });
            }
          } else if (
            projectDetails.task_type === IMAGE_BOUNDING_BOX ||
            projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX ||
            projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 ||
            projectDetails.task_type === VIDEO_BOUNDING_BOX
          ) {
            let hideLabels = false;
            let autoClose = true;
            let notes = false;
            let defaultShape = "polygon";
            let keepEntitySelected = false;
            if ("notes" in rules) {
              notes = rules.notes;
            }
            if ("autoClose" in rules) {
              autoClose = rules.autoClose;
            }
            if ("hideLabels" in rules) {
              hideLabels = rules.hideLabels;
            }
            if ("defaultShape" in rules) {
              defaultShape = rules.defaultShape;
            }
            if ("keepEntitySelected" in rules) {
              keepEntitySelected = rules.keepEntitySelected;
            }
            if (response.body.hits.length > 0) {
              const image1 = new Image(); // eslint-disable-line no-undef
              image1.src = currentHit.data;
              setTimeout(this.loadImages.bind(this), 10000);
              let boundingBoxMap = [];
              if (
                currentHit.hitResults &&
                currentHit.hitResults[0].result.length > 0
              ) {
                boundingBoxMap = JSON.parse(currentHit.hitResults[0].result);
              }
              this.setState({
                boundingBoxMap,
                defaultShape,
                autoClose,
                notes,
                hideLabels,
                entityJson,
                newEntities: [],
                shortcuts,
                rules,
                entities,
                entityColorMap,
                keepEntitySelected,
                currentIndex,
                hits: currentHits,
                currentHit,
                projectDetails,
                loading: false,
                action: ""
              });
            }
          } else if (
            projectDetails.task_type === DOCUMENT_ANNOTATION ||
            projectDetails.task_type === POS_TAGGING_GENERIC
          ) {
            let autoClose = true;
            let classification = undefined;
            let classificationResponse = [];
            if ("autoClose" in rules) {
              autoClose = rules.autoClose;
            }
            if ("classification" in rules) {
              classification = rules.classification;
            }
            if (response.body.hits.length > 0) {
              let boundingBoxMap = {};
              if (classification) {
                if (
                  currentHit.hitResults &&
                  currentHit.hitResults[0].result.length > 0
                ) {
                  let resultObject = JSON.parse(currentHit.hitResults[0].result);
                  if ("annotationResult" in resultObject) {
                    boundingBoxMap = resultObject.annotationResult;
                    classificationResponse = getClassificationResponse(
                      resultObject.classificationResult
                    );
                  } else {
                    boundingBoxMap = resultObject;
                  }
                }
              } else {
                if (currentHit.hitResults && currentHit.hitResults[0].result.length > 0) {
                  boundingBoxMap = JSON.parse(currentHit.hitResults[0].result);
                }
              }
              // let currentTags = new Set();
              // if (currentHit.hitResults !== null) {
              //   currentTags = new Set(currentHit.hitResults[0].result.split('____'));
              // }
              this.setState({
                boundingBoxMap,
                classification,
                classificationResponse,
                shortcuts,
                autoClose,
                rules,
                entities,
                newEntities: [],
                entityColorMap,
                currentIndex,
                hits: currentHits,
                currentHit,
                projectDetails,
                loading: false,
                action: ""
              });
            }
          }
      }
    } else {
      alert("Error in fetching project details, please try again");
      this.props.pushState("/projects/login");
      if (error && error.message) {
        logEvent("project_detail_fetch_error", error.message);
      } else {
        logEvent("project_detail_fetch_error", "Error");
      }
      this.setState({ loading: false });
    }
  }

  loadImages() {
    const currentHits = this.state.hits;
    for (let index = 1; index < currentHits.length; index++) {
      const image1 = new Image(); // eslint-disable-line no-undef
      image1.src = currentHits[index].data;
    }
  }

  loadProjectDetails(pid, start, count) {
    console.log("load project details", pid, start, count);
    // TODO_REPLACE
    let startP = start;
    if (startP === undefined) {
      console.log("undefined");
      startP = this.state.currentStart;
    }
    this.setState({ loading: true });
    fetchHits(
      pid ? pid : this.props.currentProject,
      startP,
      count ? count : this.state.currentCount,
      this.projectDetailsFetched,
      this.state.type,
      this.state.label,
      this.state.contributorId,
      this.state.evaluationType
    );
  }

  tagAreaClick(index, keyFlag) {
    console.log(" tagArea click ", index, keyFlag);
    const currentClickState = this.state.clickedColor;
    let select = this.state.selectIds;
    if (keyFlag) {
      for (
        let jindex = 0;
        jindex < Object.keys(currentClickState).length;
        jindex++
      ) {
        if (currentClickState[jindex] === "grey") {
          currentClickState[jindex] = "";
        }
      }
      console.log("currentClickState", currentClickState);
      if (currentClickState[index] === "") {
        currentClickState[index] = "grey";
      }
      select = [index];
    } else {
      if (currentClickState[index] === "grey") {
        currentClickState[index] = "";
        const indexDel = select.indexOf(index);
        if (indexDel > -1) {
          select.splice(indexDel, 1);
        }
      } else {
        currentClickState[index] = "grey";
        select.push(index);
      }
    }
    this.setState({
      clickedColor: currentClickState,
      tagSelected: true,
      selectIds: select,
      cursorIndex: index
    });
    return false;
  }

  hitAddCallback(error, response, action) {
    console.log(" Hit Added ", error, action, response, this.state);
    if (!error) {
      const chits = this.state.hits;
      let nextIndex = -1;
      let imgLoaded = false;

      // chits[currentIndex].result = getTaggedResult
      // for (let index = this.state.currentIndex + 1; index < chits.length; index ++) {
      //   if (!chits[index].result) {
      //     nextIndex = index;
      //     break;
      //   }
      // }
      if ((action && action === "moveToDone") || this.state.action === "moveToDone") {
        nextIndex = this.state.currentIndex;
        this.state.currentStart = this.state.currentStart - 1;
        chits.splice(this.state.currentIndex, 1);
        if (nextIndex >= chits.length) {
          // items areover in list new item are fetched and navigation start from enxt element so decreasing trhe count
          this.state.currentIndex = this.state.currentIndex - 1;
          nextIndex = nextIndex - 1;
        }
      } else if ((action && action === "saveToDone") || this.state.action === "saveToDone") {
        if (this.state.currentIndex + 1 < chits.length) {
          nextIndex = this.state.currentIndex + 1;
        }
        imgLoaded = true;
      } else if ((action && action === "next") || this.state.action === "next") {
        if (this.state.currentIndex + 1 < chits.length) {
          nextIndex = this.state.currentIndex + 1;
        }
      } else if (
        (action && action === "previous") ||
        this.state.action === "previous"
      ) {
        if (this.state.currentIndex > 0) {
          nextIndex = this.state.currentIndex - 1;
        }
      }
      // chits.splice(0, 1);
      // console.log(' Hit Added ', chits);
      let currentHit = this.state.currentHit;
      if (nextIndex > -1 &&  nextIndex < chits.length) {
        currentHit = chits[nextIndex];
        let currentTags = new Set();
        let currentNote = "";
        let textSummary = "";
        let boundingBoxMap = [];
        let classificationResponse = {};
        if (this.state.projectDetails.task_type === POS_TAGGING) {
          console.log("currenhit", currentHit);
          if (currentHit.result) {
            this.addHitinState(currentHit.result, currentHit.data);
          } else if (currentHit.hitResults && currentHit.hitResults[0].result) {
            this.addHitinState(currentHit.hitResults[0].result, currentHit.data);
          } else {
            this.addHitinState(currentHit.data);
          }
          // this.addHitinState(currentHit.hitResults ? currentHit.hitResults[0].result : currentHit.data);
        }
        if (currentHit.result && currentHit.result !== null) {
          if (
            this.state.projectDetails.task_type === TEXT_CLASSIFICATION ||
            this.state.projectDetails.task_type === IMAGE_CLASSIFICATION ||
            this.state.projectDetails.task_type === VIDEO_CLASSIFICATION
          ) {
            const result = currentHit.result;
            try {
              const resultJson = JSON.parse(result);
              currentTags = new Set(resultJson.labels);
              currentNote = resultJson.note;
            } catch (exception) {
              // statements
              console.log("exception", exception);
              currentTags = new Set(result.split("____"));
            }
          } else if (
            this.state.projectDetails.task_type === TEXT_SUMMARIZATION ||
            this.state.projectDetails.task_type === TEXT_MODERATION
          ) {
            textSummary = currentHit.result;
          } else if (
            this.state.projectDetails.task_type === IMAGE_BOUNDING_BOX ||
            this.state.projectDetails.task_type ===
              IMAGE_POLYGON_BOUNDING_BOX ||
            this.state.projectDetails.task_type ===
              IMAGE_POLYGON_BOUNDING_BOX_V2 ||
            this.state.projectDetails.task_type === VIDEO_BOUNDING_BOX ||
            this.state.projectDetails.task_type === DOCUMENT_ANNOTATION ||
            this.state.projectDetails.task_type === POS_TAGGING_GENERIC
          ) {
            if (this.state.classification) {
              let resultObject = JSON.parse(currentHit.result);
              if ("annotationResult" in resultObject) {
                boundingBoxMap = resultObject.annotationResult;
                classificationResponse = getClassificationResponse(
                  resultObject.classificationResult
                );
              } else {
                boundingBoxMap = resultObject;
              }
            } else {
              boundingBoxMap = JSON.parse(currentHit.result);
            }
          }
        } else if (currentHit.hitResults !== null) {
          if (
            this.state.projectDetails.task_type === TEXT_SUMMARIZATION ||
            this.state.projectDetails.task_type === TEXT_MODERATION
          ) {
            textSummary = currentHit.hitResults[0].result;
          } else if (
            this.state.projectDetails.task_type === TEXT_CLASSIFICATION ||
            this.state.projectDetails.task_type === IMAGE_CLASSIFICATION ||
            this.state.projectDetails.task_type === VIDEO_CLASSIFICATION
          ) {
            const result = currentHit.hitResults[0].result;
            try {
              const resultJson = JSON.parse(result);
              currentTags = new Set(resultJson.labels);
              currentNote = resultJson.note;
            } catch (exception) {
              // statements
              console.log("exception", exception);
              currentTags = new Set(result.split("____"));
            }
          } else if (
            this.state.projectDetails.task_type === IMAGE_BOUNDING_BOX ||
            this.state.projectDetails.task_type ===
              IMAGE_POLYGON_BOUNDING_BOX ||
            this.state.projectDetails.task_type === VIDEO_BOUNDING_BOX ||
            this.state.projectDetails.task_type ===
              IMAGE_POLYGON_BOUNDING_BOX_V2 ||
            this.state.projectDetails.task_type === DOCUMENT_ANNOTATION ||
            this.state.projectDetails.task_type === POS_TAGGING_GENERIC
          ) {
            if (currentHit.hitResults[0].result.length > 0) {
              if (this.state.classification) {
                let resultObject = JSON.parse(currentHit.hitResults[0].result);
                if ("annotationResult" in resultObject) {
                  boundingBoxMap = resultObject.annotationResult;
                  classificationResponse = getClassificationResponse(
                    resultObject.classificationResult
                  );
                } else {
                  boundingBoxMap = resultObject;
                }
              } else {
                boundingBoxMap = JSON.parse(currentHit.hitResults[0].result);
              }
            }
          }
        }
        this.setState({
          startTime: new Date().getTime(),
          currentNote,
          classificationResponse,
          imgLoaded,
          currentTags,
          boundingBoxMap,
          hits: chits,
          action: "",
          textSummary,
          currentIndex: nextIndex,
          currentHit,
          selectIds: [],
          tagSelected: false,
          loading: false
        });
      } else {
        const { currentStart, currentCount } = this.state;
        this.setState({ currentStart: currentStart + currentCount });
        if (!this.state.type || this.state.type === "notDone") {
          this.loadProjectDetails(this.props.currentProject, 0, currentCount);
        } else {
          this.loadProjectDetails(
            this.props.currentProject,
            currentStart + currentCount,
            this.state.DEFAULT_COUNT
          );
          this.setState({
            currentStart: currentStart + currentCount,
            currentCount: this.state.DEFAULT_COUNT,
            currentHit: undefined
          });
        }
      }
    } else {
      if (response && response.body && response.body.code && response.body.code === 401) {
        refreshUidToken(() => { console.log('token refreshed'); this.setState({ loading: false })});
      } else {
        alert(error.message);
        this.setState({ loading: false, error: error.message });
      }
    }
  }

  openProjectStats() {
    this.props.pushState("/projects/stats");
  }

  // createEntityColorMap(entities) {
  //   const colorMap = {};
  //   for (let index = 0; index < entities.length; index ++) {
  //     colorMap[entities[index]] = ENTITY_COLORS[index > ENTITY_COLORS.length ? index % ENTITY_COLORS.length : index ];
  //   }
  //   return colorMap;
  // }

  skipRow(event, data) {
    console.log(" skipRow ", event, data, this.state);
    // const latency = ((new Date().getTime() - this.state.startTime) / 1000).toPrecision(3);
    logEvent("buttons", "Skip hit");
    logEvent("Mark As", 'Skipped');
    this.setState({ loading: true, action: "next", changesInSession: 0 });
    skipHits(
      this.state.currentHit.id,
      this.props.currentProject,
      this.hitAddCallback
    );
    return false;
  }

  projectEditedCallback(response, error) {
    console.log("response error", response, error);
    this.setState({ loading: false });
  }

  saveTagAndNextRow(action, data) {
    console.log(" saveTagAndNextRow ", action, data, this.state);
    const latency = (
      (new Date().getTime() - this.state.startTime) /
      1000
    ).toPrecision(3);
    logEvent("buttons", "Next hit");
    if (this.state.changesInSession > 0) {
      logEvent("buttons", "Labeled Data");
    }
    if (this.state.newEntities && this.state.newEntities.length > 0) {
      logEvent("buttons", "New Entities");
      console.log("edit", this.state.newEntities);
      const { taskRules } = this.props.projectDetails;
      const rulesJson = JSON.parse(taskRules);
      rulesJson.tags = [...this.state.entities, ...this.state.newEntities].join(
        ","
      );
      editProject(
        this.props.currentProject,
        { rules: JSON.stringify(rulesJson) },
        this.projectEditedCallback.bind(this)
      );
      this.setState({ loading: true, newEntities: [] });
    }
    const resultString = this.getCurrentResult();
    this.state.currentHit.result = resultString;
    if (this.state.changesInSession > 0) {
      if (this.state.classification && this.state.classification.length > 0) {
        if (Object.keys(this.state.classificationResponse).length === 0) {
          alert("Please choose atleast one classification");
          return false;
        }
      }
      this.setState({loading: true, action: 'next', changesInSession: 0});
      addHits(
        this.state.currentHit.id,
        { result: resultString, timeTakenToLabelInSec: latency },
        this.props.currentProject,
        this.hitAddCallback
      );
    } else {
      this.setState({ changesInSession: 0, loading: true, action: 'next' });
      this.hitAddCallback(undefined, "No Tag Found, moving to next", 'next');
    }
    return false;
  }

  removeTag(index) {
    const { clickedColor, taggedEntity, changesInSession } = this.state;
    clickedColor[index] = "";
    taggedEntity[index] = "__";
    this.setState({
      clickedColor,
      taggedEntity,
      tagSelected: false,
      selectIds: [],
      changesInSession: changesInSession + 1
    });
    // /    console.log('remove tag', data, data2);
  }

  copyToClipboard = (event, value) => {
    logEvent("buttons", 'copyToClipboard');
    console.log("event is ", event, value, this.refs);
    if (this.state.currentHit) {
      const dummy = document.createElement("input");
      // Add it to the document
      document.body.appendChild(dummy);
      // Set its ID
      dummy.setAttribute("id", "dummy_id");
      // Output the array into it
      document.getElementById("dummy_id").value = this.state.currentHit
        ? this.state.currentHit.data
        : this.state.tagLine;
      // Select it
      dummy.select();
      // Copy its contents
      document.execCommand("copy");
      // Remove it as its not needed anymore
      document.body.removeChild(dummy);
      // This is just personal preference.
      // I prefer to not show the the whole text area selected.
      // event.target.focus();
      this.setState({ copySuccess: "Copied!" });
    }
  };

  showTagLine() {
    const currentHit = this.state.currentHit;
    const splits = currentHit.data.split(" ");
    const shortcuts = this.state.shortcuts;
    const renderArrs = [];
    if ("left" in shortcuts) {
      const lcombo = convertKeyToString(shortcuts.left);
      Mousetrap.bind(
        lcombo,
        this.tagAreaClick.bind(
          this,
          this.state.cursorIndex - 1 >= 0 ? this.state.cursorIndex - 1 : 0,
          true
        )
      );
    }
    if ("right" in shortcuts) {
      const rcombo = convertKeyToString(shortcuts.right);
      Mousetrap.bind(
        rcombo,
        this.tagAreaClick.bind(
          this,
          this.state.cursorIndex + 1 < splits.length
            ? this.state.cursorIndex + 1
            : splits.length - 1,
          true
        )
      );
    }
    for (let index = 0; index < splits.length; index++) {
      console.log(" color is ", this.state.clickedColor[index]);
      let iconC = "hidden";
      if (
        this.state.clickedColor[index] &&
        this.state.clickedColor[index] !== ""
      ) {
        iconC = "";
      }
      renderArrs.push(
        <Label
          size="large"
          className={styles.clickableLabel}
          name={index}
          style={{
            padding: "5px",
            color: "white",
            backgroundColor: this.state.clickedColor[index]
              ? this.state.clickedColor[index]
              : "silver"
          }}
          key={index}
        >
          <span
            onClick={this.tagAreaClick.bind(this, index, false)}
            name={index}
            key={index}
          >
            {splits[index]}
          </span>
          {this.state.taggedEntity[index] !== "__" && (
            <p style={{ display: "inline", fontSize: "1rem" }}>
              &nbsp; &nbsp; &nbsp; {this.state.taggedEntity[index]}
              <Icon
                name="delete"
                onClick={this.removeTag.bind(this, index)}
                className={iconC}
              />
            </p>
          )}
        </Label>
      );
    }

    return (
      <div className={styles.tagArea}>
        {renderArrs}
        <Button
          className={styles.copyButton}
          size="small"
          onClick={this.copyToClipboard}
        >
          <Icon name="copy" color="teal" />
          Copy
        </Button>
      </div>
    );
  }

  removeCurrentTag(ent) {
    const { currentTags, changesInSession } = this.state;
    currentTags.delete(ent);
    this.setState({ currentTags, changesInSession: changesInSession + 1 });
  }

  showCurrentTags() {
    console.log(" show current tags ", this.state);
    const { currentTags, entityColorMap } = this.state;
    const renderArrs = [];
    for (const ent of currentTags) {
      console.log("show current tag", ent, entityColorMap[ent]);
      renderArrs.push(
        <Label
          key={ent}
          style={{
            padding: "5px",
            color: "white",
            backgroundColor: entityColorMap[ent]
          }}
        >
          {" "}
          {ent}
          <Icon name="delete" onClick={this.removeCurrentTag.bind(this, ent)} />
        </Label>
      );
    }
    return <div> {renderArrs} </div>;
  }

  showText() {
    // const currentHit = this.state.currentHit;
    const { data } = this.state.currentHit;
    console.log("show text", this.state);
    return (
      <div className={styles.tagArea}>
        <p className={styles.textStyle}>{data}</p>
        {this.state.projectDetails.task_type === TEXT_CLASSIFICATION &&
          this.state.currentTags &&
          this.state.currentTags.size > 0 &&
          this.showCurrentTags()}
        <Button
          className={styles.copyButton}
          size="small"
          onClick={this.copyToClipboard}
        >
          <Icon name="copy" color="teal" />
          Copy
        </Button>
      </div>
    );
  }

  showTextAnnotation() {
    // const currentHit = this.state.currentHit;
    const { data } = this.state.currentHit;
    console.log("show text", this.state);
    return (
      <div className={styles.tagArea}>
        <p className={styles.textStyle}>{data}</p>
        {this.state.projectDetails.task_type === TEXT_CLASSIFICATION &&
          this.state.currentTags &&
          this.state.currentTags.size > 0 &&
          this.showCurrentTags()}
        <Button
          className={styles.copyButton}
          size="small"
          onClick={this.copyToClipboard}
        >
          <Icon name="copy" color="teal" />
          Copy
        </Button>
      </div>
    );
  }

  handleChange(field, element) {
    const value = element.target.value;
    console.log(" field value ", field, value);
    const changesInSession = this.state.changesInSession + 1;
    this.setState({ changesInSession, textSummary: value });
  }

  showWriteText(type) {
    if (type === TEXT_SUMMARIZATION) {
      return (
        <Form.Field
          id="write_text"
          control={TextArea}
          onChange={this.handleChange.bind(this, "summary")}
          label="Summary"
          value={this.state.textSummary}
          placeholder="Write text summary here..."
        />
      );
    } else if (type === TEXT_MODERATION) {
      return (
        <Form.Field
          id="write_text"
          control={TextArea}
          onChange={this.handleChange.bind(this, "summary")}
          label="Moderated Text"
          value={this.state.textSummary}
          placeholder="Write moderated text here..."
        />
      );
    }
  }

  showTags(entiti) {
    const renderArrs = [];
    const shortcuts = this.state.shortcuts;
    for (let index = 0; index < entiti.length; index++) {
      const entity = entiti[index];
      const color =
        ENTITY_COLORS[
          index > ENTITY_COLORS.length ? index - ENTITY_COLORS.length : index
        ];
      let combo = "";
      if (entity in shortcuts) {
        combo = convertKeyToString(shortcuts[entity]);
        if (this.state.projectDetails.task_type === POS_TAGGING) {
          Mousetrap.bind(
            combo,
            this.setTagClick.bind(this, null, { name: entity })
          );
        } else {
          if (this.state.currentIndex >= 0) {
            Mousetrap.bind(combo, this.setClassification.bind(this, entity));
          }
        }
      }
      renderArrs.push(
        <Label
          size="large"
          name={entity}
          className={styles.clickableLabel}
          style={{
            padding: "5px",
            color: "white",
            backgroundColor: this.state.entityColorMap[entity]
          }}
          onClick={this.setTagClick}
          key={color}
        >
          {entity} <br /> {combo}
        </Label>
      );
    }

    return <div>{renderArrs}</div>;
  }

  showImages() {
    console.log("images are ", this.state);
    const { data } = this.state.currentHit;
    console.log("show text", this.state);
    let windowHeight = (window.innerHeight * 70) / 100;
    let windowWidth = (window.innerWidth * 65) / 100;
    if (this.state.fullScreen) {
      windowHeight = (window.innerHeight * 75) / 100;
    }
    if (this.state.type !== "notDone") {
      windowHeight = (window.innerHeight * 65) / 100;
      windowWidth = (window.innerWidth * 60) / 100;
    }
    if (!checkVideoURL(data)) {
      return (
        <div className={styles.tagArea} style={{ lineHeight: '1.0rem'}}>
          {!this.state.imgLoaded && (
            <Dimmer active>
              <Loader />
            </Dimmer>
          )}
          <PanZoomElement
            image={data}
            drawButton={false}
            zoomable
            width={windowWidth}
            height={windowHeight}
          >
              <img
                draggable="false"
                onLoad={() => {
                  this.setState({ imgLoaded: true });
                }}
                className="no-flickr"
                src={data}
                style={{
                  maxHeight: `${windowHeight}`,
                  maxWidth: `${windowHeight}`,
                  width: "auto",
                  height: "auto",
                  display: "block",
                  margin: "auto",
                  marginTop: "20px",
                  cursor: "move"
                }}
              />
          </PanZoomElement>
          {this.state.projectDetails.task_type === IMAGE_CLASSIFICATION &&
            this.state.currentTags &&
            this.state.currentTags.size > 0 &&
            this.showCurrentTags()}
        </div>
      );
    } else if (checkVideoURL(data)) {
      return (
        <div className={styles.tagArea} style={{ lineHeight: '1.0rem'}}>
          <Player
            width={windowWidth}
            height={windowHeight}
            preload="auto"
            fluid={false}
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
          </Player>
          {this.state.projectDetails.task_type === VIDEO_CLASSIFICATION &&
            this.state.currentTags &&
            this.state.currentTags.size > 0 &&
            this.showCurrentTags()}
        </div>
      );
    }
  }

  annotateCallback = obj => {
    console.log("draw handle", obj, this.state);
    const { data } = this.state.currentHit;
    const boundingBoxMap = [];
    let changesInSession = 0;
    let newEntities = obj.newEntities;
    console.log('draw handle newEntities', newEntities);
    for (let index = 0; index < obj.annotations.length; index++) {
      const annotation = obj.annotations[index];
      const points = [];
      // console.log(
      //   "cross check",
      //   selectedString,
      //   annotation.text,
      //   data,
      //   annotation.start,
      //   annotation.end
      // );
      if (!this.state.currentHit.isURL) {
        const selectedString = data.substring(
          annotation.start,
          annotation.end + 1
        );
        if (selectedString === annotation.text) {
          if (annotation.category.length > 0 && annotation.text.length > 0) {
            points.push({
              start: annotation.start,
              end: annotation.end,
              text: annotation.text
            });
            boundingBoxMap.push({ label: annotation.category, points });
            changesInSession = changesInSession + 1;
          }
        } else {
          if (window.Raven) {
            if (__DEVELOPMENT__) {
              alert("annotation error, please refresh");
            }
            // window.Raven.captureException(
            //   "Error while annotating doc, hit is :  " +
            //     JSON.stringify(this.state.currentHit)
            // );
          }
        }
      } else if (this.state.currentHit.isURL) {
        if (annotation.category.length > 0 && annotation.end > annotation.start) {
          points.push({
            start: annotation.start,
            end: annotation.end,
          });
          boundingBoxMap.push({ label: annotation.category, points });
          changesInSession = changesInSession + 1;
        }
      }
    }
    if (
      this.state.boundingBoxMap &&
      this.state.boundingBoxMap.length > 0 &&
      obj.annotations.length === 0
    ) {
      changesInSession = changesInSession + 1;
    }
    if (newEntities.length > 0) {
      newEntities = [...this.state.newEntities, ...newEntities];
    } else {
      newEntities = this.state.newEntities;
    }
    let undoButton = true;
    if (obj.undoAnnotations.length > 0) {
      undoButton = false;
    }
    console.log("boundingBoxMap is ", boundingBoxMap);
    this.state.boundingBoxMap = boundingBoxMap;
    this.state.newEntities = newEntities;
    this.setState({
      changesInSession,
      boundingBoxMap,
      newEntities,
      undoButton
    });
  };

  showDocumentAnnotation() {
    // using a generator function
    console.log("doc annotation taggerspace ", this.state);
    const { data } = this.state.currentHit;
    const boundingBoxMap = this.state.boundingBoxMap;
    const annotations = [];
    if (this.state.boundingBoxMap) {
      for (let index = 0; index < boundingBoxMap.length; index++) {
        const bb = boundingBoxMap[index];
        const colors = [];
        for (let jindex = 0; jindex < bb.label.length; jindex++) {
          if (bb.label[jindex] in this.state.entityColorMap) {
            colors.push(this.state.entityColorMap[bb.label[jindex]]);
          } else {
            colors.push("brown");
          }
        }
        console.log(
          "doc annotate callback",
          bb.points[0].start + "-" + bb.points[0].end
        );
        annotations.push({
          category: bb.label,
          start: bb.points[0].start,
          end: bb.points[0].end,
          text: bb.points[0].text,
          id: bb.points[0].start + "-" + bb.points[0].end,
          color: colors
        });
      }
    }
    return (
      <div className={styles.tagArea}>
        {this.state.entities.length > 0 &&
          <div>
          <h3> Entities </h3>
          {this.showClassifyTags("false")}
         </div>
        }
        <DocumentAnnotator
          ref={node => (this.docAnnotator = node)}
          shortcuts={this.state.shortcuts}
          hits={this.state.hits}
          currentIndex={this.state.currentIndex}
          saveTagAndNextRow={this.saveTagAndNextRow}
          saveRow={this.moveToDone}
          skipRow={this.skipRow}
          urlData={this.state.currentHit.isURL}
          getBackTopreviousRow={this.getBackTopreviousRow}
          autoClose={this.state.autoClose}
          autoLabel={this.state.autoLabel}
          annotations={annotations}
          space={this.state.type === HIT_STATE_NOT_DONE}
          documentText={data}
          annotateCallback={this.annotateCallback}
          entityColorMap={this.state.entityColorMap}
        />
      </div>
    );
  }

  drawVideo = (obj, callback, param) => {
    console.log("draw handle", obj.rects, obj.rectTimeMap, callback, param);
    const boundingBoxMap = [];
    let changesInSession = 0;
    for (const key of Object.keys(obj.rects)) {
      const timeMap = obj.rectTimeMap[key];
      let shape = "polygon";
      if (obj.rectShapeMap) {
        shape = obj.rectShapeMap[key];
      }
      const positions = [];
      for (let jindex = 0; jindex < timeMap.length; jindex++) {
        if (timeMap[jindex] !== undefined) {
          positions.push({ points: obj.rects[key][jindex], time: timeMap[jindex] });
        }
      }
      // positions.push({points: obj.rects[key], time: timeMap[1]});
      boundingBoxMap.push({
        startTime: timeMap[0],
        endTime: obj.endTimeMap[key],
        label: obj.rectCatMap[key],
        shape,
        positions,
        videoWidth: obj.player.videoWidth,
        videoHeight: obj.player.videoHeight
      });
      changesInSession = changesInSession + 1;
    }
    if (
      this.state.boundingBoxMap &&
      this.state.boundingBoxMap.length > 0 &&
      Object.keys(obj.rects).length === 0
    ) {
      changesInSession = changesInSession + 1;
    }
    console.log("boundingBoxMap is ", boundingBoxMap);
    this.setState({ changesInSession, boundingBoxMap }, () => {
      if (callback) callback(param);
    });
  };

  validPoints = (points) => {
    for (let index = 0; index < points.length; index ++) {
      if ((points[index][0] > 1.0 || points[index][1] > 1.0) ||
            (points[index][0] < 0.0 || points[index][1] < 0.0))
            return false;
    }
    return true;
  }

  drawPolygon = obj => {
    console.log("draw handle", obj);
    const boundingBoxMap = [];
    let changesInSession = 0;
    // const image1 = new Image(); // eslint-disable-line no-undef
    // image1.src = this.state.currentHit.data;
    // console.log("image ", image1.width, image1.height);
    for (const key of Object.keys(obj.rects)) {
      let note = '';
      if (obj.notes && key in obj.notes) {
        note = obj.notes[key];
      }
      const points = obj.rects[key];
      if (this.validPoints(points)) {
        if (obj.rectShapeMap) {
          boundingBoxMap.push({
            label: obj.rectCatMap[key],
            shape: obj.rectShapeMap[key],
            points,
            notes: note,
            imageWidth: obj.imageNaturalWidth,
            imageHeight: obj.imageNaturalHeight
          });
        } else {
          boundingBoxMap.push({
            label: obj.rectCatMap[key],
            points,
            notes: note,
            imageWidth: obj.imageNaturalWidth,
            imageHeight: obj.imageNaturalHeight
          });
        }
      } else {
        captureException("Wrong co-ordinates spotted", this.state.currentHit);
        logEvent('Error', "Image Points");
        alert('Annotation error. please refresh the page.');
      }
      changesInSession = changesInSession + 1;
    }
    if (
      this.state.boundingBoxMap &&
      this.state.boundingBoxMap.length > 0 &&
      Object.keys(obj.rects).length === 0
    ) {
      changesInSession = changesInSession + 1;
    }
    console.log("boundingBoxMap is ", boundingBoxMap);
    this.setState({ changesInSession, boundingBoxMap });
  };

  drawHandle = obj => {
    console.log("draw handle", obj);
    const boundingBoxMap = [];
    let changesInSession = 0;
    // const image1 = new Image(); // eslint-disable-line no-undef
    // image1.src = this.state.currentHit.data;
    let newEntities = obj.newEntities;
    // console.log("imagesize ", image1.width, image1.height);
    for (let index = 0; index < obj.rects.length; index++) {
      const rect = obj.rects[index];
      const points = [];
      console.log("draw handle rect is ", rect);
      points.push({ x: rect.x1, y: rect.y1 });
      points.push({ x: rect.x2, y: rect.y2 });
      boundingBoxMap.push({
        label: obj.rectCatMap[index],
        notes: obj.notes[index],
        points,
        imageWidth: obj.imageNaturalWidth,
        imageHeight: obj.imageNaturalHeight
      });
      changesInSession = changesInSession + 1;
    }
    if (
      this.state.boundingBoxMap &&
      this.state.boundingBoxMap.length > 0 &&
      obj.rects.length === 0
    ) {
      changesInSession = changesInSession + 1;
    }
    if (newEntities.length > 0) {
      newEntities = [...this.state.newEntities, ...newEntities];
    } else {
      newEntities = this.state.newEntities;
    }
    console.log(
      "boundingBoxMap is ",
      boundingBoxMap,
      newEntities,
      this.state.newEntities
    );
    this.setState({ changesInSession, boundingBoxMap, newEntities });
  };

  showPolygonV2BoundingImages() {
    // using a generator function
    console.log("images are ", this.state);
    const { data } = this.state.currentHit;
    const boundingBoxMap = this.state.boundingBoxMap;
    console.log("show text v2", this.state);
    const rects = [];
    const rectCatMap = {};
    const rectShapeMap = {};
    const notes = {};
    if (this.state.boundingBoxMap) {
      for (let index = 0; index < boundingBoxMap.length; index++) {
        rects[index] = boundingBoxMap[index].points;
        let labels = [];
        if (typeof boundingBoxMap[index].label === 'string') {
          labels.push(boundingBoxMap[index].label);
        } else {
          labels = boundingBoxMap[index].label;
        }
        rectCatMap[index] = labels;
        if (boundingBoxMap[index].shape) {
          rectShapeMap[index] = boundingBoxMap[index].shape;
        }
        if (boundingBoxMap[index].notes) {
          notes[index] = boundingBoxMap[index].notes;
        }
      }
    }
    console.log("rectShapeMap", rectShapeMap);
    return (
      <div>
        <PolygonAnnotatorV2
          space={this.state.type === HIT_STATE_NOT_DONE}
          shortcuts={this.state.shortcuts}
          keepEntitySelected={this.state.keepEntitySelected}
          rectShapeMap={rectShapeMap}
          notes={notes}
          defaultShape={this.state.defaultShape}
          fullScreen={this.state.isFullscreenEnabled}
          loading={this.state.loading}
          hits={this.state.hits}
          currentIndex={this.state.currentIndex}
          saveTagAndNextRow={this.saveTagAndNextRow}
          saveRow={this.moveToDone}
          skipRow={this.skipRow}
          getBackTopreviousRow={this.getBackTopreviousRow}
          rects={rects}
          rectCatMap={rectCatMap}
          image={data}
          drawHandle={(this.state.type === HIT_STATE_DONE || this.state.type === HIT_STATE_NOT_DONE) ? this.drawPolygon : undefined}
          entityColorMap={this.state.entityColorMap}
          entitiesObject={this.state.entityJson}
        />
      </div>
    );
  }

  showVideoAnnotation() {
    // using a generator function
    console.log("images are ", this.state);
    const { data } = this.state.currentHit;
    const boundingBoxMap = this.state.boundingBoxMap;
    console.log("show text v2", this.state);
    const rects = [];
    const rectCatMap = {};
    const rectShapeMap = {};
    const rectTimeMap = {};
    const endTimeMap = {};
    if (this.state.boundingBoxMap) {
      for (let index = 0; index < boundingBoxMap.length; index++) {
        rects[index] = [];
        let timeMap = [];
        for (let jindex = 0; jindex < boundingBoxMap[index].positions.length; jindex ++) {
          rects[index].push(boundingBoxMap[index].positions[jindex].points);
          timeMap.push(boundingBoxMap[index].positions[jindex].time)
        }
        if (timeMap.length === 1) {
          timeMap.push(undefined);
        }
        // rects[index] = boundingBoxMap[index].positions[0].points;
        rectCatMap[index] = boundingBoxMap[index].label;
        if (boundingBoxMap[index].shape) {
          rectShapeMap[index] = boundingBoxMap[index].shape;
        }
        rectTimeMap[index] = timeMap;
        endTimeMap[index] = boundingBoxMap[index].endTime;
      }
    }
    console.log("rectShapeMap", rectShapeMap);
    return (
      <div>
        <VideoAnnotator
          space={this.state.type === HIT_STATE_NOT_DONE}
          hits={this.state.hits}
          shortcuts={this.state.shortcuts}
          rectShapeMap={rectShapeMap}
          endTimeMap={endTimeMap}
          rectTimeMap={rectTimeMap}
          defaultShape="rectangle"
          fullScreen={this.state.isFullscreenEnabled}
          currentIndex={this.state.currentIndex}
          loading={this.state.loading}
          saveTagAndNextRow={this.saveTagAndNextRow}
          skipRow={this.skipRow}
          getBackTopreviousRow={this.getBackTopreviousRow}
          rects={rects}
          rectCatMap={rectCatMap}
          video={data}
          drawHandle={(this.state.type === HIT_STATE_DONE || this.state.type === HIT_STATE_NOT_DONE) ? this.drawVideo : undefined}
          entityColorMap={this.state.entityColorMap}
        />
      </div>
    );
  }

  showPolygonBoundingImages() {
    // using a generator function
    console.log("images are ", this.state);
    const { data } = this.state.currentHit;
    const boundingBoxMap = this.state.boundingBoxMap;
    console.log("show text", this.state);
    const rects = [];
    const rectCatMap = {};
    if (this.state.boundingBoxMap) {
      for (let index = 0; index < boundingBoxMap.length; index++) {
        rects[index] = boundingBoxMap[index].points;
        rectCatMap[index] = boundingBoxMap[index].label;
      }
    }
    return (
      <div className={styles.tagArea}>
        <PolygonAnnotator
          space={this.state.type === HIT_STATE_NOT_DONE}
          hits={this.state.hits}
          shortcuts={this.state.shortcuts}
          fullScreen={this.state.isFullscreenEnabled}
          currentIndex={this.state.currentIndex}
          loading={this.state.loading}
          saveTagAndNextRow={this.saveTagAndNextRow}
          skipRow={this.skipRow}
          getBackTopreviousRow={this.getBackTopreviousRow}
          rects={rects}
          rectCatMap={rectCatMap}
          image={data}
          drawHandle={(this.state.type === HIT_STATE_DONE || this.state.type === HIT_STATE_NOT_DONE) ? this.drawPolygon : undefined}
          entityColorMap={this.state.entityColorMap}
        />
      </div>
    );
  }

  showBoundingImages() {
    // using a generator function
    console.log("images are ", this.state);
    const { data } = this.state.currentHit;
    const boundingBoxMap = this.state.boundingBoxMap;
    console.log("show text", this.state);
    const rects = [];
    const rectCatMap = {};
    const notes = {};
    if (this.state.boundingBoxMap) {
      for (let index = 0; index < boundingBoxMap.length; index++) {
        const points = {};
        points.x1 = boundingBoxMap[index].points[0].x;
        points.x2 = boundingBoxMap[index].points[1].x;

        points.y1 = boundingBoxMap[index].points[0].y;
        points.y2 = boundingBoxMap[index].points[1].y;

        rects.push(points);
        rectCatMap[index] = boundingBoxMap[index].label;
        notes[index] = boundingBoxMap[index].notes;
      }
    }
    return (
      <div className={styles.tagArea} style={{ lineHeight: '1.0rem'}}>
        <BoxAnnotator
          loading={this.state.loading}
          space={this.state.type === HIT_STATE_NOT_DONE}
          hits={this.state.hits}
          currentIndex={this.state.currentIndex}
          fullScreen={this.state.isFullscreenEnabled}
          saveTagAndNextRow={this.saveTagAndNextRow}
          skipRow={this.skipRow}
          loading={this.state.loading}
          shortcuts={this.state.shortcuts}
          getBackTopreviousRow={this.getBackTopreviousRow}
          autoClose={this.state.autoClose}
          hideLabels={this.state.hideLabels}
          noteSettings={this.state.notes}
          menuHidden={this.props.menuHidden}
          notes={notes}
          rects={rects}
          rectCatMap={rectCatMap}
          image={data}
          drawHandle={(this.state.type === HIT_STATE_DONE || this.state.type === HIT_STATE_NOT_DONE) ? this.drawHandle : undefined}
          entityColorMap={this.state.entityColorMap}
        />
      </div>
    );
  }

  showClassifyTags(flag, direct) {
    const entiti = this.state.entities;
    const shortcuts = this.state.shortcuts;
    console.log("entit is ", this.state, flag);
    const renderArrs = [];
    for (let index = 0; index < entiti.length; index++) {
      if (!this.state.searchQuery || this.state.searchQuery.length === 0 || entiti[index].toUpperCase().includes(this.state.searchQuery.toUpperCase())) {
        const entity = entiti[index];
        let combo = "";
        if (entity in shortcuts && ((flag && flag !== "false") || !flag)) {
          combo = convertKeyToString(shortcuts[entity]);
          if (this.state.currentIndex >= 0) {
            Mousetrap.bind(combo, this.setClassification.bind(this, entity));
          }
        }
        let margin = '1% 5% 1% 5%';
        if (!direct) {
          margin = '0.2%';
        }
        // const color = ENTITY_COLORS[index > ENTITY_COLORS.length ? index - ENTITY_COLORS.length : index ];
        renderArrs.push(
          <Label
            style={{
              color: "white",
              margin: `${margin}`,
              backgroundColor: this.state.entityColorMap[entity]
            }}
            compact
            size="mini"
            name={entity}
            className={styles.clickableLabel}
            onClick={this.setClassification.bind(this, entity)}
            key={index}
          >
            {entity}
              {combo &&
                <p style={{ fontSize: 'xx-small' }}>
                ({combo})
              </p>}
          </Label>
        );
      }
    }
    if (direct && direct === 'vertical') {
      let height = '60%';
      let minSearchEntities = 9;
      if (this.state.type !== 'notDone') {
        height = '80%';
        minSearchEntities = 15;
      }
      return (<div style={{ padding: '0 5% 0 5%', position: 'relative', marginLeft: '15px', borderRadius: '5px',
                            backgroundColor: '#f5f9fa', border: '1px solid #eaf2f4', boxSizing: 'border-box',
                            display: 'flex', justifyContent: 'flex-start', flexDirection: 'column',
                            height: `${height}`, overflow: 'auto' }}>
                <Label size="mini" attached="top left">
                  Select Label
                </Label>
                <div>
                  { entiti.length > minSearchEntities &&
                    <Input size="mini" value={this.state.searchQuery} onChange={(event) => this.setState({searchQuery: event.target.value })} placeholder="Search..." />
                  }
                </div>
                {renderArrs}
            </div>);
    }
    return <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', maxHeight: '10em', overflow: 'auto' }}>{renderArrs}</div>;
  }

  deleteItem() {
    console.log('delete item');
    logEvent("buttons", 'delete');
    logEvent("Mark As", 'Delete');
    const { currentHit } = this.state;
    this.setState({ loading: true, action: 'moveToDone' });
    updateHitStatus(currentHit.id, this.props.currentProject, HIT_STATE_DELETED, '', this.moveToDoneCallback.bind(this));
  }

  retagHit() {
    console.log('retag item');
    logEvent("buttons", 'Retag');
    logEvent("Mark As", 'Retag');
    const { currentHit } = this.state;
    this.setState({ loading: true, action: 'moveToDone' });
    updateHitStatus(currentHit.id, this.props.currentProject, HIT_STATE_REQUEUED, '', this.moveToDoneCallback.bind(this));
  }


  showActionButtons() {
    return (
      <div>
        <br />
        <div
          style={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {(this.state.type === HIT_STATE_SKIPPED ||
            this.state.type === HIT_STATE_PRE_TAGGED ||
            this.state.type === HIT_STATE_REQUEUED) && (
            <Button
              compact
              size="mini"
              color="blue"
              icon
              onClick={this.moveToDone.bind(this, "moveToDone")}
            >
              <Icon name="save" />
              Mark as Done
            </Button>
          )}
          <br />
          {(this.state.type === HIT_STATE_DONE ||
            this.state.type === HIT_STATE_PRE_TAGGED ||
            this.state.type === HIT_STATE_REQUEUED ||
            this.state.type === HIT_STATE_DELETED) && (
            <Button
              compact
              size="mini"
              color="blue"
              title="Mark as skipped"
              icon
              onClick={this.moveToSkip.bind(this)}
            >
              <Icon name="mail forward" />
              Mark as Skipped
            </Button>
          )}
          <br />
          { (this.state.type === HIT_STATE_SKIPPED ||
              this.state.type === HIT_STATE_DONE ||
              this.state.type === HIT_STATE_PRE_TAGGED ||
              this.state.type === HIT_STATE_REQUEUED) && (
            <Button
              compact
              size="mini"
              color="red"
              icon
              onClick={this.deleteItem.bind(this)}
            >
              <Icon name="delete" />
              Delete
            </Button>
          )}
          <br />
          { (this.state.type === HIT_STATE_DONE ||
              this.state.type === HIT_STATE_SKIPPED ||
                this.state.type === HIT_STATE_PRE_TAGGED ||
                  this.state.type === HIT_STATE_DELETED) && (
            <Button
              title="Move HIT to Re-tagging Queue"
              compact
              size="mini"
              color="blue"
              icon
              onClick={this.retagHit.bind(this)}
            >
              <Icon name="undo" />
              Requeue
            </Button>
          )}
        </div>
      </div>
    );
  }

  evaluateHit(value) {
    console.log('evaluate hit', value);
    logEvent("evaluation", value);
    const { currentHit } = this.state;
    this.setState({ loding: true });
    addHitEvaluation(currentHit.id, this.props.currentProject, value, this.evaluationCallback.bind(this, value));
  }

  showEvaluationButtons() {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button.Group size="mini">
          <Button onClick={this.evaluateHit.bind(this, 'incorrect')} color="blue">Incorrect</Button>
          <Button.Or />
          <Button onClick={this.evaluateHit.bind(this, 'correct')} color="blue">Correct</Button>
        </Button.Group>
      </div>
    );
  }

  nextRow(action) {
    let confirmed = true;
    logEvent("buttons", "Next Row");
    logEvent("navigation", "Next");
    if (this.state.changesInSession > 0 && this.state.type === HIT_STATE_DONE) {
      confirmed = confirm("You have made some changes in session, will you like to save them ?");
    }
    if (confirmed) {
      if (action === 'next') {
        this.saveTagAndNextRow()
      } else {
        this.getBackTopreviousRow();
      }
    } else {
      this.setState({ changesInSession: 0 });
      this.hitAddCallback(undefined, "Ok", action);
    }
    return false;
  }

  showButtonsMini() {
    // let nextButton = 'Next';
    // let prevButton = 'Previous';
    // let skipButton = 'Skip';
    const nextButtonDisabled =
      this.state.currentIndex < 0 ||
      (this.state.hitScrollCompleted &&
        this.state.currentIndex > this.state.hits.length - 1);
    if ("shortcuts" in this.state) {
      const shortcuts = this.state.shortcuts;
      if ("next" in shortcuts) {
        const combo = convertKeyToString(shortcuts.next);
        // nextButton = 'Next (' + combo + ')';
        if (!nextButtonDisabled) {
          Mousetrap.bind(combo, this.nextRow.bind(this, 'next'));
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ("previous" in shortcuts) {
        const combo = convertKeyToString(shortcuts.previous);
        // prevButton = 'Previous (' + combo + ')';
        if (this.state.currentIndex > 0) {
          Mousetrap.bind(combo, this.nextRow.bind(this, 'previous'));
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ("moveToDone" in shortcuts) {
        const combo = convertKeyToString(shortcuts.moveToDone);
        // prevButton = 'Previous (' + combo + ')';
        if (this.state.type === HIT_STATE_SKIPPED ||
            this.state.type === HIT_STATE_PRE_TAGGED ||
            this.state.type === HIT_STATE_REQUEUED) {
          Mousetrap.bind(combo, this.moveToDone.bind(this));
        } else {
          Mousetrap.unbind(combo);
        }
      }
    }
    return (
      <div>
        <br />
        <div
          className="marginTopExtra"
          style={{ display: "flex", justifyContent: "space-around" }}
        >
          <Button
            title="Previous Element"
            size="mini"
            color="grey"
            icon
            loading={this.state.loading}
            onClick={this.nextRow.bind(this, 'previous')}
            disabled={this.state.currentIndex <= 0}
          >
            <Icon name="left arrow" />
          </Button>
          { (this.state.changesInSession > 0 && this.state.type === HIT_STATE_DONE) && (
            <Button
              size="mini"
              color="green"
              title="Save Changes"
              icon
              loading={this.state.loading}
              onClick={this.saveElement.bind(this)}
              disabled={this.state.currentIndex < 0}
            >
              <Icon name="save" />
            </Button>
          )}
          {this.state.type === "notDone" && (
            <Button
              size="mini"
              color="grey"
              icon
              loading={this.state.loading}
              onClick={this.skipRow}
              disabled={this.state.currentIndex < 0}
            >
              <Icon name="mail forward" />
            </Button>
          )}
          <Button
            title="Next Element"
            size="mini"
            color="blue"
            icon
            loading={this.state.loading}
            onClick={this.nextRow.bind(this, 'next')}
            disabled={nextButtonDisabled}
          >
            <Icon name="right arrow" />
          </Button>
        </div>
      </div>
    );
  }

  showButtons(type) {
    let nextButton = "Next";
    let prevButton = "Previous";
    let skipButton = "Skip";
    let moveToDoneButton = "Move to Done";
    const nextButtonDisabled =
      this.state.currentIndex < 0 ||
      (this.state.hitScrollCompleted &&
        this.state.currentIndex >= this.state.hits.length - 1);
    if ("shortcuts" in this.state) {
      const shortcuts = this.state.shortcuts;
      if ("next" in shortcuts) {
        const combo = convertKeyToString(shortcuts.next);
        nextButton = "Next (" + combo + ")";
        if (!nextButtonDisabled) {
          Mousetrap.bind(combo, this.saveTagAndNextRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ("previous" in shortcuts) {
        const combo = convertKeyToString(shortcuts.previous);
        prevButton = "Previous (" + combo + ")";
        if (this.state.currentIndex > 0) {
          Mousetrap.bind(combo, this.getBackTopreviousRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ("skip" in shortcuts) {
        const combo = convertKeyToString(shortcuts.skip);
        skipButton = "Skip (" + combo + ")";
        console.log("setting skip shortcut", combo);
        if (this.state.currentIndex >= 0) {
          Mousetrap.bind(combo, this.skipRow);
        } else {
          Mousetrap.unbind(combo);
        }
      }
      if ("moveToDone" in shortcuts) {
        const combo = convertKeyToString(shortcuts.moveToDone);
        moveToDoneButton = "Move to Done (" + combo + ")";
        console.log("setting skip shortcut", combo);
        if (this.state.currentIndex >= 0) {
          Mousetrap.bind(combo, this.moveToDone.bind(this, "saveToDone"));
        } else {
          Mousetrap.unbind(combo);
        }
      }
    }
    // let flexDirection = "row";
    if (type && type === "vertical") {
      return (<div
        style={{
          display: "flex",
          flexDirection: 'column',
          justifyContent: "space-evenly",
          alignItems: 'center',
          padding: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <div title={prevButton}>
            <Button
              size="mini"
              color="grey"
              labelPosition="left"
              loading={this.state.loading}
              icon
              compact
              onClick={this.getBackTopreviousRow}
              disabled={this.state.currentIndex <= 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div title={nextButton}>
            <Button
              size="mini"
              color="blue"
              loading={this.state.loading}
              icon
              compact
              labelPosition="right"
              onClick={this.saveTagAndNextRow}
              disabled={nextButtonDisabled}
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
        <br />
        <div title={moveToDoneButton}>
          <Button
            size="mini"
            color="blue"
            loading={this.state.loading}
            icon
            labelPosition="left"
            onClick={this.moveToDone.bind(this, "saveToDone")}
          >
            <Icon name="save" />
            Move to Done
          </Button>
        </div>
        <br />
        <div title={skipButton}>
          <Button
            size="mini"
            color="grey"
            loading={this.state.loading}
            icon
            labelPosition="left"
            onClick={this.skipRow}
            disabled={this.state.currentIndex < 0}
          >
            <Icon name="mail forward" />
            Skip
          </Button>
        </div>
      </div>);
    }
    return (
      <div
        style={{
          display: "flex",
          flexDirection: 'row',
          justifyContent: "space-evenly",
          padding: '0.5rem'
        }}
      >
        <Button
          size="mini"
          color="grey"
          loading={this.state.loading}
          icon
          labelPosition="left"
          onClick={this.getBackTopreviousRow}
          disabled={this.state.currentIndex <= 0}
        >
          <Icon name="left arrow" />
          {prevButton}
        </Button>
        <br />
        <Button
          size="mini"
          color="grey"
          loading={this.state.loading}
          icon
          labelPosition="left"
          onClick={this.skipRow}
          disabled={this.state.currentIndex < 0}
        >
          <Icon name="mail forward" />
          {skipButton}
        </Button>
        <br />
        <Button
          size="mini"
          color="blue"
          loading={this.state.loading}
          icon
          labelPosition="left"
          onClick={this.moveToDone.bind(this, "saveToDone")}
        >
          <Icon name="save" />
          {moveToDoneButton}
        </Button>
        <br />
        <Button
          size="mini"
          color="blue"
          loading={this.state.loading}
          icon
          labelPosition="right"
          onClick={this.saveTagAndNextRow}
          disabled={nextButtonDisabled}
        >
          {nextButton}
          <Icon name="right arrow" />
        </Button>
      </div>
    );
  }

  toggleAutoLabel = () => {
    console.log("toggleAutoLabel");
    if (this.state.autoLabel) {
      this.setState({ autoLabel: false });
    } else {
      this.setState({ autoLabel: true });
    }
  };

  toggleAutoClose = () => {
    console.log("toggleAutoClose");
    logEvent("buttons", "Auto Close", !this.state.autoClose);
    if (this.state.autoClose) {
      this.setState({ autoClose: false });
    } else {
      this.setState({ autoClose: true });
    }
  };

  toggleNotes = () => {
    console.log("toggleAutoClose");
    logEvent("buttons", "Notes Toggle", !this.state.notes);
    if (this.state.notes) {
      this.setState({ notes: false });
    } else {
      this.setState({ notes: true });
    }
  };

  toggleHideLabels = () => {
    console.log("toggleAutoClose");
    logEvent("buttons", "Hide Labels Toggle", !this.state.hideLabels);
    if (this.state.hideLabels) {
      this.setState({ hideLabels: false });
    } else {
      this.setState({ hideLabels: true });
    }
  };

  toggleEntitySelected = () => {
    console.log("toggleAutoClose");
    logEvent("buttons", "Hide Labels Toggle", !this.state.keepEntitySelected);
    if (this.state.keepEntitySelected) {
      this.setState({ keepEntitySelected: false });
    } else {
      this.setState({ keepEntitySelected: true });
    }
  };

  handleClick = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  handleNoteChange = event => {
    console.log("handleNoteChange", event.target.value);
    this.setState({
      currentNote: event.target.value,
      changesInSession: this.state.changesInSession + 1
    });
  };

  showExtra = extra => {
    console.log("extra data is", extra);
    const arrs = [];
    for (const k1 of Object.keys(extra)) {
      arrs.push(
        <Table.Row>
          <Table.Cell textAlign="left" className="h5 bold">
            {k1}
          </Table.Cell>
          <Table.Cell className="h6">{extra[k1]}</Table.Cell>
        </Table.Row>
      );
    }

    return (
      <Table
        celled
        color="blue"
        key="blue"
        size="small"
        compact="very"
        collapsing
      >
        <Table.Body>{arrs}</Table.Body>
      </Table>
    );
  };

  showTaggingInstructions() {
    const { activeIndex } = this.state;
    console.log('showTaggingInstructions');
    return (
      <Accordion>
        <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={this.handleClick}
        >
          <Icon name="dropdown" />
          <Label size="mini" style={{ background: "#a9d5de" }}>
            Project Guidelines
          </Label>
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <p>{this.state.rules.instructions}</p>
        </Accordion.Content>
      </Accordion>
    );
  }

  render() {
    // const {user, logout} = this.props;
    let popoverTop = undefined;
    let keyobardPopover = undefined;
    let prevWord = undefined;
    let nextWord = undefined;
    // const center = [51.505, -0.09];
    console.log(" TaggerSpace state is ", this.props, this.state);
    let popupContent = "Select word and then entity to tag.";
    // let keyboarS = 'Configure Keyboard Shortcuts';
    if (this.state.projectDetails) {
      keyobardPopover = (
        <Popover id="popover-positioned-top" style={{ whiteSpace: "pre" }}>
          {this.getKeyboardShortcuts(this.state.shortcuts)}
        </Popover>
      );
      if (this.state.shortcuts) {
        if ("left" in this.state.shortcuts) {
          const prevK = convertKeyToString(this.state.shortcuts.left);
          if (prevK) {
            prevWord = prevK;
          }
        }
        if ("right" in this.state.shortcuts) {
          const nextK = convertKeyToString(this.state.shortcuts.right);
          if (nextK) {
            nextWord = nextK;
          }
        }
      }
    }
    const fullScreenPopover = (
      <Popover id="popover-positioned-top" title="Full Screen" />
    );
    if (this.state.rules && this.state.projectDetails) {
      popupContent = popupContent + " " + this.state.rules.instructions;
      if (this.state.projectDetails.task_type === POS_TAGGING) {
        popoverTop = (
          <Popover id="popover-positioned-top" title="How to annotate">
            Click to select a word and then select an entity to annotate. More
            queries?{" "}
            <a href="https://dataturks.com/help/help.php" target="_blank">
              {" "}
              See Demo Videos{" "}
            </a>
          </Popover>
        );
      } else if (this.state.projectDetails.task_type === TEXT_CLASSIFICATION) {
        popoverTop = (
          <Popover id="popover-positioned-top" title="How to classify">
            Click to select a class to classify the sentence. More queries?{" "}
            <a href="https://dataturks.com/help/help.php" target="_blank">
              {" "}
              See Demo Videos{" "}
            </a>
          </Popover>
        );
      } else if (this.state.projectDetails.task_type === IMAGE_BOUNDING_BOX) {
        popoverTop = (
          <Popover id="popover-positioned-top" title="How to Bound">
            Click on the image and mouse-drag to draw a rectangle and pick a
            category from drop-down menu. By Default first category in the list
            will be shown selected. More queries?{" "}
            <a href="https://dataturks.com/help/help.php" target="_blank">
              {" "}
              See Demo Videos{" "}
            </a>
          </Popover>
        );
      } else if (
        this.state.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX ||
        this.state.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2
      ) {
        popoverTop = (
          <Popover id="popover-positioned-top" title="How to Bound">
            <li>Click on the image to mark each point of the polygon.</li>
            <li>
              When you select "Close Polygon" button, last point is
              auto-connected to the first point to complete the polygon.
            </li>
            <li>
              More queries?{" "}
              <a href="https://dataturks.com/help/help.php" target="_blank">
                {" "}
                See Demo Videos{" "}
              </a>
            </li>
          </Popover>
        );
      }
    }
    let extra = "";
    if (this.state.currentHit) {
      console.log("extra data", extra, this.state.currentHit.extras);
      extra = JSON.parse(this.state.currentHit.extras);
    }

    const showNoteLable = () => {
      return (
        <div className="text-center">
          <Input
            action={{ color: "teal", size: "tiny", icon: "sticky note" }}
            actionPosition="left"
            value={this.state.currentNote}
            onChange={this.handleNoteChange}
            placeholder="Add a note..."
          />
        </div>
      );
    };
    const elem = document.getElementById("polygonBound");
    if (elem && elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }

    if (this.state.hits && this.state.hitsCompleted)
      return (
                  <div>
                    {this.state.type === "notDone" && (
                      <Segment color="green" className="marginTopExtra">
                        {this.state.type &&
                          this.state.type === "skipped" && (
                            <h4>
                              {" "}
                              All skipped rows are tagged, You can check the
                              project stats.{" "}
                            </h4>
                          )}
                        {this.state.type &&
                          this.state.type !== "skipped" && (
                            <h4>
                              {" "}
                              All rows are tagged, You can check the project
                              stats.{" "}
                            </h4>
                          )}
                        {!this.state.type && (
                          <h4>
                            {" "}
                            All items are tagged, You can check the project
                            stats.{" "}
                          </h4>
                        )}
                        <Button
                          onClick={() =>
                            this.props.pushState(
                              "/projects/" +
                                this.props.params.orgName +
                                "/" +
                                this.props.params.projectName
                            )
                          }
                        >
                          Show project stats
                        </Button>
                        <div style={{ height: "30px" }} />
                        <Button
                          onClick={() =>
                            this.props.pushState(
                              "/projects/" +
                                this.props.params.orgName +
                                "/" +
                                this.props.params.projectName +
                                "/space?type=done"
                            )
                          }
                        >
                          Show Completed HITs
                        </Button>
                        <div style={{ height: "30px" }} />
                        <Button
                          onClick={() =>
                            this.props.pushState(
                              "/projects/" +
                                this.props.params.orgName +
                                "/" +
                                this.props.params.projectName +
                                "/space?type=skipped"
                            )
                          }
                        >
                          Show Skipped HITs
                        </Button>
                      </Segment>
                    )}
                  </div>
                );
    // const docLabels = this.docAnnotator ? this.docAnnotator.getLabels() : undefined;
    // console.log('doclabels ', docLabels);
    // const { tagLine } = this.state;
    return (
      <div>
        {!this.props.projectDetails && <Segment basic vertical loading />}
        {this.props.projectDetails && (
          <div style={{ display: "flex", flexDirection: "row" }}>
            {this.state.type !== HIT_STATE_NOT_DONE && this.props.projectDetails.task_type !== POS_TAGGING && (
              <Segment raised style={{ width: '20%' }}>
                <h4
                  style={{ textTransform: "capitalize", marginTop: "0.5rem" }}
                >
                  {" "}
                  HITs Overview{" "}
                </h4>
                {this.getHitDetails(this.state.currentHit)}
                {this.showButtonsMini()}
                {this.showActionButtons()}
                <br />
                {this.state.type === HIT_STATE_DONE && (
                  <div>
                    <h4> Evaluate Tagging </h4>
                    {this.showEvaluationButtons()}
                  </div>
                )}
              </Segment>
            )}
            <div
              style={{
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
                backgroundColor: "white",
                width: "100%"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: 'space-between'
                }}
              >
                <div style={{
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: "space-around",
                  }}>
                  <Button
                    icon
                    title="Back"
                    className="pull-left"
                    onClick={() =>
                      this.props.pushState(
                        "/projects/" +
                          this.props.params.orgName +
                          "/" +
                          this.props.params.projectName
                      )
                    }
                    compact
                  >
                    <Icon color="teal" name="arrow left" />
                  </Button>

                  <Button
                    icon
                    title="Home"
                    className="pull-left"
                    onClick={() =>
                      this.props.pushState(
                        "/projects/"
                      )
                    }
                    compact
                  >
                    <Icon size="large" name="home" color="teal" />
                  </Button>
              {this.state.type !== HIT_STATE_NOT_DONE && this.props.projectDetails.task_type !== POS_TAGGING && (
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                  {this.getHitStates()}
                  <br />
                  {this.state.type === HIT_STATE_DONE &&
                    this.getEvaluations()}
                  <br />
                  { (this.state.type === HIT_STATE_DONE && !this.state.evaluationType) &&
                    this.getContributors(this.state.contributorDetails)}
                  <br />
                  {this.state.type === HIT_STATE_DONE && !this.state.evaluationType &&
                    this.state.entities &&
                    this.state.entities.length > 0 &&
                    this.getEntities(this.state.entities)}
                </div>
              )}
                </div>
                {(this.state.type === HIT_STATE_NOT_DONE || this.props.projectDetails.task_type === POS_TAGGING) &&
                  <div style={{ flexGrow: 2, alignSelf: 'center'}}>{this.showTaggingInstructions()}</div>
                }
                { this.state.type === HIT_STATE_NOT_DONE && this.state.currentHit &&
                  <div style={{ flexGrow: 1.5, alignSelf: 'center' }}> {this.getHitInfo(this.state.currentHit)} </div>
                }
                {this.state.type === HIT_STATE_NOT_DONE &&
                  this.props.projectDetails.task_type === IMAGE_BOUNDING_BOX &&
                  !this.state.hitsCompleted && (
                    <div className="text-center" style={{}}>
                      <Checkbox
                        size="mini"
                        checked={this.state.notes}
                        onClick={this.toggleNotes.bind(this)}
                        label="Show Notes"
                      />
                      &nbsp; &nbsp;
                      <Checkbox
                        size="mini"
                        checked={this.state.hideLabels}
                        onClick={this.toggleHideLabels.bind(this)}
                        label="Hide Labels"
                      />
                      &nbsp; &nbsp;
                      <Checkbox
                        size="mini"
                        checked={this.state.autoClose}
                        onClick={this.toggleAutoClose.bind(this)}
                        label="AutoClose"
                      />
                    </div>
                  )}
                  {this.state.type === HIT_STATE_NOT_DONE &&
                  this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 &&
                  !this.state.hitsCompleted && (
                    <div className="text-center" style={{}}>
                      <Checkbox
                        size="mini"
                        checked={this.state.keepEntitySelected}
                        onClick={this.toggleEntitySelected.bind(this)}
                        label="Keep Entity Selected"
                      />
                    </div>
                  )}
                {this.state.type === HIT_STATE_NOT_DONE &&
                  (this.props.projectDetails.task_type ===
                    DOCUMENT_ANNOTATION ||
                    this.props.projectDetails.task_type ===
                      POS_TAGGING_GENERIC) &&
                  !this.state.hitsCompleted && (
                    <div>
                      <Checkbox
                        checked={this.state.autoClose}
                        onClick={this.toggleAutoClose.bind(this)}
                        label="AutoClose on Selection"
                      />
                      &nbsp; &nbsp;
                      <Checkbox
                        checked={this.state.autoLabel}
                        onClick={this.toggleAutoLabel.bind(this)}
                        label="Autolabel Same Text in Document"
                      />
                      &nbsp; &nbsp;
                      <Button
                        disabled={this.state.undoButton}
                        size="mini"
                        icon
                        onClick={() => this.docAnnotator.undo()}
                      >
                        Undo
                      </Button>
                      &nbsp; &nbsp;
                      <Button
                        size="mini"
                        icon
                        onClick={() => this.docAnnotator.clearAll()}
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                {(this.state.type === HIT_STATE_NOT_DONE || this.props.projectDetails.task_type === POS_TAGGING) && (
                  <div style={{ display: "flex" }}>
                    {popoverTop && (
                      <div>
                        <OverlayTrigger
                          trigger={["hover"]}
                          placement="bottom"
                          overlay={popoverTop}
                        >
                          <Icon
                            size="mini"
                            name="help circle"
                            color="teal"
                            size="large"
                          />
                        </OverlayTrigger>
                      </div>
                    )}
                  </div>
                )}

                {(this.state.type === HIT_STATE_NOT_DONE || this.props.projectDetails.task_type === POS_TAGGING) && (
                  <div style={{ display: "flex" }}>
                    {keyobardPopover && (
                      <div>
                        <OverlayTrigger
                          trigger={["hover"]}
                          placement="bottom"
                          overlay={keyobardPopover}
                        >
                          <Button
                            size="mini"
                            icon
                            onClick={() =>
                              this.props.pushState(
                                "/projects/" +
                                  this.props.params.orgName +
                                  "/" +
                                  this.props.params.projectName +
                                  "/keybind"
                              )
                            }
                            compact
                          >
                            <Icon
                              aria-label="Keyboard Shortcuts"
                              name="keyboard"
                            />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    )}
                  </div>
                )}


                {(this.state.type === HIT_STATE_NOT_DONE || this.props.projectDetails.task_type === POS_TAGGING) && (
                  <div style={{ display: "flex" }}>
                    {fullScreenPopover &&
                      (this.props.projectDetails.task_type !==
                        VIDEO_BOUNDING_BOX &&
                        this.props.projectDetails.task_type !==
                          VIDEO_CLASSIFICATION) && (
                        <div>
                          <OverlayTrigger
                            trigger={["hover"]}
                            placement="bottom"
                            overlay={fullScreenPopover}
                          >
                            <Button
                              compact
                              size="mini"
                              icon
                              onClick={() => {
                                if (!this.state.fullScreen)
                                  this.setState({ fullScreen: true });
                                else this.setState({ fullScreen: false });
                              }}
                            >
                              {!this.state.fullScreen && (
                                <Icon color="blue" name="expand" />
                              )}
                              {this.state.fullScreen && (
                                <Icon color="blue" name="compress" />
                              )}
                            </Button>
                          </OverlayTrigger>
                        </div>
                      )}
                  </div>
                )}
              </div>
                <br />
              {this.state.type === "notDone" &&
                (this.props.projectDetails.task_type === DOCUMENT_ANNOTATION ||
                  this.props.projectDetails.task_type ===
                    POS_TAGGING_GENERIC) && (
                  <div>
                    <p
                      style={{
                        width: "50%",
                        border: "1px solid black",
                        padding: "0.5rem",
                        fontSize: "14px",
                        opacity: "0.7",
                        lineHeight: "1.2em"
                      }}
                    >
                      <li>
                        Click on the document and then drag to select text and
                        select a label.
                      </li>
                      <li>
                        More queries?{" "}
                        <a
                          href="https://dataturks.com/help/help.php"
                          target="_blank"
                        >
                          {" "}
                          See Demo Videos{" "}
                        </a>
                      </li>
                    </p>
                  </div>
                )}
              {this.state.loading && <Segment loading={this.state.loading} basic vertical />}
                {this.state.type !== HIT_STATE_NOT_DONE && !this.state.loading && this.props.projectDetails && (
                  <div className="text-center">{this.state.hits.length === 0 && <h2> No items to display here </h2>}</div>
                )}

              {this.state.hits &&
                this.state.currentHit && (
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between"
                    }}
                    loading={this.state.loading}
                  >
                      {this.props.projectDetails.task_type === POS_TAGGING && (
                        <Fullscreen
                          enabled={this.state.fullScreen}
                          onChange={isFullscreenEnabled =>
                            this.setState({
                              isFullscreenEnabled,
                              fullScreen: isFullscreenEnabled
                            })
                          }
                        >
                          <div className="marginTopExtra">
                            {prevWord && (
                              <div className="text-left">
                                <p>
                                  {" "}
                                  Previous Word Shortcut: <b>{prevWord}</b>
                                </p>
                              </div>
                            )}
                            {nextWord && (
                              <div className="text-left">
                                <p>
                                  {" "}
                                  Next Word Shortcut: <b> {nextWord} </b>{" "}
                                </p>
                              </div>
                            )}
                            {extra && <div>{this.showExtra(extra)}</div>}
                            {this.showTagLine()}
                            <br />
                            <h3>Entities</h3>
                            <br />
                            {this.showTags(this.state.entities)}
                            {this.state.loading &&
                              this.state.isFullscreenEnabled && (
                                <Segment basic vertical loading />
                              )}
                            <div
                              style={{ height: "20px" }}
                              disabled={this.state.loading}
                            />
                            {this.showButtons()}
                          </div>
                        </Fullscreen>
                      )}
                      {this.state.projectDetails.task_type ===
                        TEXT_SUMMARIZATION && (
                        <Fullscreen
                          enabled={this.state.fullScreen}
                          onChange={isFullscreenEnabled =>
                            this.setState({
                              isFullscreenEnabled,
                              fullScreen: isFullscreenEnabled
                            })
                          }
                        >
                          <div className="marginTopExtra">
                            {extra && <div>{this.showExtra(extra)}</div>}
                            {this.showText()}
                            <br />
                            {this.showWriteText(TEXT_SUMMARIZATION)}
                            {this.state.loading &&
                              this.state.isFullscreenEnabled && (
                                <Segment basic vertical loading />
                              )}
                            <div
                              style={{ height: "20px" }}
                              disabled={this.state.loading}
                            />
                            {this.state.type === "notDone" &&
                              this.showButtons()}
                          </div>
                        </Fullscreen>
                      )}
                      {this.state.projectDetails.task_type ===
                        TEXT_CLASSIFICATION && (
                        <Fullscreen
                          enabled={this.state.fullScreen}
                          onChange={isFullscreenEnabled =>
                            this.setState({
                              isFullscreenEnabled,
                              fullScreen: isFullscreenEnabled
                            })
                          }
                        >
                          <div
                            className="marginTopExtra"
                            style={{
                              display: "flex",
                              justifyContent: "space-between"
                            }}
                          >
                            <div style={{ width: "77%" }}>
                              {extra && <div>{this.showExtra(extra)}</div>}
                              {this.showText()}
                              <br />
                              {this.state.currentIndex >= 0 && showNoteLable()}
                            </div>
                            <div style={{ width: "20%" }}>
                              {this.state.loading &&
                                this.state.isFullscreenEnabled && (
                                  <Segment basic vertical loading />
                                )}
                              {this.showClassifyTags(true, "vertical")}
                              <br />
                              {this.state.type === "notDone" &&
                                this.showButtons("vertical")}
                            </div>
                          </div>
                        </Fullscreen>
                      )}
                      {this.state.projectDetails.task_type ===
                        TEXT_MODERATION && (
                        <Fullscreen
                          enabled={this.state.fullScreen}
                          onChange={isFullscreenEnabled =>
                            this.setState({
                              isFullscreenEnabled,
                              fullScreen: isFullscreenEnabled
                            })
                          }
                        >
                          <div className="marginTopExtra">
                            {extra && <div>{this.showExtra(extra)}</div>}
                            {this.showText()}
                            <br />
                            {this.showWriteText(TEXT_MODERATION)}
                            {this.state.loading &&
                              this.state.isFullscreenEnabled && (
                                <Segment basic vertical loading />
                              )}
                            <div
                              style={{ height: "20px" }}
                              disabled={this.state.loading}
                            />
                            {this.state.type === "notDone" &&
                              this.showButtons()}
                          </div>
                        </Fullscreen>
                      )}

                    {(this.props.projectDetails.task_type ===
                        VIDEO_CLASSIFICATION) && (
                        <Fullscreen
                          enabled={false}
                        >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ width: '80%'}}>
                          {extra && <div>{this.showExtra(extra)}</div>}
                          {this.showImages()}
                          <br />
                          {this.state.currentIndex >= 0 && showNoteLable()}
                          {this.state.loading &&
                            this.state.isFullscreenEnabled && (
                              <Segment basic vertical loading />
                            )}
                        </div>
                        <div style={{ width: '20%'}}>
                          {this.showClassifyTags(true, "vertical")}
                          <br />
                          {this.state.type === "notDone" &&
                            this.showButtons("vertical")}
                        </div>
                      </div>
                      </Fullscreen>
                    )}
                    {(this.props.projectDetails.task_type ===
                      IMAGE_CLASSIFICATION) && (
                        <Fullscreen
                          enabled={this.state.fullScreen}
                          onChange={isFullscreenEnabled =>
                            this.setState({
                              isFullscreenEnabled,
                              fullScreen: isFullscreenEnabled
                            })
                          }
                        >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                          <div style={{ width: '77%' }}>
                            {extra && <div>{this.showExtra(extra)}</div>}
                            {this.showImages()}
                            <br />
                            {this.state.currentIndex >= 0 && showNoteLable()}
                            {this.state.loading &&
                              this.state.isFullscreenEnabled && (
                                <Segment basic vertical loading />
                              )}
                          </div>
                          <div style={{ width: '20%'}}>
                            {this.showClassifyTags(true, "vertical")}
                            <br />
                            {this.state.type === "notDone" &&
                              this.showButtons("vertical")}
                          </div>
                      </div>
                      </Fullscreen>
                    )}
                    {this.props.projectDetails.task_type ===
                      IMAGE_BOUNDING_BOX && (
                      <div>
                        {extra && <div>{this.showExtra(extra)}</div>}
                        <Fullscreen
                          enabled={this.state.fullScreen}
                          onChange={isFullscreenEnabled =>
                            this.setState({
                              isFullscreenEnabled,
                              fullScreen: isFullscreenEnabled
                            })
                          }
                        >
                          {
                            <div className="col-md-12">
                              {this.showBoundingImages()}
                            </div>
                          }
                        </Fullscreen>
                      </div>
                    )}

                    {this.props.projectDetails.task_type ===
                      IMAGE_POLYGON_BOUNDING_BOX && (
                      <div>
                        {extra && <div>{this.showExtra(extra)}</div>}
                        <Fullscreen
                          enabled={this.state.fullScreen}
                          onChange={isFullscreenEnabled =>
                            this.setState({
                              isFullscreenEnabled,
                              fullScreen: isFullscreenEnabled
                            })
                          }
                        >
                          {this.showPolygonBoundingImages()}
                        </Fullscreen>
                      </div>
                    )}

                    {this.props.projectDetails.task_type ===
                      IMAGE_POLYGON_BOUNDING_BOX_V2 && (
                      <div>
                        {extra && <div>{this.showExtra(extra)}</div>}
                        <Fullscreen
                          enabled={this.state.fullScreen}
                          onChange={isFullscreenEnabled =>
                            this.setState({
                              isFullscreenEnabled,
                              fullScreen: isFullscreenEnabled
                            })
                          }
                        >
                          {this.showPolygonV2BoundingImages()}
                        </Fullscreen>
                      </div>
                    )}

                    {this.props.projectDetails.task_type ===
                      VIDEO_BOUNDING_BOX && (
                      <div>
                        {extra && <div>{this.showExtra(extra)}</div>}
                        {this.showVideoAnnotation()}
                      </div>
                    )}

                    {(this.props.projectDetails.task_type ===
                      DOCUMENT_ANNOTATION ||
                      this.props.projectDetails.task_type ===
                        POS_TAGGING_GENERIC) && (
                      <Fullscreen
                        enabled={this.state.fullScreen}
                        onChange={isFullscreenEnabled =>
                          this.setState({
                            isFullscreenEnabled,
                            fullScreen: isFullscreenEnabled
                          })
                        }
                      >
                        <div>
                          {extra && <div>{this.showExtra(extra)}</div>}
                          <br />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "center"
                            }}
                          >
                            {this.state.classification && (
                              <div style={{ width: "15%", margin: "0.5em" }}>
                                {this.state.classification && (
                                  <div>
                                    <h3> Choose all that apply </h3>
                                    <Segment
                                      raised
                                      basic
                                      vertical
                                      style={{
                                        backgroundColor: "#e1e1e1",
                                        padding: "0.5em"
                                      }}
                                    >
                                      {this.getClassificationQuestions()}
                                    </Segment>
                                  </div>
                                )}
                              </div>
                            )}
                            <div style={{ margin: "0.5em", width: "100%" }}>
                              {this.showDocumentAnnotation()}
                            </div>
                          </div>
                          {this.state.loading &&
                            this.state.isFullscreenEnabled && (
                              <Segment basic vertical loading />
                            )}
                          <div
                            style={{ height: "20px" }}
                            disabled={this.state.loading}
                          />
                        </div>
                      </Fullscreen>
                    )}
                    <br />
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
