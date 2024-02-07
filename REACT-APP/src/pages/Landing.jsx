import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';



//css
import '../css/Landing.css'

export default function Landing() {
  
  
  // const [calls, setCalls] = useState(
  //   [{Name: "Call 1", Location: "Capitol Hill", id: 1},
  //   {Name: "Call 2", Location: "Green Lake", id: 2},
  //   {Name: "Call 3", Location: "Queen Anne", id: 3}]);

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
        setCalls(callsData[0].calls);
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
        {calls ? calls.map((call, index) => (
        <div key={index} className='Call-Card' onClick={() => {
                fetch('https://di2g4utr9d.execute-api.us-west-2.amazonaws.com/Prod/callfun', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    ID: calls[index][0]
                  }),
                })
        navigate(`/calls/${calls[index][0]}`)}
        }>
          <p className='Call-Title'>{calls[index][0]} - {calls[index][1]}</p>
          <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis facere quas libero commodi obcaecati, porro assumenda! Qui deleniti soluta exercitationem provident quae similique quis repellendus? Veniam laudantium quam nobis ipsam.</p>
        </div>
          )) : <span>pending... </span>}
      </div>

    </div>
  )
}