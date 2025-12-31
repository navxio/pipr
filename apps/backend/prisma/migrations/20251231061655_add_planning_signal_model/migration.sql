-- CreateEnum
CREATE TYPE "PlanningSignalType" AS ENUM ('goal', 'context', 'non_goal', 'desired_outcome', 'completed_work', 'decision');

-- CreateTable
CREATE TABLE "PlanningSignal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "PlanningSignalType" NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanningSignal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlanningSignal" ADD CONSTRAINT "PlanningSignal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
