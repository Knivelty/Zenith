import { useEntityQuery } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { HasValue, getComponentValueStrict } from "@dojoengine/recs";

export function Rank() {
    const {
        clientComponents: { MatchState },
    } = useDojo();

    const endedMatchEntities = useEntityQuery([
        HasValue(MatchState, { end: true }),
    ]);

    const matchData = endedMatchEntities.map((e) => {
        return getComponentValueStrict(MatchState, e);
    });
    return <div></div>;
}
