import React from './core/react'
import ReactDom from './core/react-dom'

let n = 10
let props = { id: 1111 }
const App = () => {
  return (
    <div id="app">
      Hello, mini react!
      <Text />
    </div>
  )
}

function Counter({ num }) {
  const handleClick = () => {
    n++
    props = {}
    console.log('onClick')
    // 重新渲染
    ReactDom.update()
  }
  return (
    <div {...props}>
      <div>Counter: {num}</div>
      <button onClick={handleClick}>click</button>
    </div>
  )
}

let isShow = false
function Text() {
  const bar = <h2>Bar</h2>
  const handleClick = () => {
    isShow = !isShow
    ReactDom.update()
  }
  return (
    <div>
      {isShow && bar}
      <button onClick={handleClick}>toggle</button>
      {isShow && bar}
    </div>
  )
}

export default App