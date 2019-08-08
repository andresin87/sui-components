import React, {useState, useRef, useEffect, Fragment} from 'react'
import PropTypes from 'prop-types'
import withIntersectionObserver from './hoc/withIntersectionObserver'

// import useIntersectionObserver from './hooks/useIntersectionObserver'
import {withOpenToggle} from '@s-ui/hoc'

const BASE_CLASS = 'sui-AtomTooltip'
const CLASS_INNER = `${BASE_CLASS}-inner`
const CLASS_ARROW = `${BASE_CLASS}-arrow`
const PREFIX_PLACEMENT = `${BASE_CLASS}-`
const CLASS_TARGET = `${BASE_CLASS}-target`

const PLACEMENTS = {
  TOP: 'top',
  TOP_START: 'top-start',
  TOP_END: 'top-end',
  RIGHT: 'right',
  RIGHT_START: 'right-start',
  RIGHT_END: 'right-end',
  BOTTOM: 'bottom',
  BOTTOM_START: 'bottom-start',
  BOTTOM_END: 'bottom-end',
  LEFT: 'left',
  LEFT_START: 'left-start',
  LEFT_END: 'left-end'
}

const AtomTooltip = ({
  children,
  innerRef,
  isVisible,
  isOpen,
  longPressTime,
  onToggle,
  hideArrow,
  content: HtmlContent,
  delay,
  autohide,
  placement
}) => {
  const [Tooltip, setTooltip] = useState(null)
  let preventNonTouchEvents = false
  let hasTouchEnded = false
  let touchTimer = null
  let onClickTarget = null
  let title = null

  const refTooltip = useRef()
  const refTarget = useRef()

  const handleContextMenu = ev => {
    ev.preventDefault()
    ev.stopPropagation()
    return false
  }

  const handleStopPropagation = ev => {
    ev.preventDefault()
    ev.stopPropagation()
    return false
  }

  const handleTouchStart = ev => {
    preventNonTouchEvents = true
    hasTouchEnded = false
    clearTimeout(touchTimer)
    touchTimer = setTimeout(() => {
      if (!hasTouchEnded) onToggle(ev)
      preventNonTouchEvents = false
      hasTouchEnded = false
    }, longPressTime)
    return false
  }

  const handleTouchEnd = ev => {
    if (!preventNonTouchEvents) handleStopPropagation(ev)
    hasTouchEnded = true
    clearTimeout(touchTimer)
  }

  /**
   * This function is executed when target doesn't have an `onClick` prop (normal targets)
   * this logic assures that only the proper events triggers the tooltip
   */
  const handleToggleOnNormalTarget = ev => {
    const {type} = ev
    const isValidTrigger = [
      'click',
      'focusin',
      'mouseover',
      'mouseout'
    ].includes(type)
    if (type === 'touchstart') hasTouchEnded = false
    if (type === 'touchend') hasTouchEnded = true
    if (hasTouchEnded && ['focusin', 'mouseover'].includes(type)) {
      handleStopPropagation(ev)
    }
    if (isValidTrigger) onToggle(ev)
  }

  /**
   * This function is executed when target DOES have an `onClick` prop ('call-to-action' targets)
   * this logic assures that only the proper events triggers the tooltip
   */
  const handleToggleOnCallToActionTarget = ev => {
    const {type} = ev
    if (type === 'touchstart') handleTouchStart(ev)
    if (type === 'touchend') handleTouchEnd(ev)
    if (!preventNonTouchEvents) onToggle(ev)
  }

  const extendChildren = () => {
    const ref = refTarget
    const className = CLASS_TARGET
    const onTouchEnd = handleToggle

    const childrenOnly = React.Children.only(children)

    return React.Children.map(childrenOnly, child => {
      onClickTarget = child.props.onClick
      title = child.props.title
      return React.cloneElement(child, {
        ref,
        className,
        onTouchEnd
      })
    })
  }

  const handleToggle = ev => {
    if (onClickTarget) handleToggleOnCallToActionTarget(ev)
    else handleToggleOnNormalTarget(ev)
  }

  function disableTitle() {
    this.dataset.title = title
    title = ''
  }

  function restoreTitle() {
    title = this.dataset.title
  }

  const loadAsyncReacstrap = ev => {
    require.ensure(
      [],
      require => {
        const Tooltip = require('reactstrap/lib/Tooltip').default
        setTooltip(Tooltip)
        handleToggle(ev)
      },
      'reactstrap-Tooltip'
    )
  }

  const handleClickOutsideElement = ev => {
    const target = refTarget.current
    if (isOpen) {
      const tooltipDom = refTooltip.current
      const isOutside = tooltipDom && !tooltipDom.contains(ev.target)
      const isNotTarget = target && !target.contains(ev.target)
      if (isOutside && isNotTarget) onToggle(ev, {isOpen: false})
    }
  }

  useEffect(() => {
    const target = refTarget.current
    innerRef(target)
    ;['touchstart', 'mouseover'].forEach(event =>
      target.addEventListener(event, ev => {
        if (!Tooltip) loadAsyncReacstrap(ev)
      })
    )
    ;['click', 'touchend'].forEach(event =>
      window.addEventListener(event, handleClickOutsideElement)
    )
    target.oncontextmenu = handleContextMenu
    target.addEventListener('mouseover', disableTitle)
    target.addEventListener('mouseout', restoreTitle)
    return () => {
      clearTimeout(touchTimer)
      ;['click', 'touchend'].forEach(event =>
        window.removeEventListener(event, handleClickOutsideElement)
      )
      target.removeEventListener('mouseover', disableTitle)
      target.removeEventListener('mouseout', restoreTitle)
    }
  })

  const target = refTarget.current
  const restrictedProps = {
    hideArrow,
    target,
    delay,
    autohide,
    placement
  }
  let _isOpen = isOpen
  if (!isVisible && isOpen) _isOpen = false

  return (
    <Fragment>
      {extendChildren()}
      {target &&
        Tooltip && (
          <Tooltip
            {...restrictedProps}
            isOpen={_isOpen}
            toggle={handleToggle}
            className={BASE_CLASS}
            innerClassName={CLASS_INNER}
            arrowClassName={CLASS_ARROW}
            placementPrefix={PREFIX_PLACEMENT}
            innerRef={refTooltip}
            offset="auto,4px"
          >
            {HtmlContent ? <HtmlContent /> : title}
          </Tooltip>
        )}
    </Fragment>
  )
}

AtomTooltip.displayName = 'AtomTooltip'

AtomTooltip.defaultProps = {
  isVisible: true,
  longPressTime: 1000
}

AtomTooltip.propTypes = {
  children: PropTypes.any,

  /** Wether to show arrow or not. */
  hideArrow: PropTypes.bool,

  /** Optionally override show/hide delays. Default  → { show: 0, hide: 250 } */
  delay: PropTypes.oneOfType([
    PropTypes.shape({
      show: PropTypes.number,
      hide: PropTypes.number
    }),
    PropTypes.number
  ]),

  /** optionally hide tooltip when hovering over tooltip content. Default → true */
  autohide: PropTypes.bool,

  /** Tooltip and arrow position */
  placement: PropTypes.oneOf(Object.values(PLACEMENTS)),

  /** True if the target is inside the viewport */
  isVisible: PropTypes.bool,

  /** True if the tooltip is displayed or not */
  isOpen: PropTypes.bool,

  /** Handler to set the value of isOpen  */
  onToggle: PropTypes.func,

  /** HTML (component) to be displayed on the Tooltip */
  content: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),

  /** Custom ref handler that will be assigned to the "target" element */
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.object
  ]),

  /** Time in miliseconds for longpress duration */
  longPressTime: PropTypes.number
}

export default withIntersectionObserver(withOpenToggle(AtomTooltip))
export {AtomTooltip as AtomTooltipBase, PLACEMENTS as atomTooltipPlacements}
