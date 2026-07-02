import { BrowserRouter,Routes,Route,Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useDispatch,useSelector } from "react-redux";
import { checkAuth } from "./authSlice";
import { useEffect } from "react";

function App(){
  const dispatch=useDispatch();
  const {isAuthenticated}=useSelector((state)=>state.auth);

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch]) 

    return (<>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated?<Home></Home>:<Navigate to="/signup"/>}></Route>
        <Route path="/login" element={isAuthenticated?<Navigate to="/"/>:<Login></Login>}></Route>
        <Route path="/signup" element={isAuthenticated?<Navigate to="/"/>:<Signup></Signup>}></Route>
      </Routes>
      </BrowserRouter>

      </>)
}
export default App;