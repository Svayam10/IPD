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

  const renderRecommendations = () => {
    if (!recommendations) return null;

    // Split the response into sections based on headings
    const sections = recommendations.split("\n\n").map((section, index) => {
      const isHeading = section.startsWith("**");
      if (isHeading) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-4 text-blue-800">
            {section.replace(/\*\*/g, "")}
          </h3>
        );
      }
      return (
        <p key={index} className="text-left mt-2 text-gray-700">
          {section}
        </p>
      );
    });

    return sections;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md text-center">
      <h2 className="text-2xl font-semibold text-blue-600">Recommendations</h2>

      {loading ? (
        <p className="mt-6 text-lg font-medium text-gray-600">Loading recommendations...</p>
      ) : recommendations ? (
        <div className="mt-6 p-6 bg-blue-50 text-blue-900 rounded-md shadow-md text-left">
          {renderRecommendations()}
        </div>
      ) : (
        <p className="mt-6 text-lg font-medium text-red-600">
          Failed to fetch recommendations. Please try again later.
        </p>
      )}

      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default Recommendations;