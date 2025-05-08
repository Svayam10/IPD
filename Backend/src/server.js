import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import predictRoute from "./routes/predict.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/predict", predictRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
