import io
import qrcode
from datetime import datetime, timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
    HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_harvest_assessment_pdf(
    report_number: str,
    farmer_name: str,
    parcel_code: str,
    district: str,
    village: str,
    area_acres: float,
    crop_variety: str,
    season: str,
    reconstructed_volume_m3: float,
    bulk_density_kg_m3: float,
    estimated_mass_quintals: float,
    yield_quintals_per_acre: float,
    verification_hash: str,
    issue_date: datetime,
    is_demo: bool = False
) -> bytes:
    """
    Generate an authoritative AgriSentinel Technical Harvest Assessment Report PDF.
    Includes technical metadata, RANSAC base plane quantification, SHA-256 digest,
    embedded verification QR code, and explicit non-government disclaimer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    forest_green = colors.HexColor("#172B22")
    brand_green = colors.HexColor("#008C45")
    light_bg = colors.HexColor("#F7F9F8")
    border_color = colors.HexColor("#E2E9E4")
    dark_text = colors.HexColor("#1E293B")
    muted_text = colors.HexColor("#64748B")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=forest_green
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=muted_text
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=brand_green
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=dark_text
    )

    mono_style = ParagraphStyle(
        "MonoStyle",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=10,
        textColor=forest_green
    )

    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#78350F")
    )

    story = []

    # 1. Header Banner Table
    header_data = [
        [
            Paragraph("<b>AgriSentinel</b><br/><font size=8 color='#008C45'>UAV-Based Intelligent Agricultural Field Assessment</font>", title_style),
            Paragraph(f"<b>REPORT NO:</b> {report_number}<br/><b>DATE:</b> {issue_date.strftime('%d-%b-%Y')}<br/><b>SYSTEM:</b> v2.4 (PostGIS/SRID:4326)", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[4.0 * inch, 3.2 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_green, spaceBefore=2, spaceAfter=12))

    # 2. Assessment Title Banner
    badge_text = "DEMONSTRATION SAMPLE ASSESSMENT" if is_demo else "FIELD PHOTOGRAMMETRIC ASSESSMENT REPORT"
    story.append(Paragraph(f"<b>{badge_text}</b>", section_heading))
    story.append(Paragraph("Automated volumetric reconstruction and empirical mass quantification above calibrated RANSAC ground datum plane.", subtitle_style))
    story.append(Spacer(1, 12))

    # 3. Farmer & Parcel Details Table
    story.append(Paragraph("1. Administrative & Land Parcel Identifiers", section_heading))
    story.append(Spacer(1, 4))
    
    parcel_data = [
        [Paragraph("<b>Farmer / Producer:</b>", body_style), Paragraph(farmer_name, body_style), Paragraph("<b>Crop Variety:</b>", body_style), Paragraph(crop_variety, body_style)],
        [Paragraph("<b>Cadastral Parcel:</b>", body_style), Paragraph(parcel_code, body_style), Paragraph("<b>Agricultural Season:</b>", body_style), Paragraph(season, body_style)],
        [Paragraph("<b>District / Tahasil:</b>", body_style), Paragraph(f"{district}", body_style), Paragraph("<b>Recorded Area:</b>", body_style), Paragraph(f"{area_acres:.2f} Acres ({area_acres * 0.404686:.2f} Ha)", body_style)],
        [Paragraph("<b>Revenue Village:</b>", body_style), Paragraph(village, body_style), Paragraph("<b>Spatial Reference:</b>", body_style), Paragraph("EPSG:4326 (WGS84)", mono_style)]
    ]
    parcel_table = Table(parcel_data, colWidths=[1.8 * inch, 2.0 * inch, 1.8 * inch, 1.8 * inch])
    parcel_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(parcel_table)
    story.append(Spacer(1, 14))

    # 4. Volumetric & Mass Quantification Table
    story.append(Paragraph("2. Photogrammetric Volumetric & Yield Findings", section_heading))
    story.append(Spacer(1, 4))

    metrics_data = [
        [Paragraph("<b>Parameter</b>", body_style), Paragraph("<b>Measured Value</b>", body_style), Paragraph("<b>Unit / Standard</b>", body_style), Paragraph("<b>Measurement Source</b>", body_style)],
        [Paragraph("Reconstructed Volume", body_style), Paragraph(f"<b>{reconstructed_volume_m3:.3f}</b>", body_style), Paragraph("Cubic Meters (m³)", body_style), Paragraph("Stereo Point Cloud + 2.5D DEM", subtitle_style)],
        [Paragraph("Standard Bulk Density (ρ)", body_style), Paragraph(f"<b>{bulk_density_kg_m3:.1f}</b>", body_style), Paragraph("kg/m³", body_style), Paragraph("Laboratory Swarna standard @ 14% moisture", subtitle_style)],
        [Paragraph("Estimated Net Grain Mass", body_style), Paragraph(f"<b>{estimated_mass_quintals:.2f}</b>", section_heading), Paragraph("Quintals (100 kg)", body_style), Paragraph("M = V × ρ Formulation", subtitle_style)],
        [Paragraph("Calculated Field Yield", body_style), Paragraph(f"<b>{yield_quintals_per_acre:.2f}</b>", body_style), Paragraph("Quintals / Acre", body_style), Paragraph("Field Area Normalized", subtitle_style)],
    ]
    metrics_table = Table(metrics_data, colWidths=[2.2 * inch, 1.6 * inch, 1.6 * inch, 2.0 * inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E9E4")),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 14))

    # 5. QR Code and Cryptographic Provenance Block
    story.append(Paragraph("3. Cryptographic Provenance & Digital Verification", section_heading))
    story.append(Spacer(1, 4))

    # Generate QR Code image in-memory
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=2,
    )
    verify_url = f"https://agrisentinel.odisha.gov.in/verify/{verification_hash[:16]}"
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#172B22", back_color="white")
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    rl_qr = RLImage(qr_buffer, width=1.1 * inch, height=1.1 * inch)

    crypto_text = f"""
    <b>Digital Integrity Digest (SHA-256):</b><br/>
    <font face="Courier" size="7" color="#008C45">{verification_hash}</font><br/><br/>
    <b>Verification URI:</b><br/>
    <font face="Courier" size="7" color="#64748B">{verify_url}</font><br/><br/>
    <b>Issuing Engine:</b> AgriSentinel Automated Photogrammetry Service<br/>
    <b>Timestamp:</b> {issue_date.strftime('%Y-%m-%d %H:%M:%S UTC')}
    """

    crypto_table = Table([[rl_qr, Paragraph(crypto_text, body_style)]], colWidths=[1.4 * inch, 6.0 * inch])
    crypto_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(crypto_table)
    story.append(Spacer(1, 16))

    # 6. Statutory Disclaimer Box (CRITICAL COMPLIANCE REQUIREMENT)
    disclaimer_text = """
    <b>LEGAL & REGULATORY NOTICE:</b> This document is an automated technical crop assessment report generated by the 
    AgriSentinel UAV Photogrammetry & Computer Vision platform for monitoring, advisory, and planning purposes. 
    It is NOT an official government crop insurance settlement certificate, revenue patta, or statutory land grant. 
    Field measurements are subject to sensor Ground Sampling Distance (GSD), base-plane planarity tolerances, and standard grain bulk density assumptions.
    """
    disclaimer_box = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[7.4 * inch])
    disclaimer_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#F59E0B")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(KeepTogether([disclaimer_box]))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

