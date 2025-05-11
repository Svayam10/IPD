import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import predictRoute from "./routes/predict.js";
import dotenv from "dotenv";

dotenv.config();
const corsOptions = {
  origin: ["http://localhost:5173", "https://credilift.vercel.app"], // Add your frontend's URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

const app = express();

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use("/predict", predictRoute);

app.listen(process.env.PORT, () => console.log(`Backend running on http://localhost:${process.env.PORT}`));
