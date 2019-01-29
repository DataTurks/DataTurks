import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
// import { Header } from 'semantic-ui-react';
import { Form, Message } from 'semantic-ui-react';
import { push } from 'react-router-redux';
import { sendInvite } from '../../helpers/dthelper';

@connect(
  state => ({user: state.auth.user, projects: state.dataturksReducer.projects}),
      dispatch => bindActionCreators({ pushState: push }, dispatch))
export default class TaggerAdd extends Component {
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
    this.createProject = this.createProject.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.inviteSent = this.inviteSent.bind(this);
    const options = [];
    const idMap = {};
    for (let index = 0; index < this.props.projects.length; index ++) {
      options.push({key: this.props.projects[index].projectDetails.id,
                    text: this.props.projects[index].projectDetails.name,
                    value: this.props.projects[index].projectDetails.id });
      idMap[this.props.projects[index].projectDetails.name] = this.props.projects[index].projectDetails.id;
    }

    this.state = { projectsNameIdMap: idMap, options, success: false, loading: false };
  }


  state = {
    loading: false,
    projectsNameIdMap: {},
    options: [],
    success: false,
    pid: '',
    email: ''
  };

  createProject() {
    this.props.pushState('/projects/import');
  }

  inviteSent(error, response) {
    console.log(' invite sent ', error, response);
    if (!error) {
      this.setState({ success: true, loading: false });
    }
  }

  handleSubmit = (response) => {
    console.log('response is', response);
    sendInvite(this.state.pid, this.state.email, this.inviteSent);
    this.setState({ loading: true });
  }

  handleChange(e1, { value }) {
    console.log(' handleChange ', e1.target.name, value);
    if (e1.target.name === 'email') {
      this.setState({ email: value, success: false });
    } else {
      this.setState({ pid: value, success: false });
    }
  }

  render() {
    console.log('taggder add state is ', this.state, this.props);
    let submitDisabled = true;
    if (this.state.pid && this.state.email && this.state.email.indexOf('@') > 0 ) {
      submitDisabled = false;
    }

    return (
      <div className="container" id="home-page">
          <Helmet title="Create Project" />
                      {
                          <div className="col-md-5 col-sm-offset-2" style={{ height: '500px' }}>
                            <h1>Add Collaborator</h1>
                              <Form loading={this.state.loading}>
                                  <Form.Select name="project" fluid label="Project" options={this.state.options} placeholder="Select Project" onChange={this.handleChange}/>

                                      <Form.Input name="email" label="Email" placeholder="joe@schmoe.com" onChange={this.handleChange} />
                                        <Message
                                          visible={this.state.success}
                                          success
                                          header="Collaborator Added"
                                          content="We have sent an email to collaborator"
                                        />

                                  <Form.Button disabled={submitDisabled} onClick={this.handleSubmit}>Submit</Form.Button>
                              </Form>
                          </div>
                      }

      </div>

    );
  }
}
