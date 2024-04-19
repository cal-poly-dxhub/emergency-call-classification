//assets
import policePic from '../assets/Police-Response.svg'
import altResponsePic from '../assets/Alternate-Response.svg'
import noIssuePic from '../assets/No-Safety-Issue.svg'
import coResponserPic from '../assets/Co-Responder.svg'

//css
import "../css/InstructionsCard.css"

export default function InstructionsCard( { instructions, color }) {
  
  let pic = null;
  let title = null;
  
  const separateInstructions = (instructions) => {
    const lines = instructions.split("\n")
    
    return(
      lines.map((instruction,index) => (
        <li key={index} >{instruction}</li>
      ))
      )
  };
  
  if(color === "red"){
    title = "Police Response Required";
    pic = policePic;
  }
  else if (color === "blue"){
    title = "Alternate Response Required";
    pic = altResponsePic;
  }
  else if (color === "yellow"){
    title = "CoResponder Response Required";
    pic = coResponserPic;
  }
  else if (color === "green"){
    title = "No Safety Issue";
    pic = noIssuePic;
  }

  
  return (
    <div className="InstructionsCard" style={{borderColor : color}}>
      <div className='Instructions-Container'>
      
        <div className='Title-Img-Container'>
          <img src={pic} /> 
          <h1 style={{color: color}}>{title}</h1>
        </div>
      
        <ol>
          {separateInstructions(instructions)}
        </ol>
        
      </div>
    </div>
    );
    
}