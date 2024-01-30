import { useState} from 'react'
import { useNavigate } from 'react-router-dom';



//css
import '../css/Landing.css'

export default function Landing() {
  
  
  const [calls, setCalls] = useState(
    [{Name: "Call 1", Location: "Capitol Hill", id: 1},
    {Name: "Call 2", Location: "Green Lake", id: 2},
    {Name: "Call 3", Location: "Queen Anne", id: 3}]);

    const navigate = useNavigate();

  return (
    <div className='Landing'>
      <div className='Title-Container'>
        <h1 className='Title'>Current Ongoing Calls</h1>
      </div>

      <div className='Calls-Container'>
        {calls.map((call,index) => (
        <div key={index} className='Call-Card' onClick={() => navigate(`/calls/${call.id}`)}>
          <p className='Call-Title'>{call.Name} - {call.Location}</p>
          <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis facere quas libero commodi obcaecati, porro assumenda! Qui deleniti soluta exercitationem provident quae similique quis repellendus? Veniam laudantium quam nobis ipsam.</p>
        </div>))}
      </div>
    </div>
  )
}