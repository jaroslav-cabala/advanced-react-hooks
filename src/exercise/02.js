// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

// 🐨 this is going to be our generic asyncReducer
function asyncReducer(state, data) {
  console.log('-------------- reducer')
  console.log('---------------------- current state', state)
  console.log('---------------------- new data', data)

  switch (data.type) {
    case 'pending': {
      // 🐨 replace "pokemon" with "data"
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      // 🐨 replace "pokemon" with "data" (in the action too!)
      return {status: 'resolved', data: data.data, error: null}
    }
    case 'rejected': {
      // 🐨 replace "pokemon" with "data"
      return {status: 'rejected', data: null, error: data.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${data.type}`)
    }
  }
}

function useAsync(asyncAction, initialState, deps) {
  console.log(
    `useAsync, props.deps = ${
      deps === '' ? 'empty string' : deps
    }, props.initialState = `,
    initialState,
  )
  const [state, dispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  })

  React.useEffect(() => {
    console.log('useAsync effect')

    const promise = asyncAction()
    if (!promise) {
      console.log(`useAsync effect promise is ${promise}, return early`)
      return
    }

    dispatch({type: 'pending'})
    promise.then(
      data => {
        dispatch({type: 'resolved', data})
      },
      error => {
        dispatch({type: 'rejected', error})
      },
    )
  }, deps)

  return state
}

function PokemonInfo({pokemonName}) {
  console.info('||||||||||||||||||||||||||||| pokemonInfo')

  const state = useAsync(
    () => {
      if (!pokemonName) {
        return
      }
      return fetchPokemon(pokemonName)
    },
    {status: pokemonName ? 'pending' : 'idle'},
    [pokemonName],
  )
  console.log('pokemonInfo state = ', state)
  const {data: pokemon, status, error} = state

  switch (status) {
    case 'idle':
      console.log('pokemonInfo render idle ||||||||||||||||||||||||||||| ')
      return <span>Submit a pokemon</span>
    case 'pending':
      console.log('pokemonInfo render pending |||||||||||||||||||||||||||||')
      return <PokemonInfoFallback name={pokemonName} />
    case 'rejected':
      console.log('pokemonInfo throw error |||||||||||||||||||||||||||||')
      throw error
    case 'resolved':
      console.log('pokemonInfo render data view |||||||||||||||||||||||||||||')
      return <PokemonDataView pokemon={pokemon} />
    default:
      throw new Error('This should be impossible')
  }
}

function App() {
  console.log('App')

  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    console.log('submit form')
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
