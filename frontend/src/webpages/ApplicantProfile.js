import React, { useEffect, useState } from "react";
import Authorisedroute from "../components/Authorisedroute";
import DetailsDisplay from "../webpages/DetailsDisplay";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";

const ApplicantProfile = () => {
  const [applicantDetails, setApplicantDetails] = useState([]);

  useEffect(() => {
    getApplicantDetails();
  }, []);

  const deleteApplicantDetails = (id) => {
    api.delete(`/applicant/details/delete/${id}/`).then((res) => {
      if (res.status === 204) {
        alert("Applicant details deleted successfully");
        getApplicantDetails();
      } else {
        alert("Error deleting applicant details");
      }
    });
  };


  const getApplicantDetails = async () => {
    api
      .get("/applicant/details/")
      .then((res) => res.data)
      .then((data) => {
        setApplicantDetails(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };

  return (
    <Authorisedroute>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div>Your Profile:</div>
              {applicantDetails.map((applicantDetails) => (
                <DetailsDisplay
                  applicantdetails={applicantDetails}
                  onDelete={deleteApplicantDetails}
                  key={applicantDetails.id}
                />
              ))} 
            </div>
          </div>
          <a href="/applicant/details/update/">Add details</a>

    </Authorisedroute>
  );
};

export default ApplicantProfile;