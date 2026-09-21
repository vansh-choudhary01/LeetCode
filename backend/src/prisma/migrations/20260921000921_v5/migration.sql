/*
  Warnings:

  - Changed the type of `baseCode` on the `Problem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "baseCode",
ADD COLUMN     "baseCode" JSONB NOT NULL;
