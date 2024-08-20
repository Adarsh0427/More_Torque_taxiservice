"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrgSchema = exports.orgCreateSchema = exports.vehicleIdSchema = exports.vinIdSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    userName: zod_1.z.string(),
    email: zod_1.z.string(),
    password: zod_1.z.string().min(6),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string().min(6),
});
exports.vinIdSchema = zod_1.z.string();
exports.vehicleIdSchema = zod_1.z.object({
    vin: exports.vinIdSchema,
    org: zod_1.z.string()
});
exports.orgCreateSchema = zod_1.z.object({
    name: zod_1.z.string(),
    account: zod_1.z.string(),
    website: zod_1.z.string(),
    fuelReimbursementPolicy: zod_1.z.string().nullable(),
    speedLimitPolicy: zod_1.z.string(),
    parentOrg: zod_1.z.string().nullable(),
    childOrgs: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string()
    }))
});
exports.updateOrgSchema = zod_1.z.object({
    name: zod_1.z.string(),
    account: zod_1.z.string(),
    website: zod_1.z.string(),
    fuelReimbursementPolicy: zod_1.z.string(),
    speedLimitPolicy: zod_1.z.string()
});
