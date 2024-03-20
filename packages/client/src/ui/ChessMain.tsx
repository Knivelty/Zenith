import { useUIStore } from "../store";
import { Debugger } from "./Debugger";
import { Inventory } from "./Inventory";
import Shop from "./Shop";

export function ChessMain() {
    const loggedIn = useUIStore((state: any) => state.loggedIn);

    if (!loggedIn) {
        return <div></div>;
    }

    return (
        <div>
            <Debugger />
            <div className="relative">
                <Shop />
                <Inventory />
            </div>
        </div>
    );
}
