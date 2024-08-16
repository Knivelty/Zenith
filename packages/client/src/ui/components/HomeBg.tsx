import { cn } from "../lib/utils";

export function HomeBg({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex z-20 absolute h-screen w-screen bg-[url('/assets/ui/home_bg.png')] top-0 left-0 justify-center overflow-hidden",
                className
            )}
            {...props}
        />
    );
}
