import { useEntityQuery } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { Entity, HasValue, getComponentValueStrict } from "@dojoengine/recs";
import dayjs from "dayjs";
import * as R from "ramda";
import { getPlayerProfile } from "../../hooks/usePlayerProfile";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export function Rank() {
    const {
        clientComponents: { MatchResult, PlayerProfile },
    } = useDojo();

    const endedMatchEntities = useEntityQuery([HasValue(MatchResult, {})]);

    const rankData = R.pipe(
        R.map((e: Entity) => {
            const match = getComponentValueStrict(MatchResult, e);

            return {
                player: match.player,
                playerName: getPlayerProfile(
                    PlayerProfile,
                    getEntityIdFromKeys([match.player])
                ).playerName,
                score: match.score,
                time: match.time,
                formattedTime: dayjs
                    .unix(match.time)
                    .format("YYYY-MM-DD HH:mm:ss"),
            };
        }),
        R.sortWith([R.descend(R.prop("score")), R.ascend(R.prop("time"))])
    )(endedMatchEntities);

    return (
        <div className="flex flex-col items-center justify-center w-[40rem]">
            <img className="mt-20 " src="/assets/ui/rank_banner.png"></img>
            <div className="text-[#06FF00] text-3xl font-bold self-center font-dogica mt-12">
                LeaderBoard
            </div>

            <div
                className="container mx-auto p-4 mt-4 overflow-y-auto h-[30rem]"
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#06FF00 black",
                }}
            >
                <table className="min-w-full">
                    <thead>
                        <tr className="border border-[#06FF00] uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-center border border-[#06FF00] ">
                                Rank
                            </th>
                            <th className="py-3 px-6 text-center border border-[#06FF00]">
                                Player
                            </th>
                            <th className="py-3 px-6 text-center border border-[#06FF00]">
                                Score
                            </th>
                            <th className="py-3 px-6 text-center border border-[#06FF00]">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-light">
                        {rankData.map((data, index) => (
                            <tr
                                key={data.time}
                                className="border border-[#06FF00]"
                            >
                                <td className="py-3 px-6 text-center whitespace-nowrap border border-[#06FF00]">
                                    {index + 1}
                                </td>
                                <td className="py-3 px-6 text-center border border-[#06FF00]">
                                    {data.playerName}
                                </td>
                                <td className="py-3 px-6 text-center border border-[#06FF00]">
                                    {data.score}
                                </td>
                                <td className="py-3 px-6 text-center border border-[#06FF00]">
                                    {data.formattedTime}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
