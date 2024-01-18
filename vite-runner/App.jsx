import React from './core/react'
import ReactDom from './core/react-dom'

let n = 10
let props = { id: 1111 }
const App = () => {
  return (
    <div id="app">
      Hello, mini react!
      <Foo />
      <Bar />
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

  const update = ReactDom.update()

  const bar = <h2>Bar</h2>
  const handleClick = () => {
    isShow = !isShow
    update()
  }
  return (
    <div>
      {isShow && bar}
      <button onClick={handleClick}>toggle</button>
      {isShow && bar}
    </div>
  )
}

let counterBar = 1
function Bar() {
  console.log('Bar render');
  const update = ReactDom.update()

  const handleClick = () => {
    counterBar++
    update()
  }
  return (
    <div><h2>Bar</h2>
      {counterBar}
      <button onClick={handleClick}>click</button>
    </div>
  )
}
let counterFoo = 1
function Foo() {
  console.log('Foo render');
  const update = ReactDom.update()

  const handleClick = () => {
    counterFoo++
    update()
  }
  return (
    <div><h2>Foo</h2>
      {counterFoo}
      <button onClick={handleClick}>click</button>
    </div>
  )
}

export default App