import { cn } from "../lib/utils";

export function CircleShadow({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "fixed w-[80%] h-[120%] left-1/2 bg-black opacity-70",
                className
            )}
            style={{
                transform: "translateX(-50%)",
                filter: "blur(150px)",
            }}
            {...props}
        />
    );
}
