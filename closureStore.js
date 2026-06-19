/**
 * CO2: JavaScript closures as memory/state constructs
 * This is an implementation of a state container leveraging closures.
 * In JS, a closure retains access to variables declared in its outer scope even after the outer function 
 * has finished executing. Frameworks use closures (e.g. inside React hooks) to lock state references 
 * in memory across successive rendering iterations.
 */
export function createClosureStore(initialState) {
  // Private variables locked inside the function scope closure
  let state = initialState;
  const listeners = new Set();

  // Functional programming: State updates via pure transformation functions
  function getState() {
    return state;
  }

  function setState(nextState) {
    // CO1: Immutability check
    if (state === nextState) return;
    state = typeof nextState === 'function' ? nextState(state) : nextState;
    
    // Publish updates to all listeners (Reactive State architecture)
    listeners.forEach(listener => listener(state));
  }

  function subscribe(listener) {
    listeners.add(listener);
    // Return unsubscribe closure (retains reference to listener to delete it)
    return () => {
      listeners.delete(listener);
    };
  }

  // Exposed API contract - variables remain private, only accessible via these functions
  return {
    getState,
    setState,
    subscribe
  };
}

/**
 * Example custom hook demonstrating the integration of closures with React's rendering pipeline
 */
import { useState, useEffect } from 'react';

export function useClosureStore(store) {
  const [value, setValue] = useState(store.getState());

  useEffect(() => {
    // Closure-based subscription
    const unsubscribe = store.subscribe((nextState) => {
      setValue(nextState);
    });
    return unsubscribe; // Cleanup closure
  }, [store]);

  return [value, store.setState];
}
