import { HomeBg } from '../../components/HomeBg';
import { usePersistUIStore } from '../../../store';
import { GreenButton } from '../../components/GreenButton';

export function ScaleCheck() {
    const { setDidScaleCheck } = usePersistUIStore((state) => state);

    const handleConfirm = () => {
        setDidScaleCheck(true);
    };

    return (
        <HomeBg className="relative w-screen h-screen overflow-hidden select-none">
            {/* TopBar Reference */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[40rem] h-[5rem] bg-gray-800/50 border border-gray-600 z-10 flex items-center justify-center">
                <div className="text-white">Top Bar Area</div>
            </div>

            {/* Game Board Reference (PhaserLayer) */}
            <div
                style={{
                    position: "absolute",
                    top: "calc(4% + 5rem)",
                    left: "50%",
                    width: "40rem",
                    height: "40rem",
                    transform: "translateX(-50%)",
                    zIndex: "5",
                }}
                className="bg-blue-500/20 border border-blue-400"
            >
                <div className="text-center text-white mt-4">Game Board Area</div>
            </div>

            {/* Commit Button Reference */}
            <div className="absolute top-[calc(13%+40rem)] left-1/2 transform -translate-x-1/2 w-[10rem] h-10 bg-gray-800/50 border border-gray-600 text-xs flex justify-center items-center">
                <div className="text-white">Commit Button</div>
            </div>

            {/* Inventory Reference */}
            <div className="fixed bottom-0 w-1/2 m-3 flex items-center justify-center z-10 h-[5rem] bg-gray-800/50 border border-gray-600">
                <div className="text-white">Inventory Area</div>
            </div>

            {/* Scale Check Dialog */}
            <div className="fixed right-8 top-1/2 transform -translate-y-1/2 bg-black/80 p-6 rounded-lg z-50 w-[24rem]">
                <h1 className="text-2xl font-bold mb-4 text-white">Scale Check</h1>
                <p className="text-white mb-6">
                    1. Use mouse wheel or cmd+ + cmd- to zoom<br/>
                    2. Zoom until all areas are comfortably arranged
                </p>
                <GreenButton 
                    onClick={handleConfirm}
                    className="mt-2"
                >
                    Confirm Scale
                </GreenButton>
            </div>
        </HomeBg>
    );
}
