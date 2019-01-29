import React, {PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { setError } from 'redux/modules/dataturks';
@connect(
  state => ({user: state.auth.user, error: state.dataturksReducer.globalError, projects: state.dataturksReducer.projects}),
      dispatch => bindActionCreators({ setError }, dispatch))
export default class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.object,
    setError: PropTypes.func,
    error: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {error: this.props.error};
  }
  state = { error: null };

  componentWillReceiveProps(nextProps) {
    console.log('error boundary props', nextProps);
    if (this.state.error !== nextProps.error) {
      this.setState({ error: nextProps.error });
    }
  }

  unstable_handleError(error, info) {
    console.log('unstable_handleError ', error, info);
    this.props.setError(true);
    this.setState({ error: true});
    // Note: you can send error and info to analytics if you want too
  }

  render() {
    console.log('errorboundary', this.state);
    // if (this.state.error) {
    //   // You can render anything you want here,
    //   // but note that if you try to render the original children
    //   // and they throw again, the error boundary will no longer catch that.
    //   return (<div>
    //               <h2> Looks like we are having some issues </h2>
    //               <div className="text-left">
    //               <p> This is embarrassing, and we are sorry for this. We have notified our engineers to look into this with utmost priority</p>
    //               <p> Meanwhile this is getting fixed, please give us second chance</p>
    //               </div>
    //           </div>);
    // }
    console.log('error not present', this.props.children);
    return this.props.children;
  }
}
