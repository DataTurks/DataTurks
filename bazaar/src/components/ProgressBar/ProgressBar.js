import React, { Component } from 'react';

export default class ProgressBar extends Component {
  render() {
    return (
        <div className="progress">
          <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%">
          </div>
        </div>
    );
  }
}
