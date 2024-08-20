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
Object.defineProperty(exports, "__esModule", { value: true });
exports.orgsRouter = void 0;
const express_1 = require("express");
const types_1 = require("../types");
const db_1 = require("../db");
const router = (0, express_1.Router)();
function getChildrens(getChildrenQueue, children_collection) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (getChildrenQueue.length === 0) {
            return children_collection;
        }
        let childOrg = getChildrenQueue.shift();
        let childrenOrg = yield db_1.prismaClient.orgs.findUnique({
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
        let childrenOrgIds = (_a = childrenOrg === null || childrenOrg === void 0 ? void 0 : childrenOrg.childrenOrgs.map((childOrg) => { return childOrg.id; })) !== null && _a !== void 0 ? _a : [];
        getChildrenQueue.push(...childrenOrgIds);
        getChildrens(getChildrenQueue, children_collection);
        return children_collection;
    });
}
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const parsedData = types_1.orgCreateSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ error: parsedData.error });
    }
    if (parsedData.data.fuelReimbursementPolicy === null) {
        parsedData.data.fuelReimbursementPolicy = "1000";
    }
    const parent_id = yield db_1.prismaClient.orgs.findUnique({
        where: {
            name: (_a = parsedData.data.parentOrg) !== null && _a !== void 0 ? _a : ""
        }
    });
    if (parsedData.data.parentOrg && !parent_id) {
        return res.status(400).json({ error: "Parent Organization does not exist" });
    }
    let OrgId = yield db_1.prismaClient.orgs.create({
        data: {
            name: parsedData.data.name,
            account: parsedData.data.account,
            website: parsedData.data.website,
            fuelReimbursementPolicy: (_b = parsedData.data.fuelReimbursementPolicy) !== null && _b !== void 0 ? _b : "",
            SpeedLimit_kms: parseInt(parsedData.data.speedLimitPolicy),
            vehicleId: "",
            parentId: parent_id === null || parent_id === void 0 ? void 0 : parent_id.id,
            childrenOrgs: (_c = {
                connect: parsedData.data.childOrgs.map((childOrg) => {
                    return {
                        name: childOrg.name
                    };
                })
            }) !== null && _c !== void 0 ? _c : []
        }
    });
    res.json({ "orgId": OrgId });
}));
router.patch("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = types_1.updateOrgSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ error: parsedData.error });
    }
    const org = yield db_1.prismaClient.orgs.findUnique({
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
        return res.status(400).json({ error: "Organization does not exist" });
    }
    const cheack_speed = org === null || org === void 0 ? void 0 : org.SpeedLimit_kms;
    if (((org === null || org === void 0 ? void 0 : org.parentId) === null) || ((org === null || org === void 0 ? void 0 : org.fuelReimbursementPolicy) == "1000")) {
        yield db_1.prismaClient.orgs.update({
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
        yield db_1.prismaClient.orgs.update({
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
    let getChildrenQueue = org === null || org === void 0 ? void 0 : org.childrenOrgs.map((childOrg) => { return childOrg.id; });
    let children_collection = yield getChildrens(getChildrenQueue, getChildrenQueue);
    for (let childOrg of children_collection !== null && children_collection !== void 0 ? children_collection : []) {
        const childOrgSpeedLimit = yield db_1.prismaClient.orgs.findUnique({
            where: {
                id: childOrg
            },
            select: {
                SpeedLimit_kms: true
            }
        });
        if ((childOrgSpeedLimit === null || childOrgSpeedLimit === void 0 ? void 0 : childOrgSpeedLimit.SpeedLimit_kms) == cheack_speed) { //previous value
            yield db_1.prismaClient.orgs.update({
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
}));
router.get("/:pageId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(req.params.pageId);
    const pageId = (_a = req.params.pageId) !== null && _a !== void 0 ? _a : "1"; // Get the pageId from the request
    const pageSize = 1; // Number of items per page
    const offset = (parseInt(pageId) - 1) * pageSize; // Calculate the offset based on the pageId
    const orgs = yield db_1.prismaClient.orgs.findMany({
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
        } // Take only the specified number of items
    });
    return res.json({ "orgs": orgs });
}));
exports.orgsRouter = router;
