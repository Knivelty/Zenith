type TabButtonProps = {
    label: string;
    isActive: boolean;
    onClick: () => void;
};

export const TabButton: React.FC<TabButtonProps> = ({
    label,
    isActive,
    onClick,
}) => (
    <button
        className={`w-1/2 h-12 border border-[#06FF00] p-2 ${
            isActive ? "bg-[#06FF00] text-black" : "bg-black text-[#06FF00]"
        }`}
        onClick={onClick}
    >
        {label}
    </button>
);
