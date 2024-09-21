import { ChangeEvent, useState } from "react";
import { useDojo } from "../../hooks/useDojo";
import { zeroEntity } from "../../../utils";
import { updateComponent } from "@dojoengine/recs";

const allowedValues = [0.25, 0.5, 1, 2];

export const SpeedSlider = () => {
    const {
        clientComponents: { UserOperation },
    } = useDojo();

    const [index, setIndex] = useState(2); // default value is 1, index 2

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newIndex = parseInt(e.target.value, 10);
        setIndex(newIndex);
        updateComponent(UserOperation, zeroEntity, {
            animationSpeed: allowedValues[newIndex],
        });
    };

    return (
        <div className="fixed top-1 z-20 left-4 w-60">
            <input
                type="range"
                min={0}
                max={allowedValues.length - 1}
                step={1}
                value={index}
                onChange={handleChange}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs mt-1">
                {allowedValues.map((value, i) => (
                    <span key={i} className={i === index ? "font-bold" : ""}>
                        {value}
                    </span>
                ))}
            </div>
            <div className="text-center mt-1 text-[0.5rem]">
                Animation Speed: {allowedValues[index]}
            </div>
        </div>
    );
};
