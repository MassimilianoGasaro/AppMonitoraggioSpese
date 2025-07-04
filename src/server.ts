import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import { Logger } from "winston";
import logger from "./logger/logger";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

// CORS
app.use(cors({
    credentials: true,
}));

// Body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Auth e Cookie
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "secret", // Chiave segreta per firmare i cookie
    resave: false,
    saveUninitialized: false,
  })
);

// routes
app.use('/auth', authRoutes);
// app.use("/dashboard", authRoutes);

const PORT = process.env.PORT;
const uri: string | undefined = process.env.CONNECTION_STRING;
const server = http.createServer(app);

if (uri) {
    mongoose.connect(uri)
    .then(() => { /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
            logger.info("connection is opened!");
            server.listen(PORT, () => {
                logger.info(`Server is running at http://localhost:${PORT}/`);
            });
        }, err => { /** handle initial connection error */ 
            logger.error(`${err}`);
        });
}