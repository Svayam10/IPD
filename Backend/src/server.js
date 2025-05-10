import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import predictRoute from "./routes/predict.js";
import dotenv from "dotenv";

dotenv.config();

// import cors from "cors";

// const corsOptions = {
//   origin: [`http://localhost:${process.env.PORT}`, "https://your-frontend.vercel.app"], // Add your frontend's URL
//   methods: ["GET", "POST"],
//   allowedHeaders: ["Content-Type"],
// };

app.use(cors());
const app = express();
app.use(bodyParser.json());

app.use("/predict", predictRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
