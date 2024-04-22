import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';


//css 
import "../css/Call.css";

//assets
import policeResponse from '../assets/Police-Response.svg';
import noIssue from '../assets/No-Safety-Issue.svg';
import coResponser from '../assets/Co-Responder.svg';
import altResponse from '../assets/Alternate-Response.svg';
import InstructionsCard from '../components/InstructionsCard';

export default function Call(){
    const [policeConfidence,setPoliceConfidence] = useState(0);
    const [noIssueConfidence, setNoIssueConfidence] = useState(0);
    const [coResponserConfidence, setCoResponserConfidence] = useState(0);
    const [altResponseConfidence, setAltResponseConfidence] = useState(0);
    const [stable, setStable] = useState(false);
    const [callInstructions,setCallInstructions] = useState("");
    const { id } = useParams(); //call id from landing page
    const[predictionData, setPredictionData] = useState(null);
    const loadingTexts = ['Predicting','Predicting.', 'Predicting..', 'Predicting...'];
    const [currentText, setCurrentText] = useState(0);
    const WS_URL = 'wss://cv372khba8.execute-api.us-west-2.amazonaws.com/production/';
    const didUnmount = useRef(false); // for reconnecting
    const { lastJsonMessage, readyState }  = useWebSocket(WS_URL, {
      queryParams: {id},
      shouldReconnect: (closeEvent) => {
        return didUnmount.current === false;
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000 //ms
    });
    
    const instructions = "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis facere quas libero commodi obcaecati, porro assumenda! Qui deleniti soluta\nLorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis facere quas libero commodi obcaecati, porro assumenda! Qui deleniti soluta\nLorem ipsum dolor sit amet consectetur, adipisicing  elit. Blanditiis facere quas libero commodi obcaecati, porro assumenda! Qui deleniti soluta";


    const connectionStatus = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
    
    
    useEffect(()=>{
      if (lastJsonMessage){
        setPredictionData(lastJsonMessage);
    }
    },[lastJsonMessage]);
    
        
    useEffect(() => {
      if (predictionData) {
        
        
        setPoliceConfidence(Math.round((parseFloat(predictionData["predictions"][0]) ?? 0) * 100));
        setAltResponseConfidence(Math.round((parseFloat(predictionData["predictions"][1]) ?? 0) * 100));
        setCoResponserConfidence(Math.round((parseFloat(predictionData["predictions"][2]) ?? 0) * 100));
        setNoIssueConfidence(Math.round((parseFloat(predictionData["predictions"][3]) ?? 0) * 100));
            
        setStable(predictionData["isStable"]);
      }
    }, [predictionData]);
    
  // useEffect(()=>{
  //   console.log("stable: ", stable);
  // }, [stable]);
  
  const getColor = () =>{ //for instruction box
    const colors = ["red", "blue", "yellow", "green"];
    for (let i=0; i < predictionData["predictions"].length; i++){
      if (predictionData["predictions"][i] != 0){
        return colors[i];
      }
    }
    return null;
  };
  
  
  //pseudo animation function for "predicting..." text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prevText) => (prevText + 1) % loadingTexts.length);
    }, 500); // Update every 500 milliseconds
    return () => clearInterval(interval);
  }, []);

    return(
      <div className='Call'>
  
        <div className='Title-Container'>
          <h1>Caller ID: {id}</h1>
          {!stable &&
            <h2 className='Pending'>{loadingTexts[currentText]}</h2>
          }
          {stable &&
            <h2 className="Stable" style = {{color: "red"}}>Prediction Stable</h2>
          }
        </div>
          
        <span>The WebSocket is currently {connectionStatus}</span> 
        
        
        <div className='Content'>
        
          {stable && 
            <InstructionsCard instructions={instructions} color = {getColor()}/>
          }
          
          {!stable && predictionData && (predictionData["predictions"][0] > 0) ? 
         <div className='Police-Container' style={{transform: `scale(${Math.min((policeConfidence/100)+1,2)})`}}> {/* transform for animated resizing. min function to guard overflow*/}
              <span>Police Response</span>
              <span>Required</span>
              <img src={policeResponse}/>
              <span>{Math.min(policeConfidence,100)}%</span> {/* min function in case prediction goes over 100*/}
             
          </div> : null}
  
          {!stable && predictionData && (predictionData["predictions"][2] > 0) ? 
          <div className='CoResponder-Container' style={{transform: `scale(${Math.min((coResponserConfidence/100)+1,2)})`}}>
              <span>Co-Responder</span>
              <img src= {coResponser}/>
              <span>{Math.min(coResponserConfidence,100)}%</span>
            
          </div> : null}
  
          {!stable && predictionData && (predictionData["predictions"][3] > 0) ? 
          <div className='NoIssue-Container' style={{transform: `scale(${Math.min((noIssueConfidence/100)+1,2)})`}}>
            <span>No Safety Issue</span>
            <img src={noIssue}/>
            <span>{Math.min(noIssueConfidence,100)}%</span> 
          
          </div>  : null }
  
         {!stable && predictionData && (predictionData["predictions"][1] > 0) ? 
         <div className='AltResponse-Container' style={{transform: `scale(${Math.min((altResponseConfidence/100)+1,2)})`}}>
            <span>Alternate</span>
            <span>Response</span>
            <img src={altResponse}/>
            <span>{Math.min(altResponseConfidence,100)}%</span>
         
          </div> : null }
          
        </div>
          
      </div>
    );
}