export function ProgressBar({ size, strokeWidth, percentage }) {
    const radius = size / 2;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // 计算当前进度对应的strokeDashoffset值
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size}>
            <circle
                className="transition-all transform origin-center rotate-90 ease-out duration-300"
                stroke="#0299CC"
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
