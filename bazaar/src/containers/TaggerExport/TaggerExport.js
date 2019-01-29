import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
import { downloadfile, getUidToken, logEvent } from '../../helpers/dthelper';
import { setCurrentProject, getProjectDetails } from 'redux/modules/dataturks';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
import { Button, Form, Label, Segment, Icon, Breadcrumb } from 'semantic-ui-react';
import { goBack, push } from 'react-router-redux';
import { TEXT_SUMMARIZATION, DOCUMENT_ANNOTATION, POS_TAGGING_GENERIC, POS_TAGGING, TEXT_CLASSIFICATION, TEXT_MODERATION, IMAGE_POLYGON_BOUNDING_BOX, IMAGE_POLYGON_BOUNDING_BOX_V2, IMAGE_BOUNDING_BOX, IMAGE_CLASSIFICATION} from '../../helpers/Utils';

const FileSaver = require('file-saver');

// const outputFormatOptions = [{ key: 'txt', value: 'text', text: 'Text' }];
// const outputDwnldOptions = [{ key: 'all', value: 'ALL', text: 'All rows' }, { key: 'tagged', value: 'TAGGED', text: 'Only Tagged Rows' }];

// { key: 'txt', value: 'txt', flag: 'txt', text: 'Text' }]
@connect(
  state => ({user: state.auth.user,
    currentPathOrg: state.dataturksReducer.currentPathOrg,
    currentPathProject: state.dataturksReducer.currentPathProject,
   currentProject: state.dataturksReducer.currentProject, projectDetails: state.dataturksReducer.projectDetails}),
  dispatch => bindActionCreators({ goBack, downloadfile, getProjectDetails, setCurrentProject, pushState: push }, dispatch))
export default class TaggerExport extends Component {
  static propTypes = {
    user: PropTypes.object,
    pushState: PropTypes.func,
    uploadDataForm: PropTypes.func,
    projectDetails: PropTypes.object,
    currentProject: PropTypes.string,
    goBack: PropTypes.func,
    params: PropTypes.object,
    orgName: PropTypes.string,
    projectName: PropTypes.string,
    setCurrentProject: PropTypes.func,
    getProjectDetails: PropTypes.func,
    currentPathProject: PropTypes.string,
    currentPathOrg: PropTypes.string
  }

  constructor(props) {
    super(props);
    this.downloadFile = this.downloadFile.bind(this);
    this.downloadCallback = this.downloadCallback.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
  }

  state = {
    loading: false,
    downloadFormat: 'json',
    itemOption: 'TAGGED'
  }

  componentDidMount() {
    console.log('Did mount TaggerVisualize() ', this.state.projectDetails, this.state.hits);
    if ((this.props.params.orgName && this.props.params.projectName &&
      (!this.props.projectDetails || (this.props.projectDetails.name !== this.props.params.projectName || this.props.projectDetails.orgName !== this.props.params.orgName))) ||
    !this.props.currentProject) {
      this.props.setCurrentProject({orgName: this.props.params.orgName, projectName: this.props.params.projectName}, getUidToken());
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('next props in TaggerOveriew', this.props, nextProps);
    if (this.props.currentProject !== nextProps.currentProject || !this.props.projectDetails) {
      this.props.getProjectDetails(nextProps.currentProject, getUidToken());
      this.setState({ loading: true});
    }
    if (!this.props.projectDetails && nextProps.projectDetails) {
      this.setState({ loading: false });
    }
  }

  downloadCallback = (error, response) => {
    console.log(' download call back ', error, response);
    if (!error) {
      this.setState({ loading: false });
      const blob = new Blob([response.text], {type: 'application/octet-stream'});
      if (this.props.projectDetails) {
        const taskType = this.props.projectDetails.task_type;
        if (taskType === TEXT_MODERATION || taskType === TEXT_SUMMARIZATION) {
          FileSaver.saveAs(blob, this.props.projectDetails.name + '.tsv');
        } else {
          if (this.state.downloadFormat === 'json') {
            FileSaver.saveAs(blob, this.props.projectDetails.name + '.json');
          } else if (this.state.downloadFormat === 'stanford') {
            FileSaver.saveAs(blob, this.props.projectDetails.name + '.tsv');
          } else {
            FileSaver.saveAs(blob, this.props.projectDetails.name + '.txt');
          }
        }
      } else {
        FileSaver.saveAs(blob, this.props.projectDetails.name);
      }
    } else {
      alert(response.body.message);
    }
  }

  handleChange = (event, {value}) => {
    console.log('handle change', event, value);
    this.setState({ itemOption: value});
  }

  handleChange2 = (event, {value}) => {
    console.log('handle change', event, value);
    this.setState({ downloadFormat: value});
  }

  downloadFile = () => {
    console.log('downloadfile ', this.state);
    this.setState({ loading: true });
    logEvent('download', this.props.projectDetails.name);
    downloadfile(this.props.currentProject, this.state.itemOption, this.downloadCallback, this.state.downloadFormat);
  }

  render() {
    console.log('TaggerExport props are ', this.props, this.state);
    // const styles = require('./TaggerExport.scss');
    const { itemOption, downloadFormat } = this.state;
    return (
      <div className="taggerPages">
          <Helmet title="Export Data" />
                      {
                          <div className="text-center">
                              {
                                  <div>
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
                                  </div>
                              }
                            <h1>Export Data</h1>
                              <Segment basic size="mini" padded compact loading={this.state.loading}>
                              <Form size="small" key="import1" loading={this.state.loading} compact>
{/*                                <Label color="white" size="large"> Options </Label>
                                <Select name="itemOption" placeholder="Download tagged or all" defaultValue="TAGGED" options={outputDwnldOptions} onChange={this.handleChange} /> */}
                                    <Form.Group inline style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                      <Form.Radio label="All Items" value="ALL" checked={itemOption === 'ALL'} onChange={this.handleChange} />
                                      <Form.Radio label="Completed Items" value="TAGGED" checked={itemOption === 'TAGGED'} onChange={this.handleChange} />
                                    </Form.Group>
                                {/*
                                <Popup
                                  basic
                                  size="tiny"
                                  trigger={<Label size="large"> Format </Label>}>
                                  Option to select output format
                                </Popup>
                                 <Select name="format" defaultValue="text" placeholder="Output format .." options={outputFormatOptions} onChange={this.handleChange2} /> */}

                                <br />
                                { this.props.projectDetails && this.props.projectDetails.task_type === IMAGE_CLASSIFICATION &&
                                <p>Download file would be a text file where each line is a JSON containing the image URL and the classes marked for the image.</p>
                                }
                                { this.props.projectDetails && ( this.props.projectDetails.task_type === IMAGE_BOUNDING_BOX) &&
                                <div>
                                <p>Download file would be a text file where each line is a JSON containing the image URL and the coordinates of the bounded objects in the image</p>
                                </div>
                                }
                                { this.props.projectDetails && (this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX || this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
                                <p>Download file would be a text file where each line is a JSON containing the image URL and the coordinates of the bounded objects in the image</p>
                                }
                                { this.props.projectDetails && ( this.props.projectDetails.task_type === DOCUMENT_ANNOTATION || this.props.projectDetails.task_type === POS_TAGGING_GENERIC ) &&
                                <p>Download file would be a text file where each line is a JSON containing the selected text, start index, end index and marked category</p>
                                }
                                { this.props.projectDetails && this.props.projectDetails.task_type === TEXT_SUMMARIZATION &&
                                <p>Download file would be a tab seperated file with input in first column and output row in second column.</p>
                                }
                                { this.props.projectDetails && this.props.projectDetails.task_type === TEXT_MODERATION &&
                                <p>Download file would be a tab seperated file with input in first column and output row in second column.</p>
                                }
                                { this.props.projectDetails && this.props.projectDetails.task_type === POS_TAGGING &&
                                <p>Download file would be a text file where each line is a JSON containing the input text and annotated text.</p>
                                }
                                { this.props.projectDetails && this.props.projectDetails.task_type === TEXT_CLASSIFICATION &&
                                <p>Download file would be a text file where each line is a JSON containing the input text, associated label and notes.</p>
                                }
                                {
                                  this.props.projectDetails && (this.props.projectDetails.task_type === POS_TAGGING || this.props.projectDetails.task_type === DOCUMENT_ANNOTATION || this.props.projectDetails.task_type === POS_TAGGING_GENERIC) &&
                                  <div>
                                    <Form.Group inline style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                      <Form.Radio label="Json Format" value="json" checked={downloadFormat === 'json'} onChange={this.handleChange2} />
                                      <Form.Radio label="Stanford NER Format" value="stanford" checked={downloadFormat === 'stanford'} onChange={this.handleChange2} />
                                    </Form.Group>
                                  </div>
                                }
                                <br />
                                <Button primary size="mini" onClick={this.downloadFile}>
                                  Download file
                                </Button>
                                <br />

                                <div style={{ height: '100px'}} />
                                <br />
                                <br />
                                  { this.props.projectDetails && ( this.props.projectDetails.task_type === IMAGE_BOUNDING_BOX) &&
                                  <Label color="teal" as="a" href="https://dataturks.com/help/ibbx_dataturks_to_pascal_voc_format.php" target="_blank">
                                    Convert to Pascal VOC format
                                  </Label>
                                  }
                                  { this.props.projectDetails && ( this.props.projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2) &&
                                  <Label color="teal" as="a" href="https://medium.com/@dataturks/converting-polygon-bounded-boxes-in-the-dataturks-json-format-to-mask-images-f747b7ba921c" target="_blank">
                                    Create a PNG Encoded Mask
                                  </Label>
                                  }                                  { this.props.projectDetails && ( this.props.projectDetails.task_type === POS_TAGGING || this.props.projectDetails.task_type === DOCUMENT_ANNOTATION || this.props.projectDetails.task_type === POS_TAGGING_GENERIC) &&
                                  <Label color="teal" as="a" href="https://dataturks.com/help/dataturks-ner-json-to-spacy-train.php" target="_blank">
                                    Convert to Spacy format
                                  </Label>
                                  }
                              </Form>
                              </Segment>
                          </div>
                      }

      </div>
    );
  }
}
