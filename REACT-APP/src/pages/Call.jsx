import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'


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
    


    
  
    

    return(
    <div className='Call'>

        <div className='Title-Container'>
            <h1>Caller ID: {id}</h1>
        </div>
        
     <div className='Content'>
        <div className='Police-Container' style={{transform: `scale(${1 + policeConfidence})`}}>
            <span>Police Response</span>
            <span>Required</span>
            <img src={policeResponse}  onClick={() => navigate("/PoliceInfo")}/>
            <span>{policeConfidence * 100}%</span>
        </div>

        <div className='CoResponder-Container' style={{transform: `scale(${1 + coResponserConfidence})`}}>
            <span>Co-Responder</span>
            <img src= {coResponser} />
            <span>{coResponserConfidence*100}%</span>
        </div>

        <div className='NoIssue-Container' style={{transform: `scale(${1 + noIssueConfidence})`}}>
            <span>No Safety Issue</span>
            <img src={noIssue} />
            <span>{noIssueConfidence*100}%</span>
        </div>

        <div className='AltResponse-Container' style={{transform: `scale(${1 + altResponseConfidence})`}}>
            <span>Alternate</span>
            <span>Response</span>
            <img src={altResponse} />
            <span>{altResponseConfidence*100}%</span>
        </div>
        </div>
        
    </div>
    )
}