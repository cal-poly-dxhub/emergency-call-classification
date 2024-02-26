import { useState, useEffect } from 'react'
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
    const[callInstructions,setCallInstructions] = useState("");
    const { id } = useParams();
    const navigate = useNavigate();
    const WS_URL = 'wss://cv372khba8.execute-api.us-west-2.amazonaws.com/production/';
    const {  lastMessage, sendMessage, lastJsonMessage, readyState, sendJsonMessage }  = useWebSocket(WS_URL);
    const [mockData,setMockData] = useState(null)
    const[darrenData, setDarrenData] = useState(null)


    if ( lastMessage && lastJsonMessage ){
        console.log(lastMessage);
        console.log(lastJsonMessage);
    }
    
    
    const getDarrenData = async () => {
    try {
      const url = new URL('https://spdcare.calpoly.io/classifiedResults.json'); //so the browser does not cache
      url.searchParams.append('nocache', new Date().getTime());
    
    
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTPS error! status: ${response.status}`);
      }
      const calls = await response.json();
      return calls;
    } catch (error) {
      console.error("Could not fetch the calls:", error.message);
    }
  };
     
    
    useEffect(() => {
        const setter = async () =>{
            const data = await getDarrenData();
            setDarrenData(data);
        }
        setter()
        }, []);
        
    useEffect(() => {
        if (darrenData) {
            console.log(darrenData);
            console.log(darrenData["POLICE"])
            console.log(darrenData["CORESPONDER"])
            console.log(darrenData["NOISSUE"])
            // console.log(darrenData["Instructions"])
            console.log(darrenData["ALTERNATE"])
            if(darrenData["ALTERNATE"]){
              setAltResponseConfidence(Math.round(darrenData["ALTERNATE"] * 100));
            }
            if(darrenData["CORESPONDER"]){
              setCoResponserConfidence(Math.round(darrenData["CORESPONDER"] * 100));
            }
            if(darrenData["POLICE"]){
              setPoliceConfidence(Math.round(darrenData["POLICE"] * 100));
            }
            if(darrenData["NOISSUE"]){
              setNoIssueConfidence(Math.round(darrenData["NOISSUE"] * 100));
            }
            setCallInstructions(darrenData["Instructions"]);
        }
    }, [darrenData]);
    
    const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];
  
  // const getMock = async () => {
  //   try {
  //     const response = await fetch('https://my-json-server.typicode.com/ryangertz/testdb3/confidence');
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const calls = await response.json();
  //     return calls;
  //   } catch (error) {
  //     console.error("Could not fetch the calls:", error.message);
  //   }
  // };
  
  //   useEffect(() => {
  //       const setter = async () =>{
  //           const data = await getMock();
  //           setMockData(data);
  //       }
  //       setter()
  //       }, []);
        
  //   useEffect(() => {
  //       if (mockData) {
  //           setAltResponseConfidence(mockData["Alt-Response"]);
  //           setCoResponserConfidence(mockData["Co-Responder"]);
  //           setPoliceConfidence(mockData["Police-Response"]);
  //           setNoIssueConfidence(mockData["No-issue"]);
  //       }
  //   }, [mockData]);
  
    function Instructions({ text }) {
  // Split the text into lines
  const lines = text.split('\n');
  // console.log(lines);
  return (
    <ol>
      {lines.map((line, index) => (
        // Use index as a key; it's acceptable here since the list is static
        <li key={index}>{line}</li>
      ))}
    </ol>
  );
}

    return(
    <div className='Call'>

      <div className='Title-Container'>
        <h1>Caller ID: {id}</h1>
      </div>
        
      {/* <button onClick={()=>{sendJsonMessage({ action: "sendMessage", data: "hello world" })}}>click me</button>
        
        <span>The WebSocket is currently {connectionStatus}</span> */}
       
        
      <div className='Content'>
        {darrenData && darrenData["POLICE"] ? 
       <div className='Police-Container' style={{transform: `scale(${Math.min((policeConfidence/100)+1,2)})`}}>
            <span>Police Response</span>
            <span>Required</span>
            <img src={policeResponse}  onClick={() => navigate(`/PoliceInfo/${"policeResponse"}`)}/>
            <span>{Math.min(policeConfidence,100)}%</span>
            <Instructions text={callInstructions} />
        </div> : null}

        {darrenData && darrenData["CORESPONDER"] ? 
        <div className='CoResponder-Container' style={{transform: `scale(${Math.min((coResponserConfidence/100)+1,2)})`}}>
            <span>Co-Responder</span>
            <img src= {coResponser} onClick={() => navigate(`/PoliceInfo/${"coResponser"}`)} />
            <span>{Math.min(coResponserConfidence,100)}%</span>
            <Instructions text={callInstructions} />
        </div> : null}

        {darrenData && darrenData["NOISSUE"] ? 
        <div className='NoIssue-Container' style={{transform: `scale(${Math.min((noIssueConfidence/100)+1,2)})`}}>
          <span>No Safety Issue</span>
          <img src={noIssue} onClick={() => navigate(`/PoliceInfo/${"noIssue"}`)}/>
          <span>{Math.min(noIssueConfidence,100)}%</span>
          <Instructions text={callInstructions} />
        </div>  : null }

       {darrenData && darrenData["ALTERNATE"] ? 
       <div className='AltResponse-Container' style={{transform: `scale(${Math.min((altResponseConfidence/100)+1,2)})`}}>
          <span>Alternate</span>
          <span>Response</span>
          <img src={altResponse} onClick={() => navigate(`/PoliceInfo/${"altResponse"}`)}/>
          <span>{Math.min(altResponseConfidence,100)}%</span>
          <Instructions text={callInstructions} />
        </div> : null }
        
      </div>
        
    </div>
  )
}