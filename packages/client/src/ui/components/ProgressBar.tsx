import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";

export function ProgressBar({
    size,
    strokeWidth,
    percentage,
}: {
    size: number;
    strokeWidth: number;
    percentage: number;
}) {
    const radius = size / 2;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const circleRef = useRef(null);

    const [preP, setPreP] = useState(percentage);
    const [shouldTransit, setShouldTransit] = useState(true);

    useEffect(() => {
        if (percentage === preP) {
            return;
        }
        const newShouldTransit = percentage >= preP;
        setShouldTransit(newShouldTransit);
        setPreP(percentage);

        console.log("shouldTransit: ", newShouldTransit, percentage, preP);
    }, [percentage, preP]);

    const strokeDashoffset = useMemo(
        () => circumference - (percentage / 100) * circumference,
        [circumference, percentage]
    );

    return (
        <svg width={size} height={size}>
            <circle
                ref={circleRef}
                className={cn(
                    "transition-all transform origin-center rotate-90 ease-out delay-300 duration-700",
                    { "transition-none": !shouldTransit }
                )}
                stroke="#06FF00"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="#06FF00"
                fill="transparent"
                strokeWidth={1}
                style={{ strokeDashoffset: 0 }}
                r={normalizedRadius - strokeWidth / 2} // Adjust radius to create the ring effect
                cx={radius}
                cy={radius}
            />
        </svg>
    );
}
