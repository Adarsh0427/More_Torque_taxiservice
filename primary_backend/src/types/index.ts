import { z } from 'zod';

export const signupSchema = z.object({
  userName: z.string(),
  email: z.string(),
  password: z.string().min(6),
});



export const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
});


export const vinIdSchema = z.string();

export const vehicleIdSchema = z.object({
    vin: vinIdSchema,
    org : z.string()
});

export const orgCreateSchema = z.object({
  name: z.string(),
  account: z.string(),
  website: z.string(),
  fuelReimbursementPolicy: z.string().nullable(),
  speedLimitPolicy: z.string(),
  parentOrg: z.string().nullable(),
  childOrgs: z.array(z.object({
    name : z.string()}))
})

export const updateOrgSchema = z.object({
  name : z.string(),
  account: z.string(),
  website: z.string(),
  fuelReimbursementPolicy: z.string(),
  speedLimitPolicy: z.string()
})




