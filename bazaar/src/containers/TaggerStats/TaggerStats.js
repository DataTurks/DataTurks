import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
import { uploadDataForm, updateProjectDetails, setCurrentProject } from 'redux/modules/dataturks';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
import { Segment, Button, Icon, Statistic, Table, Header, Progress, Menu, Dropdown } from 'semantic-ui-react';
import { fetchProjectStats, sendInvite, getUidToken, refreshUidToken } from '../../helpers/dthelper';
import { TaggerInvite } from '../../components';
import { push } from 'react-router-redux';
import Modal from 'react-bootstrap/lib/Modal';

const statsLabel = { textTransform: 'initial', fontWeight: '300' };

@connect(
  state => ({user: state.auth.user, currentProject: state.dataturksReducer.currentProject, projectDetails: state.dataturksReducer.projectDetails }),
  dispatch => bindActionCreators({ uploadDataForm, setCurrentProject, updateProjectDetails, pushState: push }, dispatch))
export default class TaggerStats extends Component {
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
    projectDetails: PropTypes.object
  }

  constructor(props) {
    super(props);
    console.log('tagger stats props are', props);
    this.loadProjectDetails = this.loadProjectDetails.bind(this);
    this.projectDetailsFetched = this.projectDetailsFetched.bind(this);
    this.openInviteModal = this.openInviteModal.bind(this);
    this.inviteByEmail = this.inviteByEmail.bind(this);
    this.inviteSent = this.inviteSent.bind(this);
    this.openScreen = this.openScreen.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.state = {
      fields: {},
      errors: {},
      projectDetails: this.props.projectDetails,
      inviteModal: false,
      loading: false,
      successModal: false,
    };
  }

  state = {
    fields: {},
    errors: {},
    projectDetails: null,
    inviteModal: false,
    loading: false,
    successModal: false,
    projectDetailsError: undefined
  }

  componentWillMount() {
    console.log('TaggerStats componentWillMount');
  }

  componentDidMount() {
    console.log('Did mount TaggerStats ', this.state.projectDetails);
    if (this.props.params.orgName && this.props.params.projectName) {
      this.props.setCurrentProject({orgName: this.props.params.orgName, projectName: this.props.params.projectName}, getUidToken());
    }else if ((!this.state.projectDetails && this.props.currentProject) ||
      (this.state.projectDetails && !this.state.projectDetails.contributorDetails )) {
      this.loadProjectDetails();
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
    console.log('next props in taggerstats', nextProps);
    if (this.props.currentProject !== nextProps.currentProject) {
      // login
      this.loadProjectDetails(nextProps.currentProject);
    }
  }


  getContributorsData = (data) => {
    const arrs = [];
    console.log('getContributorsData ', data);

    for (let index = 0; index < data.length; index++) {
      arrs.push(
                                          <Table.Row key={index}>
                                            <Table.Cell>
                                                    {data[index].userDetails.firstName}
                                            </Table.Cell>
                                            <Table.Cell>
                                                    {data[index].avrTimeTakenInSec}
                                            </Table.Cell>
                                            <Table.Cell>
                                                    {data[index].hitsDone}
                                            </Table.Cell>
                                          </Table.Row>);
    }
    return (
                                              <Table.Body>
                                                  {arrs}
                                              </Table.Body>);
  }

  open = () => this.setState({ successModal: true })
  close = () => this.setState({ successModal: false })

  openExport = () => {
    this.props.pushState('/projects/export');
  }

  openScreen = (screen, type) => {
    console.log('opening screen ', screen);
    if (screen === 'edit') {
      this.props.pushState({pathname: '/projects/' + screen, query: {type}});
    } else {
      this.props.pushState({pathname: '/projects/' + screen});
    }
  }

  loadProjectDetails(pid) {
    this.setState({ loading: true });
    if (pid) {
      fetchProjectStats(pid, this.projectDetailsFetched);
    } else {
      fetchProjectStats(this.props.currentProject, this.projectDetailsFetched);
    }
  }

  projectDetailsFetched(error, response) {
    console.log(' project details fetched ', error, response);
    if (!error) {
      const taggingProgress = Number((response.body.totalHitsDone * 100) / response.body.totalHits).toFixed(0);
      this.props.updateProjectDetails(response.body);
      this.setState({ projectDetails: response.body, loading: false, taggingProgress });
    } else {
      if (response.body.code === 401) {
        refreshUidToken(this.loadProjectDetails);
      } else {
        this.setState({ projectDetailsError: response.body.message});
      }
    }
  }

  openInviteModal(event, data) {
    console.log('open invite modal', event, data);
    this.setState({ inviteModal: true });
  }


  inviteSent(error, response) {
    console.log('invite sent ', error, response);
    if (!error) {
      this.setState({ successModal: true });
    } else {
      this.setState({ inviteModal: false, error: true });
    }
  }

  inviteByEmail(email) {
    console.log('inviting by email ', event, event.target.value);
    sendInvite(this.props.currentProject, email, this.inviteSent);
  }

  openModal() {
    this.setState({ inviteModal: true });
  }

  closeModal() {
    this.setState({ inviteModal: false });
  }

  render() {
    console.log('TaggerStats props are ', this.props, this.state);
    const { projectDetails, taggingProgress, successModal } = this.state;
    let permissions = {};
    if (projectDetails && projectDetails.permissions) {
      permissions = projectDetails.permissions;
    }
    const styles = require('./TaggerStats.scss');
    return (
      <div className="container text-center" id="stats-page">
          <Helmet title="Project Stats" />
                      {
                        (this.state.projectDetailsError || this.state.currentProject === '-1') &&
                        <div className="text-center">
                            <h3>{this.state.projectDetailsError}</h3>
                        </div>
                      }
                      { projectDetails &&
                          <div>
                            <Segment vertical size="large" className={styles.title} loading={this.state.loading}>
                            <div>
                              <h3>{projectDetails.name}</h3>
                              <div>
                                  <Dropdown text="Options" icon="options" floating labeled button className="icon teal pull-right">
                                    <Dropdown.Menu>
                                      <Dropdown.Item disabled={!permissions.canUploadData} onClick={this.openScreen.bind(this, 'edit', 'file')}> <Icon name="add circle" color="blue"/> Add Data</Dropdown.Item>
                                      <Dropdown.Item disabled={!permissions.canEditProject} onClick={this.openScreen.bind(this, 'edit', 'label')}> <Icon name="edit" color="blue"/>Edit Project</Dropdown.Item>
                                      <Dropdown.Item disabled={!permissions.canSeeCompletedHITs} onClick={this.openScreen.bind(this, 'overview')}> <Icon name="database" color="blue" />HITs Done</Dropdown.Item>
                                      <Dropdown.Item disabled={!permissions.canDownloadData} onClick={this.openExport}><Icon name="download" color="blue" />Download</Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                              </div>
                            </div>
                           </Segment>
                          </div>
                      }
                      {
                        this.state.inviteModal &&
                        <TaggerInvite submitEmail={this.inviteByEmail} modalOpen={this.openModal} modalClose={this.closeModal} />
                      }
                      {
                        successModal &&
                              <div className="static-modal" style={{ marginTop: '50px'}}>
                                <Modal.Dialog>
                                  <Modal.Header closeButton>
                                    <Modal.Title>Invite Sent</Modal.Title>
                                  </Modal.Header>

                                  <Modal.Body>Email invite successfully sent</Modal.Body>

                                  <Modal.Footer>
                                    <Button bsStyle="success" onClick={this.close}>Close</Button>
                                  </Modal.Footer>
                                </Modal.Dialog>
                              </div>
                      }
                        <div style={{ height: '60px' }}/>

                            { projectDetails &&
                            <div className="text-center" style={{ height: '200px'}}>
                            <Segment basic vertical className={styles.stats} textAlign="center" loading={this.state.loading}>
                            <div className="col-md-12">
                              <h3> {taggingProgress} % completed </h3>
                                <Progress color="green" size="large" indicating percent={taggingProgress} precision={2} progress="percent" style={{ width: '50%', left: '25%', fontSize: '0.75rem'}} />
                              <Statistic.Group size="mini" widths="two">
                                <Statistic color="green">
                                  <Statistic.Value>{projectDetails.totalHitsDone}</Statistic.Value>
                                  <Statistic.Label style={statsLabel}>HITs Done</Statistic.Label>
                                </Statistic>
                                <Statistic>
                                  <Statistic.Value color="blue">
                                    {projectDetails.totalHits}
                                  </Statistic.Value>
                                  <Statistic.Label style={statsLabel}>Total HITs</Statistic.Label>
                                </Statistic>
                              </Statistic.Group>
                            </div>
                            </Segment>
                           </div>
                          }

                          <br />
                                                  { projectDetails &&
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                              <Button disabled={!permissions.canSeeInsights} primary size="small" onClick={this.openScreen.bind(this, 'visualize')}>
                                <Icon name="bar graph"/> Insights
                              </Button>
                              <Button disabled={!permissions.canCompleteHITs} primary size="small" onClick={this.openScreen.bind(this, 'space')}>
                                <Icon name="tag"/> Start Tagging
                              </Button>
                              <Button disabled={!permissions.canInviteCollaborators} primary size="small" onClick={this.openInviteModal}>
                                <Icon name="add user"/> Add Contributor
                              </Button>
                          </div>
                      }

                        <br />
                        <br />
                        <br />
                            { projectDetails && projectDetails.contributorDetails && projectDetails.contributorDetails.length > 0 &&
                            <div className="text-center">
                              <div style={{width: '50%', left: '25%', position: 'relative'}}>
                                      <h3> Leaderboard </h3>
                                          <Segment basic vertical loading={this.state.loading}>
                                        <Table compact="very" celled size="small" striped>
                                        <Table.Header>
                                          <Table.Row>
                                            <Table.HeaderCell width={3}>Name</Table.HeaderCell>
                                            <Table.HeaderCell width={1}>Time(s) / HIT</Table.HeaderCell>
                                            <Table.HeaderCell width={1}>#HITs done</Table.HeaderCell>
                                          </Table.Row>
                                        </Table.Header>
                                          {this.getContributorsData(projectDetails.contributorDetails)}
                                      </Table>
                                          </Segment>
                              </div>
                            </div>
                          }

                            <div style={{height: '50px'}} />

      </div>

    );
  }
}
