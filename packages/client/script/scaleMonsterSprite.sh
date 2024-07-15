#!/bin/bash
set -euo pipefail
pushd $(dirname "$0")/..

source_dir="public/assets/monsters"
target_dir="public/assets/sprites/monsters"

for dir in "$source_dir"/*; do
    if [ -d "$dir" ]; then
        subdir=$(basename "$dir")

        source_file="$dir/0.png"
        target_file="$target_dir/$subdir/0.png"

        mkdir -p "$(dirname "$target_file")"

        if [ -f "$source_file" ]; then
            convert "$source_file" -resize 80x80 "$target_file"
            echo "Processed $source_file -> $target_file"
        else
            echo "Source file $source_file does not exist"
        fi
    fi
done
