import { BrowserRouter,Routes,Route,Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useDispatch,useSelector } from "react-redux";
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";


function App(){
  const dispatch=useDispatch();
  const {isAuthenticated,user,loading}=useSelector((state)=>state.auth);

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch]) 
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }
  // loading added becoz as we refresh the page , all states get nullified including isAuthenticated false
  //  so /signup route is visited and then in the last useEffect hook works and check auth run => we found that this user isAuthenticated=true 
  // so on signup it checks if its authenticated so we direct to the home page\
  // but we dont like the signup page be visible for a moment so we we use loading => till it is verified

    return (<>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated?<Home></Home>:<Navigate to="/signup"/>}></Route>
        <Route path="/login" element={isAuthenticated?<Navigate to="/"/>:<Login></Login>}></Route>
        <Route path="/signup" element={isAuthenticated?<Navigate to="/"/>:<Signup></Signup>}></Route>
        <Route path="/admin" element={<AdminPanel/>}></Route>
         <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
        {/* when we type /admin for routing on browser the page refresh and states are lost so isAuthenticated is false so even admin cant acces /admin path 
        the solution is that we can create a button which is visible by only the admin to go to this route*/}
        {/* <Route 
        path="/admin" 
        element={
          isAuthenticated && user?.role === 'admin' ? 
            <AdminPanel /> : 
            <Navigate to="/" />
        } 
      /> */}
      </Routes>
      </BrowserRouter>

      </>)
}
export default App;