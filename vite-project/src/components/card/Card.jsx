import './Card.css'
const Card = ({content,onClick,styles})=>{
    return(
        <div style={styles} onClick={onClick} className="cardContainer">
             {content}
        </div>
    )
}

export default Card