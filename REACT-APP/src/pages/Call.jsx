import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useWebSocket, { ReadyState } from 'react-use-websocket'
// import throttle from 'lodash.throttle'


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
    const [callInstructions,setCallInstructions] = useState("");
    const { id } = useParams(); //call id from landing page
    const navigate = useNavigate();
    const[predictionData, setPredictionData] = useState(null)
    const loadingTexts = ['Predicting','Predicting.', 'Predicting..', 'Predicting...'];
    const [currentText, setCurrentText] = useState(0);
    const WS_URL = 'wss://cv372khba8.execute-api.us-west-2.amazonaws.com/production/';
    const didUnmount = useRef(false)
    const { lastJsonMessage, readyState }  = useWebSocket(WS_URL, {
      queryParams: {id},
      shouldReconnect: (closeEvent) => {
        return didUnmount.current === false;
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000 //ms
    });


    const connectionStatus = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
    
    
    useEffect(()=>{
      if (lastJsonMessage){
        console.log(lastJsonMessage);
        
        setPredictionData(lastJsonMessage)
    }
    },[lastJsonMessage])
    
  //   const getpredictionData = async () => {
  //   try {
  //     const url = new URL('https://spdcare.calpoly.io/classifiedResults.json'); //so the browser does not cache
  //     url.searchParams.append('nocache', new Date().getTime());
    
    
  //     const response = await fetch(url.toString());
  //     if (!response.ok) {
  //       throw new Error(`HTTPS error! status: ${response.status}`);
  //     }
  //     const calls = await response.json();
  //     return calls;
  //   } catch (error) {
  //     console.error("Could not fetch the calls:", error.message);
  //   }
  // };
     
    // useEffect(()=>{
    //   if(callInstructions != ""){
    //     navigate("/PoliceInfo");
    //   }
    // },[callInstructions,navigate])
    
    // useEffect(() => {
    //     const setter = async () =>{
    //         const data = await getpredictionData();
    //         setpredictionData(data);
    //     }
    //     setter()
    //     }, []);
        
    useEffect(() => {
        if (predictionData) {
            if(predictionData.M.ALTERNATE){
              setAltResponseConfidence(Math.round((parseFloat(lastJsonMessage?.M?.ALTERNATE?.N) ?? 0) *100))
              //setAltResponseConfidence((predictionData["ALTERNATE"]*100).toFixed(2));
            }
            if(predictionData.M.CORESPONDER){
              setCoResponserConfidence(Math.round((parseFloat(lastJsonMessage?.M?.CORESPONDER?.N) ?? 0) *100));
              //setCoResponderConfidence((predictionData["CORESPONDER"]*100).toFixed(2));
            }
            if(predictionData.M.POLICE){
              setPoliceConfidence(Math.round((parseFloat(lastJsonMessage?.M?.POLICE?.N) ?? 0) *100));
              // setPoliceConfidence((predictionData["POLICE"]*100).toFixed(2))
            }
            if(predictionData.M.NOISSUE){
              setNoIssueConfidence(Math.round((parseFloat(lastJsonMessage?.M?.NOISSUE?.N) ?? 0) *100))
              //setNoIssueConfidence(predictionData["NOISSUE"]*100).toFixed(2));
            }
            setCallInstructions(predictionData["Instructions"]);
        }
    }, [predictionData]);
    
    
  
  
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
        <h2 className='Pending'>{loadingTexts[currentText]}</h2>
      </div>
        
       {/*<button onClick={()=>{sendJsonMessage({ action: "sendMessage", data: "hello world" })}}>click me</button> */}
        
        <span>The WebSocket is currently {connectionStatus}</span> 
       
        
      <div className='Content'>
        {predictionData && predictionData.M.POLICE ? 
       <div className='Police-Container' style={{transform: `scale(${Math.min((policeConfidence/100)+1,2)})`}}>
            <span>Police Response</span>
            <span>Required</span>
            <img src={policeResponse}  onClick={() => navigate(`/PoliceInfo/${"policeResponse"}`)}/>
            <span>{Math.min(policeConfidence,100)}%</span>
           
        </div> : null}

        {predictionData && predictionData.M.CORESPONDER ? 
        <div className='CoResponder-Container' style={{transform: `scale(${Math.min((coResponserConfidence/100)+1,2)})`}}>
            <span>Co-Responder</span>
            <img src= {coResponser} onClick={() => navigate(`/PoliceInfo/${"coResponser"}`)} />
            <span>{Math.min(coResponserConfidence,100)}%</span>
          
        </div> : null}

        {predictionData && predictionData.M.NOISSUE ? 
        <div className='NoIssue-Container' style={{transform: `scale(${Math.min((noIssueConfidence/100)+1,2)})`}}>
          <span>No Safety Issue</span>
          <img src={noIssue} onClick={() => navigate(`/PoliceInfo/${"noIssue"}`)}/>
          <span>{Math.min(noIssueConfidence,100)}%</span>
        
        </div>  : null }

       {predictionData && predictionData.M.ALTERNATE ? 
       <div className='AltResponse-Container' style={{transform: `scale(${Math.min((altResponseConfidence/100)+1,2)})`}}>
          <span>Alternate</span>
          <span>Response</span>
          <img src={altResponse} onClick={() => navigate(`/PoliceInfo/${"altResponse"}`)}/>
          <span>{Math.min(altResponseConfidence,100)}%</span>
       
        </div> : null }
        
      </div>
        
    </div>
  )
}