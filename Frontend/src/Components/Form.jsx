import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialState = {
  NETMONTHLYINCOME: "",
  AGE: "",
  Time_With_Curr_Empr: "",
  CC_utilization: "",
  PL_utilization: "",
  enq_L6m: "",
  tot_enq: "",
  num_deliq_12mts: "",
  max_delinquency_level: "",
  num_std: "",
  CC_Flag: "0",
  PL_Flag: "0",
  MARITALSTATUS: "Single",
  EDUCATION: "GRADUATE",
  GENDER: "M",
  Credit_Score: ""
};

const Form = () => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [predictedClass, setPredictedClass] = useState(null); // State to store the predicted class
  const navigate = useNavigate(); // React Router hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from backend:", errorData);
        alert("Prediction failed. Please check the backend logs.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Predicted Class:", data.predictedClass); // Debug log
      setPredictedClass(data.predictedClass); // Store the predicted class
    } catch (error) {
      console.error("Error during prediction:", error);
      alert("An error occurred while predicting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = () => {
    // Navigate to the recommendations page with the predicted class and user inputs
    navigate("/recommendations", { state: { predictedClass, ...formData } });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6">
      <h2 className="text-2xl font-semibold text-center">
        Credit Profile Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Monthly Income (₹)", name: "NETMONTHLYINCOME" },
          { label: "Age", name: "AGE" },
          { label: "Time with Current Employer (months)", name: "Time_With_Curr_Empr" },
          { label: "Credit Card Utilization (%)", name: "CC_utilization" },
          { label: "Personal Loan Utilization (%)", name: "PL_utilization" },
          { label: "Recent Credit Inquiries (6 months)", name: "enq_L6m" },
          { label: "Total Inquiries (12 months)", name: "tot_enq" },
          { label: "Delinquencies (last 12 months)", name: "num_deliq_12mts" },
          { label: "Max Delinquency Level", name: "max_delinquency_level" },
          { label: "Number of Standard Loans", name: "num_std" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block font-medium">{field.label}</label>
            <input
              type="number"
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        ))}

        <div>
          <label className="block font-medium">Credit Card Active</label>
          <select
            name="CC_Flag"
            value={formData.CC_Flag}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Personal Loan Active</label>
          <select
            name="PL_Flag"
            value={formData.PL_Flag}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Credit Score</label>
          <input
            type="number"
            name="Credit_Score"
            value={formData.Credit_Score}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Marital Status</label>
          <select
            name="MARITALSTATUS"
            value={formData.MARITALSTATUS}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Education</label>
          <select
            name="EDUCATION"
            value={formData.EDUCATION}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          >
            <option value="12TH">12TH</option>
            <option value="GRADUATE">Graduate</option>
            <option value="OTHERS">Others</option>
            <option value="POST-GRADUATE">Post-Graduate</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="SSC">SSC</option>
            <option value="UNDER GRADUATE">Under Graduate</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Gender</label>
          <select
            name="GENDER"
            value={formData.GENDER}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Predicting..." : "Predict Credit Class"}
        </button>
      </form>

      {predictedClass && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md shadow-md text-center">
          <h3 className="text-lg font-semibold">Predicted Credit Class:</h3>
          <p className="text-2xl font-bold">{predictedClass}</p>
          <button
            onClick={handleGetRecommendations}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Get Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default Form;