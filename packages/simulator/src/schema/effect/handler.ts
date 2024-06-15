import { RxChangeEvent } from "rxdb";
import { EffectType } from ".";
import { EffectMap, EffectNameType } from "../../effect";

export async function handleEffectChange({
  documentData,
  previousDocumentData,
}: RxChangeEvent<EffectType>) {
  const eventSystem = globalThis.Simulator.eventSystem;

  if (previousDocumentData && previousDocumentData != documentData) {
    await eventSystem.emit("effectDeActive", {
      effectName: previousDocumentData.name as EffectNameType,
      data: {
        pieceId: documentData.id,
        stack: previousDocumentData?.stack,
      },
    });
  }

  await eventSystem.emit("effectActive", {
    effectName: documentData.name as EffectNameType,
    data: {
      pieceId: documentData.id,
      stack: documentData.stack,
    },
  });
}
