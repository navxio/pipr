-- 1️⃣ Create enum type (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'TaskProposalStatus'
  ) THEN
    CREATE TYPE "TaskProposalStatus" AS ENUM (
      'proposed',
      'accepted',
      'rejected'
    );
  END IF;
END $$;

-- 2️⃣ Add a temporary enum column
ALTER TABLE "TaskProposal"
ADD COLUMN "status_enum" "TaskProposalStatus";

-- 3️⃣ Copy data with explicit cast
UPDATE "TaskProposal"
SET "status_enum" = status::"TaskProposalStatus";

-- 4️⃣ Drop old column
ALTER TABLE "TaskProposal"
DROP COLUMN "status";

-- 5️⃣ Rename new column
ALTER TABLE "TaskProposal"
RENAME COLUMN "status_enum" TO "status";

-- 6️⃣ Make it NOT NULL
ALTER TABLE "TaskProposal"
ALTER COLUMN "status" SET NOT NULL;
