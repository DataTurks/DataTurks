import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
import { uploadDataForm, updateFileUploadStats, selectProject, updateHomeData, getUserHomeData } from 'redux/modules/dataturks';
import { uploadFileDT, getUidToken, getHomeData, logEvent } from '../../helpers/dthelper';
import { push } from 'react-router-redux';
import { posSample, imageBoundingSample, imagePolyBoundingSample, textClassificationJsonSample } from '../../helpers/Utils';
import { VIDEO_CLASSIFICATION, VIDEO_BOUNDING_BOX, IMAGE_CLASSIFICATION, DOCUMENT_ANNOTATION, TEXT_SUMMARIZATION, IMAGE_POLYGON_BOUNDING_BOX, IMAGE_POLYGON_BOUNDING_BOX_V2, POS_TAGGING, POS_TAGGING_GENERIC, TEXT_CLASSIFICATION, TEXT_MODERATION, IMAGE_BOUNDING_BOX } from '../../helpers/Utils';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
import { Checkbox, Button, Label, Icon, Form, Divider, Card, Statistic, Input, Segment, Progress, Accordion, Menu } from 'semantic-ui-react';
const bytes = require('bytes');

@connect(
  state => ({user: state.auth.user,
    orgName: state.dataturksReducer.orgName,
    currentProject: state.dataturksReducer.currentProject,
    projectDetails: state.dataturksReducer.projectDetails,
    projectCreateError: state.dataturksReducer.projectCreateError,
     projectCreated: state.dataturksReducer.projectCreated }),
  dispatch => bindActionCreators({ uploadDataForm, updateFileUploadStats, getUserHomeData, selectProject, pushState: push, updateHomeData }, dispatch))
export default class TaggerImport extends Component {
  static propTypes = {
    user: PropTypes.object,
    uploadDataForm: PropTypes.func,
    currentProject: PropTypes.string,
    projectCreated: PropTypes.bool,
    updateFileUploadStats: PropTypes.func,
    pushState: PropTypes.func,
    selectProject: PropTypes.func,
    updateHomeData: PropTypes.func,
    location: PropTypes.object,
    query: PropTypes.object,
    projectDetails: PropTypes.object,
    orgName: PropTypes.string,
    projectCreateError: PropTypes.string,
    getUserHomeData: PropTypes.func
  }

  constructor(props) {
    super(props);
    console.log('import props are ', props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fileUploaded = this.fileUploaded.bind(this);
    this.handleUploadFile = this.handleUploadFile.bind(this);
    this.startTagging = this.startTagging.bind(this);
    this.projectDetailsFetched = this.projectDetailsFetched.bind(this);
    this.fileUploadProgressCallback = this.fileUploadProgressCallback.bind(this);
    let defaultShape = 'polygon';
    if (this.props.location.query && this.props.location.query.shape) {
      defaultShape = this.props.location.query.shape;
    }
    let fields = {};
    fields.classification_name = '';
    fields.classification_disp_name = '';
    fields.classification_classes = '';
    let addClassificationGroup = false;
    if (props.projectDetails) {
      fields.project_name = 'Copy of ' + props.projectDetails.name;
      const taskRules = JSON.parse(props.projectDetails.taskRules);
      console.log('taskRules', taskRules);
      if (typeof taskRules.tags === 'string') {
        fields.tags = taskRules.tags;
      } else {
        let tags = [];
        fields.tagObject = taskRules.tags;
        for (let index = 0; index < taskRules.tags.length; index ++) {
          tags.push(taskRules.tags[index].label);
        }
        fields.tags = tags.join(",");
      }
      fields.instructions = taskRules.instructions;
      if (taskRules.classification && taskRules.classification.length > 0) {
        fields.classification_disp_name = taskRules.classification[0].displayName;
        fields.classification_name = taskRules.classification[0].name;
        fields.classification_classes = taskRules.classification[0].classes.join(",");
        addClassificationGroup = true;
      }
    }
    this.state = {
      fields,
      errors: {},
      loading: false,
      error: false,
      addClassificationGroup,
      fileUploaded: false,
      autoClose: true,
      defaultShape,
      notes: false,
      hideLabels: false,
      projectCreationComplete: false,
      fileUploadProgress: 0
    }
  }

  componentDidMount() {
    const editor = document.getElementById('instruction');
    editor.setAttribute('data-gramm', 'false');
  }


  componentWillReceiveProps(nextProps) {
    console.log('nextProps are ', nextProps, this.props);
    if (!this.props.projectCreated && nextProps.projectCreated && nextProps.currentProject) {
      console.log('project created, upload file');
      // uploadFileDT(this.state.file, nextProps.currentProject, this.fileUploaded);
      this.props.getUserHomeData(getUidToken());
      this.setState({ loading: false, errors: {} });
    } else if (!this.props.projectCreateError && nextProps.projectCreateError) {
      this.setState({ errors: { submit: nextProps.projectCreateError}, loading: false, error: true});
    } else {
      this.setState({ loading: false, error: true});
    }
  }

  getTagsInput() {
    let tagObject = this.state.fields.tagObject;
    let renderArrs = [];
    for (let index = 0; index < tagObject.length; index ++) {
      let tag = tagObject[index];
      renderArrs.push(
        <div>
          <Form.Input style={{ width: '50%' }} onChange={this.handleTagChange.bind(this, index, 'name')} id={index} compact label="Name" value={tag.label} placeholder="Label Name" />
          <Form.Input style={{ width: '50%' }} onChange={this.handleTagChange.bind(this, index, 'imageUrl')} id={index} compact label="Thumbnail Image URL" value={tag.imageUrl} placeholder="http://s3/image_name.jpg" />
          <br />
        </div>
      )
    }
    return (<div style={{ backgroundColor: 'aliceBlue', width: '50%', justifyContent: 'center', alignItems: 'center', display: 'flex', textAlign: 'center' }}>{renderArrs}</div>);
  }

  resetClassification() {
    let fields = this.state.fields;
    fields.classification_name = '';
    fields.classification_disp_name = '';
    fields.classification_classes = '';
    this.setState({ fields });
  }

  handleTagChange(index, event) {
    console.log('handleTagChange ', index, event);
  }

  startTagging() {
    this.props.selectProject(this.props.currentProject);
    this.props.pushState('/projects/' + this.props.orgName + '/' + this.state.fields.project_name + '/space');
  }


  projectDetailsFetched( error, response ) {
    console.log('home details fetched ', error, response);
    if (!error) {
      this.props.updateHomeData(response.body.userDetails, response.body.projects, response.body.planName, response.body.labelsAllowed, response.body.labelsDone, response.body.subscriptionExpiryTimestamp, response.body.hasSubscriptionExpired);
    }
  }

  loadHomeData() {
    getHomeData(this.projectDetailsFetched);
  }

  fileUploaded(error, response) {
    console.log(' file was uploaded ', error, response);
    if (response.statusCode && response.statusCode === 200) {
      logEvent('buttons', 'file upload sucessful');
      console.log(' file upload successful ', response.body);
      this.setState({ loading: false, fileUploaded: true, fileUploadStats: response.body, projectCreationComplete: true });
      this.props.updateFileUploadStats(response.body);
    } else {
      const errors = this.state.errors;
      logEvent('buttons', 'file upload failed');
      errors.submit = response.body ? response.body.message : response.statusText;
      this.setState({ loading: false, fileUploaded: false, errors});
    }
  }

  fileUploadProgressCallback(event) {
    console.log('file upload progress', event.percent);
    this.setState({ fileUploadProgress: event.percent });
  }

  handleSubmit = (response) => {
    if (this.props.currentProject && this.props.projectCreated) {
      console.log('project already created, upload file');
      logEvent('buttons', 'file uploading');
      if (this.state.uploadType === 'Pre-Annotated') {
        if (this.props.location.query.type === TEXT_SUMMARIZATION || this.props.location.query.type === TEXT_MODERATION || this.props.location.query.type === VIDEO_CLASSIFICATION
          || this.props.location.query.type === IMAGE_CLASSIFICATION) {
          uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback, 'PRE_TAGGED_TSV');
        }  else if (this.props.location.query.type === TEXT_CLASSIFICATION) {
          let format = 'PRE_TAGGED_TSV';
          if (this.state.selectedFormat && this.state.selectedFormat === 'json') {
            format = 'PRE_TAGGED_JSON';
          }
          uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback, format);
        } else {
          uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback, 'PRE_TAGGED_JSON');
        }
      } else {
        if (this.props.location.query.type === DOCUMENT_ANNOTATION || this.props.location.query.type === POS_TAGGING_GENERIC) {
          if (this.state.isURLs) {
            uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback, 'URL_FILE');
          } else {
            uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback);
          }
        } else {
          uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback);
        }
      }
      // uploadFileDT(this.state.file, this.props.currentProject, this.fileUploaded, this.fileUploadProgressCallback);
      this.setState({ loading: true });
    } else {
      logEvent('buttons', 'project created');
      const rules = { tags: this.state.fields.tags, instructions: this.state.fields.instructions };
      if (this.props.location.query.type === DOCUMENT_ANNOTATION ||
        this.props.location.query.type === POS_TAGGING_GENERIC || this.props.location.query.type === IMAGE_BOUNDING_BOX) {
        rules.autoClose = this.state.autoClose;
      }
      if (this.props.location.query.type === IMAGE_BOUNDING_BOX) {
        rules.hideLabels = this.state.hideLabels;
        rules.notes = this.state.notes;
      }
      if (this.props.location.query.type === IMAGE_POLYGON_BOUNDING_BOX_V2) {
        rules.defaultShape = this.state.defaultShape;
      }
      if (this.state.fields && this.state.fields.classification_name && this.state.fields.classification_disp_name && this.state.fields.classification_classes && this.state.fields.classification_name.length > 0 && this.state.fields.classification_classes.length > 0) {
        rules.classification = [{ name: this.state.fields.classification_name, displayName: this.state.fields.classification_disp_name, classes: this.state.fields.classification_classes.split(',') }];
      }
      console.log('response', response, this.state.fields, JSON.stringify(rules));
      this.props.uploadDataForm({name: this.state.fields.project_name, taskType: this.props.location.query.type, rules: JSON.stringify(rules) }, getUidToken());
      this.setState({ loading: true });
    }
  }

  handleChange(field, element) {
    console.log(' handle change ', field, element, element.target.files);
    const fields = this.state.fields;
    fields[field] = element.target.value;
    const errs = this.state.errors;
    errs[field] = false;
    this.setState({fields, errors: errs});
  }

  handleUploadFile(event) {
    console.log('handle upload file', event.target.files[0]);
    // const fields = this.state.fields;
    // fields.file = event.target.files[0];
    const file = event.target.files[0];
    // if (file.type === 'text/plain' || file.type === 'application/zip') {
    this.setState({ file });
  }

  advancedOptionChange = (e1, e2, e3) => {
    console.log('advancedOptionChange', e1, e2, e3);
    if (e1 === 'autoClose') {
      this.setState({ autoClose: e3.checked });
    } else if (e1 === 'hideLabels') {
      this.setState({ hideLabels: e3.checked });
    } else if (e1 === 'notes') {
      this.setState({ notes: e3.checked });
    } else if (e1 === 'defaultShape') {
      if (e3.checked) {
        this.setState({ defaultShape: e3.value});
      }
    } else if (e1 === 'selectedFormat') {
      if (e3.checked) {
        this.setState({ selectedFormat: e3.value });
      }
    } else if (e1 === 'isURLs') {
      this.setState({ isURLs: e3.checked });
    } else if (e1 === 'advancedTags') {
      this.setState({ advancedTags: e3.checked });
    }
  }

  render() {
    console.log('TaggerImport props are ', this.props, this.state, Object.keys(this.state.fields).length);
    const type = this.props.location.query.type;
    let submitDisabled = true;
    if ((type === POS_TAGGING || type === POS_TAGGING_GENERIC || type === TEXT_CLASSIFICATION || type === DOCUMENT_ANNOTATION || type === IMAGE_CLASSIFICATION || type === IMAGE_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX || type === VIDEO_CLASSIFICATION || type === VIDEO_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
    ((Object.keys(this.state.fields).length === 6 || (this.state.file)) && !this.state.loading)) {
      submitDisabled = false;
    } else if ((type === TEXT_SUMMARIZATION || type === TEXT_MODERATION) && ((Object.keys(this.state.fields).length === 5 || (this.state.file)) && !this.state.loading)) {
      submitDisabled = false;
    }
    if (!submitDisabled && (this.state.fields.project_name && this.state.fields.project_name.length === 0)) {
      submitDisabled = true;
    } else if (!submitDisabled && Object.keys(this.state.fields).length === 6 && this.state.fields.tags.length === 0) {
      submitDisabled = true;
    }
    let ignoreClass = 'hidden';
    if (this.state.projectCreationComplete && this.state.fileUploadStats.numHitsIgnored > 0) {
      ignoreClass = '';
    }
    if ((this.state.fields.classification_name.length > 0 && (this.state.fields.classification_classes.length === 0 || this.state.fields.classification_disp_name.length === 0)) ||
         ((this.state.fields.classification_name.length === 0 || this.state.fields.classification_disp_name.length === 0) && this.state.fields.classification_classes.length > 0) ||
         ((this.state.fields.classification_name.length === 0 || this.state.fields.classification_classes.length === 0) && this.state.fields.classification_disp_name.length > 0)) {
      submitDisabled = true;
    }
    const styles = require('./TaggerImport.scss');
    const inputWidth = { width: '50%'};
    let placeholder = 'Tagging guidelines for your team. Ex: Mark all place names as City';
    if (type === TEXT_CLASSIFICATION || type === IMAGE_CLASSIFICATION || type === VIDEO_CLASSIFICATION) {
      placeholder = 'Classification guidelines for your team. Ex: Mark all 1 star review as negative';
    } else if (type === IMAGE_BOUNDING_BOX || type === VIDEO_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX_V2) {
      placeholder = 'Bounding guidelines for your team. Ex: Create rectangles around cars';
    } else if (type === DOCUMENT_ANNOTATION) {
      placeholder = 'Document annotation guidelines for your team. e.g Mark javascript as super-human skill ';
    }
    let namePlaceHolder = "Dataset name";
    let tagPlaceHolder = "List of Classes comma seperated : Car, Cat, Tree";
    switch (type) {
      case POS_TAGGING:
      case POS_TAGGING_GENERIC:
        namePlaceHolder = 'Resume Skill Identification Dataset';
        break;
      case IMAGE_CLASSIFICATION:
        namePlaceHolder = 'Cat Dog Image Classification Dataset';
        break;
      case VIDEO_CLASSIFICATION:
        namePlaceHolder = 'Cat Dog Video Classification Dataset';
        break;
      case IMAGE_POLYGON_BOUNDING_BOX:
      case VIDEO_BOUNDING_BOX:
      case IMAGE_POLYGON_BOUNDING_BOX_V2:
      case IMAGE_BOUNDING_BOX:
        namePlaceHolder = 'Car/Cat Bounding Box Dataset';
        break;
      case TEXT_CLASSIFICATION:
        namePlaceHolder = 'Emotion Detection Dataset using tweets';
        break;
      case TEXT_MODERATION:
        namePlaceHolder = 'Violent Content Moderation Dataset';
        break;
      case TEXT_SUMMARIZATION:
        namePlaceHolder = 'Resume Summarization Dataset';
        break;
    }
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
      </div>
    );
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
    const advTagsPanels = [
      {
        key: 'details',
        title: 'Advanced',
        content: {
          as: Form.Checkbox,
          onClick: this.advancedOptionChange.bind(this, 'advancedTags'),
          value: this.state.advancedTags,
          label: 'Advanced Options',
        },
      },
    ]
    const imgBoundingOptions = (
      <div>
      <Form.Checkbox label="Show Notes" name="notes" checked={this.state.notes} value="Show Notes" onChange={this.advancedOptionChange.bind(this, 'notes')} />
      <Form.Checkbox label="Single Label per Entity" name="autoClose" checked={this.state.autoClose} value="Single Label" onChange={this.advancedOptionChange.bind(this, 'autoClose')} />
      <Form.Checkbox label="Hide Annotation After Labeling" name="hideLabels" checked={this.state.hideLabels} value="Single Label" onChange={this.advancedOptionChange.bind(this, 'hideLabels')} />
      </div>
    );
    return (
      <div className={styles.loginPage + ' container text-center'} style={{ marginTop: '20px' }}>
          <Helmet title="Create Dataset" />
                      {
                          <div>
                            { this.state.projectCreationComplete &&
                                <div>
                                  <h2> Project creation successful</h2>
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
                                    <Button color="blue" onClick={this.startTagging}>
                                      { (type === POS_TAGGING || type === DOCUMENT_ANNOTATION || type === POS_TAGGING_GENERIC) &&
                                        'Start Tagging'
                                      }
                                      {
                                        type === TEXT_SUMMARIZATION &&
                                        'Summarize Text'
                                      }
                                      {
                                        type === TEXT_MODERATION &&
                                        'Moderate Text'
                                      }
                                      {
                                        type === TEXT_CLASSIFICATION &&
                                        'Classify Text'
                                      }
                                      {
                                        type === IMAGE_CLASSIFICATION &&
                                        'Classify Image'
                                      }
                                      {
                                        type === VIDEO_CLASSIFICATION &&
                                        'Classify Videos'
                                      }
                                      {
                                        type === VIDEO_BOUNDING_BOX &&
                                        'Bound Videos'
                                      }
                                      {
                                        ( type === IMAGE_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
                                        'Bound Images'
                                      }
                                    </Button>

                                </div>

                            }

                            {
                                !this.state.projectCreationComplete && !this.props.projectCreated &&
                            <div>
                                  <h1>Create Dataset</h1>
                              <br />
                              <br />

                              <Form size="small" key="import1" loading={this.state.loading} compact>
                                    <Form.Input style={inputWidth} id="project_name" size="small" color="teal" compact onChange={this.handleChange.bind(this, 'project_name')} label="Dataset Name" control="input" type="text" value={this.state.fields.project_name} placeholder={namePlaceHolder} />
                                <br />

                                    { (type === IMAGE_CLASSIFICATION || type === VIDEO_CLASSIFICATION || type === POS_TAGGING || type === DOCUMENT_ANNOTATION || type === POS_TAGGING_GENERIC ||  type === TEXT_CLASSIFICATION || type === IMAGE_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX_V2 || type === VIDEO_BOUNDING_BOX) &&
                                      <div>
                                        { !this.state.advancedTags &&
                                          <div>
                                            <Form.Input style={inputWidth} id="tags" size="small" compact onChange={this.handleChange.bind(this, 'tags')} label="List of Entities/Categories" control="input" type="text" value={this.state.fields.tags} placeholder={tagPlaceHolder} />
                                            {/* <Accordion as={Form.Field} panels={advTagsPanels} style={{ fontSize: 'xx-small' }} /> */}
                                          </div>
                                        }
                                        {
                                          this.state.advancedTags &&
                                          <div>
                                            <Accordion as={Form.Field} panels={advTagsPanels} style={{ fontSize: 'xx-small' }} />
                                            {this.getTagsInput()}
                                          </div>
                                        }
                                      </div>
                                    }
                                <br />
                                    <Form.Input style={inputWidth} size="small" id="instruction" type="textarea" onChange={this.handleChange.bind(this, 'instructions')} value={this.state.fields.instructions} label="Tagging Instruction" control="TextArea" placeholder={placeholder} />
                                <br />

                                    { (type === IMAGE_BOUNDING_BOX) &&
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

                                  { (type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
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

                                { (type === POS_TAGGING_GENERIC || type === DOCUMENT_ANNOTATION) &&
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

                                  { (type === POS_TAGGING_GENERIC || type === DOCUMENT_ANNOTATION ) &&
                                <div style={{ position: 'relative', marginLeft: '25%', marginRight: '25%' }} className="ui well">
                                  { (this.state.addClassificationGroup && (this.state.fields.classification_name.length === 0 && this.state.fields.classification_classes.length === 0)) &&
                                    <Label as="a" icon size="mini" onClick={() => this.setState({ addClassificationGroup: false })}>
                                      <Icon color="blue" size="small" name="minus circle" /> Hide Classification
                                    </Label>
                                  }

                                  { ((this.state.fields.classification_name.length > 0 && this.state.fields.classification_classes.length > 0)) &&
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
                                          <Form.Input style={inputWidth} onChange={this.handleChange.bind(this, 'classification_disp_name')} id="classification_disp_name" compact label="Display Name" value={this.state.fields.classification_disp_name} placeholder="Select the article theme." />
                                          <Form.Input style={inputWidth} onChange={this.handleChange.bind(this, 'classification_classes')} id="classification_classes" compact label="Classes" value={this.state.fields.classification_classes } placeholder="News,Sports,Business" />
                                      </Form>
                                  }
                            </div>
                          }

                                <br />
                                <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                    <p className={styles.error} disabled={!this.state.errors.submit}>
                                      {this.state.errors.submit}
                                    </p>
                                <Divider hidden />
                              </Form>
                            </div>
                          }

                          { this.props.projectCreated && !this.state.uploadType && !this.state.projectCreationComplete &&
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
{ !this.state.projectCreationComplete && this.props.projectCreated && this.state.uploadType === 'Pre-Annotated' &&
                            <Segment basic vertical loading={this.state.loading}>

                              <div>
                                <h3>Select file with Pre-Annotated data</h3>
                                  <br />
                                  <Button onClick={() => {this.setState({ uploadType: undefined});}}>Change Import Type</Button>
                                  <br />
                                { (type === POS_TAGGING || type === POS_TAGGING_GENERIC ||
                                  type === DOCUMENT_ANNOTATION) &&
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
                                </div>
                              </Segment>
                              }
{ !this.state.projectCreationComplete && this.props.projectCreated && this.state.uploadType === 'Pre-Annotated' &&
                            <Segment basic vertical loading={this.state.loading}>

                              <div>
                                { (type === IMAGE_BOUNDING_BOX) &&
                                  <div>
                                <h3>Select file with Pre-Annotated data</h3>
                                  <br />
                                  <Button className="text-left" onClick={() => {this.setState({ uploadType: undefined});}}>Change Import Type</Button>
                                  <br />
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
                                        <b>Content</b> contains image URL, <b>annotation</b> has the labeled content [top-left and right-bottom co-ordinate], <b>extras</b> is for some extra columns that you want to show with each row.
                                      </p>
                                </div>
                                }
                                {
                                 type === IMAGE_POLYGON_BOUNDING_BOX &&
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
                                        <b>Content</b> contains image URL, <b>annotation</b> has the co-ordinate of polygon [first and last value of array is of same co-ordinate], <b>extras</b> is for some extra columns that you want to show with each row.
                                      </p>
                                </div>
                                }
                                {
                                 type === IMAGE_POLYGON_BOUNDING_BOX_V2 &&
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
                                        <b>Content</b> contains image URL, <b>annotation</b> has the co-ordinate of polygon [first and last value of array is of same co-ordinate], <b>extras</b> is for some extra columns that you want to show with each row.
                                      </p>
                                </div>
                                }
                                {
                                 type === VIDEO_BOUNDING_BOX &&
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
                                        <b>Content</b> contains video URL, <b>annotation</b> has the co-ordinate of polygon [first and last value of array is of same co-ordinate], <b>extras</b> is for some extra columns that you want to show with each row.
                                      </p>
                                </div>
                                }
                                {
                                 (type === TEXT_SUMMARIZATION || type === TEXT_MODERATION) &&
                                 <div>
                                    <p>
                                    Please upload a text file with each line in file having input sentence in following tab seperated format.
                                     Max size 10MB
                                <pre>
                                  Text Line           Result Text     Extra KeyValue Pair1(optional)    Extra KeyValue Pair1(optional)


                                  AFP - India's Tata Iron and Steel Company Ltd.      Tata Iron and Steel Company.    id=1  content=games

                                  British Foreign Minister       UK Foreign Minister id=2  content=UK  site=34

                                  Japan carmaker Toyota        Japanese carmaker Toyota    id=100
                                </pre>
                                    <b>Content</b> contains input text, <b>annotation</b> has the labeled content, <b>extras</b> is for some extra columns that you want to show with each row.
                                      </p>
                                </div>
                              }
                              { type === TEXT_CLASSIFICATION &&
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
                              { type === TEXT_CLASSIFICATION && this.state.selectedFormat === 'json' &&
                              <p>
                              Please upload a text file with each line in file having input sentence in json format.
                              This is same as download format from dataturks
                               Max size 10MB
                              <pre>
                                  {textClassificationJsonSample}
                              </pre>

                              </p>
                              }
                              { type === TEXT_CLASSIFICATION && this.state.selectedFormat === 'tsv' &&
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
                                { type === IMAGE_CLASSIFICATION &&
                                <p>
                                Please upload a text file with each line in file having input sentence in following tab seperated format.
                                 Max size 10MB
                                <pre>
                                  Image_URL                    Comma Separated Labels      Extra KeyValue Pair1(optional)    Extra KeyValue Pair1(optional)

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
                                { type === VIDEO_CLASSIFICATION &&
                                <p>
                                Please upload a text file with each line in file having input sentence in following tab seperated format.
                                 Max size 10MB
                                <pre>
                                  Video_URL                    Comma Separated Labels      Extra KeyValue Pair1(optional)    Extra KeyValue Pair1(optional)

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
                              {
                                 type === TEXT_SUMMARIZATION &&
                                 <div>
                                    <p>
                                    Please upload a text file with each line in file having input sentence in following tab seperated format.
                                     Max size 10MB
                                <pre>
                                  Text Line           Result Text     Extra KeyValue Pair1(optional)    Extra KeyValue Pair1(optional)


                                  AFP - India's Tata Iron and Steel Company Ltd.      Tata Iron and Steel Company.    id=1  content=games

                                  British Foreign Minister         UK Foreign Minister id=2  content=UK  site=34

                                  Japan carmaker Toyota         Japanese carmaker Toyota    id=100
                                </pre>
                                    <b>Content</b> contains input text, <b>annotation</b> has the labeled content, <b>extras</b> is for some extra columns that you want to show with each row.
                                      </p>
                                </div>
                                }
                               <div className="col-md-5" />
                                <div className="col-md-3 text-center" style={inputWidth}>
                                <form encType="multipart/form-data" action="" key="importFile" className="text-center">
                                    <input className="h4 text-primary" disabled={this.state.loading} type="file" name="fileName" onChange={this.handleUploadFile}>
                                    </input>
                                      { this.state.file && this.state.file.size > 10000000 && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'left' }}> File size is big: {bytes(this.state.file.size)} </p>}
                                      {this.state.file && this.state.file.size < 10000000 && <p style={{ textAlign: 'left'}}> File Size: {bytes(this.state.file.size)} </p>}
                                    <p className={styles.error} disabled={!this.state.errors.file}>
                                      {this.state.errors.file}
                                    </p>
                                 </form>
                                </div>
                                <div className="col-md-3" />
                                <br />
                                <br />

                                <div style={{ height: '50px'}}/>
                                <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                <br />
                                    <p className={styles.error} disabled={!this.state.errors.submit}>
                                      {this.state.errors.submit}
                                    </p>
                                </div>
                              </Segment>
                              }

                          {
                            this.props.projectCreated && !this.state.projectCreationComplete && this.state.uploadType === 'Raw' &&
                            <Segment basic vertical loading={this.state.loading}>
                                <h1>Import Data</h1>
                                <br />
                                  <Button className="text-left" onClick={() => {this.setState({ uploadType: undefined});}}>Change Import Type</Button>
                                <br />
                                <h3> Select file with input data </h3>
                                <br />
                                { type === POS_TAGGING &&
                                          <p>Please upload a text/doc/pdf file </p>
                                }
                                { (type === POS_TAGGING_GENERIC) &&
                                  <div>
                                          <p>Upload a Text/CSV file where each line has one data-item to be tagged.</p>
                                          <Accordion as={Form.Field} panels={advPanels} style={{ fontSize: 'xx-small' }} />
                                  </div>
                                }
                                { type === TEXT_SUMMARIZATION &&
                                    <p>Please upload a text file with each line in file having sentence to be summarized.<br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the text documents to be summarized. Max file size is 100 MB for free plans</p>
                                }
                                { type === TEXT_MODERATION &&
                                    <p>Please upload a text file with each line in file having sentence to be moderated.<br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the text documents to be moderated. Max file size is 100 MB for free plans</p>
                                }
                                { type === TEXT_CLASSIFICATION &&
                                    <p>Please upload a text file with each line in file having sentence to be classified.<br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the text documents to be classified. Max file size is 100 MB for free plans</p>
                                }
                                { type === IMAGE_CLASSIFICATION &&
                                <p>Upload a text file containing URLs of images. <br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the images. Max file size is 100 MB for free plans</p>
                                }
                                { type === VIDEO_CLASSIFICATION &&
                                <p>Upload a text file containing URLs of videos.</p>
                                }
                                { ( type === IMAGE_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX || type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
                                <p>Upload a text file containing URLs of images. <br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the images. Max file size is 100 MB for free plans</p>
                                }
                                { ( type === VIDEO_BOUNDING_BOX) &&
                                <p>Upload a text file containing URLs of videos.</p>
                                }
                                {
                                  type === DOCUMENT_ANNOTATION &&
                                  <div>
                                            <p>Please upload a valid text/doc/pdf file.<br />
                                                           <strong> OR </strong> <br />
                                    A zip file of all the text/pdf/doc documents. Max file size is 100 MB for free plans</p>
                                    <Accordion as={Form.Field} panels={advPanels} style={{ fontSize: 'xx-small' }} />
                                  </div>
                                }

                                 <div className="col-md-5" />
                                <div className="col-md-3 text-center" style={inputWidth}>
                                <form encType="multipart/form-data" action="" key="importFile" className="text-center">
                                    <input className="h4 text-primary" disabled={this.state.loading} type="file" name="fileName" onChange={this.handleUploadFile}>
                                    </input>
                                      { this.state.file && this.state.file.size > 10000000 && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'left' }}> File size is big: {bytes(this.state.file.size)} </p>}
                                      {this.state.file && this.state.file.size < 10000000 && <p style={{ textAlign: 'left'}}> File Size: {bytes(this.state.file.size)} </p>}
                                    <p className={styles.error} disabled={!this.state.errors.file}>
                                      {this.state.errors.file}
                                    </p>
                                 </form>
                                </div>
                                <div className="col-md-3" />
                                <br />
                                <br />

                                <div style={{ height: '50px'}}/>
                                <Button type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Button>
                                <br />
                                    <p className={styles.error} disabled={!this.state.errors.submit}>
                                      {this.state.errors.submit}
                                    </p>
                            </Segment>

                          }
                                  {this.state.fileUploadProgress > 0 && this.state.loading && <Progress percent={Math.floor(this.state.fileUploadProgress)} progress autoSuccess /> }
                        </div>
                      }
      </div>
    );
  }
}
