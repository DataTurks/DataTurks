import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
// import { Header } from 'semantic-ui-react';
import { Checkbox, Button, Label, Accordion, Menu, Statistic, Form, Card, Segment, Breadcrumb, Icon, Progress } from 'semantic-ui-react';
import { push } from 'react-router-redux';
import { uploadFileDT, editProject, getHomeData, getUidToken } from '../../helpers/dthelper';
import { posSample, imageBoundingSample, imagePolyBoundingSample, textClassificationJsonSample } from '../../helpers/Utils';
import { updateFileUploadStats, updateHomeData, setCurrentProject, getProjectDetails, getUserHomeData } from 'redux/modules/dataturks';
import { IMAGE_POLYGON_BOUNDING_BOX, VIDEO_BOUNDING_BOX, VIDEO_CLASSIFICATION, IMAGE_POLYGON_BOUNDING_BOX_V2, POS_TAGGING_GENERIC, DOCUMENT_ANNOTATION, IMAGE_BOUNDING_BOX, TEXT_SUMMARIZATION, POS_TAGGING, TEXT_CLASSIFICATION, IMAGE_CLASSIFICATION, TEXT_MODERATION } from '../../helpers/Utils';

const bytes = require('bytes');

@connect(
  state => ({user: state.auth.user,
    currentPathOrg: state.dataturksReducer.currentPathOrg,
    currentPathProject: state.dataturksReducer.currentPathProject,
   currentProject: state.dataturksReducer.currentProject, projectDetails: state.dataturksReducer.projectDetails,
   projects: state.dataturksReducer.projects}),
      dispatch => bindActionCreators({ pushState: push, getUserHomeData, getProjectDetails, updateFileUploadStats, updateHomeData, setCurrentProject }, dispatch))
export default class TaggerEdit extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    pushState: PropTypes.func,
    projects: PropTypes.array,
    currentProject: PropTypes.string,
    updateFileUploadStats: PropTypes.func,
    projectDetails: PropTypes.object,
    location: PropTypes.object,
    query: PropTypes.object,
    type: PropTypes.string,
    updateHomeData: PropTypes.func,
    params: PropTypes.object,
    orgName: PropTypes.string,
    projectName: PropTypes.string,
    setCurrentProject: PropTypes.func,
    getProjectDetails: PropTypes.func,
    getUserHomeData: PropTypes.func,
    currentPathProject: PropTypes.string,
    currentPathOrg: PropTypes.string
  }

  constructor(props) {
    super(props);
    console.log('edit props are ', props);
    const type = props.location.query.type;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileUploaded = this.fileUploaded.bind(this);
    this.handleUploadFile = this.handleUploadFile.bind(this);
    this.openScreen = this.openScreen.bind(this);
    this.projectEditedCallback = this.projectEditedCallback.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.projectDetailsFetched = this.projectDetailsFetched.bind(this);
    this.fileUploadProgressCallback = this.fileUploadProgressCallback.bind(this);
    const fields = {};
    let autoClose = false;
    let hideLabels = true;
    let notes = false;
    let defaultShape = 'polygon';
    let shortcuts = undefined;
    let classification_name = '';
    let classification_disp_name = '';
    let classification_classes = '';
    fields.classification_name = '';
    fields.classification_disp_name = '';
    fields.classification_classes = '';
    if (this.props.projectDetails) {
      const { name, taskRules } = this.props.projectDetails;
      const rulesJson = JSON.parse(taskRules);
      const tags = rulesJson.tags;
      const instructions = rulesJson.instructions;
      if ('autoClose' in rulesJson) {
        autoClose = rulesJson.autoClose;
      }
      if ('notes' in rulesJson) {
        notes = rulesJson.notes;
      }
      if ('hideLabels' in rulesJson) {
        hideLabels = rulesJson.hideLabels;
      }
      if ('defaultShape' in rulesJson) {
        defaultShape = rulesJson.defaultShape;
      }
      if ('shortcuts' in rulesJson) {
        shortcuts = rulesJson.shortcuts;
      }
      if ('classification' in rulesJson) {
        let classification = rulesJson.classification;
        classification_name = classification[0].name;
        classification_disp_name = classification[0].displayName;
        classification_classes = classification[0].classes;
        fields.classification_name = classification_name;
        fields.classification_disp_name = classification_disp_name;
        fields.classification_classes = classification_classes.join();
      }
      fields.projectName = name;
      fields.tags = tags;
      fields.shortcuts = shortcuts;
      fields.instructions = instructions;
    }
    this.state = {
      loading: false,
      file: undefined,
      errors: undefined,
      fileUploaded: false,
      uploadType: undefined,
      fileUploadProgress: 0,
      autoClose,
      defaultShape,
      notes,
      hideLabels,
      keepEntitySelected: false,
      activeIndex: 1,
      fields,
      type
    };
  }


  state = {
    loading: false,
    file: undefined,
    errors: undefined,
    fileUploaded: false
  };

  componentDidMount() {
    console.log('Did mount TaggerEdit ', this.props);
    if (this.props.params.orgName && this.props.params.projectName &&
      (this.props.currentPathOrg !== this.props.params.orgName && this.props.currentPathProject !== this.props.params.projectName)) {
      this.props.setCurrentProject({orgName: this.props.params.orgName, projectName: this.props.params.projectName}, getUidToken());
    }

    // if (this.props.params.orgName && this.props.params.projectName) {
    //   this.props.setCurrentProject({orgName: this.props.params.orgName, projectName: this.props.params.projectName}, getUidToken());
    // }
    const editor = document.getElementById('instruction');
    if (editor !== null) {
      editor.setAttribute('data-gramm', 'false');
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('next props in TaggerOveriew', this.props, nextProps);
    if (this.props.currentProject !== nextProps.currentProject || !this.props.projectDetails) {
      this.props.getProjectDetails(nextProps.currentProject, getUidToken());
      this.setState({ loading: true});
    }
    if (!this.props.projectDetails && nextProps.projectDetails) {
      const { name, taskRules } = nextProps.projectDetails;
      const rulesJson = JSON.parse(taskRules);
      const tags = rulesJson.tags;
      const instructions = rulesJson.instructions;
      let shortcuts = undefined;
      let autoClose = false;
      let notes = false;
      let defaultShape = 'polygon';
      let classification_name = '';
      let classification_disp_name = '';
      let classification_classes = [];
      const fields = {};
      if ('shortcuts' in rulesJson) {
        shortcuts = rulesJson.shortcuts;
      }
      if ('autoClose' in rulesJson) {
        autoClose = rulesJson.autoClose;
      }
      if ('notes' in rulesJson) {
        notes = rulesJson.notes;
      }
      if ('defaultShape' in rulesJson) {
        defaultShape = rulesJson.defaultShape;
      }
      if ('classification' in rulesJson) {
        let classification = rulesJson.classification;
        classification_name = classification[0].name;
        classification_disp_name = classification[0].displayName;
        classification_classes = classification[0].classes.join();
        fields.classification_name = classification_name;
        fields.classification_disp_name = classification_disp_name;
        fields.classification_classes = classification_classes;
      }
      fields.projectName = name;
      fields.tags = tags;
      fields.instructions = instructions;
      fields.shortcuts = shortcuts;
      this.setState({
        loading: false,
        fields,
        notes,
        autoClose,
        defaultShape
      });
    }
  }

  // showClassificationGroups() {
  //   return (<p>Classification Groups</p>);
  // }

  resetClassification() {
    let fields = this.state.fields;
    fields.classification_name = '';
    fields.classification_disp_name = '';
    fields.classification_classes = '';
    this.setState({ fields });
  }

  fileUploaded(error, response) {
    console.log(' file was uploaded ', error, response);
    if (response && response.statusCode && response.statusCode === 200) {
      console.log(' file upload successful ', response.body);
      this.setState({ loading: false, fileUploaded: true, fileUploadStats: response.body });
      this.props.updateFileUploadStats(response.body);
      this.props.getProjectDetails(this.props.currentProject, getUidToken());
      getHomeData(this.projectDetailsFetched);
    } else {
      const errors = response ? response.body.message : error;
      this.setState({ loading: false, fileUploaded: false, errors});
    }
  }

  openScreen = (screen) => {
    console.log('opening screen ', screen);
    this.props.pushState('/projects/' + screen);
  }

  handleChange(field, element) {
    console.log(' handle change ', field, element, this.state);
    const fields = this.state.fields;
    fields[field] = element.target.value;
    this.setState({fields});
  }

  handleUploadFile(event) {
    console.log('handle upload file', event.target.files[0]);
    // const fields = this.state.fields;
    // fields.file = event.target.files[0];
    const file = event.target.files[0];
    // if (file.type === 'text/plain' || file.type === 'application/zip') {
    this.setState({ file });
  }

  projectDetailsFetched( error, response ) {
    console.log('home details fetched ', error, response);
    if (!error) {
      this.props.updateHomeData(response.body.userDetails, response.body.projects, response.body.planName, response.body.labelsAllowed, response.body.labelsDone, response.body.subscriptionExpiryTimestamp);
    }
  }

  fileUploadProgressCallback(event) {
    console.log('file upload progress', event.percent);
    this.setState({ fileUploadProgress: event.percent });
  }

  projectEditedCallback(error, response) {
    console.log(' project edit callback ', error, response);
    if (!error) {
      this.props.getUserHomeData(getUidToken());
      this.props.getProjectDetails(this.props.currentProject, getUidToken());
      this.setState({ loading: false, projectEdited: true});
    } else {
      const errors = response.body.message;
      this.setState({ loading: false, projectEdited: false, errors});
    }
  }

  handleSubmit = (response, type) => {
    console.log('handleSubmit', response, type);
    if (this.props.currentProject && this.state.file) {
      console.log('project file', response);
      if (this.state.uploadType === 'Pre-Annotated') {
        if (this.props.projectDetails.task_type === TEXT_SUMMARIZATION || this.props.projectDetails.task_type === TEXT_MODERATION ||
          this.props.projectDetails.task_type === IMAGE_CLASSIFICATION || this.props.projectDetails.task_type === VIDEO_CLASSIFICATION) {
          uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback, 'PRE_TAGGED_TSV');
        } else if (this.props.projectDetails.task_type === TEXT_CLASSIFICATION) {
          let format = 'PRE_TAGGED_TSV';
          if (this.state.selectedFormat && this.state.selectedFormat === 'json') {
            format = 'PRE_TAGGED_JSON';
          }
          uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback, format);
        } else {
          uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback, 'PRE_TAGGED_JSON');
        }
      } else {
        if (this.props.projectDetails.task_type === DOCUMENT_ANNOTATION || this.props.projectDetails.task_type === POS_TAGGING_GENERIC) {
          if (this.state.isURLs) {
            uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback, 'URL_FILE');
          } else {
            uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback);
          }
        } else {
          uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback);
        }
      }
      this.setState({ loading: true });
    } else if (this.props.currentProject && this.state.type === 'label') {
      console.log('project edit', response);
      let rules = '';
      if (this.state.fields.tags) {
        rules = { tags: this.state.fields.tags, instructions: this.state.fields.instructions };
      } else {
        rules = { instructions: this.state.fields.instructions };
      }
      if (this.state.fields.shortcuts) {
        rules.shortcuts = this.state.fields.shortcuts;
      }
      if (this.props.projectDetails &&
        (this.props.projectDetails.task_type === DOCUMENT_ANNOTATION ||
          this.props.projectDetails.task_type === POS_TAGGING_GENERIC ||
          this.props.projectDetails.task_type === IMAGE_BOUNDING_BOX)) {
        rules.autoClose = this.state.autoClose;
      }
      if (this.state.fields && this.state.fields.classification_name && this.state.fields.classification_disp_name && this.state.fields.classification_classes) {
        rules.classification = [{ name: this.state.fields.classification_name, displayName: this.state.fields.classification_disp_name, classes: this.state.fields.classification_classes.split(',') }];
      }
      if (this.props.projectDetails &&
          this.props.projectDetails.task_type === IMAGE_BOUNDING_BOX) {
        rules.hideLabels = this.state.hideLabels;
        rules.notes = this.state.notes;
      }
      if (this.props.projectDetails &&
          this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2) {
        rules.defaultShape = this.state.defaultShape;
        rules.keepEntitySelected = this.state.keepEntitySelected;
      }
      console.log('response', response, this.state.fields, JSON.stringify(rules));
      editProject(this.props.currentProject, {name: this.state.fields.projectName, taskType: this.props.projectDetails.task_type, accessType: 'RESTRICTED', rules: JSON.stringify(rules) }, this.projectEditedCallback);
      this.setState({ loading: true });
    }
  }

  advancedOptionChange = (e1, e2, e3) => {
    console.log('advancedOptionChange', e1, e2, e3);
    if (e1 === 'autoClose') {
      this.setState({ autoClose: e3.checked });
    } else if (e1 === 'hideLabels') {
      this.setState({ hideLabels: e3.checked });
    } else if (e1 === 'keepEntitySelected') {
      this.setState({ keepEntitySelected: e3.checked });
    } else if (e1 === 'notes') {
      this.setState({ notes: e3.checked });
    } else if (e1 === 'defaultShape') {
      if (e3.checked) {
        this.setState({ defaultShape: e3.value });
      }
    } else if (e1 === 'selectedFormat') {
      if (e3.checked) {
        this.setState({ selectedFormat: e3.value });
      }
    } else if (e1 === 'isURLs') {
      this.setState({ isURLs: e3.checked });
    }
  }

  render() {
    // const styles = require('./TaggerAdd.scss');
    console.log('taggder add state is ', this.state, this.props);
    const { projectDetails } = this.props;
    let submitDisabled = true;
    if (projectDetails) {
      if (this.state.fields && (Object.keys(this.state.fields).length >= 2 || (this.state.file)) && !this.state.loading) {
        submitDisabled = false;
      }
      if (!submitDisabled && this.state.type === 'label' && this.state.fields && Object.keys(this.state.fields).length >= 2 && this.state.fields.projectName.length === 0) {
        submitDisabled = true;
      } else if (!submitDisabled && this.state.type === 'label' && this.state.fields && Object.keys(this.state.fields).length === 3 && this.state.fields.tags && this.state.fields.tags.length === 0) {
        submitDisabled = true;
      }
    }

    if ((this.state.fields.classification_name.length > 0 && (this.state.fields.classification_classes.length === 0 || this.state.fields.classification_disp_name.length === 0)) ||
         ((this.state.fields.classification_name.length === 0 || this.state.fields.classification_disp_name.length === 0) && this.state.fields.classification_classes.length > 0) ||
         ((this.state.fields.classification_name.length === 0 || this.state.fields.classification_classes.length === 0) && this.state.fields.classification_disp_name.length > 0)) {
      submitDisabled = true;
    }
    const styles = require('./TaggerEdit.scss');
    const inputWidth = { width: '50%'};
    const { projectName, tags, instructions } = this.state.fields;
    let ignoreClass = 'hidden';
    const docOptions = (
      <Form.Checkbox label="Single Label per Entity" name="autoClose" checked={this.state.autoClose} value="Single Label" onChange={this.advancedOptionChange.bind(this, 'autoClose')} />
    );

    const imgPolyV2Options = (
      <div>
        <Form.Field>
            <Checkbox
              radio
              label="Polygon"
              name="checkboxRadioGroup"
              value="polygon"
              checked={this.state.defaultShape === 'polygon'}
              onChange={this.advancedOptionChange.bind(this, 'defaultShape')}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label="Rectangle"
              name="checkboxRadioGroup"
              value="rectangle"
              checked={this.state.defaultShape === 'rectangle'}
              onChange={this.advancedOptionChange.bind(this, 'defaultShape')}
            />
          </Form.Field>
        <Form.Checkbox label="Keep Entity Selected" name="keepEntitySelected" checked={this.state.keepEntitySelected} value="Keep Entity Selected" onChange={this.advancedOptionChange.bind(this, 'keepEntitySelected')} />
      </div>
    );
    const imgBoundingOptions = (
      <div>
      <Form.Checkbox label="Show Notes" name="notes" checked={this.state.notes} value="Show Notes" onChange={this.advancedOptionChange.bind(this, 'notes')} />
      <Form.Checkbox label="Single Label per Entity" name="autoClose" checked={this.state.autoClose} value="Single Label" onChange={this.advancedOptionChange.bind(this, 'autoClose')} />
      <Form.Checkbox label="Hide Annotation After Labeling" name="hideLabels" checked={this.state.hideLabels} value="Single Label" onChange={this.advancedOptionChange.bind(this, 'hideLabels')} />
      </div>
    );

    if (this.state.fileUploaded && this.state.type === 'file' && this.state.fileUploadStats.numHitsIgnored > 0) {
      ignoreClass = '';
    }
    // console.log('classification_name', this.state.fields.classification_name.length);
    // let inputMessage = 'Please make sure each line in file has a input row';

    // if (projectDetails && (projectDetails.task_type === IMAGE_BOUNDING_BOX ||
    //  projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX || projectDetails.task_type === IMAGE_CLASSIFICATION)) {
    //   inputMessage = 'Upload a text file containing URLs of images. <br /> <strong> OR </strong> <br /> A zip file of all the images. Max file size is 100 MB for free plans';
    // }
    const advPanels = [
      {
        key: 'details',
        title: 'Advanced Details',
        content: {
          as: Form.Checkbox,
          onClick: this.advancedOptionChange.bind(this, 'isURLs'),
          value: this.state.isURLs,
          label: 'URLs ?',
        },
      },
    ]

    return (
      <div id="home-page" className="taggerPages">
          <Helmet title="Edit Project" />
                      { this.props.currentProject &&
                          <div className="text-center marginTop">
                                    <Segment basic size="large" loading={this.state.loading}>
                                      <Button className="pull-left" onClick={() => this.props.pushState('/projects/' + this.props.params.orgName + '/' + this.props.params.projectName)} compact><Icon name="arrow left" />Project</Button>
                                          <div className="text-center">
                                            <Breadcrumb size="big">
                                              <Breadcrumb.Section link onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName)}>{this.props.params.orgName}</Breadcrumb.Section>
                                              <Breadcrumb.Divider />
                                              <Breadcrumb.Section active link onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName + '/' + this.props.params.projectName)}>
                                                {this.props.params.projectName}
                                              </Breadcrumb.Section>
                                            </Breadcrumb>
                                          </div>
                                   </Segment>
                            <h1>Edit Project</h1>
                                <br />

                            { this.state.fileUploaded && this.state.type === 'file' &&
                                <div>
                                  <h2> Project update successful</h2>
                                    <div className={styles.stats}>
                                    <div className="col-md-5" />
                                    <Statistic.Group widths="three" size="mini" horizontal>
                                      <Statistic color="green">
                                        <Statistic.Value>{this.state.fileUploadStats.numHitsCreated}</Statistic.Value>
                                        <Statistic.Label>Number of HITs created</Statistic.Label>
                                      </Statistic>

                                      <Statistic color="green" className={ignoreClass}>
                                        <Statistic.Value>{this.state.fileUploadStats.numHitsIgnored}</Statistic.Value>
                                        <Statistic.Label>Number of HITs Ignored</Statistic.Label>
                                      </Statistic>

                                      <Statistic>
                                        <Statistic.Value color="blue">
                                          {bytes(this.state.fileUploadStats.totalUploadSizeInBytes)}
                                        </Statistic.Value>
                                        <Statistic.Label>File Size</Statistic.Label>
                                      </Statistic>
                                    </Statistic.Group>
                                    <div className="col-md-4" />
                                  </div>
                                  <br />
                                  <div style={{height: '60px'}}/>
                                    <Button color="teal" onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName + '/' + this.props.params.projectName)}>
                                      Go Back to Project
                                    </Button>

                                </div>

                            }
                            { this.state.type === 'label' && projectDetails && (projectDetails.task_type === POS_TAGGING || projectDetails.task_type === POS_TAGGING_GENERIC ||
                             projectDetails.task_type === DOCUMENT_ANNOTATION) &&
                            <div>
                              <br />
                              {!this.state.projectEdited && projectDetails &&
                              <Form size="small" key="import1" loading={this.state.loading} compact>
                                <Form.Input style={inputWidth} id="projectName" size="small" color="teal" compact onChange={this.handleChange.bind(this, 'projectName')} label="Project Name" control="input" type="text" value={projectName} />
                                <br />
                                <Form.Input style={inputWidth} id="tags" size="small" compact onChange={this.handleChange.bind(this, 'tags')} label="List of tags comma seperated" control="input" type="text" value={tags} />
                                <br />
                                <Form.Input style={inputWidth} size="small" id="instruction" type="textarea" onChange={this.handleChange.bind(this, 'instructions')} label="Tagging Instruction" control="TextArea" value={instructions} />
                                <br />
                              {this.state.type === 'label' && projectDetails && (projectDetails.task_type === DOCUMENT_ANNOTATION || projectDetails.task_type === POS_TAGGING_GENERIC) &&
                              <Accordion as="Menu">
                                <Menu.Item>
                                      <Accordion.Title
                                        active={this.state.activeIndex === 0}
                                        content="Advanced Options"
                                        index={0}
                                        onClick={() => { if (this.state.activeIndex === 0) this.setState({activeIndex: 1}); else this.setState({activeIndex: 0});}}
                                      />
                                <Accordion.Content active={this.state.activeIndex === 0} content={docOptions} />
                                </Menu.Item>
                              </Accordion>
                              }
                                <br />
                                <br />

                              {this.state.type === 'label' && projectDetails && (projectDetails.task_type === DOCUMENT_ANNOTATION || projectDetails.task_type === POS_TAGGING_GENERIC) &&
                                <div style={{ position: 'relative' }} className="ui well">
                                  { (this.state.addClassificationGroup && (!this.state.fields.classification_name || !this.state.fields.classification_disp_name || !this.state.fields.classification_classes)) &&
                                    <Label as="a" icon size="mini" onClick={() => this.setState({ addClassificationGroup: false })}>
                                      <Icon color="blue" size="small" name="minus circle" /> Hide Classification
                                    </Label>
                                  }

                                  { (this.state.fields.classification_name && this.state.fields.classification_classes && this.state.fields.classification_disp_name && (this.state.fields.classification_name.length > 0 && this.state.fields.classification_disp_name.length > 0 && this.state.fields.classification_classes.length > 0)) &&
                                    <Label attached="top left" as="a" icon size="mini" onClick={() => { this.setState({ addClassificationGroup: false }); this.resetClassification();}}>
                                      <Icon color="blue" size="small" name="minus circle" /> Remove Classification
                                    </Label>
                                  }
                                  <br />
                                  { (!this.state.addClassificationGroup && this.state.fields.classification_name.length === 0) &&
                                    <Label as="a" icon size="mini" onClick={() => this.setState({ addClassificationGroup: true })}>
                                      <Icon color="blue" size="small" name="plus circle" /> Add Classification
                                    </Label>
                                  }
                                  { (this.state.addClassificationGroup || ( this.state.fields.classification_name && this.state.fields.classification_name.length > 0)) &&
                                      <Form compact size="mini">
                                          <h5> Classification Options </h5>
                                          <Form.Input style={inputWidth} onChange={this.handleChange.bind(this, 'classification_name')} id="classification_name" compact label="Name" value={this.state.fields.classification_name} placeholder="Theme" />
                                          <Form.Input style={inputWidth} onChange={this.handleChange.bind(this, 'classification_disp_name')} id="classification_disp_name" compact label="Display Name" value={this.state.fields.classification_disp_name} placeholder="Choose the theme for given aritcle." />
                                          <Form.Input style={inputWidth} onChange={this.handleChange.bind(this, 'classification_classes')} id="classification_classes" compact label="Classes" value={this.state.fields.classification_classes } placeholder="News,Sports,Business" />
                                      </Form>
                                  }
                                </div>
                              }


                                <br />
                                <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                    <p className={styles.error} disabled={!this.state.errors}>
                                      {this.state.errors}
                                    </p>
                              </Form>
                              }
                              {
                                this.state.projectEdited &&
                                <div>
                                  <h2> Project Update successful</h2>
                                    <Button color="teal" onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName)}>
                                      Go Back to Projects
                                    </Button>
                                </div>
                              }
                            </div>
                          }
                          { this.state.type === 'label' && projectDetails && (projectDetails.task_type === TEXT_CLASSIFICATION || projectDetails.task_type === IMAGE_CLASSIFICATION || projectDetails.task_type === VIDEO_CLASSIFICATION) &&
                            <div>
                              <br />
                              {!this.state.projectEdited &&
                              <Form size="small" key="import1" loading={this.state.loading} compact>
                                <Form.Input style={inputWidth} id="projectName" size="small" color="teal" compact onChange={this.handleChange.bind(this, 'projectName')} label="Project Name" control="input" type="text" value={projectName} />
                                <br />
                                <Form.Input style={inputWidth} id="tags" size="small" compact onChange={this.handleChange.bind(this, 'tags')} label="List of classes comma seperated" control="input" type="text" value={tags} />
                                <br />
                                <Form.Input style={inputWidth} size="small" id="instruction" type="textarea" onChange={this.handleChange.bind(this, 'instructions')} label="How to Classify" control="TextArea" value={instructions} />
                                <br />
                                <br />
                                <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                    <p className={styles.error} disabled={!this.state.errors}>
                                      {this.state.errors}
                                    </p>
                              </Form>
                              }
                              {
                                this.state.projectEdited &&
                                <div>
                                  <h2> Project Update successful</h2>
                                    <Button color="teal" onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName )}>
                                      Go Back to Projects
                                    </Button>
                                </div>
                              }
                            </div>
                          }
                          { this.state.type === 'label' && projectDetails && (projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX || projectDetails.task_type === VIDEO_BOUNDING_BOX || projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 || projectDetails.task_type === IMAGE_BOUNDING_BOX) &&
                            <div>
                              <br />
                              {!this.state.projectEdited &&
                              <Form size="small" key="import1" loading={this.state.loading} compact>
                                <Form.Input style={inputWidth} id="projectName" size="small" color="teal" compact onChange={this.handleChange.bind(this, 'projectName')} label="Project Name" control="input" type="text" value={projectName} />
                                <br />
                                { typeof tags === 'string' &&
                                <Form.Input style={inputWidth} id="tags" size="small" compact onChange={this.handleChange.bind(this, 'tags')} label="List of classes comma seperated" control="input" type="text" value={tags} />
                                }
                                <br />
                                <Form.Input style={inputWidth} size="small" id="instruction" type="textarea" onChange={this.handleChange.bind(this, 'instructions')} label="How to Bound" control="TextArea" value={instructions} />
                                <br />
                              {this.state.type === 'label' && projectDetails && (projectDetails.task_type === IMAGE_BOUNDING_BOX) &&
                              <Accordion as="Menu">
                                <Menu.Item>
                                      <Accordion.Title
                                        active={this.state.activeIndex === 0}
                                        content="Advanced Options"
                                        index={0}
                                        onClick={() => { if (this.state.activeIndex === 0) this.setState({activeIndex: 1}); else this.setState({activeIndex: 0});}}
                                      />
                                <Accordion.Content active={this.state.activeIndex === 0} content={imgBoundingOptions} />
                                </Menu.Item>
                              </Accordion>
                              }
                              {this.state.type === 'label' && projectDetails && (projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
                              <Accordion as="Menu">
                                <Menu.Item>
                                      <Accordion.Title
                                        active={this.state.activeIndex === 0}
                                        content="Advanced Options"
                                        index={0}
                                        onClick={() => { if (this.state.activeIndex === 0) this.setState({activeIndex: 1}); else this.setState({activeIndex: 0});}}
                                      />
                                <Accordion.Content active={this.state.activeIndex === 0} content={imgPolyV2Options} />
                                </Menu.Item>
                              </Accordion>
                              }

                                <br />
                                <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                    <p className={styles.error} disabled={!this.state.errors}>
                                      {this.state.errors}
                                    </p>
                              </Form>
                              }
                              {
                                this.state.projectEdited &&
                                <div>
                                  <h2> Project Update successful</h2>
                                    <Button color="teal" onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName)}>
                                      Go Back to Projects
                                    </Button>
                                </div>
                              }
                            </div>
                          }
                          { this.state.type === 'label' && projectDetails && projectDetails.task_type === TEXT_MODERATION &&
                            <div>
                              <br />
                              {!this.state.projectEdited &&
                              <Form size="small" key="import1" loading={this.state.loading} compact>
                                <Form.Input style={inputWidth} id="projectName" size="small" color="teal" compact onChange={this.handleChange.bind(this, 'projectName')} label="Project Name" control="input" type="text" value={projectName} />
                                <br />
                                <Form.Input style={inputWidth} size="small" id="instruction" type="textarea" onChange={this.handleChange.bind(this, 'instructions')} label="How to Moderate" control="TextArea" value={instructions} />
                                <br />
                                <br />
                                <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                    <p className={styles.error} disabled={!this.state.errors}>
                                      {this.state.errors}
                                    </p>
                              </Form>
                              }
                              {
                                this.state.projectEdited &&
                                <div>
                                  <h2> Project Update successful</h2>
                                    <Button color="teal" onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName )}>
                                      Go Back to Projects
                                    </Button>
                                </div>
                              }
                            </div>
                          }
                          { this.state.type === 'label' && projectDetails && projectDetails.task_type === TEXT_SUMMARIZATION &&
                            <div>
                              <br />
                              {!this.state.projectEdited &&
                              <Form size="small" key="import1" loading={this.state.loading} compact>
                                <Form.Input style={inputWidth} id="projectName" size="small" color="teal" compact onChange={this.handleChange.bind(this, 'projectName')} label="Project Name" control="input" type="text" value={projectName} />
                                <br />
                                <Form.Input style={inputWidth} size="small" id="instruction" type="textarea" onChange={this.handleChange.bind(this, 'instructions')} label="How to Summarize" control="TextArea" value={instructions} />
                                <br />
                                <br />
                                <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                    <p className={styles.error} disabled={!this.state.errors}>
                                      {this.state.errors}
                                    </p>
                              </Form>
                              }
                              {
                                this.state.projectEdited &&
                                <div>
                                  <h2> Project Update successful</h2>
                                    <Button color="teal" onClick={ () => this.props.pushState('/projects/' + this.props.params.orgName )}>
                                      Go Back to Projects
                                    </Button>
                                </div>
                              }
                            </div>
                          }
                          {this.state.type === 'file' && !this.state.uploadType && !this.state.fileUploaded && projectDetails &&
                          <div>
                            <h2> Select Upload Type </h2>
                              <Segment basic>
                                <Card.Group>
                                  <Card fluid onClick={() => {this.setState({ uploadType: 'Raw'});}} centered raised style={{ cursor: 'pointer'}} color="yellow" header="Upload Raw Data"
                                  description={[
                                    ''].join('')}/>
                                  <Card fluid onClick={() => {this.setState({ uploadType: 'Pre-Annotated'});}} centered raised style={{ cursor: 'pointer'}} color="orange" header="Upload Pre-Annotated Data"
                                  description={[
                                    'If you have some data which is already pre-annotated and',
                                    ' want to go through annotations and correct them.'].join('')}/>
                                </Card.Group>
                              </Segment>
                          </div>
                          }

{ !this.state.fileUploaded && this.state.type === 'file' && this.state.uploadType === 'Pre-Annotated' && projectDetails &&
                              <div>
                                <h3>Select file with Pre-Annotated data</h3>
                                  <br />
                                { (projectDetails.task_type === POS_TAGGING || projectDetails.task_type === POS_TAGGING_GENERIC ||
                                  projectDetails.task_type === DOCUMENT_ANNOTATION) &&
                                  <div>
                                <p>
                                Please upload a text file with each line in file having input sentence in following json format.
                                Format is similar to the annotated and downloaded json file from dataturks.
                                 Max size 10MB
                                </p>
                                <pre>
                                  <code>
                                    {JSON.stringify(posSample)}
                                  </code>
                                </pre>
                                  <p>
                                    <b>Content</b> contains input text, <b>annotation</b> has the labeled content, <b>extras</b> is for some extra columns that you want to show with each row.
                                  </p>
                                </div>
                                }
                                { (projectDetails.task_type === TEXT_SUMMARIZATION || projectDetails.task_type === TEXT_MODERATION) &&
                                <p>
                                Please upload a text file with each line in file having input sentence in following tab seperated format.
                                 Max size 10MB
                                <pre>
                                  Text Line       Result Text     Extra KeyValue Pair1(optional)    Extra KeyValue Pair1(optional)

                                  <br />
                                  <br />
                                  <br />
                                  <br />

                                  AFP - India's Tata Iron and Steel Company Ltd.      Tata Iron and Steel Company.    id=1  content=games

                                  <br />

                                  British Foreign Minister  UK Foreign Minister id=2  content=UK  site=34

                                  <br />

                                  Japan carmaker Toyota   Japanese carmaker Toyota    id=100
                                </pre>
                                  </p>
                                }
                                { projectDetails.task_type === TEXT_CLASSIFICATION &&
                                  <Form>
                                    <Form.Field>
                                      Selected value: <b>{this.state.value}</b>
                                    </Form.Field>
                                    <Form.Field>
                                        <Checkbox
                                          radio
                                          label="TSV"
                                          name="checkboxRadioGroup"
                                          value="tsv"
                                          checked={this.state.selectedFormat === 'tsv'}
                                          onChange={this.advancedOptionChange.bind(this, 'selectedFormat')}
                                        />
                                      </Form.Field>
                                      <Form.Field>
                                        <Checkbox
                                          radio
                                          label="JSON"
                                          name="checkboxRadioGroup"
                                          value="json"
                                          checked={this.state.selectedFormat === 'json'}
                                          onChange={this.advancedOptionChange.bind(this, 'selectedFormat')}
                                        />
                                      </Form.Field>
                                  </Form>
                                }
                                { projectDetails.task_type === TEXT_CLASSIFICATION && this.state.selectedFormat === 'json' &&
                                <p>
                                Please upload a text file with each line in file having input sentence in json format.
                                This is same as download format from dataturks
                                 Max size 10MB
                                <pre>
                                    {textClassificationJsonSample}
                                </pre>

                                </p>
                                }
                                { projectDetails.task_type === TEXT_CLASSIFICATION && this.state.selectedFormat === 'tsv' &&
                                <p>
                                Please upload a text file with each line in file having input sentence in following tab seperated format.
                                 Max size 10MB
                                <pre>
                                    Text Line            Comma Separated Labels      Extra KeyValue Pair1(optional)    Extra KeyValue Pair1(optional)
                                  <br />
                                  <br />
                                  <br />

                                  <br />

                                    AFP - India's Tata Iron and Steel Company Ltd.  Class1, Class2  id=1  content=games
                                  <br />

                                      British Foreign Minister  Class4,Class5 id=2  content=UK  site=34
                                  <br />

                                      Japan carmaker Toyota   Class1    id=100
                                </pre>

                                </p>
                                }
                                { projectDetails.task_type === IMAGE_CLASSIFICATION &&
                                <p>
                                Please upload a text file with each line in file having input sentence in following tab seperated format.
                                 Max size 10MB
                                <pre>
                                  Image_URL          Comma Separated Labels      Extra KeyValue Pair1(optional)    Extra KeyValue Pair1(optional)

                                  <br />
                                  <br />
                                  <br />

                                  <br />

                                      http://amazonaws.com/grande.jpg Class1, Class2, Class3  id=1  context=image1

                                  <br />

                                      http://amazonaws.com/Carraway.jpg Class1  id=2  context=image2     site=34
                                  <br />

                                      http://.amazonaws.com/slices.jpg  Class1, Class2  id=32
                                </pre>

                                </p>
                                }
                                { projectDetails.task_type === VIDEO_CLASSIFICATION &&
                                <p>
                                Please upload a text file with each line in file having input sentence in following tab seperated format.
                                 Max size 10MB
                                <pre>
                                  Video_URL          Comma Separated Labels      Extra KeyValue Pair1(optional)    Extra KeyValue Pair1(optional)

                                  <br />
                                  <br />
                                  <br />

                                  <br />

                                      http://amazonaws.com/grande.mp4 Class1, Class2, Class3  id=1  context=image1

                                  <br />

                                      http://amazonaws.com/Carraway.mp4 Class1  id=2  context=image2     site=34
                                  <br />

                                      http://.amazonaws.com/slices.mp4  Class1, Class2  id=32
                                </pre>

                                </p>
                                }
                                { (projectDetails.task_type === IMAGE_BOUNDING_BOX) &&
                                  <div>
                                <p>
                                Please upload a text file with each line in file having input sentence in following json format.
                                Format is similar to the annotated and downloaded json file from dataturks.
                                 Max size 10MB
                                </p>
                                <pre>
                                  <code>
                                    {JSON.stringify(imageBoundingSample)}
                                  </code>
                                </pre>
                                  <p>
                                    <b>Content</b> contains input image URL, <b>annotation</b> has the left-top and right-bottom co-ordinates, <b>extras</b> is for some extra columns that you want to show with each row.
                                  </p>
                                </div>
                                }
                                { (projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX || projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
                                  <div>
                                <p>
                                Please upload a text file with each line in file having input sentence in following json format.
                                Format is similar to the annotated and downloaded json file from dataturks.
                                 Max size 10MB
                                </p>
                                <pre>
                                  <code>
                                    {JSON.stringify(imagePolyBoundingSample)}
                                  </code>
                                </pre>
                                  <p>
                                    <b>Content</b> contains image url, <b>annotation</b> has the co-ordinate of polygon [first and last value of array is of same co-ordinate], <b>extras</b> is for some extra columns that you want to show with each row.
                                  </p>
                                </div>
                                }
                                { (projectDetails.task_type === VIDEO_BOUNDING_BOX) &&
                                  <div>
                                <p>
                                Please upload a text file with each line in file having input sentence in following json format.
                                Format is similar to the annotated and downloaded json file from dataturks.
                                 Max size 10MB
                                </p>
                                <pre>
                                  <code>
                                    {JSON.stringify(imagePolyBoundingSample)}
                                  </code>
                                </pre>
                                  <p>
                                    <b>Content</b> contains video url, <b>annotation</b> has the co-ordinate of polygon [first and last value of array is of same co-ordinate], <b>extras</b> is for some extra columns that you want to show with each row.
                                  </p>
                                </div>
                                }
                                <div className="col-md-5" />
                                  <div className="col-md-3 text-center">
                                  <form encType="multipart/form-data" action="" key="importFile" className="text-center">
                                      <input className="h4 text-primary" disabled={this.state.loading} type="file" name="fileName" onChange={this.handleUploadFile}>
                                      </input>
                                      { this.state.file && this.state.file.size > 10000000 && <p style={{ color: 'red', fontWeight: 'bold' }}> File size is big: {bytes(this.state.file.size)} </p>}
                                      {this.state.file && this.state.file.size < 10000000 && <p> File Size: {bytes(this.state.file.size)} </p>}
                                   </form>
                                  </div>
                                  <div className="col-md-3" />
                                  <br />

                                  <div style={{ height: '50px'}}/>
                                      <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit.bind(this, 'PRE_TAGGED_JSON')}>Submit</Button>
                                      <br />
                                  {this.state.fileUploadProgress > 0 && <Progress percent={Math.floor(this.state.fileUploadProgress)} progress autoSuccess /> }
                                    <p className={styles.error} disabled={!this.state.errors}>
                                      {this.state.errors}
                                    </p>
                                    </div>
                              }

                            { !this.state.fileUploaded && this.state.type === 'file' && this.state.uploadType === 'Raw' && projectDetails &&
                              <div>
                                <h3>Select file with data</h3>
                                  <br />
                                { (projectDetails.task_type === POS_TAGGING) &&
                                          <p>Please upload a text/doc/pdf file. </p>
                                }
                                { (projectDetails.task_type === POS_TAGGING_GENERIC) &&
                                  <div>
                                    <p>Upload a Text/CSV file where each line has one data-item to be tagged.</p>
                                    <Accordion as={Form.Field} panels={advPanels} style={{ fontSize: 'xx-small' }} />
                                  </div>
                                }
                                { projectDetails.task_type === TEXT_SUMMARIZATION &&
                                    <p>Please upload a text file with each line in file having sentence to be summarized.<br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the text documents to be summarized. Max file size is 100 MB for free plans</p>
                                }
                                { projectDetails.task_type === TEXT_MODERATION &&
                                    <p>Please upload a text file with each line in file having sentence to be moderated.<br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the text documents to be moderated. Max file size is 100 MB for free plans</p>
                                }
                                { projectDetails.task_type === TEXT_CLASSIFICATION &&
                                    <p>Please upload a text file with each line in file having sentence to be classified.<br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the text documents to be classified. Max file size is 100 MB for free plans</p>
                                }
                                {
                                  projectDetails.task_type === DOCUMENT_ANNOTATION &&
                                  <div>
                                    <p>Please upload a valid text/doc/pdf file.<br />
                                                   <strong> OR </strong> <br />
                                        A zip file of all the text/pdf/doc documents. Max file size is 100 MB for free plans</p>
                                        <Accordion as={Form.Field} panels={advPanels} style={{ fontSize: 'xx-small' }} />
                                  </div>
                                }
                                { projectDetails.task_type === IMAGE_CLASSIFICATION &&
                                <p>Upload a text file containing URLs of images. <br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the images. Max file size is 100 MB for free plans</p>
                                }
                                { projectDetails.task_type === VIDEO_CLASSIFICATION &&
                                <p>Upload a text file containing URLs of videos.</p>
                                }
                                { ( projectDetails.task_type === IMAGE_BOUNDING_BOX || projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX || projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
                                <p>Upload a text file containing URLs of images. <br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the images. Max file size is 100 MB for free plans</p>
                                }
                                { (projectDetails.task_type === VIDEO_BOUNDING_BOX) &&
                                <p>Upload a text file containing URLs of videos.</p>
                                }
                                <div className="col-md-5" />
                                  <div className="col-md-3 text-center">
                                  <form encType="multipart/form-data" action="" key="importFile" className="text-center">
                                      <input className="h4 text-primary" disabled={this.state.loading} type="file" name="fileName" onChange={this.handleUploadFile}>
                                      </input>
                                      { this.state.file && this.state.file.size > 10000000 && <p style={{ color: 'red', fontWeight: 'bold' }}> File size is big: {bytes(this.state.file.size)} </p>}
                                      {this.state.file && this.state.file.size < 10000000 && <p> File Size: {bytes(this.state.file.size)} </p>}
                                   </form>
                                  </div>
                                  <div className="col-md-3" />
                                  <br />

                                  <div style={{ height: '50px'}}/>
                                      <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                      <br />
                                  {this.state.fileUploadProgress > 0 && <Progress percent={Math.floor(this.state.fileUploadProgress)} progress autoSuccess /> }
                                    <p className={styles.error} disabled={!this.state.errors}>
                                      {this.state.errors}
                                    </p>
                                    </div>
                              }
                      </div>
                  }
      </div>

    );
  }
}
