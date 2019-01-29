import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { bindActionCreators } from "redux";
import {
  uploadDataForm,
  updateProjectDetails,
  setCurrentProject,
  getUserHomeData
} from "redux/modules/dataturks";
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
import {
  Segment,
  Table as STable,
  Button,
  Icon,
  Statistic,
  Header,
  Progress,
  Menu,
  Dropdown,
  Breadcrumb,
  Label
} from "semantic-ui-react";
import {
  fetchProjectStats,
  sendInvite,
  getUidToken,
  fetchHitsDetails,
  deleteProjectDt,
  logEvent
} from "../../helpers/dthelper";
import {
  timeConverter,
  checkVideoURL,
  VIDEO_BOUNDING_BOX,
  POS_TAGGING_GENERIC,
  VIDEO_CLASSIFICATION,
  IMAGE_CLASSIFICATION,
  DOCUMENT_ANNOTATION,
  IMAGE_POLYGON_BOUNDING_BOX,
  IMAGE_POLYGON_BOUNDING_BOX_V2,
  IMAGE_BOUNDING_BOX,
  TEXT_CLASSIFICATION,
  POS_TAGGING,
  taskTypeMap,
  createEntitiesJson,
  TEXT_MODERATION,
  createDocEntityColorMap,
  TEXT_SUMMARIZATION
} from "../../helpers/Utils";
import { TaggerInvite } from "../../components";
import { push } from "react-router-redux";
import Popover from "react-bootstrap/lib/Popover";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Table from "react-bootstrap/lib/Table";
import Modal from "react-bootstrap/lib/Modal";
// import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
// import Tooltip from 'react-bootstrap/lib/Tooltip';
import ReactTooltip from "react-tooltip";
import BoxAnnotator from "../../components/BoxAnnotator/BoxAnnotator";
import BoxAnnotatorOld from "../../components/BoxAnnotatorOld/BoxAnnotator";
import VideoAnnotator from "../../components/VideoAnnotator/VideoAnnotator";
import PolygonAnnotator from "../../components/PolygonAnnotator/PolygonAnnotator";
import PolygonAnnotatorV2 from "../../components/PolygonAnnotatorV2/PolygonAnnotator";
import PolygonAnnotatorOld from "../../components/PolygonAnnotatorOld/PolygonAnnotator";
import DocumentAnnotator from "../../components/DocumentAnnotator/DocumentAnnotator";
import config from "../../config";
import {
  Player,
  ControlBar,
  ForwardControl,
  PlaybackRateMenuButton
} from "video-react";

// import { JSONLD, Product, AggregateRating, GenericCollection, Review, Author, Rating, Location } from 'react-structured-data';

const statsLabel = { textTransform: "initial", fontWeight: "300" };
const styles = require("./TaggerOrgProject.scss");
@connect(
  state => ({
    user: state.auth.user,
    currentPathOrg: state.dataturksReducer.currentPathOrg,
    currentPathProject: state.dataturksReducer.currentPathProject,
    currentProject: state.dataturksReducer.currentProject,
    projectDetails: state.dataturksReducer.projectDetails,
    sampleHits: state.dataturksReducer.sampleHits
  }),
  dispatch =>
    bindActionCreators(
      {
        uploadDataForm,
        getUserHomeData,
        setCurrentProject,
        updateProjectDetails,
        pushState: push
      },
      dispatch
    )
)
export default class TaggerOrgProject extends Component {
  static propTypes = {
    user: PropTypes.object,
    uploadDataForm: PropTypes.func,
    currentProject: PropTypes.string,
    pushState: PropTypes.func,
    updateProjectDetails: PropTypes.func,
    params: PropTypes.object,
    orgName: PropTypes.string,
    projectName: PropTypes.string,
    setCurrentProject: PropTypes.func,
    projectDetails: PropTypes.object,
    getUserHomeData: PropTypes.func,
    currentPathProject: PropTypes.string,
    currentPathOrg: PropTypes.string
  };

  constructor(props) {
    super(props);
    console.log("tagger stats props are", props);
    this.loadProjectDetails = this.loadProjectDetails.bind(this);
    this.projectDetailsFetched = this.projectDetailsFetched.bind(this);
    this.openInviteModal = this.openInviteModal.bind(this);
    this.inviteByEmail = this.inviteByEmail.bind(this);
    this.showSummaries = this.showSummaries.bind(this);
    this.inviteSent = this.inviteSent.bind(this);
    this.openScreen = this.openScreen.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.hitsFetched = this.hitsFetched.bind(this);
    this.projectDeleted = this.projectDeleted.bind(this);
    this.showTags = this.showTags.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.state = {
      fields: {},
      errors: {},
      start: 0,
      count: 20,
      hitsDetails: undefined,
      projectDetailsError: undefined,
      projectDetails: this.props.projectDetails,
      inviteModal: false,
      loading: false,
      successModal: false,
      selectedLabel: undefined
    };
  }

  state = {
    fields: {},
    errors: {},
    start: 0,
    projectDetails: null,
    inviteModal: false,
    loading: false,
    successModal: false,
    projectDetailsError: undefined,
    hitsDetails: undefined
  };

  componentWillMount() {
    console.log("TaggerStats componentWillMount");
    if (
      (this.props.params.orgName &&
        this.props.params.projectName &&
        (!this.props.projectDetails ||
          (this.props.projectDetails.name !== this.props.params.projectName ||
            this.props.projectDetails.orgName !==
              this.props.params.orgName))) ||
      !this.props.currentProject
    ) {
      this.setState({ projectDetails: undefined });
    }
    this.setState({ hitsDetails: undefined, isMounted: true });
  }

  componentDidMount() {
    console.log("Did mount TaggerStats ", this.state.projectDetails);
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
    } else {
      fetchHitsDetails(
        this.props.currentProject,
        0,
        20,
        this.hitsFetched,
        "done"
      );
    }
    // if (this.props.currentProject) {
    //   this.loadProjectDetails();
    //   fetchHitsDetails(this.props.currentProject, 0, 10, this.hitsFetched);
    // }
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
    console.log("next props in taggerstats", nextProps);
    if (nextProps.currentProject) {
      if (this.props.currentProject !== nextProps.currentProject) {
        this.loadProjectDetails(nextProps.currentProject);
        fetchHitsDetails(
          nextProps.currentProject,
          0,
          20,
          this.hitsFetched,
          "done"
        );
      }
      if (
        this.props.currentProject === nextProps.currentProject &&
        !this.state.projectDetails
      ) {
        this.loadProjectDetails(nextProps.currentProject);
      }
      if (
        this.props.currentProject === nextProps.currentProject &&
        !this.state.hitsDetails
      ) {
        fetchHitsDetails(
          nextProps.currentProject,
          0,
          20,
          this.hitsFetched,
          "done"
        );
      }
    }
  }

  componentWillUnmount() {
    console.log("unmounting taggerog");
    this.state.isMounted = false;
    // this.setState({ isMounted: false });
  }

  getContributorsData = data => {
    const arrs = [];
    console.log("getContributorsData ", data);
    let showZero = true;
    if (data && data.length > 10) {
      showZero = false;
    }
    for (let index = 0; index < data.length; index++) {
      if (data[index].hitsDone > 0 || showZero) {
        arrs.push(
          <tr key={index}>
            <td>{data[index].userDetails.firstName}</td>
            <td>{data[index].avrTimeTakenInSec}</td>
            <td>{data[index].hitsDone}</td>
          </tr>
        );
      }
    }
    return <tbody>{arrs}</tbody>;
  };

  hitsFetched(error, response) {
    console.log("hitsFetched ", error, response);
    if (!error) {
      let projectDetails = undefined;
      if (response.body.projectDetails) {
        projectDetails = response.body.projectDetails;
      } else if (this.props.projectDetails) {
        projectDetails = this.props.projectDetails;
      }
      // const projectDetails = response.body.projectDetails;
      let entities = [];
      let entityColorMap = {};
      if (
        projectDetails.task_type === POS_TAGGING ||
        projectDetails.task_type === TEXT_CLASSIFICATION ||
        projectDetails.task_type === DOCUMENT_ANNOTATION ||
        projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX ||
        projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 ||
        projectDetails.task_type === IMAGE_BOUNDING_BOX ||
        projectDetails.task_type === IMAGE_CLASSIFICATION ||
        projectDetails.task_type === VIDEO_CLASSIFICATION ||
        projectDetails.task_type === POS_TAGGING_GENERIC
      ) {
        entities = createEntitiesJson(projectDetails.taskRules).entities;
        entityColorMap = createDocEntityColorMap(entities);
        console.log("image task1", projectDetails.task_type);
        if (projectDetails.task_type.indexOf("IMAGE") >= 0) {
          console.log("image task");
          setTimeout(this.loadImages.bind(this, response.body.hits), 5000);
        }
      }
      this.setState({
        loading: false,
        entities,
        entityColorMap,
        hitsDetails: response.body.hits
      });
    }
  }

  loadImages(currentHits) {
    if (this.state.isMounted) {
      for (let index = 1; index < currentHits.length; index++) {
        console.log("loading images", this.state);
        const image1 = new Image(); // eslint-disable-line no-undef
        image1.src = currentHits[index].data;
      }
    }
  }

  open = () => this.setState({ successModal: true });
  close = () => {
    this.setState({ successModal: false });
    if (this.state.redirectToHome) {
      this.props.pushState({
        pathname: "/projects/" + this.props.params.orgName
      });
    }
  };

  openExport = () => {
    this.props.pushState("/projects/export");
  };

  openScreen = (screen, type) => {
    console.log("opening screen ", screen);
    logEvent("buttons", "Project " + screen);

    if (screen === "edit") {
      this.props.pushState({
        pathname:
          "/projects/" +
          this.props.params.orgName +
          "/" +
          this.props.params.projectName +
          "/" +
          "edit",
        query: { type }
      });
      // this.props.pushState({pathname: '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/' + screen, query: {type}});
    } else if (screen === "overview") {
      let screenName = 'space';
      if (this.state.projectDetails.task_type === POS_TAGGING) {
        screenName = 'overview';
      }
      this.props.pushState({
        pathname:
          "/projects/" +
          this.props.params.orgName +
          "/" +
          this.props.params.projectName +
          "/" +
          screenName,
        query: { type }
      });
      // this.props.pushState({pathname: '/projects/' + this.props.params.orgName + '/' + this.props.params.projectName + '/' + screen, query: {type}});
    } else {
      this.props.pushState({
        pathname:
          "/projects/" +
          this.props.params.orgName +
          "/" +
          this.props.params.projectName +
          "/" +
          screen
      });
    }
  };

  projectDetailsFetched(error, response) {
    console.log(" project details fetched ", error, response);
    if (!error) {
      this.props.updateProjectDetails(response.body);
      this.setState({
        projectDetails: response.body,
        loading: false,
        projectDetailsError: undefined
      });
    } else {
      if (response && response.body && response.body.message) {
        this.setState({ projectDetailsError: response.body.message });
      } else {
        this.setState({ projectDetailsError: "Error in fetching data" });
      }
    }
  }

  openInviteModal(event, data) {
    console.log("open invite modal", event, data);
    logEvent("buttons", "Open invite modal");
    this.setState({ inviteModal: true });
    event.preventDefault();
  }

  loadProjectDetails(pid) {
    this.setState({
      loading: true,
      projectDetails: undefined,
      hitsDetails: undefined
    });
    if (pid) {
      fetchProjectStats(pid, this.projectDetailsFetched);
    } else {
      fetchProjectStats(this.props.currentProject, this.projectDetailsFetched);
    }
  }

  inviteSent(error, response) {
    console.log("invite sent ", error, response);
    if (!error) {
      logEvent("buttons", "Invite sent success");
      this.loadProjectDetails(this.props.currentProject);
      this.setState({
        successModal: true,
        successMessage: config.servingEnv === 'online' ? "Email invite successfully sent" : "Successfully added to project, please ask them to sign up to see the project"
      });
    } else {
      logEvent("buttons", "Invite sent fail");
      this.setState({ inviteModal: false, error: true });
    }
  }

  projectDeleted(error, response) {
    console.log("project deleted ", error, response);
    if (!error) {
      logEvent("buttons", "project delete success");
      this.props.getUserHomeData(getUidToken());
      this.setState({
        successModal: true,
        showDeleteConfirmation: false,
        redirectToHome: true,
        successMessage: "Project Deleted Successfully."
      });
    } else {
      logEvent("buttons", "Delete Project fail");
      alert(error.message);
      this.setState({
        error: true,
        showDeleteConfirmation: false,
        redirectToHome: true
      });
    }
  }

  inviteByEmail(email, isOwner) {
    logEvent("buttons", "Sending invite");

    console.log("inviting by email ", event, event.target.value);
    sendInvite(this.props.currentProject, email, isOwner, this.inviteSent);
  }

  deleteProject() {
    deleteProjectDt(this.props.currentProject, this.projectDeleted);
    this.setState({ loading: true });
  }

  openModal() {
    this.setState({ inviteModal: true });
  }

  closeModal() {
    this.setState({ inviteModal: false });
  }

  showTags = entiti => {
    const renderArrs = [];
    for (let index = 0; index < entiti.length; index++) {
      const entity = entiti[index];
      const color = this.state.entityColorMap[entity];
      let onClickFn = undefined;
      if (this.state.label !== entity) {
        onClickFn = () => {
          this.state.label = entity;
          fetchHitsDetails(
            this.props.currentProject,
            0,
            20,
            this.hitsFetched,
            "done",
            entity
          );
        };
      } else {
        onClickFn = () => {
          this.state.start = 0;
          this.setState({ label: undefined });
          fetchHitsDetails(
            this.props.currentProject,
            0,
            20,
            this.hitsFetched,
            "done"
          );
        };
      }
      renderArrs.push(
        <Label
          as="a"
          size="large"
          style={{ marginTop: '5px', marginRight: '5px', padding: "5px", color: "white", backgroundColor: color }}
          onClick={() => onClickFn()}
          name={entity}
          key={index}
        >
          {entity}
          {this.state.label === entity && <Icon name="delete" />}
        </Label>
      );
    }

    return <div style={{ maxHeight: '10em', display: 'flex', flexWrap: 'wrap', overflow: 'auto'}}>{renderArrs}</div>;
  };

  previousElement(event) {
    console.log("event", event);
    if (this.state.start > 0) {
      this.setState({ start: this.state.start - 1 });
    }
  }

  nextElement(event) {
    console.log("event", event);
    if (
      this.state.start < this.state.count &&
      this.state.start < this.state.hitsDetails.length
    ) {
      this.setState({ start: this.state.start + 1 });
    } else {
      const newCount = this.state.currentCount + this.state.count;
      this.loadProjectDetails(0, newCount);
    }
  }

  showCurrentTags(tags) {
    console.log(" show current tags ", this.state);
    const { entityColorMap } = this.state;
    const renderArrs = [];
    for (const ent of tags) {
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
        </Label>
      );
    }
    return <div> {renderArrs} </div>;
  }

  showClassifications = hitsDetails => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    console.log("show classifications ", this.state);
    const currentHit = hitsDetails[this.state.start];
    const data = currentHit.data;
    const result = currentHit.hitResults[0].result;
    let currentTags = [];
    let currentNote = "";
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
      console.log("exception", exception);
      currentTags = new Set(result.split("____"));
    }
    console.log("results", result, currentTags);
    const popoverTop = (
      <Popover id="popover-positioned-top" title="Notes">
        A note could be added with each labeled item.
      </Popover>
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <div className={styles.dataArea}>
          <p>{data}</p>
          <br />
          {this.showCurrentTags(currentTags)}
        </div>
        <br />
        {currentNote &&
          currentNote.length > 0 && (
            <div>
              <p
                size="tiny"
                style={{ whiteSpace: "pre-wrap", marginLeft: "10%" }}
              >
                <OverlayTrigger
                  trigger={["hover"]}
                  placement="bottom"
                  overlay={popoverTop}
                >
                  <Icon name="sticky note" color="teal" size="large" />
                </OverlayTrigger>
                {currentNote}
              </p>
            </div>
          )}
        <br />
        <br />
        <br />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
        </div>
      </div>
    );
  };

  showClassificationImages = hitsDetails => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    const currentHit = hitsDetails[this.state.start];
    const data = currentHit.data;
    const result = currentHit.hitResults[0].result;
    let currentTags = [];
    let currentNote = "";
    console.log("result is", result);
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
      console.log("exception", exception);
      currentTags = new Set(currentHit.hitResults[0].result.split("____"));
    }
    const popoverTop = (
      <Popover id="popover-positioned-top" title="Notes">
        A note could be added with each labeled item.
      </Popover>
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <div className={styles.dataArea}>
          {!checkVideoURL(data) && <img className="img-respons" src={data} />}
          {checkVideoURL(data) && (
            <Player
              preload="auto"
              autoPlay
              poster="/assets/poster.png"
              src={data}
            >
              <ControlBar className={styles.controlBar}>
                <ForwardControl seconds={5} order={3.1} />
                <ForwardControl seconds={10} order={3.2} />
                <ForwardControl seconds={30} order={3.3} />
                <PlaybackRateMenuButton
                  rates={[5, 3, 1.5, 1, 0.5, 0.1]}
                  order={7.1}
                />
              </ControlBar>
            </Player>
          )}
          <br />
          {this.showCurrentTags(currentTags)}
          <br />
        </div>
        <br />
        {currentNote &&
          currentNote.length > 0 && (
            <div>
              <p
                size="tiny"
                style={{ whiteSpace: "pre-wrap", marginLeft: "10%" }}
              >
                <OverlayTrigger
                  trigger={["hover"]}
                  placement="bottom"
                  overlay={popoverTop}
                >
                  <Icon name="sticky note" color="teal" size="large" />
                </OverlayTrigger>
                {currentNote}
              </p>
            </div>
          )}
        <br />
        <br />
        <div className="col-md-12">
          <div className="col-md-6">
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div className="col-md-6">
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  showPosTags = hitsDetails => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    const currentHit = hitsDetails[this.state.start];
    const result = currentHit.hitResults[0].result;
    return (
      <div>
        <div>{this.showTagLine(result, currentHit.data)}</div>
        <br />
        <br />
        <br />
        <div>
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div className="col-xs-4" />
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  showBoundedImages = hitsDetails => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    const currentHit = hitsDetails[this.state.start];
    const result = currentHit.hitResults[0].result;

    console.log("bounded images are ", currentHit);
    const data = currentHit.data;
    console.log("show text", this.state);
    const rects = [];
    const rectCatMap = {};
    const noteMap = {};
    const bbmap = JSON.parse(result);
    let notes = "new";
    if (currentHit.hitResults[0] && currentHit.hitResults[0].notes) {
      notes = currentHit.hitResults[0].notes;
    }
    if (bbmap) {
      for (let index = 0; index < bbmap.length; index++) {
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
        {notes === "new" && (
          <BoxAnnotator
            space={false}
            rects={rects}
            notes={noteMap}
            rectCatMap={rectCatMap}
            image={data}
            entityColorMap={this.state.entityColorMap}
          />
        )}
        {notes === "old" && (
          <BoxAnnotatorOld
            rects={rects}
            rectCatMap={rectCatMap}
            image={data}
            entityColorMap={this.state.entityColorMap}
          />
        )}
        <br />
        <br />
        <br />
        <div>
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div className="col-xs-4" />
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  showClassificationTags = classificationResult => {
    const renderArrs = [];
    for (let index = 0; index < classificationResult.length; index++) {
      const classification = classificationResult[index];
      const classes = classification.classes;
      const classArrs = [];
      for (let jindex = 0; jindex < classes.length; jindex++) {
        classArrs.push(<Label size="mini">{classes[jindex]} </Label>);
      }
      renderArrs.push(
        <div className="well well-sm">
          <label>{classification.name}</label>
          <br />
          {classArrs}
        </div>
      );
    }
    return <div> {renderArrs} </div>;
  };

  showDocs = hitsDetails => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    const currentHit = hitsDetails[this.state.start];
    const result = currentHit.hitResults[0].result;
    let classificationObj = undefined;
    if (this.state.projectDetails && this.state.projectDetails.taskRules) {
      let ruleJson = JSON.parse(this.state.projectDetails.taskRules);
      if ("classification" in ruleJson) {
        classificationObj = ruleJson.classification;
      }
    }

    console.log("bounded images are ", currentHit);
    const data = currentHit.data;
    console.log("show text", this.state);
    const annotations = [];
    let classificationResult = undefined;
    let bbmap = undefined;
    console.log("show showPolygonImages", result);
    if (result.length > 0) {
      const resultObject = JSON.parse(result);
      if (classificationObj) {
        if ("annotationResult" in resultObject) {
          bbmap = resultObject.annotationResult;
          classificationResult = resultObject.classificationResult;
        } else {
          bbmap = resultObject;
        }
      } else {
        bbmap = resultObject;
      }
      if (bbmap) {
        for (let index = 0; index < bbmap.length; index++) {
          const bb = bbmap[index];
          const colors = [];
          for (let jindex = 0; jindex < bb.label.length; jindex++) {
            colors.push(this.state.entityColorMap[bb.label[jindex]]);
          }
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
    }
    return (
      <div>
        {classificationResult &&
          this.showClassificationTags(classificationResult)}
        <h3> Entities </h3>
        {this.showTags(this.state.entities)}
        <br />
        <DocumentAnnotator
          annotations={annotations}
          documentText={data}
          entityColorMap={this.state.entityColorMap}
        />
        <br />
        <div>
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div className="col-xs-4" />
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  showPolygonV2Images = hitsDetails => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    const currentHit = hitsDetails[this.state.start];
    const result = currentHit.hitResults[0].result;

    console.log("bounded images are ", currentHit);
    const data = currentHit.data;
    console.log("show text", this.state);
    const rects = [];
    // let notes = 'new';
    // if (currentHit.hitResults[0] && currentHit.hitResults[0].notes) {
    //   notes = currentHit.hitResults[0].notes;
    // }
    const rectCatMap = {};
    const rectShapeMap = {};
    const notes = {};
    console.log("show showPolygonImages", result);
    if (result.length > 0) {
      const bbmap = JSON.parse(result);
      if (bbmap) {
        for (let index = 0; index < bbmap.length; index++) {
          rects[index] = bbmap[index].points;
          let labels = [];
          if (typeof bbmap[index].label === 'string') {
            labels.push(bbmap[index].label);
          } else {
            labels = bbmap[index].label;
          }
          rectCatMap[index] = labels;
          if (bbmap[index].shape) {
            rectShapeMap[index] = bbmap[index].shape;
          }
          if (bbmap[index].notes) {
            notes[index] = bbmap[index].notes;
          }
        }
      }
    }
    return (
      <div>
        {
          <PolygonAnnotatorV2
            rects={rects}
            notes={notes}
            rectCatMap={rectCatMap}
            rectShapeMap={rectShapeMap}
            image={data}
            entityColorMap={this.state.entityColorMap}
          />
        }
        <br />
        <br />
        <br />
        <div>
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div className="col-xs-4" />
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  showVideoAnnotation = hitsDetails => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    const currentHit = hitsDetails[this.state.start];
    const result = currentHit.hitResults[0].result;

    console.log("bounded images are ", currentHit);
    const data = currentHit.data;
    console.log("show text", this.state);
    const rects = [];
    // let notes = 'new';
    // if (currentHit.hitResults[0] && currentHit.hitResults[0].notes) {
    //   notes = currentHit.hitResults[0].notes;
    // }
    const rectCatMap = {};
    const rectShapeMap = {};
    const rectTimeMap = {};
    const endTimeMap = {};
    console.log("show showPolygonImages", result);
    if (result.length > 0) {
      const bbmap = JSON.parse(result);
      if (bbmap) {
        for (let index = 0; index < bbmap.length; index++) {
          rects[index] = [];
          let timeMap = [];
          for (let jindex = 0; jindex < bbmap[index].positions.length; jindex ++) {
            rects[index].push(bbmap[index].positions[jindex].points);
            timeMap.push(bbmap[index].positions[jindex].time)
          }
          if (timeMap.length === 1) {
            timeMap.push(undefined);
          }
          // rects[index] = boundingBoxMap[index].positions[0].points;
          rectCatMap[index] = bbmap[index].label;
          if (bbmap[index].shape) {
            rectShapeMap[index] = bbmap[index].shape;
          }
          rectTimeMap[index] = timeMap;
          endTimeMap[index] = bbmap[index].endTime;
        }
      }
    }
    return (
      <div>
        {
          <VideoAnnotator
            rects={rects}
            rectCatMap={rectCatMap}
            rectShapeMap={rectShapeMap}
            rectTimeMap={rectTimeMap}
            endTimeMap={endTimeMap}
            video={data}
            entityColorMap={this.state.entityColorMap}
          />
        }
        <br />
        <br />
        <br />
        <div>
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div className="col-xs-4" />
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  showPolygonImages = hitsDetails => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    const currentHit = hitsDetails[this.state.start];
    const result = currentHit.hitResults[0].result;

    console.log("bounded images are ", currentHit);
    const data = currentHit.data;
    console.log("show text", this.state);
    const rects = [];
    let notes = "new";
    if (currentHit.hitResults[0] && currentHit.hitResults[0].notes) {
      notes = currentHit.hitResults[0].notes;
    }
    const rectCatMap = {};
    console.log("show showPolygonImages", result);
    if (result.length > 0) {
      const bbmap = JSON.parse(result);
      if (bbmap) {
        for (let index = 0; index < bbmap.length; index++) {
          rects[index] = bbmap[index].points;
          rectCatMap[index] = bbmap[index].label;
        }
      }
    }
    return (
      <div>
        {notes === "new" && (
          <PolygonAnnotator
            rects={rects}
            rectCatMap={rectCatMap}
            image={data}
            entityColorMap={this.state.entityColorMap}
          />
        )}
        {notes === "old" && (
          <PolygonAnnotatorOld
            rects={rects}
            rectCatMap={rectCatMap}
            image={data}
            entityColorMap={this.state.entityColorMap}
          />
        )}
        <br />
        <br />
        <br />
        <div>
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div className="col-xs-4" />
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  showTagLine(tagLine, data) {
    const splits = tagLine.split(" ");
    const renderArrs = [];
    try {
      const resultJson = JSON.parse(tagLine);
      const labelMap = {};
      let words = [];
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
        let word = words[index];
        if (word.length > 0) {
          let color = "grey";
          let entity = "";
          if (word in labelMap) {
            color = this.state.entityColorMap[labelMap[word]];
            entity = labelMap[words[index]];
          }
          renderArrs.push(
            <Label
              name={index}
              style={{ color: "white", backgroundColor: color }}
              key={index}
            >
              <span name={index} key={index}>
                {word}
              </span>
              {entity !== "" && (
                <p className={styles.entityTag} style={{ display: "inline" }}>
                  &nbsp; {entity}
                </p>
              )}
            </Label>
          );
        }
      }
    } catch (exception) {
        for (let index = 0; index < splits.length; index++) {
          let word = splits[index].trim();
          if (word.length > 0) {
            const wordSplits = word.split("____");
            let color = "grey";
            let entity = "";
            if (wordSplits.length > 1) {
              color = this.state.entityColorMap[wordSplits[1]];
              entity = wordSplits[1];
              word = wordSplits[0];
            }
            renderArrs.push(
              <Label
                name={index}
                style={{ color: "white", backgroundColor: color }}
                key={index}
              >
                <span name={index} key={index}>
                  {word}
                </span>
                {entity !== "" && (
                  <p className={styles.entityTag} style={{ display: "inline" }}>
                    &nbsp; {entity}
                  </p>
                )}
              </Label>
            );
          }
        }
    }

    return <div className={styles.posResultArea}>{renderArrs}</div>;
  }

  showExtra = extra => {
    console.log("extra data is", extra);
    const arrs = [];
    for (const k1 of Object.keys(extra)) {
      arrs.push(
        <STable.Row>
          <STable.Cell textAlign="left" className="h5 bold">
            {k1}
          </STable.Cell>
          <STable.Cell className="h6">{extra[k1]}</STable.Cell>
        </STable.Row>
      );
    }

    return (
      <STable
        celled
        color="blue"
        key="blue"
        size="small"
        compact="very"
        collapsing
      >
        <STable.Body>{arrs}</STable.Body>
      </STable>
    );
  };

  showSummaries = (hitsDetails, type) => {
    if (hitsDetails && hitsDetails.length === 0) {
      return <h2>No Sample HITs</h2>;
    }
    console.log("show hits details ", hitsDetails);
    const currentHit = hitsDetails[this.state.start];
    const data = currentHit.data;
    const result = currentHit.hitResults[0].result;
    let title = "Summaries";
    if (type === TEXT_MODERATION) {
      title = "Moderated Text";
    }
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <Segment basic>
          <h5>Text</h5>
          <p className={styles.dataArea}>{data}</p>
        </Segment>
        <br />
        <div style={{ paddingBottom: "5%" }}>
          <h5>{title}</h5>
          <p className={styles.resultArea}>{result}</p>
        </div>
        <div className="col-md-12">
          <div className="col-md-6 col-xs-4">
            <Button
              size="mini"
              color="grey"
              icon
              labelPosition="left"
              onClick={this.previousElement.bind(this, "pervious")}
              disabled={this.state.start === 0}
            >
              <Icon name="left arrow" />
              Previous
            </Button>
          </div>
          <div className="col-xs-4" />
          <div className="col-md-6">
            <Button
              size="mini"
              color="blue"
              icon
              labelPosition="right"
              onClick={this.nextElement.bind(this, "right")}
              disabled={
                this.state.start < 0 ||
                this.state.start >= this.state.hitsDetails.length - 1
              }
            >
              Next
              <Icon name="right arrow" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  render() {
    console.log("TaggerOrgProject props are ", this.props, this.state);
    const { projectDetails, successModal, hitsDetails, entities } = this.state;
    const path =
      "/projects/" +
      this.props.params.orgName +
      "/" +
      this.props.params.projectName +
      "/";
    let permissions = {};
    let createdDate = "";
    let taggingProgress = 0;
    // let tooltip = undefined;
    let disabledError = "Please login to start tagging";
    if (this.props.user) {
      disabledError = "You don't have required permission";
    }
    if (projectDetails && projectDetails.hasSubscriptionExpired) {
      disabledError = "Please renew subscription to continue";
    }
    let pageTitle = "Project stats";
    let pageDescription =
      "Just upload your data, invite your team members and start tagging. The best way to tag training/evaluation data for your machine learning projects.";
    // const baseUrl = 'https://dataturks.com/projects/';
    // const id1 = baseUrl + this.props.params.orgName + '/' + this.props.params.projectName;
    // const id2 = baseUrl + this.props.params.orgName;
    // const parent = this.props.params.orgName;
    // const child = this.props.params.projectName;
    let extra = "";
    if (
      hitsDetails &&
      hitsDetails.length > 0 &&
      this.state.start >= 0 &&
      hitsDetails[this.state.start].extras
    ) {
      console.log("extra data", hitsDetails, hitsDetails.len);
      extra = JSON.parse(hitsDetails[this.state.start].extras);
    }
    if (projectDetails && projectDetails.permissions) {
      taggingProgress = Number(
        ((projectDetails.totalHitsDone + projectDetails.totalHitsSkipped) *
          100) /
          projectDetails.totalHits
      ).toFixed(0);
      if (projectDetails.totalHits === 0) taggingProgress = 0;
      permissions = projectDetails.permissions;
      if (projectDetails.created_timestamp) {
        createdDate = timeConverter(projectDetails.created_timestamp / 1000);
      }
      pageTitle = projectDetails.name;
      if (projectDetails.shortDescription) {
        pageDescription = projectDetails.shortDescription;
        pageTitle = pageTitle + " - " + projectDetails.shortDescription;
      }
      if (projectDetails.subtitle) {
        pageTitle = pageTitle + " - " + projectDetails.subtitle;
      }
      // tooltip = (
      //   <Tooltip id="tooltip" show={!this.props.user}>
      //     <strong>Holy guacamole!</strong> Check this info.
      //   </Tooltip>
      // );
    }
    console.log("head script", config.app.head);
    const scriptInnerHTML = `
                  {
                    "@context": "http://schema.org",
                  }
                `;
    const schema = {
      type: "application/ld+json",
      innerHTML: scriptInnerHTML
    };
    return (
      <div className="taggerPages" style={{ display: 'flex', flexDirection: 'column' }}>
        <Helmet script={[schema]} title={pageTitle}>
          <meta property="og:title" content={pageTitle} />
          <meta name="description" content={pageDescription} />
          <meta property="og:description" content={pageDescription} />
        </Helmet>
        {(this.state.projectDetailsError ||
          this.state.currentProject === "-1") && (
          <div className="text-center">
            <h3>{this.state.projectDetailsError}</h3>
          </div>
        )}
        {!projectDetails && <Segment basic vertical loading />}
        {projectDetails && (
          <div>
            <Segment
              basic
              vertical
              size="large"
              className={styles.title}
              loading={this.state.loading}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <Breadcrumb size="big">
                    <Breadcrumb.Section
                      link
                      as="a"
                      href={"/projects/" + projectDetails.orgName}
                      onClick={event => {
                        this.props.pushState(
                          "/projects/" + projectDetails.orgName
                        );
                        event.preventDefault();
                      }}
                    >
                      {projectDetails.orgName}
                    </Breadcrumb.Section>
                    <Breadcrumb.Divider />
                    <Breadcrumb.Section active>
                      {projectDetails.name}
                    </Breadcrumb.Section>
                  </Breadcrumb>
                </div>
                <div />
                <div>
                  <Dropdown
                    text="Options"
                    icon="options"
                    labeled
                    button
                    className="icon mini teal"
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item
                        disabled={!permissions.canUploadData}
                        onClick={this.openScreen.bind(this, "edit", "file")}
                      >
                        {" "}
                        <Icon name="add circle" color="blue" /> Add Data
                      </Dropdown.Item>
                      <Dropdown.Item
                        disabled={!permissions.canEditProject}
                        onClick={this.openScreen.bind(this, "edit", "label")}
                      >
                        {" "}
                        <Icon name="edit" color="blue" />
                        Edit Project
                      </Dropdown.Item>
                      <Dropdown.Item
                        disabled={!permissions.canSeeCompletedHITs}
                        onClick={this.openScreen.bind(this, "overview", "all")}
                      >
                        {" "}
                        <Icon name="database" color="blue" />
                        HITs Done
                      </Dropdown.Item>
                      <Dropdown.Item
                        disabled={!permissions.canSeeCompletedHITs}
                        onClick={this.openScreen.bind(
                          this,
                          "overview",
                          "skipped"
                        )}
                      >
                        {" "}
                        <Icon name="mail forward" color="blue" />
                        HITs Skipped
                      </Dropdown.Item>
                      <Dropdown.Item
                        disabled={!permissions.canDownloadData}
                        onClick={this.openScreen.bind(this, "export")}
                      >
                        <Icon name="download" color="blue" />
                        Download
                      </Dropdown.Item>
                      <Dropdown.Item
                        disabled={!permissions.canEditProject}
                        onClick={this.openScreen.bind(this, "keybind")}
                      >
                        <Icon name="keyboard" color="blue" />
                        Keyboard Shortcuts
                      </Dropdown.Item>
                      <Dropdown.Item
                        disabled={!permissions.canInviteCollaborators}
                        onClick={this.openScreen.bind(this, "contributors")}
                      >
                        {" "}
                        <Icon name="users" color="blue" /> Contributors
                      </Dropdown.Item>
                      <Dropdown.Item
                        disabled={!permissions.canDeleteProject}
                        onClick={() => {
                          this.setState({ showDeleteConfirmation: true });
                        }}
                      >
                        <Icon name="delete" color="red" />
                        Delete Project
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div className="marginTop">
                <p className="text-left">{projectDetails.shortDescription}</p>
                {!this.props.user && (
                  <Button
                    className="pull-right"
                    as="a"
                    onClick={() => {
                      this.props.pushState("/projects/login");
                    }}
                    color="blue"
                  >
                    <Icon name="sign in" /> Log In or Register
                  </Button>
                )}
              </div>
              <br />
              <br />
            </Segment>
          </div>
        )}
        {this.state.inviteModal && (
          <TaggerInvite
            submitEmail={this.inviteByEmail}
            modalOpen={this.openModal}
            modalClose={this.closeModal}
          />
        )}
        {this.state.showDeleteConfirmation && (
          <div>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title>Delete Project</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                Once deleted we would not be able to recover the data. Please
                make sure you have a backup at your end for all the data.
              </Modal.Body>
              <Modal.Footer>
                <Button
                  onClick={() => {
                    this.setState({ showDeleteConfirmation: false });
                  }}
                >
                  Close
                </Button>
                <Button
                  negative
                  onClick={() => {
                    this.deleteProject().bind(this);
                  }}
                >
                  Delete
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        )}
        {successModal && (
          <div className="static-modal" style={{ marginTop: "50px" }}>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title>Success</Modal.Title>
              </Modal.Header>

              <Modal.Body>{this.state.successMessage}</Modal.Body>

              <Modal.Footer>
                <Button bsStyle="success" onClick={this.close}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        )}

        {projectDetails &&
          projectDetails.contributorDetails && (
            <div className="text-center" style={{ minHeight: "200px", display: 'flex', flexDirection: 'column' }}>
              <Segment
                basic
                vertical
                className={styles.stats}
                textAlign="center"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                loading={this.state.loading}
              >
                <div className="pull-left col-md-12 marginTop text-left">
                  <Label>{projectDetails.visibility_type}</Label>
                  <Label>{taskTypeMap[projectDetails.task_type]}</Label>
                  <Label>Created on {createdDate}</Label>
                  <Label>
                    {projectDetails.contributorDetails.length} Contributors
                  </Label>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <br />
                  <h3> {taggingProgress} % completed </h3>
                  <Progress
                    color="green"
                    size="large"
                    indicating
                    percent={taggingProgress}
                    precision={2}
                    progress="percent"
                    style={{ width: "50%", left: "25%", fontSize: "0.75rem" }}
                  />
                  <div style={{ padding: '0.5rem', borderTop: '1px solid lightsteelbue', borderBottom: '1px solid lightsteelbue', textAlign: 'left', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                  <div>
                  <h5> HITs Progress </h5>
                  <Statistic.Group size="mini" widths="eight">
                    <Statistic
                      color="green"
                      size="mini"
                      as="a"
                      href={path + "space?type=all"}
                      onClick={event => {
                        this.openScreen("overview", "all");
                        event.preventDefault();
                      }}
                    >
                      <Statistic.Value>
                        {projectDetails.totalHitsDone}
                      </Statistic.Value>
                      <Statistic.Label style={statsLabel}>
                        HITs Done
                      </Statistic.Label>
                    </Statistic>
                    <Statistic
                      color="violet"
                      as="a"
                      size="mini"
                      href={path + "space?type=skipped"}
                      onClick={event => {
                        this.openScreen("overview", "skipped");
                        event.preventDefault();
                      }}
                    >
                      <Statistic.Value>
                        {projectDetails.totalHitsSkipped}
                      </Statistic.Value>
                      <Statistic.Label style={statsLabel}>
                        HITs Skipped
                      </Statistic.Label>
                    </Statistic>
                    <Statistic
                      color="red"
                      size="mini"
                      as="a"
                      href={path + "space?type=deleted"}
                      onClick={event => {
                        this.openScreen("overview", "deleted");
                        event.preventDefault();
                      }}
                    >
                      <Statistic.Value>
                        {projectDetails.totalHitsDeleted}
                      </Statistic.Value>
                      <Statistic.Label style={statsLabel}>
                        HITs Deleted
                      </Statistic.Label>
                    </Statistic>
                    <Statistic size="mini">
                      <Statistic.Value color="blue">
                        {projectDetails.totalHits}
                      </Statistic.Value>
                      <Statistic.Label style={statsLabel}>
                        Total HITs
                      </Statistic.Label>
                    </Statistic>
                  </Statistic.Group>
                  </div>
                  {(projectDetails.totalEvaluationInCorrect > 0 ||
                    projectDetails.totalEvaluationCorrect > 0) && (
                    <div style={{ textAlign: 'left'}}>
                      <h5>Evaluation Stats </h5>
                      <Statistic.Group size="mini" widths="four">
                        <Statistic
                          color="green"
                          size="mini"
                        >
                          <Statistic.Value>
                            {projectDetails.totalEvaluationCorrect}
                          </Statistic.Value>
                          <Statistic.Label style={statsLabel}>
                            Correct
                          </Statistic.Label>
                        </Statistic>
                        <Statistic
                          color="red"
                          size="mini"
                        >
                          <Statistic.Value>
                            {projectDetails.totalEvaluationInCorrect}
                          </Statistic.Value>
                          <Statistic.Label style={statsLabel}>
                            Incorrect
                          </Statistic.Label>
                        </Statistic>
                      </Statistic.Group>
                    </div>
                  )}
                  </div>
                  <br />
                </div>
              </Segment>
            </div>
          )}

        {projectDetails && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly"
            }}
          >
            <Button
              as="a"
              href={path + "visualize"}
              disabled={!permissions.canSeeInsights}
              primary
              size="mini"
              onClick={event => {
                this.openScreen("visualize");
                event.preventDefault();
              }}
            >
              <Icon name="bar graph" /> Insights
            </Button>
            <a data-for="main" data-tip={disabledError}>
              <Button
                as="a"
                href={path + "space"}
                disabled={!permissions.canCompleteHITs}
                primary
                size="mini"
                onClick={event => {
                  this.openScreen("space");
                  event.preventDefault();
                }}
              >
                <Icon name="tag" /> Start Tagging
              </Button>
            </a>
            <a data-for="main2" data-tip={disabledError}>
              <Button
                disabled={!permissions.canInviteCollaborators}
                primary
                size="mini"
                onClick={this.openInviteModal}
              >
                <Icon name="add user" /> Add Contributor
              </Button>
            </a>
            <ReactTooltip id="main" disable={permissions.canCompleteHITs} />
            <ReactTooltip
              id="main2"
              disable={permissions.canInviteCollaborators}
            />
          </div>
        )}

        <div style={{ height: "50px" }} />
        {projectDetails &&
          projectDetails.contributorDetails &&
          projectDetails.contributorDetails.length > 0 && (
            <div
              className="text-center"
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              <Segment.Group
                loading={this.state.loading}
                style={{ width: "60%" }}
                centered
              >
                <Header attached="top" block as="h4">
                  <Icon name="line chart" disabled />
                  <Header.Content>Leaderboard</Header.Content>
                </Header>
                <Table striped bordered condensed hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Time(s) / HIT</th>
                      <th>#HITs done</th>
                    </tr>
                  </thead>
                  {this.getContributorsData(projectDetails.contributorDetails)}
                </Table>
              </Segment.Group>
            </div>
          )}

        <br />
        <br />

        {projectDetails &&
          projectDetails.description && (
            <Segment.Group>
              <Header attached="top" block as="h4">
                <Icon name="book" disabled />
                <Header.Content>Description</Header.Content>
              </Header>
              <Segment padded>
                <div
                  dangerouslySetInnerHTML={{
                    __html: projectDetails.description
                  }}
                />
              </Segment>
            </Segment.Group>
          )}
        {projectDetails &&
          hitsDetails &&
          hitsDetails.length > 0 &&
          projectDetails.task_type === TEXT_SUMMARIZATION && (
            <Segment.Group>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment padded>
                {extra && <div>{this.showExtra(extra)}</div>}
                {this.showSummaries(hitsDetails, TEXT_SUMMARIZATION)}
              </Segment>
            </Segment.Group>
          )}
        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          projectDetails.task_type === TEXT_MODERATION && (
            <Segment.Group>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment padded>
                {extra && <div>{this.showExtra(extra)}</div>}
                {this.showSummaries(hitsDetails, TEXT_MODERATION)}
              </Segment>
            </Segment.Group>
          )}
        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          projectDetails.task_type === TEXT_CLASSIFICATION && (
            <Segment.Group>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment padded>
                <h3> Entities </h3>
                {this.showTags(entities)}
                <br />
                {extra && <div>{this.showExtra(extra)}</div>}
                <br />
                {this.showClassifications(hitsDetails)}
              </Segment>
            </Segment.Group>
          )}

        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          (projectDetails.task_type === IMAGE_CLASSIFICATION ||
            projectDetails.task_type === VIDEO_CLASSIFICATION) && (
            <Segment.Group>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment padded>
                <h3> Entities </h3>
                {this.showTags(entities)}
                <br />
                {extra && <div>{this.showExtra(extra)}</div>}
                <br />
                {this.showClassificationImages(hitsDetails)}
              </Segment>
            </Segment.Group>
          )}

        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          projectDetails.task_type === POS_TAGGING && (
            <Segment.Group>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment
                padded
                className="text-center"
                style={{ paddingBottom: "10%" }}
              >
                <h3> Entities </h3>
                {this.showTags(entities)}
                <br />
                {extra && <div>{this.showExtra(extra)}</div>}
                <br />
                {this.showPosTags(hitsDetails)}
              </Segment>
            </Segment.Group>
          )}

        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          projectDetails.task_type === IMAGE_BOUNDING_BOX && (
            <Segment.Group>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment
                padded
                className="text-center"
                style={{ paddingBottom: "10%" }}
              >
                <h3> Entities </h3>
                {this.showTags(entities)}
                <br />
                {extra && <div>{this.showExtra(extra)}</div>}
                <br />
                {this.showBoundedImages(hitsDetails)}
              </Segment>
            </Segment.Group>
          )}
        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 && (
            <Segment.Group loading={this.state.loading}>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment
                padded
                className="text-center"
                style={{ paddingBottom: "10%" }}
              >
                <h3> Entities </h3>
                {this.showTags(entities)}
                <br />
                {extra && <div>{this.showExtra(extra)}</div>}
                <br />
                {this.showPolygonV2Images(hitsDetails)}
              </Segment>
            </Segment.Group>
          )}
        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX && (
            <Segment.Group loading={this.state.loading}>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment
                padded
                className="text-center"
                style={{ paddingBottom: "10%" }}
              >
                <h3> Entities </h3>
                {this.showTags(entities)}
                <br />
                {extra && <div>{this.showExtra(extra)}</div>}
                <br />
                {this.showPolygonImages(hitsDetails)}
              </Segment>
            </Segment.Group>
          )}
        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          projectDetails.task_type === VIDEO_BOUNDING_BOX && (
            <Segment.Group loading={this.state.loading}>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment
                padded
                className="text-center"
                style={{ paddingBottom: "10%" }}
              >
                <h3> Entities </h3>
                {this.showTags(entities)}
                <br />
                {extra && <div>{this.showExtra(extra)}</div>}
                <br />
                {this.showVideoAnnotation(hitsDetails)}
              </Segment>
            </Segment.Group>
          )}

        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 &&
          (projectDetails.task_type === DOCUMENT_ANNOTATION ||
            projectDetails.task_type === POS_TAGGING_GENERIC) && (
            <Segment.Group loading={this.state.loading}>
              <Header attached="top" block as="h4">
                <Icon name="list" disabled />
                <Header.Content>Sample Data</Header.Content>
              </Header>
              <Segment
                basic
                vertical
                className="text-center"
                style={{ paddingBottom: "10%" }}
              >
                {extra && <div>{this.showExtra(extra)}</div>}
                {this.showDocs(hitsDetails)}
              </Segment>
            </Segment.Group>
          )}
        <div style={{ height: "50px" }} />

        {projectDetails &&
          hitsDetails &&
          hitsDetails.length >= 0 && (
            <div className="text-center">
              <a data-for="main7" data-tip={disabledError}>
                <Button
                  disabled={!permissions.canCompleteHITs}
                  primary
                  onClick={this.openScreen.bind(this, "space")}
                >
                  <Icon name="tag" /> Start Tagging
                </Button>
              </a>
              <ReactTooltip id="main7" disable={permissions.canCompleteHITs} />
            </div>
          )}

        <div style={{ height: "50px" }} />
      </div>
    );
  }
}
