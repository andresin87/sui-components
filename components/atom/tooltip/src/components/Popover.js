import React, {Component, Fragment} from 'react'

const BASE_CLASS = 'sui-AtomTooltip'
const CLASS_INNER = `${BASE_CLASS}-inner`
const CLASS_ARROW = `${BASE_CLASS}-arrow`
const PREFIX_PLACEMENT = `${BASE_CLASS}-`
const CLASS_TARGET = `${BASE_CLASS}-target`

class Popover extends Component {
  state = {Popover: null}
  refTarget = React.createRef()
  refPopover = React.createRef()

  loadAsyncReacstrap(ev) {
    if (!this.state.Popover) {
      require.ensure(
        [],
        require => {
          const Popover = require('reactstrap/lib/Popover').default
          this.setState({Popover})
        },
        'reactstrap-Popover'
      )
    }
  }

  get extendedChildren() {
    const {children} = this.props // eslint-disable-line react/prop-types

    const ref = this.refTarget
    const className = CLASS_TARGET

    const childrenOnly = React.Children.only(children)

    return React.Children.map(childrenOnly, child => {
      this.onClickTarget = child.props.onClick
      this.title = child.props.title
      return React.cloneElement(child, {
        ref,
        className
      })
    })
  }

  componentDidMount() {
    const target = this.refTarget.current
    this.props.innerRef(target) // eslint-disable-line react/prop-types
    ;['touchstart', 'mouseover'].forEach(event =>
      target.addEventListener(event, this.loadAsyncReacstrap)
    )
  }

  componentWillUnmount() {
    const target = this.refTarget.current
    clearTimeout(this.touchTimer)
    ;['touchstart', 'mouseover'].forEach(event =>
      target.removeEventListener(event, this.loadAsyncReacstrap)
    )
  }

  handleToggle = ev => {
    /* eslint-disable */
    console.log('Popover:handleToggle')
    console.log(ev)
  }

  render() {
    /* eslint-disable react/prop-types */
    const {
      hideArrow,
      content: HtmlContent,
      delay,
      autohide,
      placement
    } = this.props

    const {Popover} = this.state
    const {
      extendedChildren,
      refPopover,
      refTarget: {current: target}
    } = this
    const restrictedProps = {
      hideArrow,
      target,
      delay,
      autohide,
      placement
    }
    let {isVisible, isOpen} = this.props
    if (!isVisible && isOpen) isOpen = false

    return (
      <Fragment>
        {extendedChildren}
        {target &&
          Popover && (
            <Popover
              {...restrictedProps}
              isOpen={isOpen}
              toggle={this.handleToggle}
              className={BASE_CLASS}
              innerClassName={CLASS_INNER}
              arrowClassName={CLASS_ARROW}
              placementPrefix={PREFIX_PLACEMENT}
              innerRef={refPopover}
              offset="auto,4px"
            >
              {HtmlContent || this.title}
            </Popover>
          )}
      </Fragment>
    )
  }
}

Popover.displayName = 'Popover'

export default Popover
