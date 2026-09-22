/*
  Warnings:

  - Added the required column `inputType` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnType` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "inputType" TEXT NOT NULL,
ADD COLUMN     "returnType" TEXT NOT NULL;
