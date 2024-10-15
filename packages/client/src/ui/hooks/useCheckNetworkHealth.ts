import { useEffect } from "react";
import { logDebug } from "../lib/utils";

export function useCheckNetworkHealth() {
    useEffect(() => {
        const errorHandler = (event: ErrorEvent): void => {
            logDebug("Global error:", event.error);

            if (
                event.error &&
                event.error.toString().includes("RuntimeError: unreachable")
            ) {
                alert("network disconnect, page will be refreshed");
                location.reload();
            }
        };

        window.addEventListener("error", errorHandler);

        return () => {
            window.removeEventListener("error", errorHandler);
        };
    }, []);

    return;
}
