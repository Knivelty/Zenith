import { HTMLAttributes } from "react";
import { cn } from "../lib/utils";

export interface ILoadingShade {
    loading?: boolean;
    gifClassName?: string;
}

export function LoadingShade({
    className,
    gifClassName,
    loading,
    ...props
}: HTMLAttributes<HTMLDivElement> & ILoadingShade) {
    return (
        <div
            {...props}
            className={cn(
                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none",
                { invisible: !loading },
                className
            )}
        >
            <div className="absolute h-full w-full bg-black opacity-80"></div>
            <img
                className={cn(
                    "absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 h-full",
                    gifClassName
                )}
                src="/assets/ui/loading.gif"
            />
        </div>
    );
}
