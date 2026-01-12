#!/bin/bash
# Script to add icons to navigation in all HTML files

for file in *.html; do
  if [ -f "$file" ] && [ "$file" != "index.html" ]; then
    # This will be done manually for each file
    echo "Processing $file..."
  fi
done
