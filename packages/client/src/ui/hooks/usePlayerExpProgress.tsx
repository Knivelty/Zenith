import { useEffect } from "react";
import { useDojo } from "./useDojo";
import { useComponentValue } from "@dojoengine/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useSetState } from "ahooks";
import { getComponentValueStrict } from "@dojoengine/recs";

export function usePlayerExpProgress() {
    const {
        account: { playerEntity },
        clientComponents: { Player, LevelConfig },
    } = useDojo();

    const player = useComponentValue(Player, playerEntity);

    const levelConfig = useComponentValue(
        LevelConfig,
        getEntityIdFromKeys([BigInt(player?.level || 0)])
    );

    const [expProgress, setExpProgress] = useSetState({
        percentage: ((player?.exp || 0) / (levelConfig?.expForNext || 1)) * 100,
        exp: player?.exp,
        expForNext: levelConfig?.expForNext,
        level: player?.level,
    });

    useEffect(() => {
        const sub = Player.update$.subscribe(({ value, entity }) => {
            if (entity !== playerEntity) {
                return;
            }

            console.log("value", value, "entity", entity);
            const [v, preV] = value;

            const level = v?.level;
            const expForNext = getComponentValueStrict(
                LevelConfig,
                getEntityIdFromKeys([BigInt(v?.level || 0)])
            ).expForNext;

            const preVExpForNext = getComponentValueStrict(
                LevelConfig,
                getEntityIdFromKeys([BigInt(preV?.level || 0)])
            ).expForNext;
            const p = ((v?.exp || 0) / (expForNext || 1)) * 100;

            if (!v) {
                return;
            }

            if (!preV) {
                return;
            }

            if (v.level === preV.level && v.exp === preV.exp) {
                return;
            }

            if (v.exp > preV.exp && v.level === preV.level) {
                if (expProgress.percentage === p) {
                    return;
                }
                setExpProgress({
                    percentage: p,
                    exp: v.exp,
                    level,
                    expForNext,
                });
            }

            if (v.level > preV.level) {
                setExpProgress({
                    percentage: 100,
                    exp: preVExpForNext,
                    level: preV.level,
                    expForNext: preVExpForNext,
                });

                setTimeout(
                    () =>
                        setExpProgress({
                            percentage: 0,
                            exp: 0,
                            level,
                            expForNext,
                        }),
                    1000
                );
                setTimeout(
                    () =>
                        setExpProgress({
                            percentage: p,
                            exp: v.exp,
                            level,
                            expForNext,
                        }),
                    2000
                );
            }
        });

        return () => {
            sub.unsubscribe();
        };
    }, [
        Player.update$,
        playerEntity,
        LevelConfig,
        expProgress,
        setExpProgress,
    ]);

    return expProgress;
}
