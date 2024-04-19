import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



//css
import '../css/Landing.css';

export default function Landing() {
  const [calls, setCalls] = useState([]);
  const navigate = useNavigate();
    
  const getCalls = async () => {
    try {
      const response = await fetch('https://di2g4utr9d.execute-api.us-west-2.amazonaws.com/Prod/callfun');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const calls = await response.json();
      return calls;
    } catch (error) {
      console.error("Could not fetch the calls:", error.message);
    }
  };

    
  useEffect(() => {
    const setter = async () => {
      const callsData = await getCalls();
      if (callsData) {
        setCalls(callsData);
      }
    };
    
    setter();
  }, []);
  


  return (
    <div className='Landing'>
      <div className='Title-Container'>
        <h1 className='Title'>Current Ongoing Calls</h1>
      </div>

      <div className='Calls-Container'>
        {calls ? calls.map((call,index)=>(
          call["active"] &&
          <div key={call["id"]} className='Call-Card' onClick={()=>{navigate(`/calls/${call["id"]}`)}}>
          <p className='Call-Title'>{call["id"]} - {call["loc"]}</p>
          <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis facere quas libero commodi obcaecati, porro assumenda! Qui deleniti soluta</p>
          </div>
        )) : <span> pending... </span>}
      </div>

    </div>
  );
}