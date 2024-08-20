-- CreateTable
CREATE TABLE "vehicle" (
    "id" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orgs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "fuelReimbursementPolicy" TEXT NOT NULL,
    "SpeedLimit_kms" INTEGER NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "orgs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_vin_key" ON "vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "orgs_website_key" ON "orgs"("website");

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_vin_fkey" FOREIGN KEY ("vin") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgs" ADD CONSTRAINT "orgs_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
