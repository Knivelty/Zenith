import { createSimulator } from "../src";
import * as fs from "fs-extra";
import debug from "debug";

const timeLimit = 5000;

function setTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Time limit exceeded")), ms);
  });
}

async function runOneCase(path: string) {
  const data = fs.readFileSync(path, "utf8");

  const input = JSON.parse(data) as Parameters<typeof createSimulator>[0];

  const { calculateBattleLogs, getEmittedEvents } =
    await createSimulator(input);

  const { result } = await calculateBattleLogs();

  // const allEvents = getEmittedEvents();
}

test("test case by case", async () => {
  debug.enable("*");
  // await runOneCase("test/data/endless_loop_battle_1.json");
  await runOneCase("test/data/endless_loop_battle_2.json");
});
