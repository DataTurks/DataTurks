import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
// import { Header } from 'semantic-ui-react';
import { Card, Button, Menu, Dropdown, Header, Progress, Segment, Label, Icon, Message } from 'semantic-ui-react';
import { push } from 'react-router-redux';
import { getHomeData, getUidToken, refreshUidToken, logEvent } from '../../helpers/dthelper';
import { timeConverter, taskTypeMap, DUMMY_UID, POS_TAGGING, POS_TAGGING_GENERIC, TEXT_SUMMARIZATION, IMAGE_CLASSIFICATION, TEXT_MODERATION, TEXT_CLASSIFICATION, DOCUMENT_ANNOTATION, IMAGE_POLYGON_BOUNDING_BOX, IMAGE_POLYGON_BOUNDING_BOX_V2, IMAGE_BOUNDING_BOX } from '../../helpers/Utils';
import { updateHomeData, selectProject, getOrgDetails, updateProjectDetails } from 'redux/modules/dataturks';
import { signIn } from 'redux/modules/auth';

@connect(
  state => ({user: state.auth.user, projects: state.dataturksReducer.projects}),
      dispatch => bindActionCreators({ signIn, pushState: push, updateHomeData, updateProjectDetails, selectProject, getOrgDetails }, dispatch))
export default class TaggerProjects extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    pushState: PropTypes.func,
    updateHomeData: PropTypes.func,
    projects: PropTypes.array,
    selectProject: PropTypes.func,
    params: PropTypes.object,
    orgName: PropTypes.string,
    getOrgDetails: PropTypes.func,
    updateProjectDetails: PropTypes.func,
    signIn: PropTypes.func
  }

  constructor(props) {
    console.log('props are ', props);
    super(props);
    this.openCreate = this.openCreate.bind(this);
    this.loadProjectDetails = this.loadProjectDetails.bind(this);
    this.projectDetailsFetched = this.projectDetailsFetched.bind(this);
    this.openStats = this.openStats.bind(this);
    this.state = {
      loading: false,
      homeDetails: null,
      activeMenu: 'home'
    };
  }


  componentWillMount() {
    console.log('TaggerProjects componentWillMount');
  }

  componentDidMount() {
    console.log('Did mount TaggerProjects ', this.state.homeDetails, this.props);
    if (!this.state.homeDetails) {
      this.loadProjectDetails();
    }
    logEvent('buttons', 'Home page opened');
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
    console.log('next props in projects', this.props, nextProps);
    if (!this.props.projects && nextProps.projects) {
      this.setState({ homeDetails: nextProps.projects, loading: false });
    }
  }

  componentWillUnmount() {
    console.log('unmounting Component');
    this.setState({ homeDetails: undefined });
  }

  getProjects = (projects) => {
    const arrs = [];
    for (let index = 0; index < projects.length; index ++) {
      console.log(' project detail ', projects[index].projectDetails.visibility_type, projects[index].projectDetails);
      let tagButtonHidden = true;
      let overviewClass = '';
      if ( projects[index].projectDetails.totalHitsDone === projects[index].projectDetails.totalHits ||
        projects[index].projectDetails.totalHits === 0) {
        tagButtonHidden = true;
        overviewClass = '';
      }
      arrs.push(
        <Card raised blue key={index} style={{ width: '35%', marginLeft: '5%', marginRight: '5%', marginBottom: '5%' }}>
                          <Card.Content extra onClick={this.openProject} style={{ cursor: 'pointer'}} onClick={this.openStats.bind(this, 'stats', projects[index].projectDetails.orgName, projects[index].projectDetails.name)}>
                        { projects[index].role === 'OWNER' &&
                          <Label size="mini" attached="top left" > Owner </Label>
                        }
                        { projects[index].role === 'OWNER' &&
                          <Label icon size="mini" attached="top right" style={{ width: '10%', background: 'white'}}>
                            <Menu secondary>
                              <Dropdown icon="ellipsis horizontal">
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={this.copyProject.bind(this, index)}>Copy</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </Menu>
                          </Label>
                        }
                            <Card.Header>
                              {projects[index].projectDetails.name}
                            </Card.Header>
                            <Card.Meta className="marginTop">
                              { projects[index].projectDetails.visibility_type &&
                                <Label size="mini" inverted style={{ width: '20%', background: '#a1bccc', color: 'white'}}> {projects[index].projectDetails.visibility_type} </Label>
                              }
                              <br />
                              <span className="date">
                                {taskTypeMap[projects[index].projectDetails.task_type]}
                              </span>
                            </Card.Meta>
                            <Card.Description>
                                <Progress style={{ marginBottom: '1em', fontSize: '0.75rem'}} precision={0} color="olive" indicating progress percent={projects[index].projectDetails.totalHits === 0 ? 0 : (projects[index].projectDetails.totalHitsDone * 100) / projects[index].projectDetails.totalHits} />
                                {projects[index].projectDetails.totalHitsDone} / {projects[index].projectDetails.totalHits}
                            </Card.Description>
                          </Card.Content>
                          <Card.Content extra>
                              <Button primary name="posT" size="mini" onClick={this.openStats.bind(this, 'stats', projects[index].projectDetails.orgName, projects[index].projectDetails.name)} className={overviewClass}>
                              Overview
                              </Button>
                            { !tagButtonHidden &&
                              <Button color="teal" className="pull-right" name="posT1" size="mini" onClick={this.openStats.bind(this, 'tag', projects[index].projectDetails.orgName, projects[index].projectDetails.name)}>
                              { (projects[index].projectDetails.task_type === POS_TAGGING || projects[index].projectDetails.task_type === DOCUMENT_ANNOTATION ||
                                projects[index].projectDetails.task_type === POS_TAGGING_GENERIC)
                                && 'Start Tagging'

                              }
                              {projects[index].projectDetails.task_type === TEXT_SUMMARIZATION && 'Write Summary'
                              }
                              {projects[index].projectDetails.task_type === TEXT_MODERATION && 'Moderate Text'
                              }
                              {projects[index].projectDetails.task_type === TEXT_CLASSIFICATION && 'Classify Text'
                              }
                              { (projects[index].projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX || projects[index].projectDetails.task_type === IMAGE_POLYGON_BOUNDING_BOX_V2 ) && 'Bound Images'
                              }
                              {projects[index].projectDetails.task_type === IMAGE_BOUNDING_BOX && 'Bound Images'
                              }
                              {projects[index].projectDetails.task_type === IMAGE_CLASSIFICATION && 'Classify Image'
                              }
                              </Button>
                            }
                          </Card.Content>
          </Card>
        );
    }
    return (
             <Card.Group stackable centered itemsPerRow="2">
              {arrs}
             </Card.Group>);
  }

  openProject(event, data) {
    console.log('open project ', event, data);
  }

  copyProject = (index, event) => {
    console.log('copyProject', event);
    this.props.updateProjectDetails(this.state.homeDetails[index].projectDetails);
    this.props.pushState('/projects/import?type=' + this.state.homeDetails[index].projectDetails.task_type);
  }

  openStats(field1, field2, field3) {
    console.log('opening ', field1, field2, field3);
    if (field1 === 'tag') {
      this.props.pushState('/projects/' + field2 + '/' + field3 + '/space');
    } else {
      this.props.pushState('/projects/' + field2 + '/' + field3);
    }
  }

  projectDetailsFetched( error, response ) {
    console.log('home details fetched ', error, response);
    if (!error) {
      this.props.signIn({firstName: response.body.userDetails.firstName, lastName: response.body.userDetails.secondName,  fullName: response.body.userDetails.firstName + " " + response.body.userDetails.secondName, uid: response.body.userDetails.uid, email: response.body.userDetails.email, profilePic: response.body.userDetails.profilePic });
      this.props.updateHomeData(response.body.userDetails, response.body.projects, response.body.planName, response.body.labelsAllowed, response.body.labelsDone, response.body.subscriptionExpiryTimestamp, response.body.hasSubscriptionExpired);
      this.setState({homeDetails: response.body.projects, loading: false, plan: response.body.planName, labelsAllowed: response.body.labelsAllowed, labelsDone: response.body.labelsDone, subscriptionExpiryTimestamp: response.body.subscriptionExpiryTimestamp, hasSubscriptionExpired: response.body.hasSubscriptionExpired });
    } else if (response && response.body) {
      if (response.body.code === 401) {
        refreshUidToken(this.loadProjectDetails);
      } else {
        this.setState({ projectDetailsError: response.body.message});
      }
    } else {
      this.setState({ projectDetailsError: 'Not able to connect'});
    }
  }

  loadProjectDetails(cache) {
    const { uid, token } = getUidToken();
    console.log('uid in taggerpeoj', uid, DUMMY_UID);
    if (this.props.params.orgName) {
      this.props.getOrgDetails(this.props.params.orgName, { uid, token });
    } else if (uid !== DUMMY_UID) {
      getHomeData(this.projectDetailsFetched, cache);
    }
    this.setState({ loading: true});
  }

  openCreate(val) {
    this.props.pushState('/projects/' + val);
  }

  handleSubmit = (response) => {
    console.log('response', response, this.props.login);
    if (response && response.profileObj) {
      this.props.login(response.profileObj.name, response.profileObj.imageUrl);
    }
  }

  render() {
    console.log('state is ', this.state);
    return (
      <div className="taggerPages">
          <Helmet title="My Projects" />
                          <div className="text-center">
                          <Button size="tiny" loading={this.state.loading} positive className="pull-right" onClick={() => this.loadProjectDetails(true)} compact><Icon name="refresh" loading={this.state.loading} />Refresh</Button>
                            <h2>My Projects</h2>
                            <br />

                            {
                              (this.state.labelsDone > this.state.labelsAllowed || this.state.hasSubscriptionExpired) &&
                                <div className="text-center" style={{ marginBottom: '40px' }}>
                                  <Message negative style={{ marginTop: '-60px' }} size="mini">
                                    <Message.Header>Your account needs renewal, please contact <u>
                                    contact@dataturks.com </u></Message.Header>
              <div className="text-center">
                <p> Labels Used </p>
                <Label> {this.state.labelsDone} </Label>
                <p> Total Labels in Package</p>
                <Label> {this.state.labelsAllowed} </Label>
                { this.state.subscriptionExpiryTimestamp &&
                  <div>
                    <p> Subsription Expiry </p>
                    <Label> {timeConverter(this.state.subscriptionExpiryTimestamp / 1000)}</Label>
                  </div>
                }
                <div style={{ height: '20px' }} />
                <Button color="blue" size="mini">
                        <a href="https://dataturks.com/pricing.php" target="_blank">
                          <h6 style={{ color: 'white' }}>Renew</h6>
                        </a>
                  </Button>
              </div>
                                  </Message>
                                </div>
                            }

                            <br />
                            <div style={{ height: '20px' }} />
                            <br />
                              <Segment basic loading={this.state.loading}>
                                  {this.state.homeDetails && this.state.homeDetails.length > 0 && this.getProjects(this.state.homeDetails)}
                              </Segment>
                          </div>
                      {
                        this.state.homeDetails && this.state.homeDetails.length === 0 &&
                          <div>
                            <h1>No Projects Currently</h1>
                              <div>
                                  <Button color="blue" onClick={this.openCreate.bind(this, 'create')}>
                                    Create A New Project
                                  </Button>
                              </div>
                          </div>
                      }

      </div>

    );
  }
}
