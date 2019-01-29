import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Helmet from 'react-helmet';
import { login, signIn, logout, resetFlags } from 'redux/modules/auth';
import { replace } from 'react-router-redux';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
// import { Header } from 'semantic-ui-react';
import { Button, Icon, Message, Transition, Segment, Form, Divider, Label } from 'semantic-ui-react';
import { refreshToken, logEvent, createUserWithPassword, dtLogin } from '../../helpers/dthelper';
import { publicEmails } from '../../helpers/Utils';
import firebase from 'firebase';
// import mixpanel from 'mixpanel-browser';
import ReactGA from 'react-ga';
import swot from 'swot-simple';
import config from '../../config';

@connect(
  state => ({user: state.auth.user, userCreated: state.auth.userCreated}),
  dispatch => bindActionCreators({login, signIn, logout, replaceState: replace, resetFlags }, dispatch))
export default class TaggerLogin extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    signIn: PropTypes.func,
    replaceState: PropTypes.func,
    userCreated: PropTypes.bool,
    resetFlags: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGitSubmit = this.handleGitSubmit.bind(this);
    this.handleTwSubmit = this.handleTwSubmit.bind(this);
    this.firebaseCallback = this.firebaseCallback.bind(this);
    this.firebaseIdTokenCallBack = this.firebaseIdTokenCallBack.bind(this);
    this.firebaseCreateUserCallback = this.firebaseCreateUserCallback.bind(this);
    this.errorCallback = this.errorCallback.bind(this);
    this.createAccount = this.createAccount.bind(this);
    this.handleEmailSignIn = this.handleEmailSignIn.bind(this);
    this.firebaseIdTokenCreateUserCallBack = this.firebaseIdTokenCreateUserCallBack.bind(this);
  }

  state = {
    loading: false,
    emailSignup: false,
    email: '',
    fname: '',
    lname: '',
    password: '',
    error: undefined
  }

  componentWillMount() {
    if (this.props.user) {
      this.props.replaceState('/projects');
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('next props in login', this.props, nextProps);
    if (!this.props.userCreated && nextProps.userCreated) {
      console.log('next props in login', nextProps);
      this.props.signIn(this.state.userInfo);
    }
  }

  componentWillUnmount() {
    console.log('unmounting Component');
    this.props.resetFlags();
  }

  getEmailCategory(email) {
    try {
      const splits = email.split('@');
      if (swot.isAcademic(email)) {
        return 'Academic';
      } else if (publicEmails.includes(splits[1])) {
        return 'Public';
      }
      return 'Business';
      // statements
    } catch (event) {
      // statements
      console.log(event);
      return 'Category identiy error';
    }
  }

  firebaseCallback(result) {
    console.log('result is', result);
    logEvent('buttons', 'Login Firebase CallBack');
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(this.firebaseIdTokenCallBack.bind(this, result))
    .catch(function(error) {
      console.log('error generating token ', error);
      // Handle error
    });
  }

  firebaseCreateUserCallback(result) {
    console.log('result is', result);
    logEvent('buttons', 'Login Firebase CallBack');
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(this.firebaseIdTokenCreateUserCallBack.bind(this, result))
    .catch(function(error) {
      console.log('error generating token ', error);
      // Handle error
    });
  }

  dtCreateUserCallback(error, response) {
    console.log('dtCreateUserCallback', error, response);
    if (!error) {
      console.log('dtCreateUserCallback', error, response);
      this.setState({ loading: false });
      window.sessionStorage.setItem('uid', response.body.id);
      window.sessionStorage.setItem('token', response.body.token);
      this.props.signIn({authType: 'password',
                          firstName: this.state.fname,
                          lastName: this.state.lname,
                          fullName: this.state.fname + " " + this.state.lname,
                          uid: response.body.id,
                          email: this.state.email,
                          });
      this.setState({ userInfo: {authType: 'emailSignup',
                          firstName: this.state.fname,
                          lastName: this.state.lname,
                          fullName: this.state.fname + ' ' + this.state.lname,
                          email: this.state.email,
                          uid: response.body.id,
                          } });
    } else {
      alert(error);
      this.setState({ loading: false });
    }
  }

  firebaseIdTokenCreateUserCallBack(result, idToken) {
    console.log('idtoken is ', idToken, result);
    window.sessionStorage.setItem('token', idToken);
    window.sessionStorage.setItem('uid', result.uid);
    setTimeout(function() { refreshToken(); }, 30);
    const category = this.getEmailCategory(result.email);
    logEvent('user', category);
//    mixpanel.alias(result.email);
    ReactGA.set({ userId: result.uid });
//    mixpanel.people.set({
//      '$email': result.email,
//    });
    if (this.state.emailSignup) {
      logEvent('buttons', 'New user firebase success');
      logEvent('buttons', 'emailSignUp');
      this.props.login({authType: 'emailSignup',
                          firstName: this.state.fname,
                          secondName: this.state.lname,
                          fullName: this.state.fname + this.state.lname,
                          email: result.email,
                          emailVerified: result.emailVerified,
                          phone: result.phoneNumber,
                          profilePic: result.photoURL
                          }, result.uid, idToken);
      this.setState({ userInfo: {authType: 'emailSignup',
                          firstName: this.state.fname,
                          lastName: this.state.lname,
                          fullName: this.state.fname + this.state.lname,
                          email: result.email,
                          emailVerified: result.emailVerified,
                          uid: result.uid,
                          phone: result.phoneNumber,
                          profilePic: result.photoURL
                          } });
      firebase.auth().currentUser.sendEmailVerification().then(function() {
       // Email sent.
        console.log('Verification email sent');
      }, function(error) {
        // An error happened.
        console.log('couldnt sent verification emailSignu', error);
      });
    } else if (this.state.emailSignIn) {
      logEvent('buttons', 'Old User firebase success');
      logEvent('buttons', 'emailSignIn');
//      mixpanel.alias(result.email);
      logEvent('user', this.getEmailCategory(result.email));
//      mixpanel.identify(result.email);
//      if (window.FS) {
//        window.FS.identify(result.uid, { displayName: result.displayName, email: result.email });
//      }
      ReactGA.set({ userId: result.uid });
//      mixpanel.people.set({
//        '$email': result.email,
//      });
      this.props.signIn({authType: 'password',
                          firstName: result.displayName,
                          lastName: result.displayName,
                          fullName: result.displayName,
                          uid: result.uid,
                          emailVerified: result.emailVerified,
                          email: result.email,
                          phone: result.phoneNumber,
                          profilePic: result.photoURL
                          });
    }
  }

  firebaseIdTokenCallBack(result, idToken) {
    console.log('idtoken is ', idToken, result);
    window.sessionStorage.setItem('token', idToken);
    window.sessionStorage.setItem('uid', result.user.uid);
    setTimeout(function() { refreshToken(); }, 30);
    if (result.additionalUserInfo.isNewUser) {
      logEvent('buttons', 'New user firebase success');
//      mixpanel.alias(result.user.email);
      logEvent('user', this.getEmailCategory(result.user.email));
      ReactGA.set({ userId: result.user.uid });
//      mixpanel.people.set({
//        '$email': result.user.email,
//      });
      this.props.login({authType: result.credential.providerId,
                          firstName: result.additionalUserInfo.profile.given_name,
                          secondName: result.additionalUserInfo.profile.family_name,
                          fullName: result.user.displayName,
                          email: result.user.email,
                          phone: result.user.phoneNumber,
                          profilePic: result.user.photoURL
                          }, result.user.uid, idToken);
      this.setState({ userInfo: {authType: result.credential.providerId,
                          firstName: result.additionalUserInfo.profile.given_name,
                          lastName: result.additionalUserInfo.profile.family_name,
                          fullName: result.user.displayName,
                          email: result.user.email,
                          uid: result.user.uid,
                          phone: result.user.phoneNumber,
                          profilePic: result.user.photoURL
                          } });
    } else {
      logEvent('buttons', 'Old User firebase success');
//      mixpanel.alias(result.user.email);
      logEvent('user', this.getEmailCategory(result.user.email));
//      mixpanel.identify(result.user.email);
//      if (window.FS) {
//        window.FS.identify(result.user.uid, { displayName: result.user.displayName, email: result.user.email });
//      }
      ReactGA.set({ userId: result.user.uid });
//      mixpanel.people.set({
//        '$email': result.user.email,
//      });
      this.props.signIn({authType: result.credential.providerId,
                          firstName: result.additionalUserInfo.profile.given_name,
                          lastName: result.additionalUserInfo.profile.family_name,
                          fullName: result.user.displayName,
                          uid: result.user.uid,
                          email: result.user.email,
                          phone: result.user.phoneNumber,
                          profilePic: result.user.photoURL
                          });
    }
  }

  errorCallback(error) {
    console.log('error is', error);
    logEvent('buttons', 'Login Error', error.message);
    this.setState({ loading: false, error: error.message});
  }

  handleSubmit = (response) => {
    console.log('response', response, this.props.login);
    this.setState({loading: true});
    logEvent('buttons', 'Google Login');
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(googleProvider).then(this.firebaseCallback).catch(this.errorCallback);
  }

  createAccount(event) {
    console.log('create account ', event, this.email, this.password);
    if (this.state.email.length === 0 || !this.state.email.includes('@')) {
      this.setState({ error: 'Invalid Email'});
    } else if (this.state.password.length <= 6) {
      this.setState({ error: 'Password should be atleast 6 letters long'});
    } else if (this.state.fname.length < 2) {
      this.setState({ error: 'Please enter first name'});
    } else if (this.state.lname.length < 2) {
      this.setState({ error: 'Please enter last name'});
    } else if (this.state.email.length > 0 && this.state.email.includes('@') && this.state.password.length > 6) {
      this.setState({ loading: true});
      if (config.servingEnv === 'online') {
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).
          then(this.firebaseCreateUserCallback).catch(this.errorCallback);
      } else {
        createUserWithPassword(this.state.fname, this.state.lname, this.state.email, this.state.password, this.dtCreateUserCallback.bind(this));
      }
    } else {
      this.setState({ error: 'Please enter valid values '});
    }
  }

  handleTwSubmit = (response) => {
    console.log('response', response, this.props.login);
    this.setState({loading: true});
    const provider = new firebase.auth.TwitterAuthProvider();

    firebase.auth().signInWithPopup(provider).then(this.firebaseCallback).catch(this.errorCallback);
  }

  handleEmailSignIn = (response) => {
    console.log('response', response, this.props.login);
    this.setState({loading: true, emailSignup: false, emailSignIn: true});
    if (config.servingEnv === 'online') {
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(this.firebaseCreateUserCallback).catch(this.errorCallback);
    } else {
      dtLogin(this.state.email, this.state.password, this.dtCreateUserCallback.bind(this));
    }
  }

  handleGitSubmit = (response) => {
    console.log('response', response, this.props.login);
    this.setState({loading: true});
    const provider = new firebase.auth.GithubAuthProvider();
    logEvent('buttons', 'Git Login');

    firebase.auth().signInWithPopup(provider).then(this.firebaseCallback).catch(this.errorCallback);
  }

  handleCreateChange = (event) => {
    console.log('handleCreateChange ', event.target.name, event.target.value);
    // this.setState({ eventtarget.name: event.target.value });
    if (event.target.name === 'email') {
      this.setState({ email: event.target.value });
    } else if (event.target.name === 'password') {
      this.setState({ password: event.target.value });
    } else if (event.target.name === 'fname') {
      this.setState({ fname: event.target.value });
    } else if (event.target.name === 'lname') {
      this.setState({ lname: event.target.value });
    }
  }

  forgotPassword = () => {
    console.log('forgot password', this.email.value);
    if (this.email.value && this.email.value.includes('@')) {
      firebase.auth().sendPasswordResetEmail(this.email.value).then(function() {
          // Email sent.
        alert('Password reset email sent');
      }).catch(function(error) {
          // An error happened.
        console.log('error ', error);
        alert('Error in resetting in email password', error.message);
      });
    } else {
      alert('Please enter valid email');
    }
  }

  render() {
    const {user} = this.props;
    console.log('TaggerLogin props are ', config, this.props, this.state);
    // const styles = require('./TaggerLogin.scss');
    return (
      <div>
        <Helmet title="Login"/>
        {!user &&
      <div className="row" style={{padding: '5% 20% 10% 15%'}}>
        <Segment basic loading={this.state.loading}>
          <div className="col-md-7 text-left" style={{marginBottom: '10%'}}>
              <h1 style={{fontSize: '3em', letterSpacing: 'normal' }}> Super Easy Data Annotations </h1>
              <p style={{fontSize: '1.4em'}}>Invite your team and generate high quality labeled data in minutes</p>
              <p style={{fontSize: '0.8em', color: 'lightslategray'}}>By signing up on Dataturks, you agree with our privacy policy and terms. </p>
          </div>
        <Transition visible animation="browse" duration={2000}>

            <div className="col-md-5 text-center"
             style={{marginTop: '-5%', background: 'black', height: '150%', paddingBottom: '10%', paddingTop: '1%', border: '1px solid lightslategray',
    boxShadow: '-1px 1px lightslategray,-2px 2px lightslategray, -3px 3px lightslategray, -4px 4px lightslategray, -5px 5px lightslategray' }}>
                    { !this.state.emailSignup && <div style={{ marginTop: '5%'}}>
                          <Form onSubmit={this.handleEmailSignIn} inverted inline ref={form => this.form = form}>
                            <h2 style={{ color: 'white'}}>Log in</h2>
                            <Form.Group widths="equal">
                            <Form.Field>
                              <label>Email</label>
                              <input ref={(email) => {this.email = email;}} type="email" onChange={this.handleCreateChange.bind(this)} value={this.state.email} name="email" placeholder="me@Email.com" />
                            </Form.Field>
                            <Form.Field>
                              <label>Password</label>
                              <input ref={(password) => {this.password = password;}} value={this.state.password} onChange={this.handleCreateChange.bind(this)} name="password" type="password" placeholder="Enter Password" />
                            </Form.Field>
                            </Form.Group>
                            <br />
                            <Button size="tiny" type="submit">Log in</Button>
                              <br />
                              <br />
                              <a as="a" onClick={this.forgotPassword.bind(this)} style={{ color: 'white'}}>Forgot Password ?</a>
                              <br />
                              <h6 style={{ color: 'white'}}> Don't have an account yet? &nbsp;
                              <Label color="green" as="a" onClick={() => { this.setState({emailSignup: true});}}>  Sign Up</Label>
                              </h6>
                          </Form>
                            <Message negative hidden={!this.state.error}>
                              <p>{this.state.error}</p>
                            </Message>
                           {config.servingEnv === 'online' && <div>
                          <Divider style={{ padding: '5%', backgroundColor: 'black', color: 'white'}} horizontal>Or</Divider>
                        <br />

                            <div>
                            <Button disabled={this.state.loading} color="grey" onClick={this.handleGitSubmit}>
                                  <Icon name="github" /> Sign in with Gihub
                                </Button>
                            </div>
                        <br />
                            <div>
                              <Button disabled={this.state.loading} color="google plus" onClick={this.handleSubmit}>
                                    <Icon name="google plus" /> Sign in with Google
                                  </Button>
                              </div>
                          </div> }
                    </div> }
                    { this.state.emailSignup &&
                      <div style={{ marginTope: '-10%'}}>
                          <Form inverted ref={form => this.form = form}>
                            <Form.Group widths="equal">
                              <Form.Field>
                                <label>First Name</label>
                                <input ref={(fname) => {this.fname = fname;}} type="text" onChange={this.handleCreateChange.bind(this)} value={this.state.fname} name="fname" placeholder="First Name" />
                              </Form.Field>
                              <Form.Field>
                                <label>Last name</label>
                                <input ref={(lname) => {this.lname = lname;}} type="text" onChange={this.handleCreateChange.bind(this)} value={this.state.lname} name="lname" placeholder="Last Name" />
                              </Form.Field>
                            </Form.Group>

                            <Form.Field>
                              <label>Email</label>
                              <input ref={(email) => {this.email = email;}} type="email" onChange={this.handleCreateChange.bind(this)} value={this.state.email} name="email" placeholder="me@Email.com" />
                            </Form.Field>
                            <Form.Field>
                              <label>Password</label>
                              <input ref={(password) => {this.password = password;}} value={this.state.password} onChange={this.handleCreateChange.bind(this)} name="password" type="password" placeholder="Create a password" />
                            </Form.Field>
                            <Button type="submit" onClick={this.createAccount.bind(this)}>Sign Up</Button>
                            <Message negative hidden={!this.state.error}>
                              <p>{this.state.error}</p>
                            </Message>
                          </Form>
                      </div>
                    }
              </div>
          </Transition>
          </Segment>
      </div>
        }
        {user &&
        <div>
          <p>You are currently logged in as {user.name}.</p>

          <div>
            <button className="btn btn-danger" onClick={this.props.logout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
          </div>
        </div>
        }
      </div>
    );
  }
}
