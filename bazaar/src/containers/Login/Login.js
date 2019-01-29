import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import * as authActions from 'redux/modules/auth';
import { GoogleLogin } from 'react-google-login';
import FontAwesome from 'react-fontawesome';

@connect(
  state => ({user: state.auth.user}),
  authActions)
export default class Login extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func
  }

  handleSubmit = (response) => {
    console.log('response', response, this.props.login);
    if (response && response.profileObj) {
      this.props.login(response.profileObj.name, response.profileObj.imageUrl);
    }
  }

  render() {
    const {user, logout} = this.props;
    const styles = require('./Login.scss');
    return (
      <div className={styles.loginPage + ' container text-center'}>
        <Helmet title="Login"/>
        <h1>Login</h1>
        {!user &&
        <div>
          <form className="login-form form-inline">
            <div className="form-group">
            <GoogleLogin
                clientId="366714989770-binh1uk4gctmgi08b61094td8ofa3u53.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={this.handleSubmit}
                onFailure={this.handleSubmit}
              >
                  <FontAwesome name = "google" />
                  <span> &nbsp; Using Google</span>
              </GoogleLogin>
            </div>
          </form>
        </div>
        }
        {user &&
        <div>
          <p>You are currently logged in as {user.name}.</p>

          <div>
            <button className="btn btn-danger" onClick={logout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
          </div>
        </div>
        }
      </div>
    );
  }
}
