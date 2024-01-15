import React from './core/react'
import ReactDom from './core/react-dom'

let n = 10
let props = { id: 1111 }
const App = () => {
  return (
    <div id="app">
      Hello, mini react!
      <Counter num={n} />
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

export default App