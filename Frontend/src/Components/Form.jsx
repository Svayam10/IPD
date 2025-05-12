import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import dotenv from "dotenv";
dotenv.config();
const BACKEND_URL = process.env.BACKEND_URL;

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
  const [predictedClass, setPredictedClass] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
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
      console.log("Predicted Class:", data.predictedClass);
      setPredictedClass(data.predictedClass);
    } catch (error) {
      console.error("Error during prediction:", error);
      alert("An error occurred while predicting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = () => {
    navigate("/recommendations", { state: { predictedClass, ...formData } });
  };

  const financialFields = [
    { label: "Monthly Income (₹)", name: "NETMONTHLYINCOME", icon: "₹" },
    { label: "Credit Card Utilization (%)", name: "CC_utilization", icon: "%" },
    { label: "Personal Loan Utilization (%)", name: "PL_utilization", icon: "%" },
    { label: "Credit Score", name: "Credit_Score", icon: "#" }
  ];

  const personalFields = [
    { label: "Age", name: "AGE", icon: "#" },
    { label: "Time with Current Employer (months)", name: "Time_With_Curr_Empr", icon: "#" }
  ];

  const creditHistoryFields = [
    { label: "Recent Credit Inquiries (6 months)", name: "enq_L6m", icon: "#" },
    { label: "Total Inquiries (12 months)", name: "tot_enq", icon: "#" },
    { label: "Delinquencies (last 12 months)", name: "num_deliq_12mts", icon: "#" },
    { label: "Max Delinquency Level", name: "max_delinquency_level", icon: "#" },
    { label: "Number of Standard Loans", name: "num_std", icon: "#" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-b from-white to-gray-50 shadow-lg rounded-lg">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Credit Profile Assessment</h2>
        <p className="text-gray-600 mt-2">Complete the form below to get your credit class prediction</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded shadow-sm">
            <div className="text-sm font-bold text-green-700">P1</div>
            <div className="text-xs text-green-600">Excellent / Very Low Risk</div>
            <div className="text-xs font-medium text-green-800">✅ Approved confidently</div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded shadow-sm">
            <div className="text-sm font-bold text-blue-700">P2</div>
            <div className="text-xs text-blue-600">Good / Moderate Risk</div>
            <div className="text-xs font-medium text-blue-800">✅ Approved, with conditions</div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded shadow-sm">
            <div className="text-sm font-bold text-yellow-700">P3</div>
            <div className="text-xs text-yellow-600">Risky / Below Average</div>
            <div className="text-xs font-medium text-yellow-800">⚠️ May require review</div>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded shadow-sm">
            <div className="text-sm font-bold text-red-700">P4</div>
            <div className="text-xs text-red-600">High Risk / Poor History</div>
            <div className="text-xs font-medium text-red-800">❌ Strongly rejected</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            Personal Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {personalFields.map((field) => (
              <div key={field.name} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">{field.icon}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="GENDER"
                value={formData.GENDER}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
              <select
                name="MARITALSTATUS"
                value={formData.MARITALSTATUS}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <select
                name="EDUCATION"
                value={formData.EDUCATION}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="bg-green-100 text-green-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </span>
            Financial Information
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {financialFields.map((field) => (
              <div key={field.name} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">{field.icon}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Card Active</label>
              <select
                name="CC_Flag"
                value={formData.CC_Flag}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personal Loan Active</label>
              <select
                name="PL_Flag"
                value={formData.PL_Flag}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Credit History Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </span>
            Credit History
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {creditHistoryFields.map((field) => (
              <div key={field.name} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">{field.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
              Predict Credit Class
            </>
          )}
        </button>
      </form>

      {predictedClass && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md text-center border-l-4 border-green-500">
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Predicted Credit Class</h3>
            <p className="text-3xl font-bold mb-4 text-blue-700">{predictedClass}</p>
            <button
              onClick={handleGetRecommendations}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Get Personalized Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;