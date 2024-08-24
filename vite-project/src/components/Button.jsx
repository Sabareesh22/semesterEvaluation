import './Button.css'

const Button = ({label,onClick,styles})=>{
    return(
        <button style={styles} onClick={onClick} className="button">
            {label}
            </button>
    )
}
export default Button;