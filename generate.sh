#!/bin/bash

# Generate index.html with all files in the directory

OUTPUT="index.html"

# Start HTML
cat > "$OUTPUT" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Files</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: white;
        }
        h1 { margin-bottom: 30px; }
        .file-item {
            padding: 15px;
            border: 1px solid #ddd;
            margin-bottom: 10px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .file-name { font-weight: bold; }
        .download-link {
            color: #0066cc;
            text-decoration: none;
        }
        .download-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>📁 Files</h1>
EOF

# Add each file (exclude index.html, generate.sh, .git, README.md)
for file in *; do
    if [ -f "$file" ] && [ "$file" != "index.html" ] && [ "$file" != "generate.sh" ] && [ "$file" != "README.md" ] && [ "$file" != ".gitignore" ]; then
        echo "    <div class=\"file-item\">" >> "$OUTPUT"
        echo "        <span class=\"file-name\">$file</span>" >> "$OUTPUT"
        echo "        <a href=\"$file\" class=\"download-link\" download>Download</a>" >> "$OUTPUT"
        echo "    </div>" >> "$OUTPUT"
    fi
done

# Close HTML
cat >> "$OUTPUT" << 'EOF'

</body>
</html>
EOF

echo "Generated $OUTPUT with all files!"
