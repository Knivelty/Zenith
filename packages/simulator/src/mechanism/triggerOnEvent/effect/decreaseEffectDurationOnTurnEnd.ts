import { asyncMap } from "../../../utils/asyncHelper";

export function decreaseEffectDurationOnTurnEnd() {
  globalThis.Simulator.eventSystem.on("turnEnd", async () => {
    const all = await globalThis.Simulator.db.effect.find().exec();

    await asyncMap(all, async (effect) => {
      await effect.incrementalModify((doc) => {
        if (doc.duration >= 1) {
          doc.duration -= 1;
        } else {
          doc.duration = 0;
        }
        return doc;
      });
    });
  });
}
