/*
  Warnings:

  - The `provenance` column on the `TaskProposal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TaskProposal" DROP COLUMN "provenance",
ADD COLUMN     "provenance" TEXT[];
