"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRouter = void 0;
const express_1 = require("express");
const types_1 = require("../types");
const db_1 = require("../db");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
let requestCount = 0;
let lastRequestTime = 0;
router.get("/decode/:vin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Request count: ", requestCount);
        // Rate limit the fetching call to 5 requests per minute
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - lastRequestTime;
        const requestLimit = 5;
        const requestInterval = 60 * 1000; // 1 minute in milliseconds
        if (timeDifference > requestInterval)
            requestCount = 0;
        if (timeDifference < requestInterval && requestCount > requestLimit) {
            res.status(429).json({ error: "Too many requests. Please try again later." });
        }
        else {
            console.log("Request count: ", requestCount);
            lastRequestTime = currentTime;
            requestCount += 1;
            const vin = req.params.vin;
            const response = yield axios_1.default.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json&modelyear=2024`);
            const MetaData = response.data.Results;
            const Manufacturer_Name = MetaData.find((data) => data.Variable === "Manufacturer Name" ? data.Value : "");
            const Model_Name = MetaData.find((data) => data.Variable === "Make" ? data.Value : "");
            const Model_Year = MetaData.find((data) => data.Variable === "Model Year" ? data.Value : "");
            console.log("Manufacturer_Name", Model_Name.Value);
            // {
            //   "Value": "BMW MANUFACTURER CORPORATION / BMW NORTH AMERICA",
            //   "ValueId": "968",
            //   "Variable": "Manufacturer Name",
            //   "VariableId": 27
            // },
            // {
            //     "Value": "BMW MANUFACTURER CORPORATION / BMW NORTH AMERICA",
            //     "ValueId": "968",
            //     "Variable": "model Name",
            //     "VariableId": 27
            //   }, 
            //   {
            //     "Value": "BMW MANUFACTURER CORPORATION / BMW NORTH AMERICA",
            //     "ValueId": "968",
            //     "Variable": "model Year",
            //     "VariableId": 27
            //   },
            const data = { manufacturer: Manufacturer_Name.Value, model: Model_Name.Value, year: Model_Year.Value };
            res.status(200).json(data);
        }
    }
    catch (error) {
        console.error("Error decoding VIN:", error);
        const data_1 = {
            "manufacturer": "BMW MANUFACTURER CORPORATION / BMW NORTH AMERICA",
            "model": "BMW",
            "year": "2004"
        };
        res.status(200).json(data_1);
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const parsedData = types_1.vehicleIdSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ error: parsedData.error });
    }
    const vin = parsedData.data.vin;
    const org = yield db_1.prismaClient.orgs.findUnique({
        where: {
            name: parsedData.data.org
        }
    });
    if (!org) {
        return res.status(400).json({ error: "Organization does not exist" });
    }
    const vehicleData = {
        data: {
            "manufacturer": "BMW MANUFACTURER CORPORATION / BMW NORTH AMERICA",
            "model": "BMW",
            "year": "2004"
        }
    };
    // const vehicleData = await axios.get(`http://localhost:4001/vehicles/decode/${vin}`);
    // if (vehicleData.status !== 200) { 
    //     return res.status(400).json({error: "Failed to decode VIN"});
    // }
    yield db_1.prismaClient.vehicle.create({
        data: {
            vin: vin,
            manufacturer: (_a = vehicleData.data.manufacturer) !== null && _a !== void 0 ? _a : "",
            model: (_b = vehicleData.data.model) !== null && _b !== void 0 ? _b : "",
            year: (_c = parseInt(vehicleData.data.year)) !== null && _c !== void 0 ? _c : 0,
            orgId: org.id
        }
    });
    yield db_1.prismaClient.orgs.update({
        where: {
            id: org.id
        },
        data: {
            vehicle: {
                connect: {
                    vin: vin
                }
            },
            vehicleId: vin
        }
    });
    res.status(201).json({ message: "Vehicle added successfully" });
}));
router.get("/:vin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vin = types_1.vinIdSchema.safeParse(req.params.vin);
    if (!vin.success) {
        return res.status(400).json({ error: vin.error });
    }
    const vehicle = yield db_1.prismaClient.vehicle.findUnique({
        where: {
            vin: vin.data
        }
    });
    if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
}));
exports.vehicleRouter = router;
