import React from './core/react'
import ReactDom from './core/react-dom'

const App = () => {
  return (
    <div id="app">
      Hello, mini react!
      <Counter />
    </div>
  )
}

function Counter() {
  const [count, setCount] = ReactDom.useState(0)
  const [msg, setMsg] = ReactDom.useState('hi')

  return (
    <div>
      <div>count: {count}</div>
      <div>msg: {msg}</div>
      <button onClick={() => setCount(count + 1)}>increment</button>
      <button onClick={() => setCount(c => c + 1)}>increment</button>
      <button onClick={() => setCount(100)}>increment to 100</button>
      <button onClick={() => setMsg(msg => msg + msg)}>setMsg</button>
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