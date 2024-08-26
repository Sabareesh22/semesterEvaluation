import PageNotFoundImage from '../../assets/PageNotFound.gif'
function PageNotFound(){
    return(
        <div style={{height:"100vh",display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"center"}}>
            <img height={"400px"} src={PageNotFoundImage}></img>
            <h1>Page Not Found :) 404</h1>
        </div>
    )
}

export default PageNotFound