import React from './core/react'

const App = () => {
  return (
    <div id="app">
      Hello, mini react!
      <Counter num={123} />
      <Counter num={666} />
    </div>
  )
}

function Counter({ num }) {
  return (
    <div>Counter: {num}</div>
  )
}

export default App