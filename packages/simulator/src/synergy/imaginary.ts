import { logSynergy } from "../debug";
import { getAllPieceWithOrigin, getValidTraitCount } from "./utils";

const ORIGIN_IMAGINARY_NAME = "Imaginary";

export async function applyImaginarySynergy(isHome: boolean) {
  await giveExtraAction(isHome);
}

async function giveExtraAction(isHome: boolean) {
  const allImaginaryPieces = await getAllPieceWithOrigin(
    isHome,
    ORIGIN_IMAGINARY_NAME
  );
  const validCount = getValidTraitCount(allImaginaryPieces);

  if (validCount < 3) {
    return;
  }

  allImaginaryPieces.map((p) => {
    globalThis.Simulator.eventSystem.on(
      "afterPieceAction",
      async ({ pieceId, initiative }) => {
        if (p.entity === pieceId) {
          if (initiative >= 75) {
            logSynergy("Imaginary")(
              `add an extra action for ${pieceId} with initiative ${initiative - 75}`
            );
            await globalThis.Simulator.db.action_order_stack.insert({
              piece_id: pieceId,
              initiative: initiative - 75,
            });
          }
        }
      }
    );
  });
}
