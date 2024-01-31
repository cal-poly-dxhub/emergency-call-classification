//assets
import policeResponse from '../assets/Police-Response.svg'

//css
import "../css/PoliceInfo.css"

export default function PoliceInfo(){




    return (
        <div className="PoliceInfo">

<img src={policeResponse} />
            <div className='Instructions-Container'>
                <ol>
                    <div className='Title-Img-Container'>
                        <h1>Police Response Required</h1>
                    </div>

                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, commodi est sapiente enim aliquam tempore fugit accusantium possimus nisi, quo quos rem blanditiis natus tenetur ipsum similique labore ullam modi!</li>
                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae non ea aut sit animi, quasi vitae dolorum enim alias nobis aliquam, explicabo, ipsam omnis odit aperiam. Odit aspernatur repudiandae nulla.</li>
                    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur maxime ipsa voluptatibus odit molestiae et provident, maiores nulla quae doloribus eius labore nobis esse quod veniam neque libero enim rem.</li>
                </ol>
            </div>

        </div>
    )
}