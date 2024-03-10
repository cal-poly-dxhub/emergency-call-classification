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
    const[darrenData, setDarrenData] = useState(null)
    const loadingTexts = ['Predicting','Predicting.', 'Predicting..', 'Predicting...'];
    const [currentText, setCurrentText] = useState(0);
    const WS_URL = 'wss://cv372khba8.execute-api.us-west-2.amazonaws.com/production/';
    const didUnmount = useRef(false)
    const { lastJsonMessage, readyState, sendJsonMessage }  = useWebSocket(WS_URL, {
      queryParams: {id},
      shouldReconnect: (closeEvent) => {
        return didUnmount.current === false;
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000 //ms
    });


    
    
    
    useEffect(()=>{
      if (lastJsonMessage){
        console.log(lastJsonMessage);
        var coresponderValue = parseFloat(lastJsonMessage.M.CORESPONDER.N);
        var noIssueValue = parseFloat(lastJsonMessage.M.NOISSUE.N);
        var policeValue = parseFloat(lastJsonMessage.M.POLICE.N);
        setDarrenData(lastJsonMessage)
        
        setPoliceConfidence(Math.round((parseFloat(lastJsonMessage?.M?.POLICE?.N) ?? 0) *100));
        setNoIssueConfidence(Math.round((parseFloat(lastJsonMessage?.M?.NOISSUE?.N) ?? 0) *100))
        setCoResponserConfidence(Math.round((parseFloat(lastJsonMessage?.M?.CORESPONDER?.N) ?? 0) *100))
        setAltResponseConfidence(Math.round((parseFloat(lastJsonMessage?.M?.ALTERNATE?.N) ?? 0) *100))

        console.log(coresponderValue, noIssueValue, policeValue);
        // setDarrenData(lastJsonMessage)
    }
    },[lastJsonMessage])
    
  //   const getDarrenData = async () => {
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
    //         const data = await getDarrenData();
    //         setDarrenData(data);
    //     }
    //     setter()
    //     }, []);
        
    useEffect(() => {
        if (darrenData) {
            // console.log(darrenData);
            // console.log(darrenData["POLICE"])
            // console.log(darrenData["CORESPONDER"])
            // console.log(darrenData["NOISSUE"])
            // console.log(darrenData["Instructions"])
            // console.log(darrenData["ALTERNATE"])
            if(darrenData["ALTERNATE"]){
              setAltResponseConfidence(Math.round(darrenData["ALTERNATE"] * 100));
              //setAltResponseConfidence((darrenData["ALTERNATE"]*100).toFixed(2));
            }
            if(darrenData["CORESPONDER"]){
              setCoResponserConfidence(Math.round(darrenData["CORESPONDER"] * 100));
              //setCoResponderConfidence((darrenData["CORESPONDER"]*100).toFixed(2));
            }
            if(darrenData["POLICE"]){
              setPoliceConfidence(Math.round(darrenData["POLICE"] * 100));
              // setPoliceConfidence((darrenData["POLICE"]*100).toFixed(2))
            }
            if(darrenData["NOISSUE"]){
              setNoIssueConfidence(Math.round(darrenData["NOISSUE"] * 100));
              //setNoIssueConfidence(darrenData["NOISSUE"]*100).toFixed(2));
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
        {darrenData && darrenData.M.POLICE ? 
       <div className='Police-Container' style={{transform: `scale(${Math.min((policeConfidence/100)+1,2)})`}}>
            <span>Police Response</span>
            <span>Required</span>
            <img src={policeResponse}  onClick={() => navigate(`/PoliceInfo/${"policeResponse"}`)}/>
            <span>{Math.min(policeConfidence,100)}%</span>
           
        </div> : null}

        {darrenData && darrenData.M.CORESPONDER ? 
        <div className='CoResponder-Container' style={{transform: `scale(${Math.min((coResponserConfidence/100)+1,2)})`}}>
            <span>Co-Responder</span>
            <img src= {coResponser} onClick={() => navigate(`/PoliceInfo/${"coResponser"}`)} />
            <span>{Math.min(coResponserConfidence,100)}%</span>
          
        </div> : null}

        {darrenData && darrenData.M.NOISSUE ? 
        <div className='NoIssue-Container' style={{transform: `scale(${Math.min((noIssueConfidence/100)+1,2)})`}}>
          <span>No Safety Issue</span>
          <img src={noIssue} onClick={() => navigate(`/PoliceInfo/${"noIssue"}`)}/>
          <span>{Math.min(noIssueConfidence,100)}%</span>
        
        </div>  : null }

       {darrenData && darrenData.M.ALTERNATE ? 
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