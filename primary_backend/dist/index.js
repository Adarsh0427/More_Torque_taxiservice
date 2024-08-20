"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vehicle_1 = require("./router/vehicle");
const orgs_1 = require("./router/orgs");
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const port = process.env.PORT || 4001;
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({ secret: "your-secret-key", "saveUninitialized": false, "resave": false }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/vehicles", vehicle_1.vehicleRouter);
app.use("/Orgs", orgs_1.orgsRouter);
app.listen(port, () => {
    console.log("Server started at http://localhost:" + port + "/vehicles \nServer started at http://localhost:" + port + "/orgs");
});
