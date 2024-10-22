import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "./components/Header";
import ListofJobs from "./webpages/ListofJobs";
import JobDetails from "./webpages/JobDetails";
import HomePage from "./webpages/HomePage";
import { useEffect, useState } from "react";
import ApplicantContext from "./context/ApplicantContext";
import Logout from "./webpages/Logout";
import NotFound from "./webpages/404NotFound";
import Login from "./webpages/Login";
import Register from "./webpages/Register";
import Footer from "./components/Footer";
import ApplicantDetails from "./webpages/ApplicantDetails";
import ApplicantProfile from "./webpages/ApplicantProfile";
import { ACCESS_TOKEN } from "./constants";
import EmployeeHome from "./webpages/EmployeeHome";
import ListApplicants from "./webpages/ListApplicants";
import AddJob from "./webpages/AddJob";

function App() {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const [userinformation, setuserinformation] = useState([]);

  const verifytoken = () => {
    const access_key = localStorage.getItem(ACCESS_TOKEN);
    const username = localStorage.getItem("username");

    fetch("/applicant/token/verify/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: access_key }),
    }).then((response) => {
      if (response.ok) {
        setuserinformation({
          ...userinformation,
          access_token: access_key,
          username: username,
        });
      } else {
        setuserinformation({
          ...userinformation,
          access_token: null,
          username: null,
        });
      }
    });
  };

  useEffect(() => {
    verifytoken();
  }, []);

  const updateuserinformation = (value) => {
    setuserinformation(value);
  };

  return (
    <BrowserRouter>
      <ApplicantContext.Provider value={{ userinformation, updateuserinformation }}>

          <GoogleOAuthProvider clientId={clientId}>
            <div className="App">
              <Header />
              <Routes>
                <Route path="/Jobs/List/" exact element={<ListofJobs />}></Route>
                <Route path="/Jobs/List/:jobId/" element={<JobDetails />}></Route>
                <Route path="/" exact element={<HomePage />}></Route>
                <Route path="/logout/" element={<Logout />}></Route>
                <Route path="/login/" element={<Login />}></Route>
                <Route path="/register/" element={<Register />}></Route>
                <Route path="*" element={<NotFound />}></Route>
                <Route path="/applicant/details/" element={<ApplicantProfile />}></Route>
                <Route path="/applicant/details/update/" element={<ApplicantDetails />}></Route>
                <Route path="/employee/home/" element={<EmployeeHome />}></Route>
                <Route path="/applicant/list/" element={<ListApplicants />}></Route>
                <Route path="/Jobs/add/" element={<AddJob />}></Route>
              </Routes>
              <Footer />
            </div>
          </GoogleOAuthProvider>

      </ApplicantContext.Provider>
    </BrowserRouter>
  );
}

export default App;