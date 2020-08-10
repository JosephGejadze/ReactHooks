import React, {useState, useEffect, useCallback, useMemo, useRef, useReducer} from 'react';
import './App.css';

// Write custom hook without using useCallback which behaves exactly like useCallback.

const areEqualArrays = (A: readonly any[], B: readonly any[]): boolean => {
  if (A.length !== B.length) return false;
  for(let i=0; i<A.length; i++){
    if(A[i]!==B[i]) return false
  }
  return true;
}

const useCustomCallback = (func: ((...x: any)=>void) , deps: readonly any[]) => {
  const callback = useRef(func);
  const dependencies = useRef([...deps]);
  if (!areEqualArrays(dependencies.current, deps)){
    callback.current = func;
    dependencies.current = [...deps];
  };
  return callback.current;
};

const useCustomCallback2 = <T extends (...args: any[])=>void>(func: T, deps: readonly any[]) => {
  return useMemo(()=>func, deps);
}

// 🔹 Write custom hook that accepts a function fn and:
// 🔹 Returns a function outFn, which guaranteedly is not changed on re-renders
// 🔹 outFn should behave exactly like latest fn
// 🔸 Do not use useCallback hook
// 🔹 In other words, you are required to write custom hook similar to useCallback which does not need 
// 🔹 dependencies array and has same (or even better) performance benefits.

const useBetterCallback = (func: ((...x: any)=>void)):((...y: any)=>void) => {
  const outFn = useRef(func);
  outFn.current = func;
  const callback = useRef((...args: any[]) => outFn.current(...args));
  return callback.current;
};

// Write custom hook without using useRef which behaves exactly like useRef.

const useCustomRef = <T extends any>(initialValue: T): {current: T} => {
  const refObject = useMemo(()=>({current: initialValue}), []);
  return refObject;
}

// Write custom hook without using neither useMemo nor useCallback which behaves exactly like useMemo.

const useCustomMemo = <T extends unknown>(func: ()=>T, deps: readonly any[]): T => {
  const shouldCallFunc = useRef(true);
  const memoizedRef = useRef(null as T);
  const dependencies = useRef(deps);
  if(!areEqualArrays(dependencies.current, deps)){
    shouldCallFunc.current = true;
    dependencies.current = deps;
  }
  if(shouldCallFunc.current){
    memoizedRef.current = func();
  }
  shouldCallFunc.current = false;
  return memoizedRef.current;
}

// 🔹 Write custom hook without using useState which behaves exactly like useState. Be sure that:
// 🔹 It can accept default value as well as a function which returns default value
// 🔹 Second element of returned array (setState) can accept new value as well as function that receives old value and returns new value 🔹 Make sure that setState stays the same function and is not changed on re-renders
// 🔸 You can use useReducer hook only for re-rendering purpose

const useForceUpdate = () => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  return forceUpdate;
};

const useCustomState = <T extends unknown>(initialState: T|(()=>T)): any[] => {
  const forceUpdate = useForceUpdate();

  const initialStateValueRef = useRef(null as T);
  if(typeof initialState === 'function'){
    const initialStateFunc = initialState as ()=>T;
    if(initialStateValueRef.current === null) initialStateValueRef.current = initialStateFunc();
  } else{
    initialStateValueRef.current = initialState as T;
  }
  const stateRef = useRef(initialStateValueRef.current);

  const setStateRef = useRef((nextState: T|((currentState: T)=>T)) => {
    if(typeof nextState === 'function'){  
      const nextStateFunc = nextState as (currentState: T) => T;
      const nextStateValue = nextStateFunc(stateRef.current);
      if(stateRef.current !== nextStateValue){
        stateRef.current = nextStateValue;
        forceUpdate();
      }
    }else{
      if(stateRef.current !== nextState){
        stateRef.current = nextState;
        forceUpdate();
      };
    };
  });
  
  return [stateRef.current, setStateRef.current];
};

// 🔹 Write higher order function which:
// 🔹 Accepts function compareFn as a sole parameter.
// 🔹 compareFn itselft accepts two arrays as parameters and returns a boolean - whether every element of arrays on same indixes are equal or not. 
// 🔹 It can use simple shallow equality, deep equality or even custom. The implementation of compareFn is not imporant for us anyway.
// 🔹 Returns custom hook which behaves like useMemo with the difference that the equality of old and new dependencies must be checked by compareFn function.
// 🔹 Does not use neither useMemo nor useCallback

const createMemoHook = (compareFn: (A: readonly any[], B: readonly any[])=>boolean) => {
  return <T extends unknown>(func: ()=>T, deps: readonly any[]): T => {
    const shouldCallFunc = useRef(true);
    const memoizedRef = useRef(null as T);
    const dependencies = useRef(deps);
    if(!compareFn(dependencies.current, deps)){
      shouldCallFunc.current = true;
      dependencies.current = deps;
    }
    if(shouldCallFunc.current){
      memoizedRef.current = func();
    }
    shouldCallFunc.current = false;
    return memoizedRef.current;
  }
}

// Display two buttons for incrementing and decrementing and value. 
// Make it optimized so that on each render you pass exact same onClick functions 
// to each button (not necessarily same function to both buttons)

export const App1 = () => {
  
  const [count, setCount] = useState(0);
  const decrement = useCallback(()=>{setCount( x => x-1 )}, []);
  const increment = useCallback(()=>{setCount( x => x+1 )}, []);

  return (
      <App1Display count={count} decrement={decrement} increment={increment}/>
  );
}

interface App1DisplayProps {
  count: number;
  decrement: ()=>void;
  increment: ()=>void;
}

const App1Display = (props: App1DisplayProps) => {
  console.log("render");
  return (
    <div className = "appDiv">
      <button className = "button decrement" onClick={props.decrement}>-1</button>
      <h1 className="value">{props.count}</h1>
      <button className = "button increment" onClick={props.increment}>+1</button>
    </div>
  );
}


/****************************************************************************************/

// 🔹 Call fetchData and if promise resolves, render it on the page.
// 🔹 Display loading text while promise is not fulfilled yet.
// 🔹 If promise is rejected, display custom text on page and a single button. 
// 🔹 Clicking that button should retry calling fetchData and display loading text too, 
// 🔹 until promise is fulfilled (either resolved or rejected).

const fetchData = (): Promise<string> => {
  return new Promise((resolve, reject) => {
      const time = Math.random() * 1000 + 500;
      setTimeout(() => {
          if (Math.random() > 0.9) {
              const userId = Math.floor(Math.random() * 10000);
              resolve(`Hello user${userId}!`);
          } else {
              reject(new Error("random error"));
          }
      }, time);
  });
}

export const App2 = () => {
  const [status, setStatus] = useState("pending");
  let successMessage: string = '';

  const fetch = () => {
    fetchData()
      .then((value)=>{
        successMessage = value;
        setStatus("success");
      })
      .catch((value)=>{
        setStatus("failure");
      })
  }

  useEffect(fetch, []);

  const handleClick = () => {
    setStatus("pending");
    fetch();
  }

  switch(status){
    case "success":
      return <div><h1>Success... {successMessage}</h1></div>;
    case "failure":
      return (
        <div>
          <h1>failure...</h1>
          <button onClick={handleClick}>Try again</button>
        </div>
      );
    default: 
      return <h1>Loading...</h1>;
  }  
}

// 🔹 Create a parent component and in it's state store array of names (strings). Initial value - ["First", "Second"]
// 🔹 Create a child component with the following props

/*
    interface ChildProps {
        name: string;
        index: number;
        onChange: (index: number, newName: string) => void;
        onDelete: (index: number) => void;
    }
*/
// 🔹 Parent component should render child comomponents (each child component responsible for rendering one name) 
//    and a button, which, when clicked, will add new name at the end. It should pass required props to child components 
//    and the passed functions must behave as their names suggest.
// 🔹 Child component should render controllable input with explicit value passed from parent. 
//    Changing input value must call onChange function (received from props) with appropriate arguments. 
//    Render button for deleting too.
// 🔹 Make sure that changing value of single name rerenders only parent and corresponding child component


export const App3 = () => {
  const [names, setNames] = useState(["First", "Second"]);
  
  const handleAdd = useBetterCallback(():void => {
    setNames((x)=>[...x, ''])
  });

  const handleDelete = useBetterCallback((index: number): void => {
    setNames((x)=>x.filter((e, i)=> index !== i));
  });

  const handleChange = useBetterCallback((i: number, newName: string):void => {
    setNames((x)=>{
      let newNames = [...x];
      newNames[i] = newName;
      return newNames;
    });
    });

  return(
      <div>
          {names.map((name, index) => <App3Child name={name} index={index} key={index} onDelete={handleDelete} onChange={handleChange} />)}
          <button onClick={handleAdd}>Add</button>
      </div>
  );
};

interface App3ChildProps {
  name: string;
  index: number;
  onDelete: (index: number) => void;
  onChange: (index: number, newName: string) => void;
}

const App3Child = React.memo((props: App3ChildProps) => { 
  console.log('render');
  return (
    <div>
      <input value = {props.name} onChange={(e)=>{props.onChange(props.index, e.target.value)}} />
      <button onClick={()=>{props.onDelete(props.index)}}>Delete</button>
    </div>
  );
});


// 🔹 The problem is same as previous, except:
// 🔹 the props of child component. The new type should be
/*  
    interface ChildProps {
        name: string;
        onChange: (newName: string) => void;
        onDelete: () => void;
    }
*/
// 🔹 Try achieving desired results without considreng optimization of rerendering only appropriate components.
// 🔹 Finally, try achieving desired result with optimizing rerendering as described in MNA.1.

const useFuncDistributor = <T extends any>(factory: (index: number) => T, length: number) :T[] => {
  const factoryRef = useBetterCallback(factory) as (index: number) => T;
  return useMemo(() => {
    const factoryFuncArr: T[] = [];
    for(let i=0; i<length; i++){
      factoryFuncArr[i] = factoryRef(i);
    }
    return factoryFuncArr;
  }, [length, factoryRef]);
};


export const App4 = () => {
  const [names, setNames] = useState(["First", "Second"]);
  
  const handleAdd = ():void => {
    deletes[deletes.length] = handleDelete(deletes.length);
    changes[changes.length] = handleChange(changes.length);
    setNames((x)=>[...x, ''])
  };

  const handleDelete = (index: number) => {
    return ()=>{
      setNames((x)=>x.filter((e, i) => index !== i));
    }
  };
  
  const handleChange = (index: number) => {
    return (newName: string) => {
      setNames((x)=>{
        let newNames = [...x];
        newNames[index] = newName;
        return newNames;
      });
    }
  };

  const deletes = useFuncDistributor(handleDelete, names.length);
  const changes = useFuncDistributor(handleChange, names.length);  

  return(
    <div>
      {names.map((name, index) => 
      <App4Child key={index} name={name} onDelete={deletes[index]} onChange={changes[index]} />
      )}
      <button onClick={handleAdd}>Add</button>
    </div>
  )
};

interface App4ChildProps {
  name: string;
  onDelete: () => void;
  onChange: (newName: string) => void;
};

const App4Child = React.memo((props: App4ChildProps) => { 
  console.log("render");
  return (
    <div>
      <input value = {props.name} onChange={(e)=>{props.onChange(e.target.value)}} />
      <button onClick={props.onDelete}>Delete</button>
    </div>
  );
});

// 🔹 You are given uncontrollable child component.
// 🔸 Parent component stores number of counters and renders that amount of child components. 
// 🔹 It has two buttons Add counter and Increment all counters.
// 🔸 You are not allowed to edit child component.
// 🔹 Implement incrementCounters so that it increments counters of all child components that are rendered.


interface ParentState {
  numOfCounters: number;
}

export class App5 extends React.Component<{}, ParentState> {
  constructor(props: any){
    super(props);
    this.state = {numOfCounters: 2};
  }
  childRefs: any[] = [React.createRef(), React.createRef()];

  addCounter = () => {
    this.childRefs.push(React.createRef());
    this.setState(({ numOfCounters } ) => ({
      numOfCounters: numOfCounters + 1
    }));
  };

  incrementCounters = () => {
    for(let i=0; i<this.childRefs.length; i++){
      this.childRefs[i].current.increment();
    }
  };

  render() {
    return (
      <div>
        {new Array(this.state.numOfCounters).fill(0).map((_, index) => {
          return <App5Child key={index} ref={this.childRefs[index]}/>;
        })}
        <br />
        <button onClick={this.addCounter}>Add counter</button>
        <button onClick={this.incrementCounters}>Increment all counters</button>
      </div>
    );
  }
}

interface ChildCounterState {
  counter: number;
}

class App5Child extends React.Component<{}, ChildCounterState> {
  state: ChildCounterState = {
    counter: 0
  };

  increment = () => {
    this.setState(({ counter }) => ({
      counter: counter + 1
    }));
  };

  render() {
    return (
      <div>
        Counter: {this.state.counter}
        <button onClick={this.increment}>+</button>
      </div>
    );
  }
}
