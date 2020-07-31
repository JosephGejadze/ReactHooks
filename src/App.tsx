import React, {useState, useEffect, useCallback} from 'react';
import './App.css';

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
  
  const handleAdd = useCallback(():void => {
    setNames((x)=>[...x, ''])
  }, []);

  const handleDelete = (i: number): void => {
    let newNames = [...names];
    newNames.splice(i, 1);
    setNames(newNames);
  };

  const handleChange = useCallback((i: number, newName: string):void => {
    let newNames = [...names];
    newNames[i] = newName;
    setNames(newNames);
  }, [names]);


  return(
    <div>
      {names.map((name, index) => <App3Child name={name} index={index} /*onDelete={handleDelete} onChange={handleChange}*/ />)}
      <button onClick={handleAdd}>Add</button>
    </div>
  )
};

interface ChildProps {
  name: string;
  index: number;
  // onDelete: (index: number) => void;
  // onChange: (index: number, newName: string) => void;
}

const App3Child = React.memo((props: ChildProps) => { 
  console.log('render');
  return (
    <div>
      <input value = {props.name} /*onChange={(e)=>{props.onChange(props.index, e.target.value)}}*/ />
      <button /*onClick={()=>{props.onDelete(props.index)}}*/>Delete</button>
    </div>
  );
});