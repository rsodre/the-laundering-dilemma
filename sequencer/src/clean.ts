import { _saveLog } from "./log";

async function main(): Promise<void> {
  await _saveLog();
}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
