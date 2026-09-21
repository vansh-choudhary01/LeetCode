/*
  Warnings:

  - Added the required column `baseCode` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `functionName` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "baseCode" TEXT NOT NULL,
ADD COLUMN     "functionName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "resultStatus" BOOLEAN NOT NULL,
    "result" JSONB NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
