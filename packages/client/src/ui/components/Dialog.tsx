import { forwardRef } from "react";
import { cn } from "../lib/utils";

export const Dialog = forwardRef(
    (
        { className, ...props }: React.HTMLAttributes<HTMLDivElement>,
        ref: React.ForwardedRef<HTMLDivElement>
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-black border-[#06FF00] flex items-center justify-start w-2/3 z-30 h-[65%] flex-col",
                    className
                )}
                {...props}
            ></div>
        );
    }
);
