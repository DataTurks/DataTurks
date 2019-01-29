import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Rect from './Rect'
import { getNewStyle, degToRadian } from './Utils'

const centerToTL = (state) => {
  const { position: { centerX, centerY }, size: { width, height }, transform: { rotateAngle } } = state
  const top = centerY - height / 2
  const left = centerX - width / 2
  return { top, left, width, height, rotateAngle }
}

const tLToCenter = (props) => {
  const { width, height, top, left, rotateAngle } = props
  return {
    position: {
      centerX: left + width / 2,
      centerY: top + height / 2
    },
    size: {
      width,
      height
    },
    transform: {
      rotateAngle
    }
  }
}

class ResizableRect extends Component {
  static propTypes = {
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    rotatable: PropTypes.bool,
    rotateAngle: PropTypes.number,
    parentRotateAngle: PropTypes.number,
    zoomable: PropTypes.string,
    minWidth: PropTypes.number,
    minHeight: PropTypes.number,
    aspectRatio: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.bool
    ]),
    onRotateStart: PropTypes.func,
    onRotate: PropTypes.func,
    onRotateEnd: PropTypes.func,
    onResizeStart: PropTypes.func,
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func
  }
  static defaultProps = {
    parentRotateAngle: 0,
    rotateAngle: 0,
    rotatable: true,
    zoomable: '',
    minWidth: 10,
    minHeight: 10
  }

  handleRotate = (angle, startAngle) => {
    if (!this.props.onRotate) return
    let rotateAngle = Math.round(startAngle + angle)
    if (rotateAngle >= 360) {
      rotateAngle -= 360
    } else if (rotateAngle < 0) {
      rotateAngle += 360
    }
    if (rotateAngle > 356 || rotateAngle < 4) {
      rotateAngle = 0
    } else if (rotateAngle > 86 && rotateAngle < 94) {
      rotateAngle = 90
    } else if (rotateAngle > 176 && rotateAngle < 184) {
      rotateAngle = 180
    } else if (rotateAngle > 266 && rotateAngle < 274 ) {
      rotateAngle = 270
    }
    this.props.onRotate(rotateAngle)
  }

  handleResize = (length, alpha, rect, type, isShiftKey) => {
    if (!this.props.onResize) return
    const { rotateAngle, aspectRatio, minWidth, minHeight, parentRotateAngle } = this.props
    const beta = alpha - degToRadian(rotateAngle + parentRotateAngle)
    const deltaW = length * Math.cos(beta)
    const deltaH = length * Math.sin(beta)
    const ratio = isShiftKey && !aspectRatio ? rect.width / rect.height : aspectRatio
    const style = getNewStyle(type, {...rect, rotateAngle}, deltaW, deltaH, ratio, minWidth, minHeight)
    this.props.onResize(centerToTL({ ...style, transform: { rotateAngle } }), isShiftKey, type)
  }

  handleDrag = (deltaX, deltaY) => {
    this.props.onDrag && this.props.onDrag(deltaX, deltaY)
  }

  render() {
    const styles = tLToCenter(this.props)
    const { zoomable, rotatable, parentRotateAngle } = this.props
    return  (
      <Rect zoomable={zoomable} rotatable={rotatable && this.props.onRotate ? true : false} styles={styles}
        parentRotateAngle={parentRotateAngle}
        onResizeStart={this.props.onResizeStart}
        onResize={this.handleResize}
        onResizeEnd={this.props.onResizeEnd}
        onRotateStart={this.props.onRotateStart}
        onRotate={this.handleRotate}
        onRotateEnd={this.props.onRotateEnd}
        onDragStart={this.props.onDragStart}
        onDrag={this.handleDrag}
        onDragEnd={this.props.onDragEnd}
      />
    )
  }
}

export default ResizableRect
