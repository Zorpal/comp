import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Authorisedroute from "../components/Authorisedroute";

//function to list all applicants who have sent their details in
const ListApplicants = () => {
    const [ApplicantDetails, setApplicantDetails] = useState([]);
    const [isStaff, setIsStaff] = useState(false);
    const navigate = useNavigate();
    
    //checks if the current user is an employee
    useEffect(() => {
        const retrievestaffstatus = async () => {
            try {
                const response = await api.get("/applicant/retrieve-staff-status");
                if (response.status === 200) {
                    setIsStaff(response.data.is_staff);
                    if (!response.data.is_staff) {
                        navigate("/");
                    }
                }
            } catch (error) {
                console.error("Error retrieving staff status:", error);
                navigate("/");
            }
        };
        retrievestaffstatus();
    }, [navigate]);

    //retrieves every applicant from the database
    const getApplicantDetails = useCallback(async () => {
        try {
            const response = await api.get("/applicant/applicant/list/");
            setApplicantDetails(response.data);
            console.log(response.data);
        } catch (error) {
            alert(error);
        }
    }, []);

    useEffect(() => {
        getApplicantDetails();
    }, [getApplicantDetails]);


    //function to update the recruitment tracker of an applicant, it updates to 2 so their progress bar fills to 2
    const updateRecruitmentTracker = async (email) => {
        try {
            await api.post("/applicant/updatert/", { email, recruitmenttracker: 2 });
            alert("Recruitment tracker updated successfully");
            getApplicantDetails();
        } catch (error) {
            alert(error);
        }
    };

    if (!isStaff) {
        return null;
    }

    return (
        <Authorisedroute>
        <div className="container">
            <h1 className="my-4">List of Applicants</h1>
            <div className="row">
                {ApplicantDetails.map((details) => (
                    <div
                        key={details.id}
                        className={`col-md-4 mb-4 ${
                            details.recruitmenttracker <= 1 ? "border-danger" : ""
                        }`}
                        style={{
                            border: details.recruitmenttracker <= 1 ? "2px solid red" : "none",
                            margin: "5px" 
                        }}
                    >
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{details.fullname}</h5>
                                <p className="card-text">
                                    <strong>Email:</strong> {details.email}
                                </p>
                                <p className="card-text">
                                    <strong>Phone:</strong> 0{details.phonenumber}
                                </p>
                                <p className="card-text">
                                    <strong>Skills:</strong>
                                </p>
                                <ul>
                                    <li>{details.skill_1}</li>
                                    <li>{details.skill_2}</li>
                                    <li>{details.skill_3}</li>
                                    <li>{details.skill_4}</li>
                                    <li>{details.skill_5}</li>
                                </ul>
                                <p className="card-text">
                                    <strong>Qualifications:</strong> {details.qualifications}
                                </p>
                                <p className="card-text">
                                    <strong>Preferences:</strong> {details.preferences}
                                </p>
                                <p className="card-text">
                                    <strong>CV:</strong> {details.cv}
                                </p>
                                {details.recruitmenttracker <= 1 ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => updateRecruitmentTracker(details.email)}
                                    >
                                        Update Recruitment Tracker
                                    </button>
                                ) : (
                                    <p className="text-success">This applicant has been reviewed already!</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </Authorisedroute>
    );
};

export default ListApplicants;