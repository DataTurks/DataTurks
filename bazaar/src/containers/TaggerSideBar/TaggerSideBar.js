import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import * as authActions from 'redux/modules/auth';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
import { Sidebar, Menu, Icon, Segment } from 'semantic-ui-react';

@connect(
  state => ({user: state.auth.user}),
  authActions)
export default class TaggerSideBar extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func
  }

  constructor(props) {
    console.log('sidebar props are ', props);
    super(props);
    this.selectMenu = this.selectMenu.bind(this);
  }

  state = {
    activeMenu: 'projects'
  };


  selectMenu(item, {name}) {
    this.setState({ activeMenu: name});
  }

  render() {
    const sidebarStyle = { width: 150 };
    console.log('sidebar state is ', this.state);
    const { activeMenu } = this.state;
    // const styles = require('./TaggerImport.scss');
    return (
      <div className="container">
        <Helmet title="Login"/>
        {
          <Segment color="blue" vertical style={ sidebarStyle }>
            <Sidebar.Pushable>
              <Sidebar as={Menu} animation="overlay" width="thin" visible icon="labeled" vertical>
            <Menu.Item name="projects"
                  active={activeMenu === 'projects'}
                  onClick={this.selectMenu}>
              <Icon name="list layout" />
              Projects
            </Menu.Item>
            <Menu.Item name="create" active={activeMenu === 'create'} onClick={this.selectMenu}>
              <Icon name="plus" />
              Create Project
            </Menu.Item>
          </Sidebar>
        </Sidebar.Pushable>
        </Segment>

        }

      </div>
    );
  }
}
