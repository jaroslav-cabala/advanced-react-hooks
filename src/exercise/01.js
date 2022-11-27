// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

const countReducer = (currentState, newState) => {
  const {type, step} = newState
  if (type === 'INCREMENT') {
    return {count: currentState.count + step}
  } else {
    return {count: currentState.count - step}
  }
}

function Counter({initialCount = 0, step = 1}) {
  const [state, dispatch] = React.useReducer(countReducer, {
    count: initialCount,
  })

  const {count} = state
  const increment = () => dispatch({type: 'INCREMENT', step})
  const decrement = () => dispatch({type: 'DECREMENT', step})

  return (
    <>
      {count}
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </>
  )
}

function App() {
  return <Counter />
}

export default App
