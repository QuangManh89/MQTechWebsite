#!/usr/bin/env python3
"""
render_cam_nang_chrome.py
Renders all 8 Cẩm Nang graphic assets with Google Fonts 'Be Vietnam Pro'
using Headless Chrome for 100% perfect Vietnamese typography.
"""

import os
import re
import subprocess
import tempfile
from pathlib import Path
from PIL import Image

CHROME_BIN = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = Path(r"D:\1.Project\MQTechWeb\public\cam-nang")
CJS_PATH = Path(r"D:\1.Project\MQTechWeb\scripts\generate-cam-nang-images.cjs")

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=JetBrains+Mono:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      width: 1200px;
      height: 675px;
      overflow: hidden;
      background: #0B132B;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }}
    svg {{
      width: 1200px;
      height: 675px;
      display: block;
    }}
    text, tspan {{
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }}
    text[font-family="monospace"], tspan[font-family="monospace"] {{
      font-family: 'JetBrains Mono', monospace !important;
    }}
  </style>
</head>
<body>
{svg}
</body>
</html>
"""

def extract_svgs():
    with open(CJS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Pattern matches const svg... = `...` followed later by .toFile(...'filename.webp')
    blocks = re.findall(r"const\s+(svg\w+)\s*=\s*`([\s\S]*?)`;[\s\S]*?toFile\(path\.join\(OUTPUT_DIR,\s*['\"]([^'\"]+\.webp)['\"]\)\)", content)
    
    print(f"Found {len(blocks)} SVG definitions:")
    for varname, svg_content, filename in blocks:
        print(f" - {varname} -> {filename} ({len(svg_content)} chars)")
    return blocks

def render_svg_to_webp(svg_content, out_filename):
    out_path = OUTPUT_DIR / out_filename
    html_content = HTML_TEMPLATE.format(svg=svg_content.strip())
    
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".html", delete=False) as f:
        f.write(html_content)
        temp_html = Path(f.name)
        
    temp_png = temp_html.with_suffix(".png")
    
    try:
        cmd = [
            CHROME_BIN,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--window-size=1200,675",
            f"--screenshot={temp_png}",
            f"file:///{temp_html.as_posix()}"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if res.returncode != 0:
            print(f"[ERROR] Chrome failed on {out_filename}: {res.stderr}")
            return False
            
        if not temp_png.exists():
            print(f"[ERROR] Screenshot missing for {out_filename}")
            return False
            
        img = Image.open(temp_png)
        if img.size != (1200, 675):
            img = img.crop((0, 0, 1200, 675))
            
        img.save(out_path, format="WEBP", quality=90, method=6)
        file_size_kb = out_path.stat().st_size / 1024.0
        print(f"[SUCCESS] Rendered: {out_filename} ({img.width}x{img.height} px, {file_size_kb:.1f} KB)")
        return True
    finally:
        if temp_html.exists():
            os.remove(temp_html)
        if temp_png.exists():
            os.remove(temp_png)

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    svgs = extract_svgs()
    assert len(svgs) == 8, f"Expected 8 SVGs, got {len(svgs)}"
    
    success = 0
    for varname, svg_content, filename in svgs:
        if render_svg_to_webp(svg_content, filename):
            success += 1
            
    print(f"\nAll {success}/{len(svgs)} assets successfully rendered with Be Vietnam Pro to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
