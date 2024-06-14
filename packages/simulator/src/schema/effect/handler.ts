import { RxChangeEvent } from "rxdb";
import { EffectType } from ".";
import { EffectMap } from "../../effect/createEffectSystem";

export async function handleEffectChange({
  documentData,
  previousDocumentData,
}: RxChangeEvent<EffectType>) {
  const effectSystem = globalThis.Simulator.effectSystem;

  if (previousDocumentData && previousDocumentData != documentData) {
    await effectSystem.deActive(previousDocumentData.name as keyof EffectMap, {
      pieceId: documentData.id,
      stack: previousDocumentData?.stack,
    });
  }

  await effectSystem.active(documentData.name as keyof EffectMap, {
    pieceId: documentData.id,
    stack: documentData.stack,
  });
}
