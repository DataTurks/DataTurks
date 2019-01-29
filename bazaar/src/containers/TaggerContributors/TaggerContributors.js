import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {bindActionCreators} from 'redux';
// import { GoogleLogin } from 'react-google-login';
// import FontAwesome from 'react-fontawesome';
// import { Header } from 'semantic-ui-react';
import { getProjectDetails } from 'redux/modules/dataturks';
import { Button, Segment, Breadcrumb, Icon, List, Image, Label } from 'semantic-ui-react';
import { push } from 'react-router-redux';
import Modal from 'react-bootstrap/lib/Modal';
import { removeContributor, logEvent, getUidToken } from '../../helpers/dthelper';

@connect(
  state => ({user: state.auth.user, projects: state.dataturksReducer.projects,
            currentProject: state.dataturksReducer.currentProject, projectDetails: state.dataturksReducer.projectDetails}),
      dispatch => bindActionCreators({ pushState: push, getProjectDetails }, dispatch))
export default class TaggerContributors extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    pushState: PropTypes.func,
    projects: PropTypes.array,
    params: PropTypes.object,
    orgName: PropTypes.string,
    projectName: PropTypes.string,
    getProjectDetails: PropTypes.func,
    projectDetails: PropTypes.object,
    currentProject: PropTypes.string
  }

  constructor(props) {
    console.log('props are ', props);
    super(props);
    this.contributorDeleted = this.contributorDeleted.bind(this);
    this.state = {
      loading: false,
      showDeleteConfirmation: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.projectDetails !== nextProps.projectDetails) {
      this.setState({ loading: false });
    }
  }

  getItems(contributors) {
    console.log('projectDetails ', contributors);
    const items = [];
    for (let index = 0; index < contributors.length; index++) {
      items.push(
    <List.Item style={{ display: 'flex', flexDirection: 'row', marginLeft: '10%', marginRight: '10%' }}>
        <Image avatar src={contributors[index].userDetails.profilePic} />
        <List.Content style={{ display: 'flex', flexDirection: 'row', marginLeft: '20%', justifyContent: 'space-evenly'}}>
          { contributors[index].role === 'OWNER' && <Label size="mini" color="orange">Admin</Label> }
          { contributors[index].role !== 'OWNER' && <Label size="mini" color="grey">Annotator</Label> }
          &nbsp;
          &nbsp;
          <List.Header>{contributors[index].userDetails.firstName}</List.Header>
          &nbsp;
          &nbsp;
          {contributors[index].userDetails.email}
           {contributors[index].userDetails.email && contributors[index].role !== 'OWNER' &&
            <Button icon size="mini" onClick={() => this.setState({ showDeleteConfirmation: true, selectedContributor: contributors[index].userDetails.email})} color="red" className="pull-right">
              <Icon name="remove" />
            </Button>
          }
        </List.Content>
    </List.Item>
        );
    }
    return (
      <List divided relaxed>
        {items}
      </List>
      );
  }

  contributorDeleted(error, response) {
    console.log('invite sent ', error, response);
    if (!error) {
      logEvent('buttons', 'Contributor Removed');
      this.setState({ showDeleteConfirmation: false });
      this.props.getProjectDetails(this.props.currentProject, getUidToken());
      this.setState({ loading: true});
    } else {
      logEvent('buttons', 'Contributor remove failed');
      this.setState({ error: true, errorMessage: error, showDeleteConfirmation: false });
      alert(error);
      this.setState({ loading: false });
    }
  }

  deleteContributor() {
    console.log('selectedContributor ', this.state.selectedContributor);
    removeContributor(this.props.currentProject, this.state.selectedContributor, this.contributorDeleted);
    this.setState({ loading: true, showDeleteConfirmation: false });
  }

  render() {
    console.log('contributor state is ', this.state, this.props);
    return (
      <div style={{ background: 'white'}} className="text-center">
          <Helmet title="Contributor List" />
                      {this.state.showDeleteConfirmation &&
                        <div>
                            <Modal.Dialog>
                              <Modal.Header>
                                <Modal.Title>Remove Contributor</Modal.Title>
                              </Modal.Header>

                              <Modal.Body>
                                Are you sure you want to remove this contributor from project ?
                              </Modal.Body>
                              <Modal.Footer>
                                <Button onClick={() => {this.setState({showDeleteConfirmation: false});}}>Close</Button>
                                <Button negative onClick={() => {this.deleteContributor().bind(this);}}>Remove</Button>
                              </Modal.Footer>
                            </Modal.Dialog>
                          </div>
                      }
              <div >
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
                            <h1>Contributor Details</h1>
                          <div style={{ display: 'flex', justifyContent: 'center', marginLeft: '20%', marginRight: '20%' }}>
                            {this.getItems(this.props.projectDetails.contributorDetails)}
                          </div>
              </div>
      </div>

    );
  }
}
