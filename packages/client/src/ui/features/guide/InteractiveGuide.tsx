import { ShowItem, usePersistUIStore, useUIStore } from "../../../store";
import ReactJoyride, { Step } from "react-joyride";
import { logDebug } from "../../lib/utils";

export function InterActiveGuide() {
    const { setField, guideIndex, guideRun } = useUIStore();
    const show = useUIStore((state) =>
        state.getShow(ShowItem.InterActiveGuide)
    );

    const { setSkipGuide } = usePersistUIStore((state) => state);

    const steps: Step[] = [
        {
            target: ".guide-step-1",
            content: (
                <div className="text-sm">
                    Open the shop and buy a chess piece (beast).
                </div>
            ),
            disableBeacon: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            hideFooter: true,
            styles: {},
        },
        {
            target: ".guide-step-2",
            content: (
                <div className="text-sm">
                    The "Traits" of the chess piece are displayed on it. Buy
                    chess pieces with the same "Traits" to unleash their more
                    powerful abilities. Click to buy.se a chess piece.
                </div>
            ),
            disableBeacon: true,
            hideFooter: false,
            disableOverlayClose: true,
            spotlightClicks: true,
            spotlightPadding: 10,
            styles: {},
        },
        {
            target: ".guide-step-3",
            content: (
                <div className="w-[33rem] text-sm">
                    Drag the chess pieces to the battlefield. You can adjust
                    their positions at any time before the battle begins.
                </div>
            ),
            disableBeacon: true,
            hideFooter: false,
            hideBackButton: true,
            disableOverlayClose: true,
            spotlightClicks: true,
            spotlightPadding: 10,
        },
        {
            target: ".guide-step-4",
            content: <div className="text-sm">Click to start the battle</div>,
            disableBeacon: true,
            hideFooter: false,
            hideBackButton: true,

            disableOverlayClose: true,
            spotlightClicks: true,
            spotlightPadding: 10,
        },
        {
            target: ".guide-step-5",
            content: (
                <div className="text-sm">
                    Consume 4 gold coins to buy experience points, and your
                    level will increase.
                </div>
            ),
            disableBeacon: true,
            hideFooter: false,
            disableOverlayClose: true,
            spotlightClicks: true,
            spotlightPadding: 10,
        },
        {
            target: ".guide-step-6",
            content: (
                <div className="text-sm">
                    Due to the increase in level, you can deploy one more chess
                    piece on the field.
                </div>
            ),
            disableBeacon: true,
            hideFooter: false,
            disableOverlayClose: false,
            spotlightClicks: true,
            spotlightPadding: 10,
        },

        {
            target: ".guide-step-7",
            content: (
                <div className="text-sm w-[40rem]">
                    Curse: Players will receive 10 Curse value at the beginning
                    of the 4 round. This value will affect how much Danger value
                    you get at the beginning of each round. <br />
                    <br /> Curse value = Danger value added at the start of each
                    round.
                </div>
            ),
            disableBeacon: true,
            hideFooter: false,
            disableOverlayClose: true,
            spotlightClicks: true,
            spotlightPadding: 10,
            styles: {
                buttonNext: {
                    visibility: "visible",
                    backgroundColor: "#03FF00",
                    color: "black",
                },
            },
        },

        {
            target: ".guide-step-8",
            content: (
                <div className="text-sm w-[40rem]">
                    Starting from Round 4, players will gain a Danger value
                    equal to the Curse value at the beginning of each round.
                    When the Danger value reaches 100, the Level(Round) will
                    mutate to Danger.
                </div>
            ),
            disableBeacon: true,
            hideFooter: false,
            disableOverlayClose: true,
            spotlightClicks: true,
            spotlightPadding: 10,
            styles: {
                buttonNext: {
                    visibility: "visible",
                    backgroundColor: "#03FF00",
                    color: "black",
                },
            },
        },

        {
            target: ".guide-step-9",
            content: (
                <div className="text-sm w-[40rem]">
                    Dangerous Stage: Higher difficulty, richer rewards.
                </div>
            ),
            disableBeacon: true,
            hideFooter: false,
            disableOverlayClose: true,
            spotlightClicks: true,
            spotlightPadding: 10,
            styles: {
                buttonNext: {
                    visibility: "visible",
                    backgroundColor: "#03FF00",
                    color: "black",
                },
            },
        },
    ];

    if (!show) {
        return null;
    }

    return (
        <div>
            <ReactJoyride
                run={guideRun}
                callback={(data) => {
                    const { lifecycle, index } = data;

                    if (guideIndex === 5) {
                        setTimeout(() => {
                            setField("guideIndex", guideIndex + 1);
                            setField("guideRun", false);
                        }, 1000);
                    }

                    if (guideIndex === 6 && lifecycle == "complete") {
                        setField("guideIndex", guideIndex + 1);
                        setField("guideRun", true);
                    }

                    if (guideIndex === 7 && lifecycle == "complete") {
                        setField("guideIndex", guideIndex + 1);
                        setField("guideRun", false);
                    }

                    if (index === steps.length - 1 && lifecycle == "complete") {
                        logDebug("Guide ended");
                        setSkipGuide(true);
                        setField("guideIndex", 0);
                        setField("guideRun", false);
                    }
                }}
                continuous
                disableCloseOnEsc={true}
                disableOverlayClose={true}
                spotlightClicks={true}
                hideCloseButton={true}
                showProgress
                steps={steps}
                stepIndex={guideIndex}
                hideBackButton
                styles={{
                    options: {
                        arrowColor: "white",
                        backgroundColor: "transparent",
                        textColor: "white",
                        beaconSize: 14,
                        overlayColor: "rgba(0, 0, 0, 0.5)",
                    },
                    spotlight: {
                        border: "4px solid white",
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                    },
                    tooltipFooter: { backgroundColor: "transparent" },
                    buttonNext: { visibility: "hidden" },
                }}
            />
        </div>
    );
}
