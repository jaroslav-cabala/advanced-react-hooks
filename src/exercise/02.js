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
function asyncReducer(state, action) {
  console.log('-------------- reducer')
  console.log('---------------------- current state', state)
  console.log('---------------------- new data', action)

  switch (action.type) {
    case 'pending': {
      // 🐨 replace "pokemon" with "data"
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      // 🐨 replace "pokemon" with "data" (in the action too!)
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      // 🐨 replace "pokemon" with "data"
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useAsync(initialState) {
  console.log('useAsync')
  const [state, dispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  })

  function run(promise) {
    console.log('run')
    dispatch({type: 'pending'})
    promise.then(
      data => {
        console.log('dispatch resolved')
        dispatch({type: 'resolved', data})
      },
      error => {
        console.log('dispatch rejected')
        dispatch({type: 'rejected', error})
      },
    )
  }

  const runCallback = React.useCallback(run, [])

  return {state, run: runCallback}
}

function PokemonInfo({pokemonName}) {
  console.info('||||||||||||||||||||||||||||| pokemonInfo')
  const {state, run} = useAsync({status: pokemonName ? 'pending' : 'idle'})

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }

    const pokemonPromise = fetchPokemon(pokemonName)
    run(pokemonPromise)
  }, [pokemonName, run])

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
