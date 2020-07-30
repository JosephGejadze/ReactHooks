import React, {useState, useEffect} from 'react';
import './App.css';

// Display two buttons for incrementing and decrementing and value. 
// Make it optimized so that on each render you pass exact same onClick functions 
// to each button (not necessarily same function to both buttons)

export const App1 = () => {
  
  const [count, setCount] = useState(0);
  const decrement = () => {setCount(count-1)};
  const increment = () => {setCount(count+1)};

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
  const [display, setDisplay] = useState(<h1>Loading...</h1>);
  const [mounted, setMounted] = useState(false);

  const fetch = () => {
    fetchData().
      then((value)=>{
        setDisplay(<div><h1>Success... {value}</h1></div>);
      })
      .catch((value)=>{
        setDisplay(
        <div>
          <h1>failure...</h1>
          <button onClick={handleClick}>Try again</button>
        </div>);
        
      })
  }

  useEffect(()=>{  
    setMounted(true);
    if(!mounted) fetch();
    console.log("effect used");
  });

  const handleClick = () => {
    setDisplay(<h1>Loading...</h1>)
    fetch();
  }

  return display;
}
