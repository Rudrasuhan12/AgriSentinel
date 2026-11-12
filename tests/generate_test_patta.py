import os
from PIL import Image, ImageDraw, ImageFont

TEST_DIR = os.path.join(os.path.dirname(__file__), "sample_patta")
os.makedirs(TEST_DIR, exist_ok=True)

def generate_patta_image(output_path: str):
    # Standard A4 proportions in pixels: 1240 x 1754
    width, height = 1240, 1754
    img = Image.new("RGB", (width, height), color="#FCFCF9")
    draw = ImageDraw.Draw(img)

    # Use default font or basic font
    try:
        font_title = ImageFont.truetype("arial.ttf", 36)
        font_header = ImageFont.truetype("arial.ttf", 26)
        font_bold = ImageFont.truetype("arialbd.ttf", 22)
        font_body = ImageFont.truetype("arial.ttf", 20)
        font_sm = ImageFont.truetype("arial.ttf", 16)
    except Exception:
        font_title = font_header = font_bold = font_body = font_sm = ImageFont.load_default()

    # Outer border
    draw.rectangle([(40, 40), (width - 40, height - 40)], outline="#2B3E2F", width=3)
    draw.rectangle([(46, 46), (width - 46, height - 46)], outline="#7A9382", width=1)

    # Document Header
    draw.text((width // 2, 80), "GOVERNMENT OF ODISHA", fill="#1A2D20", font=font_header, anchor="mm")
    draw.text((width // 2, 120), "REVENUE & DISASTER MANAGEMENT DEPARTMENT", fill="#2D4A36", font=font_body, anchor="mm")
    draw.text((width // 2, 160), "RECORD OF RIGHTS (ପ୍ରପତ୍ର ୩୯-କ)", fill="#123B20", font=font_title, anchor="mm")
    draw.text((width // 2, 200), "Schedule I Form No. 39-A [See Rule 21]", fill="#4A6B53", font=font_sm, anchor="mm")

    # Divider
    draw.line([(70, 230), (width - 70, 230)], fill="#2D4A36", width=2)

    # Administrative Master Details Box
    draw.rectangle([(70, 250), (width - 70, 430)], outline="#A5B8AC", fill="#F4F8F5", width=1)
    
    # Left Column
    draw.text((100, 275), "State: Odisha (ଓଡ଼ିଶା)", fill="#172B22", font=font_bold)
    draw.text((100, 315), "District: Cuttack (କଟକ)", fill="#172B22", font=font_bold)
    draw.text((100, 355), "Tahasil: Cuttack (କଟକ)", fill="#172B22", font=font_bold)
    draw.text((100, 395), "Thana: Madhupatna (ଥାନା: ମଧୁପାଟଣା)", fill="#172B22", font=font_bold)

    # Right Column
    draw.text((650, 275), "Thana No.: 42", fill="#172B22", font=font_body)
    draw.text((650, 315), "Mouza: Cuttack Sahar Unit No. 30, Andarpur", fill="#172B22", font=font_bold)
    draw.text((650, 355), "Khata No.: 299/611 (ଖତିୟାନ ନଂ)", fill="#172B22", font=font_bold)
    draw.text((650, 395), "Tenant: Dilip Kumar Sahoo, S/O Raghab Sahoo", fill="#172B22", font=font_body)

    # Table Header for Plots
    y_table = 470
    headers = [
        ("Plot No.\n(ଡାଗ ନଂ)", 70, 220),
        ("Kisam\n(କିସମ)", 220, 390),
        ("Recorded Area\n(Acres)", 390, 580),
        ("Area\n(Hectares)", 580, 770),
        ("Rent / Cess\n(Rs.)", 770, 960),
        ("Remarks\n(ମନ୍ତବ୍ୟ)", 960, width - 70),
    ]

    draw.rectangle([(70, y_table), (width - 70, y_table + 60)], fill="#E2EBE5", outline="#7A9382", width=1)
    for title, x1, x2 in headers:
        draw.line([(x1, y_table), (x1, y_table + 160)], fill="#7A9382", width=1)
        draw.text(((x1 + x2) // 2, y_table + 30), title, fill="#172B22", font=font_sm, anchor="mm")
    draw.line([(width - 70, y_table), (width - 70, y_table + 160)], fill="#7A9382", width=1)

    # Table Row 1 (Target Plot)
    y_row = y_table + 60
    draw.line([(70, y_row), (width - 70, y_row)], fill="#7A9382", width=1)
    draw.text((145, y_row + 25), "640/2536", fill="#172B22", font=font_bold, anchor="mm")
    draw.text((305, y_row + 25), "Gharabari", fill="#172B22", font=font_bold, anchor="mm")
    draw.text((485, y_row + 25), "0.0440 Acres", fill="#006B36", font=font_bold, anchor="mm")
    draw.text((675, y_row + 25), "0.0178 Ha", fill="#172B22", font=font_body, anchor="mm")
    draw.text((865, y_row + 25), "24.50", fill="#172B22", font=font_body, anchor="mm")
    draw.text((1060, y_row + 25), "Private Settlement", fill="#555555", font=font_sm, anchor="mm")

    # Table Row 2 (Sub-plot)
    y_row2 = y_row + 50
    draw.line([(70, y_row2), (width - 70, y_row2)], fill="#7A9382", width=1)
    draw.text((145, y_row2 + 25), "640/2537", fill="#172B22", font=font_body, anchor="mm")
    draw.text((305, y_row2 + 25), "Sarada", fill="#172B22", font=font_body, anchor="mm")
    draw.text((485, y_row2 + 25), "0.8500 Acres", fill="#172B22", font=font_body, anchor="mm")
    draw.text((675, y_row2 + 25), "0.3440 Ha", fill="#172B22", font=font_body, anchor="mm")
    draw.text((865, y_row2 + 25), "12.00", fill="#172B22", font=font_body, anchor="mm")
    draw.text((1060, y_row2 + 25), "Paddy Field", fill="#555555", font=font_sm, anchor="mm")

    draw.line([(70, y_row2 + 50), (width - 70, y_row2 + 50)], fill="#7A9382", width=1)

    # Footnotes / Seal
    draw.text((100, 1500), "Official Digital Record certified from Odisha Bhulekh Portal (bhulekh.ori.nic.in)", fill="#64746A", font=font_sm)
    draw.text((100, 1530), "Tahasil Office: Cuttack Revenue Division | Date of Download: 12-Nov-2026", fill="#64746A", font=font_sm)

    img.save(output_path, quality=95)
    print(f"Generated test patta image at: {output_path}")
    return output_path

if __name__ == "__main__":
    jpg_path = os.path.join(TEST_DIR, "odisha_patta_cuttack_sample.jpg")
    png_path = os.path.join(TEST_DIR, "odisha_patta_cuttack_sample.png")
    pdf_path = os.path.join(TEST_DIR, "odisha_patta_cuttack_sample.pdf")
    
    generate_patta_image(jpg_path)
    generate_patta_image(png_path)
    
    # Save as PDF as well
    img = Image.open(jpg_path)
    img.save(pdf_path, "PDF", resolution=150.0)
    print(f"Generated test patta PDF at: {pdf_path}")

