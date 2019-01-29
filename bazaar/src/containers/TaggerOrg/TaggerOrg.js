import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
// import { Header } from 'semantic-ui-react';
import { Pagination, Card, Button, Header, Form, Progress, Segment, Message, Label, Icon, TextArea } from 'semantic-ui-react';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { push } from 'react-router-redux';
import { getUidToken, addKeyValues, logEvent } from '../../helpers/dthelper';
import { taskTypeMap } from '../../helpers/Utils';
import { updateHomeData, selectProject, getOrgDetails } from 'redux/modules/dataturks';
import Helmet from 'react-helmet';
// import _ from 'lodash';
import Fuse from 'fuse.js';
// const styles = require('./TaggerOrg.scss');

@connect(
  state => ({user: state.auth.user, orgData: state.dataturksReducer.orgData,
   orgDataFailure: state.dataturksReducer.orgDataFailure}),
      dispatch => bindActionCreators({ pushState: push, updateHomeData, selectProject, getOrgDetails }, dispatch))
export default class TaggerOrg extends Component {
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
    orgData: PropTypes.object,
    orgDataFailure: PropTypes.string,
    location: PropTypes.object,
    pathname: PropTypes.string,
  }

  constructor(props) {
    console.log('props are ', props);
    super(props);
    this.openCreate = this.openCreate.bind(this);
    this.loadProjectDetails = this.loadProjectDetails.bind(this);
    this.sendDatasetRequest = this.sendDatasetRequest.bind(this);
    this.datasetRequestCallback = this.datasetRequestCallback.bind(this);
    // this.projectDetailsFetched = this.projectDetailsFetched.bind(this);
    this.openStats = this.openStats.bind(this);
    this.selectMenu = this.selectMenu.bind(this);
    let selectedType = 'All';
    let searchQuery = '';
    let fuse = undefined;
    let activePage = 1;
    if (this.props.location && this.props.location.query && this.props.location.query.type) {
      selectedType = this.props.location.query.type;
    }
    if (this.props.location && this.props.location.query && this.props.location.query.query) {
      searchQuery = this.props.location.query.query;
    }
    if (this.props.location && this.props.location.query && this.props.location.query.page) {
      activePage = this.props.location.query.page;
      if (activePage < 1) {
        activePage = 1;
      }
    }
    let searchResults = [];
    let taskTypeM = undefined;
    if (this.props.orgData && this.props.orgData.projects) {
      const { searchData, typesCountMap } = this.createindex(this.props.orgData.projects);
      taskTypeM = typesCountMap;
      const options = {keys: ['data'], shouldSort: true, id: 'id'};
      fuse = new Fuse(searchData, options);
      if (searchQuery > 0) {
        searchResults = this.state.fuse.search(searchQuery);
        console.log('search results', searchResults);
        if (searchResults.length === 0) {
          logEvent('SearchEvent', 'NoResultsFound');
          logEvent('NoSearchResult', searchQuery);
        }
      }
    }

    this.state = {
      loading: false,
      orgData: this.props.orgData,
      selectedType,
      datasetRequestSent: false,
      datasetRequest: false,
      description: '',
      email: '',
      fuse,
      searchLoading: false,
      typesCountMap: taskTypeM,
      searchResults,
      searchQuery,
      activePage,
      activeMenu: 'home',
      searchData: []
    };
  }


  componentWillMount() {
    console.log('TaggerProjects componentWillMount');
  }


  componentDidMount() {
    console.log('Did mount TaggerProjects ', this.props);
    if (!this.state.homeDetails) {
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
    console.log('net props ', this.props, nextProps, this.state);
    if (this.props.params.orgName !== nextProps.params.orgName) {
      this.props.getOrgDetails(nextProps.params.orgName, getUidToken(), false);
      this.setState({loading: true});
    } else if (nextProps.orgData) {
      if ((this.props.location.query && this.props.location.query.type) && (!nextProps.location.query || !nextProps.location.query.type)) {
        this.setState({ searchQuery: '', selectedType: 'All', searchResults: [], searchLoading: false });
      }
      const { types, searchData, typesCountMap } = this.createindex(nextProps.orgData.projects);
      console.log('index created', typesCountMap);
      this.setState({ typesCountMap });
      const options = {keys: ['data'], distance: 400, matchAllTokens: false, threshold: 0.1, shouldSort: true, id: 'id'};
      if (nextProps.location && nextProps.location.query && nextProps.location.query.query && nextProps.location.query.query.length > 0) {
        const fuse = new Fuse(searchData, options);
        const searchResults = fuse.search(nextProps.location.query.query);
        if (searchResults.length === 0) {
          logEvent('SearchEvent', 'NoResultsFound');
          logEvent('NoSearchResult', nextProps.location.query.query);
        }
        console.log('search results', searchResults);
        this.setState({
          searchLoading: false,
          searchQuery: nextProps.location.query.query,
          searchResults,
          typesCountMap
        });
      } else {
        this.setState({ searchQuery: '', searchResults: [], searchLoading: false });
      }
      this.setState({orgData: nextProps.orgData});
      this.setState({types});
      if (nextProps.location.query && nextProps.location.query.page &&
        nextProps.location.query.page !== this.state.activePage) {
        this.setState({ activePage: nextProps.location.query.page });
      }
      this.setState({loading: false, datasetRequestSent: false, datasetRequest: false, error: ''});
    }
  }

  componentWillUnmount() {
    console.log('unmounting Component');
    this.setState({ orgData: undefined });
  }

  getOptions = (types, selected) => {
    console.log('projects otpions', types);
    if (types) {
      const typesArr = Array.from(types);
      const arrs = [];
      for (let index = 0; index < typesArr.length; index ++) {
        // console.log(' project detail ', typesArr[index]);
        // let tagButtonHidden = false;
        // let overviewClass = 'pull-left';
        // if ( projects[index].totalHitsDone === projects[index].totalHits ||
        //   projects[index].totalHits === 0) {
        //   // tagButtonHidden = true;
        //   overviewClass = '';
        // }
        arrs.push(
          <MenuItem eventKey={index} id={index} key={index} onClick={this.selectMenu.bind(this, typesArr[index])}>{taskTypeMap[typesArr[index]]}</MenuItem>
          );
      }
      let title = 'Select Type';
      if (selected && selected !== 'All') {
        title = 'Type: ' + taskTypeMap[selected];
      }
      return (
               <DropdownButton
                                        id="1"
                                        bsStyle="success"
                                        title={title}
                                      >
                {arrs}
               </DropdownButton>);
    }
  }

  getProjects = (projects, type, pageNum, count) => {
    const arrs = [];
    let pushedCount = 0;
    for (let index = 0; index < projects.length; index ++) {
      // if (this.state.searchQuery.len > 0) {
      //   if (this.state.searchResults.length > 0 && !this.state.searchResults.includes(index)) {
      //     continue;
      //   }
      // }
      // console.log(' project detail ', projects[index]);
      // let tagButtonHidden = false;
      const href = '/projects/' + projects[index].orgName + '/' + projects[index].name;
      // let overviewClass = 'pull-left';
      // if ( projects[index].totalHitsDone === projects[index].totalHits ||
      //   projects[index].totalHits === 0) {
      //   // tagButtonHidden = true;
      //   overviewClass = '';
      // }
      // console.log('getProjects', this.state.searchQuery.length, this.state.searchResults.length, index, this.state.searchResults, this.state.searchResults.includes(index.toString()));
      if ((this.state.searchQuery.length === 0 && (!type || type === 'All' || type === projects[index].task_type)) || (this.state.searchQuery.length > 0 && this.state.searchResults.length > 0 && this.state.searchResults.includes(index.toString()))) {
        // console.log('here');
        if ((this.state.searchQuery.length === 0 && pushedCount >= ((pageNum - 1) * count) && pushedCount < (pageNum * count)) ||
          this.state.searchQuery.length > 0) {
          arrs.push(
            <Card raised blue key={index} style={{ width: '45%', marginLeft: '2%', marginRight: '2%', marginBottom: '5%' }}>
                            <Card.Content extra style={{ cursor: 'pointer'}} onClick={(event) => { this.openStats('stats', projects[index].orgName, projects[index].name); event.preventDefault(); }}>
                          { projects[index].role === 'OWNER' &&
                            <Label size="mini" attached="top left" style={{ width: '20%', background: '#a9d5de'}}> Owner </Label>
                          }
                              <Card.Header as="a" href={href} style={{ color: 'black' }}>
                                {projects[index].subtitle ? projects[index].subtitle : projects[index].name}
                              </Card.Header>
                              <Card.Meta className="marginTop">
                                {projects[index].subtitle ? projects[index].name : ''}
                                {projects[index].subtitle &&
                                  <br />
                                }
                              { projects[index].visibility_type &&
                                <Label size="mini" style={{ width: '20%', background: '#a1bccc', color: 'white'}}> {projects[index].visibility_type} </Label>
                              }
                              <br />
                                {projects[index].subtitle &&
                                  <br />
                                }
                                <br />
                                <span className="date">
                                  {taskTypeMap[projects[index].task_type]}
                                </span>
                              </Card.Meta>
                              <Card.Description>
                                  <Progress size="tiny" style={{ marginBottom: '1em', color: 'white', height: '0.5em', fontSize: '0.75rem'}} precision={0} color="olive" indicating progress percent={projects[index].totalHits === 0 ? 0 : ((projects[index].totalHitsDone + projects[index].totalHitsSkipped) * 100) / projects[index].totalHits} />
                                  <p style={{ fontSize: '0.75rem'}}> {projects[index].totalHitsDone + projects[index].totalHitsSkipped} / {projects[index].totalHits} </p>
                                  <p style={{ color: 'black', fontSize: '1.0rem'}}>
                                    {projects[index].shortDescription}
                                  </p>
                              </Card.Description>
                            </Card.Content>
                            <Card.Content extra>
                                <Button primary name="posT" size="mini" onClick={(event) => { this.openStats('stats', projects[index].orgName, projects[index].name); event.preventDefault(); }}>
                                Overview
                                </Button>
                            </Card.Content>
            </Card>
          );
        }
        pushedCount = pushedCount + 1;
      }
    }
    return (
             <Card.Group stackable centered itemsPerRow="2">
              {arrs}
             </Card.Group>);
  }

  handleResultSelect = (event, { result }) => this.setState({ resultValue: result.title })

  handleSearchChange = (event) => {
    if (event.key === 'Enter' && event.target.value.length > 2) {
      console.log('event value', event, event.target.value);
      this.setState({ searchLoading: true, resultValue: event.target.value });
      logEvent('SearchEvent', 'Search');
      logEvent('search', event.target.value);
      this.props.pushState(this.props.location.pathname + '?query=' + event.target.value);

      // setTimeout(() => {
      //   // if (this.state.resultValue.length < 1) return this.resetComponent();

      //   // const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
      //   // const isMatch = result => re.test(result.data);
      //   console.log('search result value', this.state.resultValue);
      //   const results = this.state.fuse.search(this.state.resultValue);
      //   console.log('search results', results);
      //   this.setState({
      //     searchLoading: false,
      //     results
      //   });
      // }, 3);
    }
  }

  createindex = (projects) => {
    const types = new Set();
    const searchData = [];
    const typesCountMap = {};
    typesCountMap.All = 0;
    for (let index = 0; index < projects.length; index ++) {
      types.add(projects[index].task_type);
      if (!(projects[index].task_type in typesCountMap)) {
        typesCountMap[projects[index].task_type] = 0;
      }
      typesCountMap.All = typesCountMap.All + 1;
      typesCountMap[projects[index].task_type] = typesCountMap[projects[index].task_type] + 1;

      // const href = '/projects/' + projects[index].orgName + '/' + projects[index].name;
      let data = projects[index].name;
      if (projects[index].shortDescription) {
        data = data + ' ' + projects[index].shortDescription;
      }
      if (projects[index].subtitle) {
        data = data + ' ' + projects[index].subtitle;
      }
      searchData.push({ id: index, data: projects[index].name + projects[index].shortDescription });
    }
    return { types, searchData, typesCountMap };
  }

  selectMenu(type) {
    console.log('select index is', type);
    this.setState({ selectedType: type, activePage: 1});
    this.props.pushState(this.props.location.pathname + '?type=' + type);
  }

  openStats(event, field2, field3) {
    console.log('opening ', event, field2, field3);
    this.props.pushState('/projects/' + field2 + '/' + field3);
    if (this.state.searchQuery.length > 0 && this.state.searchResults.length > 0) {
      logEvent('SearchEvent', 'SearchResultClick');
      logEvent('SearchResultClick', this.state.searchQuery);
    }
    return false;
  }

  // projectDetailsFetched( error, response ) {
  //   console.log('home details fetched ', error, response);
  //   if (!error) {
  //     this.props.updateHomeData(response.body.userDetails, response.body.projects);
  //     this.setState({homeDetails: response.body, loading: false });
  //   }
  // }

  loadProjectDetails(cache) {
    if (this.props.params.orgName) {
      this.props.getOrgDetails(this.props.params.orgName, getUidToken(), cache);
      this.setState({loading: true});
    }
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

  datasetRequestCallback(response, error) {
    this.setState({ loading: false });
    console.log('datasetRequestCallback', error, response);
    if (error) {
      this.setState({ error: response.body.message });
    } else {
      this.setState({ datasetRequestSent: true, datasetRequest: false });
    }
  }

  sendDatasetRequest() {
    if (this.state.description.length < 5) {
      this.setState({ error: 'Please enter description'});
      return;
    }
    if (this.props.user) {
      const email = this.props.user.email;
      logEvent('searchDataRequest', this.state.description);
      logEvent('SearchEvent', 'searchDataRequest');
      addKeyValues(email, this.state.description, 'datasetRequest', '', this.datasetRequestCallback);
      this.setState({loading: true});
    } else {
      if (this.state.email.length < 5) {
        this.setState({ error: 'Please enter email'});
        return;
      }
      const email = this.state.email;
      logEvent('searchDataRequest', this.state.description);
      logEvent('SearchEvent', 'searchDataRequest');
      addKeyValues(email, this.state.description, 'datasetRequest', '', this.datasetRequestCallback);
      this.setState({loading: true});
    }
    // addKeyValues()
  }

  handleCreateChange = (event) => {
    console.log('handleCreateChange ', event.target.name, event.target.value);
    // this.setState({ eventtarget.name: event.target.value });
    if (event.target.name === 'email') {
      this.setState({ email: event.target.value });
    } else if (event.target.name === 'description') {
      this.setState({ description: event.target.value });
    }
  }

  render() {
    console.log('tagger org state is ', this.state, this.props);
    let title = 'Projects';
    const nextPage = parseInt(this.state.activePage, 10) + 1;
    const prevPage = parseInt(this.state.activePage, 10) - 1;
    if (this.props.orgData && this.props.orgData.orgName) {
      title = this.props.orgData.orgName;
    }
    if (this.props.user && (this.props.user.firstName || this.props.user.fullName)) {
      title = title + '(' + this.props.user.fullName ? this.props.user.fullName : this.props.user.firstName + ')';
    }
    return (
      <div className="taggerPages">
                <Helmet title={title}
                                script={[
                  {'type': 'application/ld+json', innerHTML: `{ "@context": "http://schema.org" }`}
                                ]} />
                { this.props.orgData && this.props.orgData.orgName && <Helmet title={this.props.orgData.orgName} /> }
                      {!this.props.orgData && this.props.orgDataFailure &&
                        <h3>{this.props.orgDataFailure}
                        </h3>}
                        {
                          this.state.loading &&
                          <Segment basic loading/>
                        }
                        {
                          this.props.orgData && this.props.orgData.projects.length > 50 &&
                                          <div className="ui icon input">
                                            <input onKeyPress={this.handleSearchChange} type="text" placeholder="Search Datasets" tabIndex="0" className="prompt" autoComplete="off" />
                                              <i aria-hidden="true" className="search icon"></i>
                                          </div>
                        }
                      {this.props.orgData && this.props.orgData.projects.length > 0 &&
                          <div className="text-center">

                          <Button size="tiny" positive className="pull-right" onClick={() => this.loadProjectDetails(true)} compact><Icon name="refresh" />Refresh</Button>
                            <h2>{this.props.orgData.orgName} Projects</h2>
                            <br />
                            <div className="col-md-12">
                            {this.state.types && this.state.searchQuery.length === 0 &&
                                <div className="text-left col-md-6">
                                  {this.getOptions(this.state.types, this.state.selectedType)}
                                </div>
                            }
                            { this.state.searchQuery.length > 0 &&
                                <div className="text-left col-md-6">
                                  <h3 className="bold">Search Query: </h3> <h4>{this.state.searchQuery}</h4>
                                </div>
                            }
                            {
                              !this.props.user &&
                              <div className="text-right col-md-6">
                                <Button className="pull-right" as="a" onClick={() => {this.props.pushState('/projects/login');}} color="blue">
                                  <Icon name="sign in" />  Log In or Register
                                </Button>
                              </div>
                            }
                            </div>
                            { this.state.searchQuery.length > 0 && this.state.searchResults.length === 0 && !this.state.datasetRequest &&
                              !this.state.datasetRequestSent &&
                              <div>
                                <p>No Results Found.</p>
                                <br />
                                <Button onClick={ () => this.setState({datasetRequest: true}) }>Create Dataset Request</Button>
                              </div>}
                            { this.state.datasetRequest && !this.props.user &&
                          <Form ref={form => this.form = form}>
                              <div style={{ height: '120px' }} />
                              <p>
                              Tell us more about the dataset you need, size, type etc. We will share the request with our network of dataset creators and if we find a match, we will connect you two.
                              </p>
                              <Form.Field >
                                <label>Email</label>
                                <input ref={(email) => {this.email = email;}} onChange={this.handleCreateChange.bind(this)} value={this.state.email} name="email" placeholder="Email" />
                              </Form.Field>
                              <Form.Field control={TextArea} onChange={this.handleCreateChange.bind(this)} value={this.state.description} name="description" label="Description"
                              placeholder="Tell us more about the dataset you need, size, type etc. We will share the request with our network of dataset creators and if we find a match, we will connect you two." />
                              <Button positive onClick={this.sendDatasetRequest}>Send Request</Button>
                            <Message negative hidden={!this.state.error}>
                              <p>{this.state.error}</p>
                            </Message>
                          </Form>
                            }
                            {this.state.datasetRequestSent &&
                              <p>
                              We have received your request and will soon get back to you.
                              </p>}
                          { this.state.datasetRequest && this.props.user &&
                            <div>
                            <Form ref={form => this.form = form}>
                              <div style={{ height: '120px' }} />
                              <p>
                              Tell us more about the dataset you need, size, type etc. We will share the request with our network of dataset creators and if we find a match, we will connect you two.
                              </p>
                              <Form.Field control={TextArea} onChange={this.handleCreateChange.bind(this)}
                                value={this.state.description} name="description"
                                label="Description"
                                placeholder="Tell us more about the dataset you need, size, type etc. We will share the request with our network of dataset creators and if we find a match, we will connect you two." />
                                <Button positive onClick={this.sendDatasetRequest}>Send Request</Button>
                            <Message negative hidden={!this.state.error}>
                              <p>{this.state.error}</p>
                            </Message>
                          </Form>
                          </div>
                            }
                            <br />
                              <Segment basic loading={this.state.loading || this.state.searchLoading} className="col-md-12">
                                  {this.getProjects(this.props.orgData.projects, this.state.selectedType, this.state.activePage, 20)}
                                  {
                                    this.state.searchQuery.length === 0 && this.state.typesCountMap[this.state.selectedType] > 20 &&
                                    <Pagination onPageChange={ (event, data) => {
                                      event.preventDefault();
                                      if (this.state.selectedType && this.state.selectedType !== 'All') {
                                        this.props.pushState(this.props.location.pathname + '?type=' + this.state.selectedType + '&page=' + data.activePage);
                                      } else {
                                        this.props.pushState(this.props.location.pathname + '?page=' + data.activePage);
                                      }
                                    }}
                                      nextItem={{
                                        content: '⟩',
                                        href: this.props.location.pathname + '?page=' + nextPage
                                      }}
                                      prevItem={{
                                        content: '⟨',
                                        href: this.props.location.pathname + '?page=' + prevPage
                                      }}
                                      activePage={this.state.activePage}
                                      totalPages={this.props.orgData.projects.length > 20 ? Math.floor(this.state.typesCountMap[this.state.selectedType] / 20) + 1 : 1} />
                                  }
                              </Segment>
                          </div>
                      }
                      {
                        !this.props.orgData &&
                        <Segment basic loading={!this.props.orgData}/>
                      }
      </div>

    );
  }
}
