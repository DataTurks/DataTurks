import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
// import { IndexLink } from 'react-router';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
// import { isLoaded as isInfoLoaded, load as loadInfo } from 'redux/modules/info';
import { logout, verifyUser, signIn } from 'redux/modules/auth';
import { resetState } from 'redux/modules/dataturks';
import { push, replace } from 'react-router-redux';
import config from '../../config';
import { getUidToken, logEvent, refreshToken, getAPIKey } from '../../helpers/dthelper';
import { DUMMY_UID, timeConverter } from '../../helpers/Utils';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import ga from 'react-ga';
import { selectProject, getUserHomeData, setError, toggleMenu } from 'redux/modules/dataturks';
import '../../../semantic/dist/semantic.css';
import { Segment, Menu, Header, Icon, Button, Image, Label, Divider } from 'semantic-ui-react';
import Modal from "react-bootstrap/lib/Modal";
// import mixpanel from 'mixpanel-browser';
import firebase from 'firebase';
import ReactGA from 'react-ga';
import LoadingBar from 'react-redux-loading-bar';

/* global FB */
// import { asyncConnect } from 'redux-async-connect';

// @asyncConnect([{
//   promise: ({store: {dispatch, getState}}) => {
//     const promises = [];
//     console.log('app asyncConnect');
//     // if (!isInfoLoaded(getState())) {
//     //   promises.push(dispatch(loadInfo()));
//     // }
//     // if (!isAuthLoaded(getState())) {
//     //   promises.push(dispatch(loadAuth()));
//     // }

//     return Promise.all(promises);
//   }
// }])
@connect(
  state => ({user: state.auth.user, globalError: state.dataturksReducer.globalError, menuHidden: state.dataturksReducer.menuHidden,
    orgName: state.dataturksReducer.orgName, projects: state.dataturksReducer.projects, plan: state.dataturksReducer.plan,
    loggingIn: state.auth.loggingIn, labelsDone: state.dataturksReducer.labelsDone, labelsAllowed: state.dataturksReducer.labelsAllowed, subscriptionExpiryTimestamp: state.dataturksReducer.subscriptionExpiryTimestamp}),
  dispatch => bindActionCreators({ getUserHomeData,
   logout, pushState: push, replaceState: replace, signIn, toggleMenu, resetState, selectProject, verifyUser, setError }, dispatch))
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    resetState: PropTypes.func,
    plan: PropTypes.string,
    labelsAllowed: PropTypes.int,
    labelsDone: PropTypes.int,
    subscriptionExpiryTimestamp: PropTypes.string,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    toggleMenu: PropTypes.func,
    location: PropTypes.object,
    menuHidden: PropTypes.boolean,
    projects: PropTypes.array,
    selectProject: PropTypes.func,
    replaceState: PropTypes.func,
    history: PropTypes.object,
    getUserHomeData: PropTypes.func,
    verifyUser: PropTypes.func,
    loggingIn: PropTypes.boolean,
    orgName: PropTypes.string,
    globalError: PropTypes.boolean,
    setError: PropTypes.func,
    signIn: PropTypes.func
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  constructor(props) {
    console.log('App props are ', props);
    super(props);
    this.selectMenu = this.selectMenu.bind(this);
    this.getProjectNames = this.getProjectNames.bind(this);
    this.selectProjectMenu = this.selectProjectMenu.bind(this);
  }

  state = {
    activeMenu: 'projects',
    projectNameIdMap: {},
    projectNames: [],
    refresh: false,
  };

  componentWillMount() {
    logEvent('buttons', 'User visit started');
    console.log('app componnent will mount', this.props, config.servingEnv);
    if (this.props.user && config.servingEnv === 'online') {
      this.props.verifyUser();
    }
    // const script = document.createElement('script');

    // script.src = 'window["_fs_debug"] = false; window["_fs_host"] = "fullstory.com"; window["_fs_org"] = "BQYDB"; window["_fs_namespace"] = "FS"; (function(m,n,e,t,l,o,g,y){  if (e in m) {if(m.console && m.console.log) { m.console.log("FullStory namespace conflict. Please set window["_fs_namespace"]."");} return;}  g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[]; o=n.createElement(t);o.async=1;o.src="https://' + window._fs_host + '/s/fs.js"; y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y); g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){g(l,v)}; y="rec";g.shutdown=function(i,v){g(y,!1)};g.restart=function(i,v){g(y,!0)}; y="consent";g[y]=function(a){g(y,!arguments.length||a)}; g.identifyAccount=function(i,v){o="account";v=v||{};v.acctId=i;g(o,v)}; g.clearUserCookie=function(){}; })(window,document,window["_fs_namespace"],"script","user");';
    // script.async = true;

    // document.body.appendChild(script);
    this.startErrorLog();
  }

  componentDidMount() {
    ga.initialize('UA-110079535-1');
    ga.pageview(this.props.location.pathname);

    // window.fbAsyncInit = function() {
    //   FB.init({
    //     appId: '192074501369792',
    //     cookie: true,  // enable cookies to allow the server to access the session
    //     xfbml: true,  // parse social plugins on this page
    //     version: 'v2.5' // use version 2.1
    //   });
    // };

        // Load the SDK asynchronously
    // (function(d1, s1, id) {
    //   let js;
    //   const fjs = d1.getElementsByTagName(s1)[0];
    //   if (d1.getElementById(id)) return;
    //   js = d1.createElement(s1); js.id = id;
    //   js.src = '//connect.facebook.net/en_US/sdk.js';
    //   fjs.parentNode.insertBefore(js, fjs);
    // }(document, 'script', 'facebook-jssdk'));
    console.log('app did mount', this.props);
    if (!this.props.projects && this.props.user) {
      if (config.servingEnv === 'online') {
        firebase.auth().onAuthStateChanged(function(user) {
          refreshToken();
          console.log('user refreshed', user);
        });
//        mixpanel.identify(this.props.user.email);
        if (window.FS) {
          window.FS.identify(this.props.user.uid, { displayName: this.props.user.firstName, email: this.props.user.email, plan: this.props.plan });
        }
        ReactGA.set({ userId: this.props.user.uid });
        if (window.Raven) {
          console.log('setting raven context', this.props.user.email);
          window.Raven.setUserContext({
            email: this.props.user.email
          });
        }
      }
      if (getUidToken().uid !== DUMMY_UID) {
        this.props.getUserHomeData(getUidToken());
      }
    }
    if (this.props.location.pathname === '/projects' && !this.props.user) {
      // logout
      if (config.servingEnv === 'online') {
        const cu = firebase.auth().getCurrentUser;
        console.log('current user is', cu);
        if (cu) {
          this.props.signIn(cu);
        } else {
          this.props.replaceState('/projects/login');
        }
      } else {
        if (getUidToken().uid === DUMMY_UID) {
          this.props.replaceState('/projects/login');
        }
      }
    } else if (this.props.user && config.servingEnv === 'onpremise') {
      if (getUidToken().uid === DUMMY_UID) {
        console.log('GOT dummy uid');
        this.props.logout();
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('next props in app', nextProps);
    if (this.props.location.pathname !== nextProps.location.pathname) {
      ga.pageview(nextProps.location.pathname);
    }
    if (this.props.globalError && nextProps.globalError) {
      console.log('resetting global error');
      this.props.setError(false);
    }
    if (!this.props.projects && nextProps.projects) {
      this.setState({ refresh: true});
    }
    if (this.props.loggingIn && !nextProps.loggingIn) {
      this.props.getUserHomeData(getUidToken());
    }
    if (!this.props.user && nextProps.user) {
      // login
      if (nextProps.user && nextProps.user.email) {
//        mixpanel.identify(nextProps.user.email);
        ReactGA.set({ userId: nextProps.user.uid });
        if (window.Raven) {
          window.Raven.setUserContext({
            email: nextProps.user.email
          });
        }
      }
      this.props.pushState('/projects');
    } else if ((this.props.location.pathname === '/projects' && !this.props.user && !nextProps.user) || (this.props.user && !nextProps.user)) {
      // logout
      this.props.replaceState('/projects/login');
    }
    // const slashCount = this.props.location.pathname.split('/');
    // console.log('slashCount', slashCount);
  }

  componentWillUnmount() {
    console.log('unmounting Component');
    this.props.resetState();
  }

  getProjectNames(projectArray) {
    const names = [];
    console.log('project array is ', projectArray);
    if (projectArray) {
      for (let index = 0; index < projectArray.length; index ++) {
        // names.push(projectArray[index].name);
        // idMap[projectArray[index].name] = projectArray[index].id;
        const name = projectArray[index].projectDetails.name;
        const orgName = projectArray[index].projectDetails.orgName;
        const id = projectArray[index].projectDetails.id;
        names.push(
        <Menu.Item key={index} name={name} as="a" href={'/projects/' + orgName + '/' + name} active={this.state.activeMenu === id} onClick={(event) => { this.selectProjectMenu(id, orgName, name); event.preventDefault();}}>
          {name}
        </Menu.Item>
        );
      }
    }
    return names;
  }

  startErrorLog() {
    window.onerror = (message, file, line, column, errorObject) => {
      console.log('startErrorLog ', message, file, line, column, errorObject);
      const column1 = column || (window.event && window.event.errorCharacter);
      const stack = errorObject ? errorObject.stack : null;
      this.props.setError(true);
      const data = {
        message: message,
        file: file,
        line: line,
        column: column1,
        errorStack: stack,
      };
      console.log('error log data is ', data);
    };
  }

  selectProjectMenu(id, orgName, projectName) {
    this.props.selectProject(id);
    this.setState({ activeMenu: id });
    this.props.pushState('/projects/' + orgName + '/' + projectName);
  }

  selectMenu(item, {name}) {
    console.log('selecing menu ', item, name);
    this.setState({ activeMenu: name});
    if (name === 'home') {
      this.props.pushState('/projects');
    } else {
      this.props.pushState('/projects/' + name);
    }
    item.preventDefault();
  }

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
  };

  apiKeyFetched = (error, response) => {
    console.log('apiKeyFetched ', error, response);
    if (error) {
      let errorM = "Failed";
      if (response && response.body && response.body.message) {
        errorM = response.body.message;
      }
      this.setState({ apiKeyError: errorM, apiKeyResponse: undefined });
    } else {
      this.setState({ apiKeyError: undefined, apiKeyResponse: response.body });
    }
  }

  render() {
    console.error('version is 1.6');
    const {user} = this.props;
    const styles = require('./App.scss');
    const { activeMenu } = this.state;
    let projectMenuClass = 'hidden';
    const projectArray = this.getProjectNames(this.props.projects);
    if (projectArray.length > 0) {
      projectMenuClass = '';
    }
    let width = '15%';
    let imageSize = 'tiny';
    if (this.props.menuHidden) {
      width = '5%';
      imageSize = 'mini';
    }
    console.log('app render', this.props, this.state);
    const pathSplits = this.props.location.pathname.split('/');
    // let menuHidden = state.menuHidden;
    const spaceStyle = { height: '60px'};
    let spaceOpen = false;
    let marginTop = '20px';
    console.log('locationchange', pathSplits);
    if (pathSplits.length === 5 && pathSplits[4] === 'space') {
      spaceOpen = { height: '0px'};
      marginTop = '0px';
    }
    if (spaceOpen && window && window.drift) {
      window.drift.on('ready', function(api) {
          // hide the widget when it first loads
        api.widget.hide()
      })
    } else if (window && window.drift) {
      window.drift.on('ready', function(api) {
          // hide the widget when it first loads
        api.widget.show()
      })
    }
    return (
      <div className={styles.app}>
        <Helmet {...config.app.head}
                script={[
                  {'type': 'application/ld+json', innerHTML: `{ "@context": "http://schema.org" }`}
                ]} />
         <LoadingBar style={{ zIndex: 9999, backgroundColor: '#007BA7', height: '5px', position: 'absolute', top: 0, left: 0 }} />
         { spaceOpen && <div style={{ height: '1rem', backgroundColor: '#00B5AD' }} /> }
         { !spaceOpen &&
         <Navbar fixedTop style={spaceStyle}>
         <Navbar.Header>
            <Navbar.Brand>
              <a href="https://dataturks.com">
                <div className={styles.brand}/>
                <span style={{color: '#ffffff'}}>
                  <h3 className={styles.brandLink}>
                  {config.app.title}
                  </h3>
                </span>
              </a>
            </Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>

          <Navbar.Collapse eventKey={0}>
            <Nav navbar pullRight>
            {<li role="presentation" className="logout-link">
            <a href="https://dataturks.com/help/help.php" target="_blank">
              <h4 className="nav-link">Documentation</h4>
            </a>
          </li>}
            {<li role="presentation" className="logout-link">
            <a href="https://docs.dataturks.com/" target="_blank">
              <h4 className="nav-link">APIs</h4>
            </a>
          </li>}
            {
              <LinkContainer to="/projects/dataturks">
                <NavItem eventKey={7} className="logout-link">
                <h4 className="nav-link">
                  Try Demo
                </h4>
                </NavItem>
              </LinkContainer>}

              {!user &&
              <LinkContainer to="/projects/login">
                <NavItem eventKey={6}>
                <h4 className="nav-link">
                  Sign Up/Login
                </h4>
                </NavItem>
              </LinkContainer>}
              {user &&
              <LinkContainer to="/projects/login">
                <NavItem eventKey={7} className="logout-link" onClick={this.handleLogout}>
                <h4 className="nav-link">
                  Logout
                </h4>
                </NavItem>
              </LinkContainer>}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      }

      <div>
      <Segment.Group basic horizontal style={{ marginTop: `${marginTop}`, minHeight: '600px'}}>
      { user && user.uid && !spaceOpen &&
      <Segment basic vertical className={styles.mobile_hide} style={{ minWidth: width, maxWidth: width, marginTop: '2%' }}>
          <div className="text-right">
            {this.props.menuHidden && <Icon name="toggle on" onClick={() => { this.props.toggleMenu(false);}}/> }
            {!this.props.menuHidden && <Icon name="toggle off" onClick={() => {this.props.toggleMenu(true);}}/> }
          </div>
          {
              <div className="text-center">
              { user.profilePic &&
                <Image avatar src={user.profilePic} size={imageSize} />
              }
              { !user.profilePic &&
                <Icon name="user" color="blue" size="big" />
              }
                {!this.props.menuHidden &&
                <p> {user.firstName}</p> }
              </div>
          }
            <br />
            <br />
          <Menu secondary vertical fluid icon="labeled" widths="one" size="large">

            <Menu.Item name="home"
                  active={activeMenu === 'projects'}
                  onClick={this.selectMenu}>
              <Icon name="home" color="blue" />
              {!this.props.menuHidden && <h7> Home </h7>}
            </Menu.Item>
            <Menu.Item name="create" active={activeMenu === 'create'} href={'/projects/create'} onClick={this.selectMenu}>
              <Icon name="plus" color="blue" />
              {!this.props.menuHidden && <h7> Create Dataset </h7>}
            </Menu.Item>
                  { this.props.plan && !this.props.menuHidden &&
                    <div>
                    <Button onClick={ () => { this.setState({ apiKeyModal: true }); getAPIKey(this.apiKeyFetched.bind(this));}}>
                      Get API Key
                    </Button>
                  </div>}
            <br />

          { !this.props.menuHidden && this.props.labelsAllowed &&
          <div>
          <Divider small />
            { !this.props.plan &&
            <h7 className="text-left header"> Account Details </h7>
            }
                { this.props.plan &&
                  <Label color="green">{this.props.plan}</Label>}
              <br />
                <div className="text-center">
                <p> Labels Used </p>
                <Label> {this.props.labelsDone} </Label>
                <p> Total Labels in Package</p>
                <Label> {this.props.labelsAllowed} </Label>
                { this.props.subscriptionExpiryTimestamp &&
                  <div>
                    <p> Subsription Expiry </p>
                    <Label> {timeConverter(this.props.subscriptionExpiryTimestamp / 1000)}</Label>
                  </div>
                }
              </div>
            <Divider small />
          </div>
          }

            <br />
                {!this.props.menuHidden &&
                  <Menu.Item className={projectMenuClass} style={{ padding: '2%' }}>
                    <Menu.Header><h7> Datasets </h7> </Menu.Header>

                    <Menu.Menu style={{ padding: '2%' }}>
                      {projectArray}
                    </Menu.Menu>
                  </Menu.Item>
                }
            </Menu>
        </Segment>
      }


        <div className="col-md-0.5" />
          <Segment basic vertical>
          {this.state.apiKeyModal &&
          <div>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Title>API Authentication</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                {  this.state.apiKeyError &&
                   <p> {this.state.apiKeyError} </p>
                }
                {
                  !this.state.apiKeyError && this.state.apiKeyResponse &&
                  <p>
                    All APIs take a ‘key’ and ‘secret’ param in the header.
                    These key-secret pairs are associated with a user and allows the same permission to the user as she has on the Dataturks website,
                    ex: if she is an admin of a project, she can upload data to the project etc.
                    <br />
                    <pre>
                      {JSON.stringify(this.state.apiKeyResponse, null, 2)}
                    </pre>
                    <br />
                    API Documentation : <a href="https://docs.dataturks.com/" target="_blank">Docs</a>
                  </p>
                }
              </Modal.Body>
              <Modal.Footer>
                <Button
                  onClick={() => {
                    this.setState({ apiKeyModal: false });
                  }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
            }
            { !spaceOpen && <div style={{height: '30px'}} /> }
            <ErrorBoundary>
              {this.props.children}
            </ErrorBoundary>
            </Segment>
        </Segment.Group>
        </div>

        {/*
        <div className="text-center">
        <div className="fb-comments" data-href="https://www.facebook.com/Datatrks/" data-numposts="10"></div>
        </div>
        */}
        <div className="centered footer">
        <div className="footer-links">
        <a href="/" className="brand footer-brand w-nav-brand">
            <h4>
            Dataturks
            </h4>
            </a>
            <a target="_blank" href="https://dataturks.com/blog/blog.php" className="footer-link w-inline-block">
                <div>Blog</div>
            </a>
            <a target="_blank" href="mailto:support@dataturks.com?subject=Hey%2C%20Turk!" className="footer-link w-inline-block">
                <div>Contact</div>
            </a>
            <a target="_blank" href="https://dataturks.com/privacy.php" className="footer-link w-inline-block">
                <div>Privacy Policy</div>
            </a>
          </div>
            <div className="footer-links centered">
                <div className="text-center marginTop">
                    <hr className="small" />
                    <p>(+91) 080-331-72755, +91-99010-49915, +91-88614-08222</p>
                    <p>contact@dataturks.com</p>
                </div>
            </div>

    </div>


      </div>
    );
  }
}
