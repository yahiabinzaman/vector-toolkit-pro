import os
from PIL import Image, ImageDraw

def create_forma_icon(size, style="normal"):
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Styles
    if style == "normal":
        sheet_bg = (240, 243, 246, 255)
        border_c = (140, 155, 175, 255)
        grid_c = (200, 210, 225, 255)
        accent_c = (0, 120, 240, 255) # Illustrator Blue
        mark_c = (90, 105, 120, 255)
    elif style == "rollover":
        sheet_bg = (255, 255, 255, 255)
        border_c = (0, 140, 255, 255)
        grid_c = (180, 220, 255, 255)
        accent_c = (0, 160, 255, 255)
        mark_c = (0, 120, 240, 255)
    elif style == "dark":
        sheet_bg = (40, 44, 52, 255)
        border_c = (90, 100, 115, 255)
        grid_c = (60, 68, 80, 255)
        accent_c = (56, 189, 248, 255) # Cyan
        mark_c = (148, 163, 184, 255)
    elif style == "dark-hover":
        sheet_bg = (50, 56, 66, 255)
        border_c = (56, 189, 248, 255)
        grid_c = (75, 85, 100, 255)
        accent_c = (125, 211, 252, 255)
        mark_c = (224, 231, 255, 255)
    else: # disabled
        sheet_bg = (120, 120, 120, 120)
        border_c = (100, 100, 100, 160)
        grid_c = (90, 90, 90, 140)
        accent_c = (130, 130, 130, 160)
        mark_c = (110, 110, 110, 140)

    pad = int(canvas_size * 0.14)
    sw = canvas_size - 2 * pad
    sh = canvas_size - 2 * pad

    # Outer Sheet
    draw.rounded_rectangle([pad, pad, pad + sw, pad + sh], radius=int(scale * 2), fill=sheet_bg, outline=border_c, width=int(scale * 1.2))

    # Grid (2x2 or 4-box imposition grid)
    mid_x = pad + sw // 2
    mid_y = pad + sh // 2
    
    # Dashed/Fold fold line in center
    draw.line([(mid_x, pad + 2), (mid_x, pad + sh - 2)], fill=grid_c, width=int(scale * 1))
    draw.line([(pad + 2, mid_y), (pad + sw - 2, mid_y)], fill=grid_c, width=int(scale * 1))

    # Mini imposition cells
    cell_pad = int(scale * 2)
    # Cell 1 (top-left) - Page with arrow
    draw.rectangle([pad + cell_pad, pad + cell_pad, mid_x - cell_pad, mid_y - cell_pad], fill=None, outline=grid_c, width=int(scale * 0.8))
    # Cell 2 (top-right - upside down indicator)
    draw.rectangle([mid_x + cell_pad, pad + cell_pad, pad + sw - cell_pad, mid_y - cell_pad], fill=None, outline=grid_c, width=int(scale * 0.8))
    # Cell 3 (bottom-left)
    draw.rectangle([pad + cell_pad, mid_y + cell_pad, mid_x - cell_pad, pad + sh - cell_pad], fill=None, outline=grid_c, width=int(scale * 0.8))
    # Cell 4 (bottom-right) - Accent Active Cell
    draw.rectangle([mid_x + cell_pad, mid_y + cell_pad, pad + sw - cell_pad, pad + sh - cell_pad], fill=accent_c)

    # Crop marks on corners
    cm_len = int(scale * 3)
    draw.line([(pad - cm_len, pad), (pad, pad)], fill=mark_c, width=int(scale * 1))
    draw.line([(pad, pad - cm_len), (pad, pad)], fill=mark_c, width=int(scale * 1))
    
    draw.line([(pad + sw, pad), (pad + sw + cm_len, pad)], fill=mark_c, width=int(scale * 1))
    draw.line([(pad + sw, pad - cm_len), (pad + sw, pad)], fill=mark_c, width=int(scale * 1))

    draw.line([(pad - cm_len, pad + sh), (pad, pad + sh)], fill=mark_c, width=int(scale * 1))
    draw.line([(pad, pad + sh), (pad, pad + sh + cm_len)], fill=mark_c, width=int(scale * 1))

    draw.line([(pad + sw, pad + sh), (pad + sw + cm_len, pad + sh)], fill=mark_c, width=int(scale * 1))
    draw.line([(pad + sw, pad + sh), (pad + sw, pad + sh + cm_len)], fill=mark_c, width=int(scale * 1))

    # Center tick fold marks
    draw.line([(mid_x, pad - cm_len), (mid_x, pad - 1)], fill=mark_c, width=int(scale * 1))
    draw.line([(pad - cm_len, mid_y), (pad - 1, mid_y)], fill=mark_c, width=int(scale * 1))

    # Resize with high quality Lanczos
    return img.resize((size, size), Image.Resampling.LANCZOS)

os.makedirs("icons", exist_ok=True)
create_forma_icon(23, "normal").save("icons/icon-normal.png")
create_forma_icon(23, "rollover").save("icons/icon-rollover.png")
create_forma_icon(23, "disabled").save("icons/icon-disabled.png")
create_forma_icon(23, "dark").save("icons/icon-dark.png")
create_forma_icon(23, "dark-hover").save("icons/icon-dark-hover.png")

# High-res icons
create_forma_icon(48, "dark").save("icons/icon-48.png")
create_forma_icon(128, "dark").save("icons/icon-128.png")
create_forma_icon(256, "dark").save("icons/icon-256.png")
print("Icons generated successfully.")

