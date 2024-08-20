import express from "express";
import { vehicleRouter } from "./router/vehicle";
import { orgsRouter } from "./router/orgs";
import cors from "cors";
import  session from "express-session";

const port = process.env.PORT || 4001;

const app = express();  
app.use(session({secret : "your-secret-key", "saveUninitialized" : false, "resave" : false}));
app.use(express.json());
app.use(cors());


app.use("/vehicles", vehicleRouter);


app.use("/Orgs", orgsRouter);

app.listen(port, () => {
    console.log("Server started at http://localhost:" + port + "/vehicles \nServer started at http://localhost:" + port + "/orgs");

})
