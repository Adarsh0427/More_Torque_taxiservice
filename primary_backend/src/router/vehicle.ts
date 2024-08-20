import e, {Router} from "express";
import { signupSchema, loginSchema, vehicleIdSchema, vinIdSchema} from "../types";
import { prismaClient } from "../db";
import { Response, Request } from "express";
import axios from "axios";
import session from "express-session";





const router = Router();
let requestCount =  0;
let lastRequestTime = 0;



router.get("/decode/:vin", async (req, res) => {
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
    } else {
        console.log("Request count: ", requestCount);

        lastRequestTime = currentTime;
        requestCount += 1;
        const vin = req.params.vin;
        const response = await axios.get(
            `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json&modelyear=2024`
        );
        const MetaData= response.data.Results;
        const Manufacturer_Name = MetaData.find((data: any) => data.Variable === "Manufacturer Name" ? data.Value : "");
        const Model_Name = MetaData.find((data: any) => data.Variable === "Make" ? data.Value : "");
        const Model_Year = MetaData.find((data: any) => data.Variable === "Model Year" ? data.Value : "");
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


        const data = { manufacturer: Manufacturer_Name.Value, model: Model_Name.Value, year: Model_Year.Value};
        res.status(200).json(data);
    }
  } catch (error) {
    console.error("Error decoding VIN:", error);
    const data_1 = {
        "manufacturer": "BMW MANUFACTURER CORPORATION / BMW NORTH AMERICA",
        "model": "BMW",
        "year": "2004"
    }
    res.status(200).json(data_1);
  }
});

router.post("/", async (req, res) => {  
    const parsedData = vehicleIdSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({error: parsedData.error});
    }

    const vin = parsedData.data.vin;
    const org = await prismaClient.orgs.findUnique({
        where: {
            name: parsedData.data.org
        }
    });

    if (!org) {
        return res.status(400).json({error: "Organization does not exist"});
    }


    const vehicleData = {
        data : {
            "manufacturer": "BMW MANUFACTURER CORPORATION / BMW NORTH AMERICA",
            "model": "BMW",
            "year": "2004"
        }
    };
    // const vehicleData = await axios.get(`http://localhost:4001/vehicles/decode/${vin}`);
    
    
    // if (vehicleData.status !== 200) { 
    //     return res.status(400).json({error: "Failed to decode VIN"});
    // }
    

    await prismaClient.vehicle.create({
        data: {
            vin: vin,
            manufacturer: vehicleData.data.manufacturer ?? "",
            model: vehicleData.data.model ?? "",
            year: parseInt(vehicleData.data.year) ?? 0,
            orgId: org.id
        }
    });
    await prismaClient.orgs.update({
        where: {
            id: org.id
        },
        data: {
            vehicle: { 
                connect: {
                    vin: vin
                }
            },
            vehicleId : vin
        }
    })

    res.status(201).json({message: "Vehicle added successfully"});
});

router.get("/:vin", async (req, res) => {
    const vin = vinIdSchema.safeParse(req.params.vin);
    if (!vin.success) {
        return res.status(400).json({error: vin.error});
    }

    const vehicle = await prismaClient.vehicle.findUnique({
        where: {
            vin: vin.data
        }
    });

    if (!vehicle) {
        return res.status(404).json({error: "Vehicle not found"});
    }

    res.status(200).json(vehicle);
});


export const vehicleRouter = router;