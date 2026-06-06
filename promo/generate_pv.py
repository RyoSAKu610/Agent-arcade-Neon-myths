#!/usr/bin/env python3
from __future__ import annotations

import math
import random
import subprocess
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PROMO_DIR = ROOT / "promo"
ASSET_DIR = PROMO_DIR / "assets"
OUT_MP4 = PROMO_DIR / "neon-mythos-ledger-dawn-pv.mp4"
OUT_CREDITS = PROMO_DIR / "credits.md"
AUDIO = ASSET_DIR / "cipher-kevin-macleod.oga"
AUDIO_SOURCE_URL = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Cipher%20%28ISRC%20USUAN1100844%29.oga"

W = 1280
H = 720
FPS = 24
DURATION = 90
TOTAL_FRAMES = FPS * DURATION

FONT_REGULAR = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
FONT_BLACK = Path("/System/Library/Fonts/Supplemental/Arial Black.ttf")


@dataclass(frozen=True)
class Segment:
    start: float
    end: float
    kind: str
    location: str
    action: str
    line: str
    theme: str
    accent: tuple[int, int, int]


SEGMENTS = [
    Segment(0, 8, "title", "LUMEN ATLAS", "A broken city boots from a corrupted ledger.", "The first key will decide which myths wake next.", "midnight", (0, 229, 255)),
    Segment(8, 18, "plaza", "CENTRAL PLAZA", "YOU meet NEGO-CHAN and accept Ledger Dawn.", "NEGO-CHAN: The Atlas is blinking. Bring back the first Lumen Key.", "city", (0, 229, 255)),
    Segment(18, 28, "route", "GLITCH ROUTE 01", "Cross the neon route before the ledger rewrites itself.", "NEON: I will mark the safe tiles. Keep moving.", "route", (255, 98, 198)),
    Segment(28, 38, "temple", "GOLDEN TEMPLE", "KANE-KAMI reveals the Vault is under attack.", "KANE-KAMI: The ledger is being overwritten. Find ZERO and patch the gate.", "gold", (255, 211, 77)),
    Segment(38, 48, "causeway", "DATA CAUSEWAY", "ZERO patches the gate while hostile signals close in.", "ZERO: Hold the line. I can open one clean route.", "data", (0, 255, 136)),
    Segment(48, 58, "deal", "NEGOTIATION CUT-IN", "Choose a stance and turn rivals into temporary allies.", "YOU: Build trust. We need allies, not just money.", "deal", (255, 211, 77)),
    Segment(58, 68, "vault", "UNDERGROUND VAULT", "Enter the Vault and recover the first Lumen Key.", "SYSTEM: Key signature found. Extraction window is collapsing.", "vault", (191, 95, 255)),
    Segment(68, 80, "oracle", "ORACLE GATE", "Return the key. The first locked region begins to open.", "ORACLE: One key lights eight regions. Seven shadows answer.", "oracle", (0, 229, 255)),
    Segment(80, 90, "preview", "MIDGAME RISING", "The Atlas expands toward guilds, labs, bridges, and the Eye-Void.", "NEXT: Routes unlock, allies clash, and the city chooses a keeper.", "preview", (136, 0, 255)),
]

SPRITES = {
    "neon": ROOT / "character-pets-lite" / "neon" / "spritesheet.webp",
    "nego": ROOT / "character-pets-lite" / "nego" / "spritesheet.webp",
    "kane": ROOT / "character-pets-lite" / "kane" / "spritesheet.webp",
    "zero": ROOT / "character-pets-lite" / "zero" / "spritesheet.webp",
    "oracle": ROOT / "character-pets-lite" / "oracle" / "spritesheet.webp",
    "human": ROOT / "character-pets-lite" / "human" / "spritesheet.webp",
    "pixel": ROOT / "character-pets-lite" / "pixel" / "spritesheet.webp",
    "eyevoid": ROOT / "character-pets-lite" / "eyevoid" / "spritesheet.webp",
    "goldjack": ROOT / "character-pets-lite" / "goldjack" / "spritesheet.webp",
}


def load_font(size: int, bold: bool = False, black: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BLACK if black and FONT_BLACK.exists() else FONT_BOLD if bold and FONT_BOLD.exists() else FONT_REGULAR
    return ImageFont.truetype(str(path), size)


FONT = {
    "tiny": load_font(18),
    "small": load_font(22),
    "body": load_font(28),
    "body_bold": load_font(30, bold=True),
    "label": load_font(34, bold=True),
    "title": load_font(58, black=True),
    "mega": load_font(84, black=True),
}


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def smooth(value: float) -> float:
    value = clamp01(value)
    return value * value * (3 - 2 * value)


def ease_out(value: float) -> float:
    value = clamp01(value)
    return 1 - (1 - value) * (1 - value)


def mix(a: float, b: float, p: float) -> float:
    return a + (b - a) * p


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def rgba(color: tuple[int, int, int], alpha: int) -> tuple[int, int, int, int]:
    return color[0], color[1], color[2], alpha


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    for raw in text.split("\n"):
        words = raw.split()
        current = ""
        for word in words:
            trial = word if not current else f"{current} {word}"
            if text_size(draw, trial, font)[0] <= max_width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_glow(img: Image.Image, xy: tuple[int, int], radius: int, color: tuple[int, int, int], alpha: int = 150) -> None:
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x, y = xy
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=rgba(color, alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(radius // 2))
    img.alpha_composite(layer)


def make_gradient(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        p = y / max(1, H - 1)
        color = tuple(int(mix(top[i], bottom[i], p)) for i in range(3))
        draw.line((0, y, W, y), fill=color + (255,))
    return img


def make_base(theme: str, accent: tuple[int, int, int]) -> Image.Image:
    palettes = {
        "midnight": ((4, 6, 17), (12, 26, 46)),
        "city": ((8, 18, 42), (14, 58, 54)),
        "route": ((18, 11, 38), (18, 38, 66)),
        "gold": ((42, 30, 8), (35, 34, 18)),
        "data": ((6, 25, 38), (7, 47, 51)),
        "deal": ((26, 18, 42), (34, 22, 18)),
        "vault": ((5, 6, 14), (18, 24, 39)),
        "oracle": ((4, 16, 32), (10, 45, 68)),
        "preview": ((5, 3, 18), (25, 12, 46)),
    }
    top, bottom = palettes.get(theme, palettes["midnight"])
    img = make_gradient(top, bottom)
    draw = ImageDraw.Draw(img, "RGBA")
    rng = random.Random(theme)
    for _ in range(120):
        x = rng.randrange(0, W)
        y = rng.randrange(0, 520)
        size = rng.choice([1, 1, 2, 2, 3])
        draw.ellipse((x, y, x + size, y + size), fill=(180, 240, 255, rng.randrange(25, 100)))
    for i in range(0, W, 64):
        draw.line((i, 0, i - 160, H), fill=rgba(accent, 20), width=1)
    for j in range(260, H, 44):
        draw.line((0, j, W, j + 24), fill=rgba(accent, 18), width=1)
    draw.rectangle((0, 544, W, H), fill=(3, 5, 12, 180))
    return img


BG_CACHE = {seg.kind: make_base(seg.theme, seg.accent) for seg in SEGMENTS}
SPRITE_CACHE: dict[tuple[str, int, int, int], Image.Image] = {}


def sprite(char: str, row: int, frame: int, height: int) -> Image.Image:
    frame_count = 6 if row == 0 else 8
    frame = frame % frame_count
    key = (char, row, frame % 8, height)
    if key in SPRITE_CACHE:
        return SPRITE_CACHE[key]
    sheet = Image.open(SPRITES[char]).convert("RGBA")
    cell_w = sheet.width // 8
    cell_h = sheet.height // 9
    x = (frame % 8) * cell_w
    y = max(0, min(8, row)) * cell_h
    crop = sheet.crop((x, y, x + cell_w, y + cell_h))
    scale = height / cell_h
    crop = crop.resize((int(cell_w * scale), height), Image.Resampling.LANCZOS)
    SPRITE_CACHE[key] = crop
    return crop


def paste_center(img: Image.Image, item: Image.Image, x: int, y: int) -> None:
    img.alpha_composite(item, (int(x - item.width / 2), int(y - item.height)))


def draw_sprite_label(draw: ImageDraw.ImageDraw, x: int, y: int, label: str, color: tuple[int, int, int]) -> None:
    tw, th = text_size(draw, label, FONT["tiny"])
    rounded(draw, (x - tw // 2 - 9, y, x + tw // 2 + 9, y + th + 10), 8, (4, 7, 15, 210), rgba(color, 220), 2)
    draw.text((x - tw // 2, y + 4), label, font=FONT["tiny"], fill=(236, 248, 255, 255))


def draw_header(img: Image.Image, seg: Segment, t: float, p: float) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    rounded(draw, (34, 28, 486, 112), 16, (5, 7, 16, 188), rgba(seg.accent, 190), 2)
    draw.text((56, 43), "NEON MYTHOS", font=FONT["label"], fill=(238, 248, 255, 255))
    draw.text((58, 80), seg.location, font=FONT["small"], fill=rgba(seg.accent, 255))
    progress_w = int(1150 * (t / DURATION))
    draw.rectangle((64, 684, 64 + progress_w, 690), fill=rgba(seg.accent, 230))
    draw.rectangle((64, 690, 1214, 692), fill=(238, 248, 255, 55))


def draw_quest_panel(img: Image.Image, seg: Segment) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    rounded(draw, (42, 136, 420, 278), 16, (6, 9, 18, 205), rgba(seg.accent, 160), 2)
    draw.text((64, 154), "CURRENT ACTION", font=FONT["tiny"], fill=rgba(seg.accent, 255))
    y = 184
    for line in wrap_text(draw, seg.action, FONT["small"], 320):
        draw.text((64, y), line, font=FONT["small"], fill=(232, 243, 255, 245))
        y += 29


def draw_map_floor(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    road = rgba(seg.accent, 90)
    for i in range(9):
        y = int(356 + i * 30 + math.sin(t * 1.4 + i) * 2)
        draw.line((210 - i * 18, y, 1140 + i * 22, y + 16), fill=road, width=3)
    for i in range(7):
        x = 470 + i * 74
        draw.line((x, 330, x - 170, 544), fill=rgba(seg.accent, 54), width=2)
    for x, y, w, h, label, color in [
        (650, 294, 134, 70, "ATLAS", (0, 229, 255)),
        (834, 316, 110, 66, "GATE", (255, 211, 77)),
        (996, 352, 132, 58, "SYNC", (0, 255, 136)),
    ]:
        offset = int(math.sin(t * 2.4 + x) * 4)
        rounded(draw, (x, y + offset, x + w, y + h + offset), 8, (8, 14, 27, 205), rgba(color, 190), 2)
        draw.text((x + 18, y + 22 + offset), label, font=FONT["tiny"], fill=rgba(color, 255))


def draw_title_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    cx = W // 2
    for i, r in enumerate([280, 210, 142, 78]):
        alpha = int(40 + 28 * math.sin(t * 2 + i))
        draw.ellipse((cx - r, 88 - r, cx + r, 88 + r), outline=rgba(seg.accent, max(20, alpha)), width=3)
    title_y = int(mix(252, 218, smooth(p)))
    draw.text((W // 2 - 384, title_y), "NEON MYTHOS", font=FONT["mega"], fill=(238, 248, 255, 255))
    draw.text((W // 2 - 245, title_y + 92), "Lumen Atlas PV", font=FONT["label"], fill=rgba(seg.accent, 255))
    draw.text((W // 2 - 226, title_y + 137), "Chapter 1 to Midgame Rising", font=FONT["small"], fill=(186, 202, 219, 255))
    key_x = int(mix(-60, 1080, smooth(p)))
    draw_lumen_key(img, key_x, 372, 1.2, seg.accent, t)
    paste_center(img, sprite("neon", 0, int(t * 9), 176), 260, 500)
    paste_center(img, sprite("oracle", 0, int(t * 8 + 2), 176), 1020, 500)


def draw_plaza_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw_map_floor(img, seg, p, t)
    draw = ImageDraw.Draw(img, "RGBA")
    px = int(mix(270, 600, smooth(p)))
    paste_center(img, sprite("neon", 1, int(t * 8), 142), px, 502)
    paste_center(img, sprite("nego", 0, int(t * 7 + 2), 150), 762, 490)
    draw_sprite_label(draw, px, 510, "YOU", seg.accent)
    draw_sprite_label(draw, 762, 500, "NEGO-CHAN", (255, 98, 198))
    draw_speech(draw, 690, 178, "NEGO-CHAN", "The Atlas is blinking.", (255, 98, 198))


def draw_route_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw_map_floor(img, seg, p, t)
    draw = ImageDraw.Draw(img, "RGBA")
    for i in range(8):
        x = int(180 + i * 126 - (t * 70) % 126)
        y = 420 + int(math.sin(i + t * 5) * 18)
        draw.rectangle((x, y, x + 52, y + 8), fill=rgba(seg.accent, 115))
    px = int(mix(278, 890, ease_out(p)))
    paste_center(img, sprite("neon", 1, int(t * 10), 128), px, 500)
    paste_center(img, sprite("pixel", 0, int(t * 7), 114), 1010, 493)
    draw_sprite_label(draw, px, 508, "NEON", seg.accent)
    draw_sprite_label(draw, 1010, 502, "PIXEL", (0, 255, 136))
    draw_speech(draw, 708, 160, "NEON", "Safe tiles are moving. Follow the light.", seg.accent)


def draw_temple_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw_map_floor(img, seg, p, t)
    draw = ImageDraw.Draw(img, "RGBA")
    for i in range(5):
        x = 612 + i * 78
        draw.polygon([(x, 244), (x + 52, 244), (x + 26, 182)], fill=rgba(seg.accent, 72), outline=rgba(seg.accent, 180))
    rounded(draw, (610, 270, 1064, 414), 16, (35, 25, 9, 216), rgba(seg.accent, 220), 3)
    draw.text((758, 320), "TEMPLE", font=FONT["label"], fill=rgba(seg.accent, 255))
    paste_center(img, sprite("kane", 0, int(t * 7), 176), 864, 504)
    paste_center(img, sprite("neon", 0, int(t * 7 + 2), 136), 500, 508)
    draw_speech(draw, 520, 154, "KANE-KAMI", "The Vault ledger is being overwritten.", seg.accent)


def draw_causeway_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw_map_floor(img, seg, p, t)
    draw = ImageDraw.Draw(img, "RGBA")
    for i in range(9):
        x = 448 + i * 44
        alpha = int(90 + 80 * math.sin(t * 8 + i))
        draw.line((x, 274, x + 110, 470), fill=rgba(seg.accent, alpha), width=3)
    rounded(draw, (802, 238, 1000, 348), 14, (4, 20, 24, 230), rgba(seg.accent, 230), 2)
    draw.text((848, 274), "PATCH", font=FONT["label"], fill=rgba(seg.accent, 255))
    paste_center(img, sprite("zero", 2, int(t * 9), 170), 720, 500)
    paste_center(img, sprite("neon", 1, int(t * 8), 128), 476, 506)
    draw_speech(draw, 556, 154, "ZERO", "One clean route. Do not let it close.", seg.accent)


def draw_deal_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    draw_map_floor(img, seg, p, t)
    paste_center(img, sprite("nego", 0, int(t * 7), 158), 335, 492)
    paste_center(img, sprite("goldjack", 0, int(t * 7 + 3), 158), 945, 492)
    draw.text((595, 322), "VS", font=FONT["mega"], fill=rgba(seg.accent, 230))
    rounded(draw, (318, 130, 962, 304), 18, (249, 250, 252, 224), (5, 7, 15, 255), 3)
    draw.text((474, 146), "Choose a negotiation stance", font=FONT["body_bold"], fill=(5, 7, 15, 255))
    choices = [
        ("Read Signal", "Safer. More data.", (0, 229, 255)),
        ("Push Anchor", "High reward. High risk.", (255, 98, 198)),
        ("Build Trust", "Rep and contracts.", (255, 211, 77)),
    ]
    for i, (title, desc, color) in enumerate(choices):
        x = 348 + i * 202
        y = 194
        active = i == 2 and p > 0.45
        rounded(draw, (x, y, x + 176, y + 82), 10, (10, 18, 32, 245), rgba(color, 255 if active else 155), 3 if active else 2)
        draw.text((x + 14, y + 14), title, font=FONT["tiny"], fill=rgba(color, 255))
        yy = y + 42
        for line in wrap_text(draw, desc, FONT["tiny"], 144):
            draw.text((x + 14, yy), line, font=FONT["tiny"], fill=(208, 221, 236, 235))
            yy += 22
    if p > 0.48:
        draw.text((514, 287), "TRUST ROUTE SELECTED", font=FONT["tiny"], fill=(5, 7, 15, 255))


def draw_vault_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw_map_floor(img, seg, p, t)
    draw = ImageDraw.Draw(img, "RGBA")
    for i in range(4):
        rounded(draw, (610 + i * 94, 230, 666 + i * 94, 440), 8, (4, 5, 12, 230), rgba(seg.accent, 120), 2)
    key_x = int(mix(946, 726, smooth(p)))
    draw_lumen_key(img, key_x, 344, 1.0 + 0.08 * math.sin(t * 7), (255, 211, 77), t)
    paste_center(img, sprite("neon", 2, int(t * 8), 150), 556, 512)
    paste_center(img, sprite("zero", 0, int(t * 7), 120), 372, 514)
    draw_speech(draw, 590, 156, "SYSTEM", "Key signature found.", seg.accent)


def draw_oracle_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw_map_floor(img, seg, p, t)
    draw = ImageDraw.Draw(img, "RGBA")
    for i in range(7):
        r = 48 + i * 28
        alpha = int(45 + 50 * math.sin(t * 2.3 + i))
        draw.ellipse((760 - r, 294 - r, 760 + r, 294 + r), outline=rgba(seg.accent, max(20, alpha)), width=3)
    paste_center(img, sprite("oracle", 0, int(t * 8), 206), 760, 512)
    paste_center(img, sprite("kane", 0, int(t * 7 + 1), 132), 488, 514)
    draw_lumen_key(img, 586, 360, 0.78, (255, 211, 77), t)
    draw_speech(draw, 456, 154, "ORACLE", "One key lights eight regions.", seg.accent)


def draw_preview_scene(img: Image.Image, seg: Segment, p: float, t: float) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    regions = [
        ("Oracle Skyline", (0, 229, 255), "oracle"),
        ("Trade Guild", (255, 98, 198), "nego"),
        ("Shadow Lab", (191, 95, 255), "zero"),
        ("Dragon Route", (0, 255, 136), "pixel"),
        ("Human Bridge", (156, 163, 175), "human"),
        ("Sage Academy", (85, 255, 204), "goldjack"),
        ("Eye-Void Nexus", (136, 0, 255), "eyevoid"),
    ]
    for i, (name, color, char) in enumerate(regions):
        appear = smooth((p - i * 0.055) / 0.24)
        x = int(112 + (i % 4) * 270)
        y = int(168 + (i // 4) * 190 + (1 - appear) * 34)
        alpha = int(appear * 240)
        rounded(draw, (x, y, x + 232, y + 148), 18, (4, 7, 15, alpha), color + (int(appear * 220),), 2)
        if appear > 0.05:
            mini = sprite(char, 0, int(t * 7 + i), 84).copy()
            mini.putalpha(mini.getchannel("A").point(lambda a: int(a * appear)))
            img.alpha_composite(mini, (x + 18, y + 50))
            draw.text((x + 88, y + 28), name, font=FONT["small"], fill=(238, 248, 255, alpha))
            draw.text((x + 88, y + 66), "LOCKED -> RISING", font=FONT["tiny"], fill=color + (alpha,))
    if p > 0.62:
        rounded(draw, (406, 514, 874, 586), 18, (4, 7, 15, 218), rgba(seg.accent, 230), 2)
        draw.text((456, 532), "THE MIDGAME BEGINS", font=FONT["label"], fill=(238, 248, 255, 255))
    if p > 0.74:
        draw.text((414, 608), "Music: Cipher - Kevin MacLeod (incompetech.com), CC BY 3.0", font=FONT["tiny"], fill=(196, 211, 226, 240))


def draw_speech(draw: ImageDraw.ImageDraw, x: int, y: int, speaker: str, line: str, color: tuple[int, int, int]) -> None:
    rounded(draw, (x, y, x + 470, y + 116), 18, (3, 6, 14, 215), rgba(color, 190), 2)
    draw.text((x + 22, y + 16), speaker, font=FONT["tiny"], fill=rgba(color, 255))
    yy = y + 46
    for wrapped in wrap_text(draw, line, FONT["small"], 408):
        draw.text((x + 22, yy), wrapped, font=FONT["small"], fill=(236, 248, 255, 255))
        yy += 28


def draw_lumen_key(img: Image.Image, x: int, y: int, scale: float, color: tuple[int, int, int], t: float) -> None:
    draw_glow(img, (x, y), int(72 * scale), color, 95)
    draw = ImageDraw.Draw(img, "RGBA")
    pulse = 1 + 0.06 * math.sin(t * 5)
    s = scale * pulse
    draw.ellipse((x - 22 * s, y - 22 * s, x + 22 * s, y + 22 * s), fill=rgba(color, 230), outline=(255, 255, 255, 230), width=3)
    draw.rounded_rectangle((x - 7 * s, y + 18 * s, x + 7 * s, y + 96 * s), radius=int(6 * s), fill=(255, 243, 188, 240))
    draw.rectangle((x + 4 * s, y + 70 * s, x + 42 * s, y + 84 * s), fill=rgba(color, 238))
    draw.rectangle((x + 4 * s, y + 92 * s, x + 30 * s, y + 104 * s), fill=rgba(color, 210))


def current_segment(t: float) -> tuple[Segment, float]:
    for seg in SEGMENTS:
        if seg.start <= t < seg.end:
            return seg, (t - seg.start) / (seg.end - seg.start)
    seg = SEGMENTS[-1]
    return seg, 1.0


def render_frame(t: float) -> Image.Image:
    seg, p = current_segment(t)
    img = BG_CACHE[seg.kind].copy()
    draw_glow(img, (int(1120 + math.sin(t * 0.7) * 46), int(126 + math.cos(t * 0.5) * 28)), 190, seg.accent, 45)
    draw_header(img, seg, t, p)
    if seg.kind != "title":
        draw_quest_panel(img, seg)
    {
        "title": draw_title_scene,
        "plaza": draw_plaza_scene,
        "route": draw_route_scene,
        "temple": draw_temple_scene,
        "causeway": draw_causeway_scene,
        "deal": draw_deal_scene,
        "vault": draw_vault_scene,
        "oracle": draw_oracle_scene,
        "preview": draw_preview_scene,
    }[seg.kind](img, seg, p, t)
    return img.convert("RGB")


def write_credits() -> None:
    OUT_CREDITS.write_text(
        "\n".join(
            [
                "# NEON MYTHOS: Lumen Atlas PV Credits",
                "",
                "- Video: NEON MYTHOS: Lumen Atlas, generated from repository sprites and story data.",
                "- Music: `Cipher` by Kevin MacLeod (incompetech.com).",
                "- License: Creative Commons Attribution 3.0 Unported.",
                "- Source: https://commons.wikimedia.org/wiki/File:Cipher_(ISRC_USUAN1100844).oga",
                "- License URL: https://creativecommons.org/licenses/by/3.0/",
                "",
                "Attribution text: `Cipher Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 3.0 License https://creativecommons.org/licenses/by/3.0/`",
                "",
            ]
        ),
        encoding="utf-8",
    )


def encode_video() -> None:
    if not AUDIO.exists():
        print(f"downloading BGM from {AUDIO_SOURCE_URL}", flush=True)
        request = urllib.request.Request(
            AUDIO_SOURCE_URL,
            headers={"User-Agent": "Mozilla/5.0 NEON-MYTHOS-PV/1.0"},
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            AUDIO.write_bytes(response.read())
    command = [
        "ffmpeg",
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{W}x{H}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-t",
        str(DURATION),
        "-i",
        str(AUDIO),
        "-filter_complex",
        "[1:a]atrim=0:90,afade=t=in:st=0:d=1.5,afade=t=out:st=86:d=4,volume=0.82[a]",
        "-map",
        "0:v",
        "-map",
        "[a]",
        "-c:v",
        "libx264",
        "-profile:v",
        "high",
        "-level",
        "4.0",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "medium",
        "-crf",
        "29",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
        "-shortest",
        "-metadata",
        "title=NEON MYTHOS: Lumen Atlas PV",
        "-metadata",
        "artist=RyoSAKu610 / Codex",
        str(OUT_MP4),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    for index in range(TOTAL_FRAMES):
        t = index / FPS
        frame = render_frame(t)
        process.stdin.write(frame.tobytes())
        if index % (FPS * 10) == 0:
            print(f"rendered {index // FPS:02d}s / {DURATION}s", flush=True)
    process.stdin.close()
    code = process.wait()
    if code:
        raise SystemExit(code)


def main() -> None:
    PROMO_DIR.mkdir(exist_ok=True)
    ASSET_DIR.mkdir(exist_ok=True)
    write_credits()
    encode_video()
    print(f"wrote {OUT_MP4}")
    print(f"wrote {OUT_CREDITS}")


if __name__ == "__main__":
    main()
