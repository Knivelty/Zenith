#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

# export RPC_URL="http://localhost:5050"
export RPC_URL="https://api.cartridge.gg/x/zenith/katana"

export WORLD_ADDRESS=$(cat ./manifests/dev/manifest.json | jq -r '.world.address')

export HOME_ADDRESS=$(cat ./manifests/dev/manifest.json | jq -r '.contracts[] | select(.kind == "DojoContract" ).address')

echo "---------------------------------------------------------------------------"
echo world : $WORLD_ADDRESS
echo " "
echo home : $HOME_ADDRESS
echo "---------------------------------------------------------------------------"

# enable system -> component authorizations
MODELS=("Player" "Piece" "InningBattle" "GlobalState" "MatchState" "Altar" "PlayerPiece" "PlayerInvPiece" "CreatureProfile" "StageProfile" "StageProfilePiece" "LevelConfig" "PlayerProfile" "ChoiceProfile")

AUTH_MODELS=""
# Give permission to the action system to write on all the models.
for component in ${MODELS[@]}; do
    AUTH_MODELS+="$component,$HOME_ADDRESS "
done

sozo auth grant writer $AUTH_MODELS

echo "Default authorizations have been successfully set."

# run intialize function
sleep 1
sozo execute $HOME_ADDRESS "initialize"
echo "Initialize successfully"

pnpm run applyValue
