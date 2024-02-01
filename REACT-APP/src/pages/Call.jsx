import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import throttle from 'lodash.throttle'


//css 
import "../css/Call.css"

//assets
import policeResponse from '../assets/Police-Response.svg'
import noIssue from '../assets/No-Safety-Issue.svg'
import coResponser from '../assets/Co-Responder.svg'
import altResponse from '../assets/Alternate-Response.svg'

export default function Call(){
    const [policeConfidence,setPoliceConfidence] = useState(0);
    const [noIssueConfidence, setNoIssueConfidence] = useState(0);
    const [coResponserConfidence, setCoResponserConfidence] = useState(0);
    const [altResponseConfidence, setAltResponseConfidence] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();
    const WS_URL = 'wss://cv372khba8.execute-api.us-west-2.amazonaws.com/production/';
    const {  lastMessage, sendMessage, lastJsonMessage, readyState, sendJsonMessage }  = useWebSocket(WS_URL);


    if ( lastMessage && lastJsonMessage ){
        console.log(lastMessage);
        console.log(lastJsonMessage);
    }
    
    const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];
  
    

    return(
    <div className='Call'>

        <div className='Title-Container'>
            <h1>Caller ID: {id}</h1>
        </div>
        
       <button onClick={()=>{sendJsonMessage({ action: "sendMessage", data: "hello world" })}}>click me</button>
        
        <span>The WebSocket is currently {connectionStatus}</span>
        
        
     <div className='Content'>
        <div className='Police-Container' style={{transform: `scale(${Math.min(1 + policeConfidence,2)})`}}>
            <span>Police Response</span>
            <span>Required</span>
            <img src={policeResponse}  onClick={() => navigate("/PoliceInfo")}/>
            <span>{Math.min(policeConfidence * 100,100)}%</span>
        </div>

        <div className='CoResponder-Container' style={{transform: `scale(${Math.min(1 + coResponserConfidence,2)})`}}>
            <span>Co-Responder</span>
            <img src= {coResponser} />
            <span>{Math.min(coResponserConfidence*100,100)}%</span>
        </div>

        <div className='NoIssue-Container' style={{transform: `scale(${Math.min(1 + noIssueConfidence,2)})`}}>
            <span>No Safety Issue</span>
            <img src={noIssue} />
            <span>{Math.min(noIssueConfidence*100,100)}%</span>
        </div>

        <div className='AltResponse-Container' style={{transform: `scale(${Math.min(1 + altResponseConfidence,2)})`}}>
            <span>Alternate</span>
            <span>Response</span>
            <img src={altResponse} />
            <span>{Math.min(altResponseConfidence*100,100)}%</span>
        </div>
        </div>
        
    </div>
    )
}