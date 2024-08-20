/*
  Warnings:

  - The primary key for the `vehicle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `vehicle` table. All the data in the column will be lost.
  - The required column `veh_id` was added to the `vehicle` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "vehicle" DROP CONSTRAINT "vehicle_vin_fkey";

-- AlterTable
ALTER TABLE "vehicle" DROP CONSTRAINT "vehicle_pkey",
DROP COLUMN "id",
ADD COLUMN     "veh_id" TEXT NOT NULL,
ADD CONSTRAINT "vehicle_pkey" PRIMARY KEY ("veh_id");

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_veh_id_fkey" FOREIGN KEY ("veh_id") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
