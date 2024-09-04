import React from "react";

export function OptionMenuItem({
    onClick,
    ...props
}: React.DOMAttributes<HTMLDivElement>) {
    return (
        <div
            onClick={onClick}
            {...props}
            className="w-full border border-[#06FF00] h-10 bg-black flex items-center justify-center text-xs hover:cursor-pointer"
        ></div>
    );
}
