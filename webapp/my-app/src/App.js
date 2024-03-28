import logo from "./logo.svg";
import "./App.css";
import "./tailwindstyles.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";
import Verification from "./Verification";
import Resetpassword from "./Resetpassword";
import Backadmin from "./Backadmin";
import Courseadd from "./Courseadd";
import Advising from "./Advising";
import Viewrecords from "./Viewrecords";
import Adminadvising from "./Adminadvising";
import Adminadvisinguser from "./Adminadvisinguser";
import Profilesettings from "./Profilesettings";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile/:emailToGo/:adminVal" element={<Profile />} />
          {/*<Route path="/profile/:emailToGo/:adminVal/:verifyer" element={<Profile/>}/>*/}

          <Route
            path="/verification/:emailToGo/:adminVal"
            element={<Verification />}
          />
          <Route
            path="/profile/resetpassword/:emailToGo/:adminVal"
            element={<Resetpassword />}
          />
          <Route
            path="/profile/:emailToGo/:adminVal/adminApprover"
            element={<Backadmin />}
          />
          <Route
            path="/profile/:emailToGo/:adminVal/preReq"
            element={<Courseadd />}
          />
          <Route
            path="/profile/:emailToGo/:adminVal/course-advising-form"
            element={<Advising />}
          />
          <Route
            path="/profile/:emailToGo/:adminVal/studentRecord"
            element={<Viewrecords />}
          />
          <Route
            path="/profile/advisingadmin/:emailToGo/:adminVal"
            element={<Adminadvising />}
          />
          <Route
            path="/profile/adminAdvisingUser/:emailToGo/:adminVal/:student_id/:student_name"
            element={<Adminadvisinguser />}
          />
          <Route
            path="/profile/:emailToGo/:adminVal/profileupdater"
            element={<Profilesettings />}
          />

          {/* Other routes */}
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
