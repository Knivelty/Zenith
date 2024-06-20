import { RxChangeEvent } from "rxdb";
import { EffectType } from ".";
import { EffectNameType } from "../../effect/interface";

export async function handleEffectChange({
  documentData,
  previousDocumentData,
}: RxChangeEvent<EffectType>) {
  const eventSystem = globalThis.Simulator.eventSystem;

  await eventSystem.emit("effectChange", {
    effectName: documentData.name as EffectNameType,
    preValue: {
      pieceId: documentData.id,
      stack: previousDocumentData?.stack || 0,
      duration: previousDocumentData?.duration || 0,
    },
    value: {
      pieceId: documentData.id,
      stack: documentData.stack,
      duration: documentData.duration,
    },
  });
}
