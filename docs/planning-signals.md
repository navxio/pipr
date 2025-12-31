# Planning Signal Lifecycle

| Signal                         | Created when                                    | Persists across goals | Invalidated when        | Authority          |
| ------------------------------ | ----------------------------------------------- | --------------------- | ----------------------- | ------------------ |
| **Goal**                       | User submits plan                               | ❌ No                 | New goal submitted      | User               |
| **Context**                    | User asserts fact OR system infers              | ✅ Yes                | Explicitly contradicted | Context > Goal     |
| **Non-goals**                  | User states exclusion OR inferred from decision | ⚠️ Soft-yes           | Explicitly revoked      | Non-goal > Context |
| **Desired Outcome**            | User defines success                            | ❌ No                 | New goal submitted      | Goal               |
| **Already Completed Work**     | Work is observed / linked                       | ✅ Yes                | Never (append-only)     | Historical fact    |
| **Decision (with provenance)** | User accepts / rejects                          | ✅ Yes                | Never (append-only)     | Reasoned judgment  |
