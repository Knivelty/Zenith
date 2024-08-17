import { createSimulator } from "../src";
import * as fs from "fs-extra";
import debug from "debug";

const timeLimit = 5000;

function setTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Time limit exceeded")), ms);
  });
}

test("test case by case", async () => {
  debug.enable("*");
  const data = fs.readFileSync("test/data/endless_loop_battle_1.json", "utf8");

  const input = JSON.parse(data) as Parameters<typeof createSimulator>[0];

  const { calculateBattleLogs, getEmittedEvents } =
    await createSimulator(input);

  try {
    await Promise.race([
      (async () => {
        const { result } = await calculateBattleLogs();
        console.log("logs: ", result);

        const allEvents = getEmittedEvents();
        console.log("allEvents: ", allEvents);
      })(),
      setTimeoutPromise(timeLimit),
    ]);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});
