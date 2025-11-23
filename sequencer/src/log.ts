import { config } from "dotenv";
import { writeFile } from "fs/promises";
import path from "path";

config();


//---------------------------------------------------------
// Log
//
export type LogType = {
  currentDay: number;
  authority_balance: number;
  days: {
    day: number;
    abstract: string;
    syndicates: Record<string, {
      strategy: string;
      amount_clean: number;
      amount_lost: number;
      dirty_balance: number;
      clean_balance: number;
      busted: boolean;
      success: boolean;
    }>;
  }[];
};

export let _log: LogType = {
  currentDay: 0,
  authority_balance: 0,
  days: [],
};

export const _saveLog = async () => {
  const filePath = path.resolve(process.cwd(), "../client/src/data/activity_log.json");
  try {
    await writeFile(filePath, JSON.stringify(_log, null, 2), "utf-8");
    console.log(`Activity log saved to ${filePath}`);
  } catch (error) {
    console.error("Failed to save activity log:", error);
  }
};


