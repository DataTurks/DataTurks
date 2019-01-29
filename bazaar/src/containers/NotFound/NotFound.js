import React from 'react';

export default function NotFound() {
  const styles = require('./NotFound.scss');
  return (
    <div className="container">
        <div className={styles.loading + ' text-center'}>
          <span className="glyphicon glyphicon-repeat glyphicon-refresh-animate gi-3x">
          </span>
        </div>
    </div>
  );
}
