import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/bd";
import projectRoutes from "./routes/projectRoutes";
import morgan from "morgan";

dotenv.config();

connectDB();

const app = express();

app.use(cors(corsConfig));

// Leer dats del form
app.use(express.json());

// login
app.use(morgan("dev"));

// Routes
app.use("/api/projects", projectRoutes);

export default app;
