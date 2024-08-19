#!/bin/bash
cd "$(dirname "$0")"

audiosprite --path "/assets/sounds/" -f howler2 -e ogg --output ../public/assets/sounds/sounds.holwer2 ../assets/sound/*.mp3 ../assets/sound/*.opus ../assets/sound/synergy/*.mp3

audiosprite --path "/assets/sounds/" -f jukebox -e ogg --output ../public/assets/sounds/sounds.jukebox ../assets/sound/*.mp3 ../assets/sound/*.opus ../assets/sound/synergy/*.mp3

mv ../public/assets/sounds/sounds.holwer2.ogg ../public/assets/sounds/sounds.ogg
rm ../public/assets/sounds/sounds.jukebox.ogg
