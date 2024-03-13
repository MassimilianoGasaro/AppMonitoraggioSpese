import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import { Logger } from "winston";
import logger from "./logger/logger";

dotenv.config();

const app = express();

app.use(cors({
    credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// routes
// TODO

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