#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

export RPC_URL="http://localhost:5050"
# export RPC_URL="https://api.cartridge.gg/x/autochessia/katana"

export WORLD_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.world.address')

export HOME_ADDRESS=$(cat ./target/dev/manifest.json | jq -r '.contracts[] | select(.name == "autochessia::home::home" ).address')

echo "---------------------------------------------------------------------------"
echo world : $WORLD_ADDRESS
echo " "
echo home : $HOME_ADDRESS
echo "---------------------------------------------------------------------------"

# enable system -> component authorizations
COMPONENTS=("Creature" "Player" "Piece" "InningBattle" "GlobalState" "MatchState" "Altar" "PlayerPiece" "PlayerInvPiece" "CreatureProfile" "StageProfile" "StageProfilePiece" "LevelConfig")

for component in ${COMPONENTS[@]}; do
    sozo auth writer $component $HOME_ADDRESS --world $WORLD_ADDRESS --rpc-url $RPC_URL
    # necessary even in local development, to avoid nonce duplicate
    sleep 1
done

echo "Default authorizations have been successfully set."

# run intialize function
sozo execute $HOME_ADDRESS "initialize"
echo "Initialize successfully"
