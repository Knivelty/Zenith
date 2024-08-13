import { cn } from "../lib/utils";

export function GreenButton({
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn("bg-[#06FF00]", "text-black", "rounded", className)}
            {...props}
        />
    );
}
