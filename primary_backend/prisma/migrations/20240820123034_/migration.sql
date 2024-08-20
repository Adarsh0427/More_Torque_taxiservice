/*
  Warnings:

  - A unique constraint covering the columns `[orgId]` on the table `vehicle` will be added. If there are existing duplicate values, this will fail.
  - Made the column `orgId` on table `vehicle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "vehicle" DROP CONSTRAINT "vehicle_veh_id_fkey";

-- AlterTable
ALTER TABLE "vehicle" ALTER COLUMN "orgId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_orgId_key" ON "vehicle"("orgId");

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
