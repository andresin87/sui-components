/* global IntersectionObserver */
import {useState, useEffect} from 'react'

if (typeof window !== 'undefined' && window.document) {
  require('intersection-observer')
}

function useIntersectionObserver(target) {
  const [isIntersecting, setIsIntersecting] = useState(true)

  const handleChange = ([{isIntersecting}]) => {
    setIsIntersecting(isIntersecting)
  }

  useEffect(
    () => {
      if (!('IntersectionObserver' in window)) {
        setIsIntersecting(true)
        return
      }
      new IntersectionObserver(handleChange).observe(target)
    },
    [target]
  )

  return {isIntersecting}
}

export default useIntersectionObserver

// export default BaseComponent => {
//   const displayName = BaseComponent.displayName

//   return class WithIntersectionObserver extends Component {
//     static displayName = `withIntersectionObserver(${displayName})`
//     static contextTypes = BaseComponent.contextTypes

//     state = {
//       isIntersecting: true
//     }

//     handleChange = ([{isIntersecting}]) => {
//       this.setState({isIntersecting})
//     }

//     innerRef = elem => {
//       this.refTarget = elem
//     }

//     componentDidMount() {
//       const target = refTarget
//       // check we support IntersectionObserver
//       if (!('IntersectionObserver' in window)) {
//         this.setState({isIntersecting: true})
//         return
//       }
//       new IntersectionObserver(this.handleChange).observe(target)
//     }

//     render() {
//       const {isIntersecting: isVisible} = this.state
//       return (
//         <BaseComponent
//           {...this.props}
//           isVisible={isVisible}
//           innerRef={this.innerRef}
//         />
//       )
//     }
//   }
// }
