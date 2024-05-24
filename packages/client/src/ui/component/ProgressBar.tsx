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

    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size}>
            <circle
                className="transition-all transform origin-center rotate-90 ease-out duration-300"
                stroke="#06FF00"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
}
