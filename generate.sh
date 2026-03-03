#!/bin/bash

BASE="https://modulnas.netlify.app"
OUTPUT="index.html"
HEADERS="_headers"

# Simple URL encode: replace spaces with %20
urlencode() {
    local s="${1// /%20}"
    s="${s//(/%28}"
    s="${s//)/%29}"
    echo "$s"
}

# --- Generate index.html ---
cat > "$OUTPUT" << 'HTMLHEAD'
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
        }
        .file-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .file-name { font-weight: bold; }
        .download-link {
            color: #0066cc;
            text-decoration: none;
        }
        .download-link:hover { text-decoration: underline; }
        .curl-box {
            background: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .curl-cmd {
            font-family: monospace;
            font-size: 0.8rem;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            user-select: all;
        }
        .btn-copy {
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 10px;
            font-size: 0.75rem;
            cursor: pointer;
            white-space: nowrap;
        }
        .btn-copy:hover { background: #0055aa; }
    </style>
</head>
<body>
    <h1>📁 Files</h1>
HTMLHEAD

# --- Generate _headers ---
echo "# Auto-generated headers" > "$HEADERS"

i=0

for file in *; do
    [ ! -f "$file" ] && continue
    case "$file" in
        index.html|generate.sh|push.sh|README.md|.gitignore|_headers|_redirects) continue ;;
    esac

    encoded=$(urlencode "$file")

    echo "    <div class=\"file-item\">" >> "$OUTPUT"
    echo "        <div class=\"file-top\">" >> "$OUTPUT"
    echo "            <span class=\"file-name\">$file</span>" >> "$OUTPUT"
    echo "            <a href=\"$encoded\" class=\"download-link\" download>Download</a>" >> "$OUTPUT"
    echo "        </div>" >> "$OUTPUT"
    echo "        <div class=\"curl-box\">" >> "$OUTPUT"
    echo "            <span class=\"curl-cmd\" id=\"cmd-$i\">curl -O \"${BASE}/${encoded}\"</span>" >> "$OUTPUT"
    echo "            <button class=\"btn-copy\" onclick=\"copyCmd($i, this)\">Copy</button>" >> "$OUTPUT"
    echo "        </div>" >> "$OUTPUT"
    echo "    </div>" >> "$OUTPUT"

    echo "/$encoded" >> "$HEADERS"
    echo "  Content-Disposition: attachment" >> "$HEADERS"
    echo "" >> "$HEADERS"

    i=$((i + 1))
done

cat >> "$OUTPUT" << 'HTMLFOOT'

    <script>
        function copyCmd(i, btn) {
            var text = document.getElementById('cmd-' + i).textContent;
            navigator.clipboard.writeText(text).then(function() {
                btn.textContent = 'Copied!';
                setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
            });
        }
    </script>
</body>
</html>
HTMLFOOT

echo "Generated $OUTPUT with $i files"
