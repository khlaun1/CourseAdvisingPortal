import logo from './logo.svg';
import './App.css';
import './tailwindstyles.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Profile from './Profile';
import Verification from './Verification';
import Resetpassword from './Resetpassword';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/profile/:emailToGo/:adminVal" element={<Profile/>}/>
        <Route path="/verification/:emailToGo/:adminVal" element = {<Verification/>}/>
        <Route path="/profile/resetpassword/:emailToGo/:adminVal" element = {<Resetpassword/>}/>
        {/* Other routes */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
    
    </>
  );
}

export default App;
