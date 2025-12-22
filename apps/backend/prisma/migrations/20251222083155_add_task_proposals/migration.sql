-- CreateTable
CREATE TABLE "TaskProposal" (
    "id" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimate" INTEGER,
    "provenance" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "externalRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskProposal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskProposal" ADD CONSTRAINT "TaskProposal_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
