import { Button } from "./button";
import { useDojo } from "./hooks/useDojo";

export function ChessMain() {
    const {
        account: { account },
        systemCalls: { spawn, startBattle, playAnimation },
    } = useDojo();

    return (
        <div className="absolute flex-wrap justify-between p-2 space-x-3">
            {/* <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
    
          <div className="fixed left-4 bottom-32">
            <Button type="primary" onClick={() => setOpen(true)}>
              How To Play
            </Button>
          </div> */}
            {/* <GameStatusBar />
            <ShopCom />
            <div className="handle-area">
                <Chessboard setAcHeroFn={setAcHeroFn} />
                <Inventory setAcHeroFn={setAcHeroFn} />
            </div> */}
            <Button
                onClick={async () => {
                    const { receipt } = await startBattle(account);

                    receipt.then((v) => {
                        playAnimation();
                    });
                }}
            >
                start battle
            </Button>
            <Button
                onClick={async () => {
                    location.reload();
                }}
            >
                refresh
            </Button>
        </div>
    );
}
