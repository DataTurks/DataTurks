import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { Button, Header, Icon, Form, Checkbox } from 'semantic-ui-react';
import Modal from 'react-bootstrap/lib/Modal';


@connect(state => ({ user: state.auth.user }))
export default class TaggerInvite extends Component {
  static propTypes = {
    user: PropTypes.object,
    submitEmail: PropTypes.func,
    title: PropTypes.string,
    modalClose: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    console.log('TaggerInvite called ', props);
  }

  state = { modalOpen: true, formValue: '', owner: false };

  handleOpen = () => this.setState({ modalOpen: true })

  handleClose = () => { this.setState({ modalOpen: false }); this.props.modalClose(); }

  handleSubmit = () => {
    this.props.submitEmail(this.state.formValue, this.state.owner);
  }

  handleChange = (field, element) => {
    console.log(' handle change ', field, element);
    if (field === 'role') {
      if (this.state.owner) {
        this.setState({ owner: false});
      } else {
        this.setState({ owner: true});
      }
    } else {
      this.setState({ formValue: element.target.value });
    }
  }

  render() {
    // const {time} = this.props;
    const submitDisabled = this.state.formValue.indexOf('@') > 0 ? false : true;
    return (

      <div>
        <Modal
          show={this.state.modalOpen}
          onHide={this.handleClose}
          container={this}
          style={{ marginTop: '50px'}}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">
              Add Contributor
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
              Annotator can view, tag or update HIT tags.
              <br />
              <br />
              Admins have all permissions: modify or add data to the project, and add other contributors.
              <Form size="small" key="import">
                <Form.Field id="tags" onChange={this.handleChange.bind(this, 'tags')} label="Email" control="input" type="email" placeholder="Enter email id" />
                    <Form.Field>
                      <Checkbox checked={this.state.owner} onChange={this.handleChange.bind(this, 'role')} label="Admin" />
                      <br />
                      <Checkbox checked={!this.state.owner} onChange={this.handleChange.bind(this, 'role')} label="Annotator" />
                    </Form.Field>
              </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose} className="pull-left">Close</Button>
            <Button color="green" inverted type="submit" disabled={submitDisabled} onClick={this.handleSubmit}>
                    <Icon name="checkmark" /> Send Invite
                  </Button>
          </Modal.Footer>
        </Modal>

        </div>
    );
  }
}
