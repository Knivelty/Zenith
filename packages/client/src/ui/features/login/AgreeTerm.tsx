import { useUIStore } from "../../../store";
import { CircleShadow } from "../../components/CircleShadow";
import { GreenButton } from "../../components/GreenButton";

export const AgreeTerm = () => {
    const setAgreeTerm = useUIStore((state) => state.setAgreeTerm);
    return (
        <div className="absolute flex flex-col z-100 h-screen w-screen bg-[url('/assets/ui/chess_bg.png')] top-0 left-0 items-center justify-center overflow-hidden z-20">
            <CircleShadow className="-z-10" />
            <div className="w-1/2 h-auto flex flex-col items-center justify-center">
                <img src="/assets/ui/zenith.png" />
            </div>
            <GreenButton
                className="mt-12 w-[30rem] h-16"
                onClick={() => setAgreeTerm(true)}
            >
                I Agree
            </GreenButton>
            <div className="mt-4 text-[0.5rem] w-[30rem]">
                By clicking 'I agree', you acknowledge that you (i) agree to the
                Terms of Service and (ii) have read and understood our Privacy
                Policy.
            </div>
        </div>
    );
};
