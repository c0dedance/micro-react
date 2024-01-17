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

function TextInline() {
  return <h2>Foo</h2>
}

let isShow = false
function Text() {
  const foo = <h2>Foo</h2>
  const bar = <p>Bar</p>
  const handleClick = () => {
    isShow = !isShow
    // 重新渲染
    ReactDom.update()
  }
  return (
    <div id="text">
      <div>{isShow ? bar : <TextInline />}</div>
      {/* <div>{isShow ? bar : foo}</div> */}
      {/* {isShow ? bar : foo} */} {/* TODO: append添加到末尾，而不是在原来相对的位置 */}
      <button onClick={handleClick}>toggle</button>
    </div>
  )
}

export default App