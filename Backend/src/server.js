import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import predictRoute from "./routes/predict.js";
import dotenv from "dotenv";

dotenv.config();
const corsOptions = {
  origin: [`http://localhost:${process.env.PORT}`, `${process.env.FRONTEND_URL}`], // Add your frontend's URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

const app = express();

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use("/predict", predictRoute);

app.listen(PORT, () => console.log(`Backend running on http://localhost:${process.env.PORT}`));
