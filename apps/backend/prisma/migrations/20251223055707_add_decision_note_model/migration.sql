-- CreateTable
CREATE TABLE "DecisionNote" (
    "id" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DecisionNote" ADD CONSTRAINT "DecisionNote_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
