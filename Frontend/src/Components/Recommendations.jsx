import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Recommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { predictedClass, ...userInputs } = location.state || {};

  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("http://localhost:5000/predict/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ predictedClass, ...userInputs }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations(null);
      } finally {
        setLoading(false);
      }
    };

    if (predictedClass) {
      fetchRecommendations();
    } else {
      console.error("No predicted class provided");
      setLoading(false);
    }
  }, [predictedClass, userInputs]);

  const formatText = (text) => {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    text = text.replace(/_(.*?)_/g, "<em>$1</em>");
    return text;
  };

  const renderRecommendations = () => {
    if (!recommendations) return null;

    const lines = recommendations.split("\n");
    const elements = [];

    let currentList = [];
    let listType = null;

    const flushList = () => {
      if (currentList.length === 0) return;

      const ListTag = listType === "number" ? "ol" : "ul";
      elements.push(
        <ListTag key={`list-${elements.length}`} className="ml-6 mt-2 text-gray-800 list-inside">
          {currentList.map((item, idx) => (
            <li key={idx} className="mb-2 py-1" dangerouslySetInnerHTML={{ __html: formatText(item) }} />
          ))}
        </ListTag>
      );

      currentList = [];
      listType = null;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        return;
      }

      if (/^\*\*.*\*\*$/.test(trimmed)) {
        flushList();
        elements.push(
          <h3
            key={`heading-${index}`}
            className="text-xl font-semibold mt-6 mb-3 text-blue-700 flex items-center"
            dangerouslySetInnerHTML={{ 
              __html: `<span class="inline-block bg-blue-100 p-1 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </span>${formatText(trimmed)}` 
            }}
          />
        );
      } else if (/^\d+\.\s+/.test(trimmed)) {
        if (listType !== "number") flushList();
        listType = "number";
        currentList.push(trimmed.replace(/^\d+\.\s+/, ""));
      } else if (/^[-*]\s+/.test(trimmed)) {
        if (listType !== "bullet") flushList();
        listType = "bullet";
        currentList.push(trimmed.replace(/^[-*]\s+/, ""));
      } else {
        flushList();
        elements.push(
          <p
            key={`para-${index}`}
            className="mt-3 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatText(trimmed) }}
          />
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-b from-white to-gray-50 shadow-lg rounded-lg">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
          <span className="bg-blue-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </span>
          Personalized Recommendations
        </h2>
        {predictedClass && (
          <div className="mt-3 flex flex-col items-center justify-center">
            <div className="flex items-center mb-1">
              <span className="text-gray-600 mr-2">Credit Class:</span>
              <span className={`text-lg font-semibold px-3 py-1 rounded-full ${
                predictedClass === "P1" ? "text-green-700 bg-green-50" :
                predictedClass === "P2" ? "text-blue-700 bg-blue-50" :
                predictedClass === "P3" ? "text-yellow-700 bg-yellow-50" :
                "text-red-700 bg-red-50"
              }`}>
                {predictedClass}
              </span>
            </div>
            <div className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium ${
              predictedClass === "P1" ? "bg-green-100 text-green-800" :
              predictedClass === "P2" ? "bg-blue-100 text-blue-800" :
              predictedClass === "P3" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {predictedClass === "P1" && "Excellent / Very Low Risk ✅ Approved confidently"}
              {predictedClass === "P2" && "Good / Moderate Risk ✅ Approved, maybe with conditions"}
              {predictedClass === "P3" && "Risky / Below Average ⚠️ May require review, often rejected"}
              {predictedClass === "P4" && "High Risk / Very Poor History ❌ Strongly rejected"}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium text-gray-600">Loading your personalized recommendations...</p>
        </div>
      ) : recommendations ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className={`border-l-4 pl-4 py-2 mb-6 ${
            predictedClass === "P1" ? "border-green-500 bg-green-50" :
            predictedClass === "P2" ? "border-blue-500 bg-blue-50" :
            predictedClass === "P3" ? "border-yellow-500 bg-yellow-50" :
            "border-red-500 bg-red-50"
          }`}>
            <p className={`font-medium ${
              predictedClass === "P1" ? "text-green-800" :
              predictedClass === "P2" ? "text-blue-800" :
              predictedClass === "P3" ? "text-yellow-800" :
              "text-red-800"
            }`}>
              {predictedClass === "P1" && "Congratulations on your excellent credit profile! Here are some recommendations to maintain your strong financial standing:"}
              {predictedClass === "P2" && "Your credit profile looks good! Here are some recommendations to further improve your financial health:"}
              {predictedClass === "P3" && "Your credit profile has some areas that need attention. Here are recommendations to improve your financial standing:"}
              {predictedClass === "P4" && "Your credit profile requires significant improvement. Here are key recommendations to help rebuild your financial health:"}
            </p>
          </div>
          
          <div className="recommendation-content">
            {renderRecommendations()}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center py-8">
            <span className="bg-red-100 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p className="text-xl font-medium text-red-600 mb-2">
              Unable to Load Recommendations
            </p>
            <p className="text-gray-600 text-center">
              We encountered an issue while fetching your personalized recommendations. Please try again later.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate("/")}
          className={`inline-flex items-center px-6 py-3 text-white font-medium rounded-lg shadow-md transition duration-300 ${
            predictedClass === "P1" ? "bg-green-600 hover:bg-green-700" :
            predictedClass === "P2" ? "bg-blue-600 hover:bg-blue-700" :
            predictedClass === "P3" ? "bg-yellow-600 hover:bg-yellow-700" :
            "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Credit Assessment
        </button>
      </div>
    </div>
  );
};

export default Recommendations;