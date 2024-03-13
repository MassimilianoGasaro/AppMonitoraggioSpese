require('dotenv').config();
import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose, { ConnectOptions } from "mongoose";
import { MongoClientOptions } from "mongodb";

const app = express();
// console.log(app.get("env"));

app.use(cors({
    credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// routes

const PORT = process.env.PORT;
const uri: string = process.env.DB_CONN || "mongodb+srv://massimilianogasaro95:TT52z7ZZ65NfJLVs@api-giorgia.k3obtav.mongodb.net/?retryWrites=true&w=majority";
const server = http.createServer(app);

mongoose.connect(uri).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
        console.log(`connection is opened!`);
        server.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}/`)
        });
    },
    err => { /** handle initial connection error */ 
        console.log(err);
    }
  );