import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
// import { Header } from 'semantic-ui-react';
import { Button } from 'semantic-ui-react';
import { push } from 'react-router-redux';

@connect(
  state => ({user: state.auth.user, projects: state.dataturksReducer.projects}),
      dispatch => bindActionCreators({ pushState: push }, dispatch))
export default class TaggerError extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    pushState: PropTypes.func,
    projects: PropTypes.array
  }

  constructor(props) {
    console.log('props are ', props);
    super(props);
  }


  render() {
    console.log('TaggerError state is ', this.state, this.props);
    return (
      <div style={{ background: 'white'}} className="text-center">
          <Helmet title="Error while loading" />
              <div >
                  <h2> Looks like we are having some issues </h2>
                  <div className="text-left">
                  <p> This is embarrassing, and we are sorry for this. We have notified our engineers to look into this with utmost priority</p>
                  <p> Meanwhile this is getting fixed, please give us second chance</p>
                  </div>
                  <br />
                  <br />
                  <br />
                  <br />
                  <Button positive onClick={ () => { this.props.pushState('/projects'); }}>Home</Button>
              </div>
      </div>

    );
  }
}
