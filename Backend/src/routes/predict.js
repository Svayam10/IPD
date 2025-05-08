import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv"; // For environment variables
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Google Generative AI

dotenv.config();

const router = express.Router();

// Resolve the absolute path to ML/predict.py
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pythonScriptPath = path.resolve(__dirname, "../../../ML/predict.py");

// Initialize Google Generative AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Route to handle predictions
router.post("/", (req, res) => {
  console.log("Received Input Data:", req.body); // Log incoming data

  const python = spawn("python", [pythonScriptPath]);

  let result = "";
  let error = "";

  python.stdout.on("data", (data) => {
    console.log("Python stdout:", data.toString()); // Log Python stdout
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("Python stderr:", data.toString()); // Log Python stderr
    error += data.toString();
  });

  python.on("close", (code) => {
    console.log("Python process exited with code:", code); // Log exit code

    // If the process exited successfully, ignore stderr and send the result
    if (code === 0) {
      console.log("Python Output:", result.trim()); // Log Python output
      return res.json({ predictedClass: result.trim() }); // Send the predicted class to the frontend
    }

    // If the process exited with an error code, treat it as a failure
    console.error("Python Error:", error); // Log Python errors
    return res.status(500).json({ error: "Prediction failed", details: error });
  });

  // Send user data to Python script
  python.stdin.write(JSON.stringify(req.body));
  python.stdin.end();
});

// Route to handle recommendations
router.post("/recommend", async (req, res) => {
  try {
    const { predictedClass, ...userInputs } = req.body;

    // Construct the prompt for the Google Generative AI API
    const prompt = `
      Based on the following financial profile and predicted credit class, provide actionable recommendations to improve the user's credit score and financial health:

      Predicted Credit Class: ${predictedClass}
      User Inputs:
      - Monthly Income: ₹${userInputs.NETMONTHLYINCOME}
      - Age: ${userInputs.AGE}
      - Time with Current Employer: ${userInputs.Time_With_Curr_Empr} years
      - Credit Card Utilization: ${userInputs.CC_utilization}%
      - Personal Loan Utilization: ${userInputs.PL_utilization}%
      - Recent Credit Inquiries (6 months): ${userInputs.enq_L6m}
      - Total Credit Inquiries (12 months): ${userInputs.tot_enq}
      - Delinquencies (last 12 months): ${userInputs.num_deliq_12mts}
      - Max Delinquency Level: ${userInputs.max_delinquency_level}
      - Number of Standard Loans: ${userInputs.num_std}
      - Credit Card Active: ${userInputs.CC_Flag === "1" ? "Yes" : "No"}
      - Personal Loan Active: ${userInputs.PL_Flag === "1" ? "Yes" : "No"}
      - Marital Status: ${userInputs.MARITALSTATUS}
      - Education: ${userInputs.EDUCATION}
      - Gender: ${userInputs.GENDER}
      - Credit Score: ${userInputs.Credit_Score}

      Provide recommendations to:
      1. Improve the user's credit score.
      2. Enhance the user's financial health.
    Format the recommendations in a clear and concise manner, using bullet points or numbered lists where appropriate. Avoid jargon and ensure the recommendations are actionable and easy to understand.
    Be specific and provide examples where possible. The recommendations should be tailored to the user's financial profile and the predicted credit class.
    Avoid generic advice and focus on practical steps the user can take to improve their creditworthiness and financial situation.
    `;

    // Use Google Generative AI to generate recommendations
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recommendations = response.text();

    // Send the recommendations back to the frontend
    res.json({ recommendations: recommendations.trim() });
  } catch (error) {
    console.error("Error calling Google Generative AI API:", error.message);

    // Log detailed error information
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
      console.error("Response Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }

    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

export default router;