import {Router} from "express";
import { Response, Request } from "express";
import { orgCreateSchema, updateOrgSchema } from "../types";
import { prismaClient } from "../db";
import { Cookie } from "express-session";

const router = Router();


async function getChildrens(getChildrenQueue: string[], children_collection: string[]) {
    if (getChildrenQueue.length === 0) {
        return children_collection;
    }
    let childOrg = getChildrenQueue.shift();
    let childrenOrg = await prismaClient.orgs.findUnique({
        where: {
            id: childOrg
        },
        select: {
            childrenOrgs: {
                select: {
                    id: true
                }
            }
        }
    });
    let childrenOrgIds = childrenOrg?.childrenOrgs.map((childOrg) => { return childOrg.id; }) ?? [];
    getChildrenQueue.push(...childrenOrgIds);

    getChildrens(getChildrenQueue, children_collection);
    return children_collection;
}

router.post("/", async (req, res) => {
    const parsedData = orgCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({error: parsedData.error});
    }
    if (parsedData.data.fuelReimbursementPolicy === null) {
        parsedData.data.fuelReimbursementPolicy = "1000";
    }
    const parent_id = await prismaClient.orgs.findUnique({
        where: {
            name: parsedData.data.parentOrg ?? ""
        }
    });
    if ( parsedData.data.parentOrg && !parent_id) {
        return res.status(400).json({error: "Parent Organization does not exist"});
    }
    
    let OrgId = await prismaClient.orgs.create({    
            data: {
                name: parsedData.data.name, 
                account : parsedData.data.account,
                website : parsedData.data.website,
                fuelReimbursementPolicy : parsedData.data.fuelReimbursementPolicy ?? "",
                SpeedLimit_kms : parseInt(parsedData.data.speedLimitPolicy),
                vehicleId : "",

                parentId : parent_id?.id ,
                childrenOrgs : {
                    connect: parsedData.data.childOrgs.map((childOrg) => {
                        return {
                            name: childOrg.name
                        }
                })} ?? []
        }});
    
    res.json({"orgId" : OrgId });
    
})

router.patch("/", async (req, res) => {
    const parsedData = updateOrgSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({error: parsedData.error});
    }

    const org = await prismaClient.orgs.findUnique({
        where: {
            name: parsedData.data.name
        },
        select: {
            id: true,
            parentId: true,
            fuelReimbursementPolicy: true,
            SpeedLimit_kms: true,
            childrenOrgs: {
                select: {
                    id: true
                }
            }
        }
    });
    if (!org) {
        return res.status(400).json({error: "Organization does not exist"});
    }
    
    const cheack_speed = org?.SpeedLimit_kms;

    if ((org?.parentId === null) || (org?.fuelReimbursementPolicy == "1000")){
        await prismaClient.orgs.update({
            where: {
                id: org.id
            },
            data: {
                account: parsedData.data.account,
                website: parsedData.data.website,
                fuelReimbursementPolicy: parsedData.data.fuelReimbursementPolicy,
                SpeedLimit_kms: parseInt(parsedData.data.speedLimitPolicy)
            }
        });
    }
    else {
        await prismaClient.orgs.update({
            where: {
                id: org.id
            },
            data: {
                account: parsedData.data.account,
                website: parsedData.data.website,
                SpeedLimit_kms: parseInt(parsedData.data.speedLimitPolicy)
            }
        });
    }
    
    let getChildrenQueue = org?.childrenOrgs.map((childOrg) => { return childOrg.id; });
    let children_collection = await getChildrens(getChildrenQueue , getChildrenQueue);

    for (let childOrg of children_collection ?? []) {
        const childOrgSpeedLimit =  await prismaClient.orgs.findUnique({
            where: {
                id: childOrg
            },
            select: {
                SpeedLimit_kms: true
            }
        });
    
        if (childOrgSpeedLimit?.SpeedLimit_kms == cheack_speed) { //previous value
            await prismaClient.orgs.update({
                where: {
                    id: childOrg
                },
                data: {
                    SpeedLimit_kms: parseInt(parsedData.data.speedLimitPolicy)
                }
            });
        }
    }

    res.status(200).send("Update Organization");

});



router.get("/:pageId", async (req, res) => {
    console.log(req.params.pageId);
    const pageId = req.params.pageId ?? "1"; // Get the pageId from the request
    const pageSize = 1; // Number of items per page
    const offset = (parseInt(pageId) - 1) * pageSize; // Calculate the offset based on the pageId

    const orgs = await prismaClient.orgs.findMany({
        skip: offset, // Skip the specified number of items
        take: pageSize, // Take only the specified number of items
        select: {
            id: true,
            name: true,
            account: true,
            website: true,
            fuelReimbursementPolicy: true,
            SpeedLimit_kms: true,
            parentOrg: true,
            childrenOrgs: true
        }// Take only the specified number of items
    });

    return res.json({ "orgs": orgs });

});
    





export const orgsRouter = router  ;