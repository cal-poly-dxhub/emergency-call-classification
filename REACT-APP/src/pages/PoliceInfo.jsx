//assets
import policeResponse from '../assets/Police-Response.svg'
import altResponse from '../assets/Alternate-Response.svg'
import noIssue from '../assets/No-Safety-Issue.svg'
import coResponser from '../assets/Co-Responder.svg'


//css
import "../css/PoliceInfo.css"

import { useParams } from 'react-router-dom'

export default function PoliceInfo(){
    

    const { issue } = useParams();
    let pic;
    let clr;
    
    if (issue === "policeResponse"){
        pic = policeResponse;
        clr = "#E84F70";
    }
    else if (issue === "coResponser"){
        pic = coResponser;
        clr = "#F2C46D";
    }
    else if (issue === "noIssue"){
        pic = noIssue;
        clr = "#41D9A1";
    }
    else if (issue === "altResponse"){
        pic = altResponse;
        clr = "#268EA6";
    }


    return (
        <div className="PoliceInfo">

            
            <div className='Instructions-Container'>
                <ol>
                
                    <div className='Title-Img-Container'>
                    <img src={pic} /> 
                        <h1 style={{color: clr}}>Police Response Required</h1>
                    </div>

                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, commodi est sapiente enim aliquam tempore fugit accusantium possimus nisi, quo quos rem blanditiis natus tenetur ipsum similique labore ullam modi!</li>
                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae non ea aut sit animi, quasi vitae dolorum enim alias nobis aliquam, explicabo, ipsam omnis odit aperiam. Odit aspernatur repudiandae nulla.</li>
                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur maxime ipsa voluptatibus odit molestiae et provident, maiores nulla quae doloribus eius labore nobis esse quod veniam neque libero enim rem.</li>
                </ol>
            </div>

        </div>
    )
}