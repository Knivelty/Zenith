import { useEffect } from "react";
import { logDebug } from "../lib/utils";

export function useCheckNetworkHealth() {
    useEffect(() => {
        const errorHandler = (event: ErrorEvent): void => {
            logDebug("Global error:", event.error);

            logDebug("readyState: ", document.readyState);

            if (
                event.error &&
                (event.error.toString().includes("RuntimeError: unreachable") ||
                    event.error
                        .toString()
                        .includes("js api error:TypeError:network error"))
            ) {
                alert("network disconnect, page will be refreshed");
                location.reload();
            }
        };

        const beforeReloadHandler = (): void => {
            window.removeEventListener("error", errorHandler);
        };

        window.addEventListener("error", errorHandler);
        window.addEventListener("beforeunload", beforeReloadHandler);

        return () => {
            window.removeEventListener("error", errorHandler);
            window.removeEventListener("beforeunload", beforeReloadHandler);
        };
    }, []);

    return;
}
