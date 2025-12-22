// src/context/readProjectContext.ts
import fs from "fs/promises";
import path from "path";

export async function readProjectContext() {
  const readmePath = path.resolve(process.cwd(), "../../README.md");
  console.log("readmePath: ", readmePath);

  try {
    const content = await fs.readFile(readmePath, "utf-8");
    return content.slice(0, 4000); // hard cap for now
  } catch {
    return "No project documentation available.";
  }
}
