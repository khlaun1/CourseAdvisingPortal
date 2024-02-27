import logo from './logo.svg';
import './App.css';
import './tailwindstyles.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Profile from './Profile';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/profile" element={<Profile/>}/>
        {/* Other routes */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
    
    </>
  );
}

export default App;
