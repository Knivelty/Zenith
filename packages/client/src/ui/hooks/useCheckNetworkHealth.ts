import { useEffect } from "react";
import { useDojo } from "./useDojo";

export function useCheckNetworkHealth() {
    const {
        networkLayer: { toriiClient },
    } = useDojo();

    useEffect(() => {
        const t = setInterval(async () => {
            try {
                await toriiClient.getEntities(1, 0);
            } catch (e) {
                alert("network disconnect, please refresh the page");
                clearInterval(t);
            }
        }, 5000);

        return () => {
            clearInterval(t);
        };
    }, [toriiClient]);
    return;
}
