#!/usr/bin/env python3
"""
generate_og_image.py
Generates the official Open Graph (og:image / twitter:image) 1200x630 banner for CheckYourself.
Meets all social media requirements (Facebook, LinkedIn, Twitter/X, Slack, iMessage):
- Standard 1.91:1 aspect ratio (1200x630 px)
- File size < 150 KB
- High-contrast, legible typography with Polish character support
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_PATH = "img/og_image.jpg"
FONT_BOLD_PATH = "api/lib/dompdf/vendor/dompdf/dompdf/lib/fonts/DejaVuSans-Bold.ttf"
FONT_REG_PATH = "api/lib/dompdf/vendor/dompdf/dompdf/lib/fonts/DejaVuSans.ttf"

WIDTH, HEIGHT = 1200, 630

def create_og_image():
    # 1. Base canvas
    base = Image.new("RGB", (WIDTH, HEIGHT), color="#f8fafc")
    
    # 2. Subtle radial glow in the top-right / avatar area
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = 960, 260
    for r in range(350, 0, -5):
        alpha = int(28 * (1.0 - r / 350.0))
        glow_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(124, 58, 237, alpha))
    base.paste(glow, (0, 0), mask=glow)
    
    # 3. Engineering / architectural drafting grid (subtle lines)
    grid = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grid)
    for x in range(0, WIDTH, 40):
        gdraw.line([(x, 0), (x, HEIGHT)], fill=(124, 58, 237, 14), width=1)
    for y in range(0, HEIGHT, 40):
        gdraw.line([(0, y), (WIDTH, y)], fill=(124, 58, 237, 14), width=1)
    base.paste(grid, (0, 0), mask=grid)
    
    # 4. Right side: Place character avatars
    # Avatars: avatar_cel_ri.png, avatar_cel_se.png, avatar_cel_ie.png
    av_ri_path = "img/avatars/wersja_2/avatar_cel_ri.png"
    av_se_path = "img/avatars/wersja_2/avatar_cel_se.png"
    av_ie_path = "img/avatars/wersja_2/avatar_cel_ie.png"
    
    avatar_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    
    # Helper to paste avatar with drop shadow
    def paste_avatar(img_path, target_box, shadow_blur=18, shadow_offset=(0, 10)):
        if not os.path.exists(img_path):
            return
        av = Image.open(img_path).convert("RGBA")
        target_w = target_box[2] - target_box[0]
        target_h = target_box[3] - target_box[1]
        av = av.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Shadow
        shadow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        # Mask from alpha
        alpha = av.split()[3]
        s_img = Image.new("RGBA", (target_w, target_h), (15, 23, 42, 70))
        s_img.putalpha(alpha)
        shadow.paste(s_img, (target_box[0] + shadow_offset[0], target_box[1] + shadow_offset[1]))
        shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_blur))
        
        avatar_layer.paste(shadow, (0, 0), mask=shadow)
        avatar_layer.paste(av, target_box[:2], mask=av)

    # Background avatars (left & right)
    paste_avatar(av_ri_path, (700, 180, 700 + 260, 180 + 260), shadow_blur=12, shadow_offset=(0, 8))
    paste_avatar(av_se_path, (920, 180, 920 + 260, 180 + 260), shadow_blur=12, shadow_offset=(0, 8))
    
    # Foreground center avatar
    paste_avatar(av_ie_path, (795, 120, 795 + 320, 120 + 320), shadow_blur=22, shadow_offset=(0, 14))
    
    base.paste(avatar_layer, (0, 0), mask=avatar_layer)
    
    # 5. Left side: Typography & Badges
    draw = ImageDraw.Draw(base)
    
    font_badge = ImageFont.truetype(FONT_BOLD_PATH, 13)
    font_brand = ImageFont.truetype(FONT_BOLD_PATH, 42)
    font_h1 = ImageFont.truetype(FONT_BOLD_PATH, 34)
    font_sub = ImageFont.truetype(FONT_REG_PATH, 18)
    font_feat = ImageFont.truetype(FONT_BOLD_PATH, 17)
    font_footer = ImageFont.truetype(FONT_BOLD_PATH, 16)
    
    # Badge (Pill)
    badge_text = "MODEL RIASEC  ·  34 PYTANIA  ·  5 MINUT"
    bbox = font_badge.getbbox(badge_text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    bx, by = 75, 65
    bw, bh = tw + 28, th + 16
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=16, fill="#ede9fe", outline="#ddd6fe", width=1)
    draw.text((bx + 14, by + 8), badge_text, font=font_badge, fill="#6d28d9")
    
    # Brand title: CheckYourself .pl
    draw.text((75, 125), "CheckYourself", font=font_brand, fill="#0f172a")
    bb_brand = font_brand.getbbox("CheckYourself")
    draw.text((75 + bb_brand[2] + 2, 125), ".pl", font=font_brand, fill="#7c3aed")
    
    # Main Headline
    draw.text((75, 195), "Odkryj swój profil zawodowy\ni pasujące zawody", font=font_h1, fill="#1e293b", spacing=10)
    
    # Subtitle
    sub_text = (
        "Darmowy test predyspozycji zawodowych. Sprawdź, do jakich\n"
        "zawodów pasujesz i jak do nich wejść – także bez studiów."
    )
    draw.text((75, 305), sub_text, font=font_sub, fill="#475569", spacing=6)
    
    # Value points with stylized green checkmarks
    points = [
        "18 zawodów precyzyjnie dobranych do Twojej sytuacji",
        "Polskie realia płacowe 2026 (GUS / Sedlak & Sedlak)",
        "Praktyczny 12-tygodniowy plan wejścia i baza bonów PUP"
    ]
    
    py = 390
    for pt in points:
        # Checkmark badge circle
        draw.ellipse([75, py, 75 + 24, py + 24], fill="#ecfdf5", outline="#a7f3d0", width=1)
        draw.text((82, py + 3), "✓", font=font_badge, fill="#059669")
        # Text
        draw.text((110, py + 2), pt, font=font_feat, fill="#334155")
        py += 38
        
    # Bottom separator line
    draw.line([(75, 525), (650, 525)], fill="#e2e8f0", width=1)
    
    # Bottom reassurance tag
    draw.text((75, 545), "⚡ Wynik od razu na ekranie", font=font_footer, fill="#7c3aed")
    draw.text((320, 545), "·  Bez rejestracji", font=font_footer, fill="#64748b")
    draw.text((475, 545), "·  100% zautomatyzowane", font=font_footer, fill="#64748b")

    # 6. Save as JPEG with high quality and optimized size
    base.save(OUTPUT_PATH, "JPEG", quality=88, optimize=True)
    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Generated {OUTPUT_PATH} ({WIDTH}x{HEIGHT}) successfully! File size: {size_kb:.1f} KB")

if __name__ == "__main__":
    create_og_image()
