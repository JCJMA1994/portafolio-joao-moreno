"""Create and validate the directed one-page CV PDF from rendered Astro HTML."""

import argparse
import os
import re
from html.parser import HTMLParser
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "dist" / "client" / "cv" / "index.html"
OUTPUT = ROOT / "output" / "pdf" / "CV_Jose_Carlos_Moreno_Flutter-2026.pdf"
INK = colors.HexColor("#141610")
MUTED = colors.HexColor("#5e6256")
SIGNAL = colors.HexColor("#a6d900")
LINE = colors.HexColor("#8e9285")
METRICS = ("99.5%", "30+", "10")


class Node:
    def __init__(self, tag="", attrs=None, parent=None):
        self.tag = tag
        self.attrs = dict(attrs or [])
        self.parent = parent
        self.children = []
        self.contents = []

    @property
    def classes(self):
        return set(self.attrs.get("class", "").split())

    def text(self):
        value = " ".join(item.text() if isinstance(item, Node) else item for item in self.contents)
        return " ".join(value.split())


class DomParser(HTMLParser):
    void = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

    def __init__(self):
        super().__init__()
        self.root = Node()
        self.current = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        self.current.contents.append(node)
        if tag not in self.void:
            self.current = node

    def handle_endtag(self, tag):
        cursor = self.current
        while cursor.parent is not None:
            if cursor.tag == tag:
                self.current = cursor.parent
                return
            cursor = cursor.parent

    def handle_data(self, data):
        self.current.contents.append(data)


def nodes(root, *, tag=None, class_name=None):
    result = []
    for child in root.children:
        if (tag is None or child.tag == tag) and (class_name is None or class_name in child.classes):
            result.append(child)
        result.extend(nodes(child, tag=tag, class_name=class_name))
    return result


def first(root, *, tag=None, class_name=None):
    matches = nodes(root, tag=tag, class_name=class_name)
    if not matches:
        raise ValueError(f"Missing rendered CV element: tag={tag!r}, class={class_name!r}")
    return matches[0]


def clean(value):
    return value.replace("—", "-").replace("−", "-").replace("→", "->").replace("←", "<-").replace("·", " | ")


def paragraph(text, style):
    return Paragraph(clean(text), style)


def validate_pdf(path):
    path = Path(path)
    data = path.read_bytes()
    if len(data) < 1_000 or not data.startswith(b"%PDF-") or b"%%EOF" not in data[-1024:]:
        raise ValueError("Incomplete or invalid PDF container")
    reader = PdfReader(path)
    if len(reader.pages) != 1:
        raise ValueError(f"Expected exactly one page, found {len(reader.pages)}")
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    if len(text.strip()) < 100:
        raise ValueError("PDF text is not selectable or is unexpectedly empty")
    for metric in METRICS:
        pattern = rf"(?<![\w.]){re.escape(metric)}(?![\w+])"
        count = len(re.findall(pattern, text))
        if count != 1:
            raise ValueError(f"Expected metric {metric!r} exactly once, found {count}")


def owned_temporary(output, temporary=None):
    output_dir = output.parent.resolve()
    candidate = (
        Path(temporary).resolve()
        if temporary is not None
        else output.with_name(f".{output.stem}.{os.getpid()}.tmp.pdf").resolve()
    )
    if candidate.parent != output_dir or candidate == output.resolve():
        raise ValueError("Temporary PDF must be a distinct file inside output/pdf")
    return candidate


def build_pdf(output=OUTPUT, source=SOURCE, temporary=None):
    if not source.exists():
        raise FileNotFoundError("Run the Astro build before exporting the CV PDF.")

    parser = DomParser()
    parser.feed(source.read_text(encoding="utf-8"))
    root = parser.root
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = owned_temporary(output, temporary)

    try:
        doc = SimpleDocTemplate(
            str(temporary), pagesize=A4, leftMargin=13 * mm, rightMargin=13 * mm,
            topMargin=10 * mm, bottomMargin=9 * mm, title=clean(first(root, tag="h1").text()),
            author="Jose Carlos Moreno Alemán",
        )
        base = ParagraphStyle("base", fontName="Courier", fontSize=7.35, leading=9.7, textColor=INK)
        muted = ParagraphStyle("muted", parent=base, textColor=MUTED, fontSize=6.8, leading=8.8)
        label = ParagraphStyle("label", parent=muted, fontName="Courier-Bold", fontSize=6.6, leading=8)
        name = ParagraphStyle("name", fontName="Times-Roman", fontSize=31, leading=27.5, textColor=INK)
        role = ParagraphStyle("role", fontName="Times-Italic", fontSize=14, leading=15, textColor=INK)
        section = ParagraphStyle("section", fontName="Times-Roman", fontSize=14, leading=15, textColor=INK)
        job_title = ParagraphStyle("job", parent=base, fontName="Courier-Bold", fontSize=7.5, leading=9.5)
        metric_value = ParagraphStyle("metric", fontName="Times-Roman", fontSize=22, leading=21, textColor=INK)

        contact = [node.text() for node in nodes(first(root, class_name="dossier-contact"), tag="li")]
        header = Table(
            [[[paragraph(first(root, tag="h1").text(), name), paragraph(first(root, class_name="dossier-role").text(), role)], [paragraph(item, muted) for item in contact]]],
            colWidths=[116 * mm, 63 * mm], hAlign="LEFT",
        )
        header.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "BOTTOM"), ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 5 * mm), ("LEFTPADDING", (1, 0), (1, 0), 3 * mm),
            ("RIGHTPADDING", (1, 0), (1, 0), 0), ("LINEBEFORE", (1, 0), (1, 0), 5, SIGNAL),
            ("LINEBELOW", (0, 0), (-1, -1), 2.5, INK), ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
        ]))

        metric_cells = [[paragraph(first(metric, tag="strong").text(), metric_value), paragraph(first(metric, tag="span").text(), muted)] for metric in nodes(root, class_name="metric")]
        metrics = Table([metric_cells], colWidths=[179 * mm / 3] * 3)
        metrics.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm), ("TOPPADDING", (0, 0), (-1, -1), 3.2 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.2 * mm), ("LINEAFTER", (0, 0), (1, 0), 0.5, LINE),
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, LINE),
        ]))

        summary_node = first(root, class_name="dossier-summary")
        summary = Table([[paragraph("PERFIL / 01", label), paragraph(first(summary_node, tag="p").text(), base)]], colWidths=[27 * mm, 152 * mm])
        summary.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 4 * mm), ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm), ("LINEBELOW", (0, 0), (-1, -1), 0.5, LINE),
        ]))

        experience_flow = [paragraph("02  Experiencia seleccionada", section), HRFlowable(width="100%", thickness=0.6, color=INK, spaceAfter=2 * mm)]
        for job in nodes(root, class_name="job"):
            achievements = [ListItem(paragraph(item.text(), base), leftIndent=0) for item in nodes(job, tag="li")]
            body = [
                paragraph(first(job, tag="h3").text(), job_title), paragraph(first(job, class_name="job-company").text(), muted),
                ListFlowable(achievements, bulletType="bullet", start="circle", leftIndent=3.5 * mm, bulletFontSize=4, spaceBefore=1 * mm),
            ]
            job_table = Table([[paragraph(first(job, class_name="job-period").text(), muted), body]], colWidths=[25 * mm, 91 * mm])
            job_table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), 3 * mm), ("TOPPADDING", (0, 0), (-1, -1), 2.4 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.4 * mm), ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
            ]))
            experience_flow.append(job_table)

        side_flow = [paragraph("03  Stack", section), HRFlowable(width="100%", thickness=0.6, color=INK, spaceAfter=1 * mm)]
        for item in nodes(first(root, class_name="stack-list"), tag="li"):
            side_flow.extend([paragraph(item.text(), base), HRFlowable(width="100%", thickness=0.25, color=LINE, spaceBefore=1 * mm, spaceAfter=1 * mm)])
        side_flow.extend([Spacer(1, 1.5 * mm), paragraph("04  Formación", section), HRFlowable(width="100%", thickness=0.6, color=INK, spaceAfter=1 * mm)])
        for item in nodes(first(root, class_name="education-list"), tag="li"):
            side_flow.extend([paragraph(item.text(), base), Spacer(1, 1 * mm)])
        side_flow.extend([Spacer(1, 2.5 * mm), paragraph(first(root, class_name="availability").text(), base)])

        columns = Table([[experience_flow, side_flow]], colWidths=[120 * mm, 55 * mm], hAlign="LEFT")
        columns.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 5 * mm), ("LEFTPADDING", (1, 0), (1, 0), 2 * mm),
            ("RIGHTPADDING", (1, 0), (1, 0), 0), ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        footer = Table([[paragraph("Currículum dirigido | Flutter Engineering", muted), paragraph("Actualizado 2026", ParagraphStyle("right", parent=muted, alignment=2))]], colWidths=[90 * mm, 89 * mm])
        footer.setStyle(TableStyle([
            ("LINEABOVE", (0, 0), (-1, -1), 2.5, INK), ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
            ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        doc.build([header, metrics, summary, columns, Spacer(1, 2 * mm), footer])
        validate_pdf(temporary)
        os.replace(temporary, output)
    finally:
        temporary.unlink(missing_ok=True)
    print(output)


def self_test(temporary=None):
    temporary = owned_temporary(
        OUTPUT,
        temporary or OUTPUT.parent / f".cv-validator.{os.getpid()}.tmp.pdf",
    )
    temporary.parent.mkdir(parents=True, exist_ok=True)
    try:
        document = canvas.Canvas(str(temporary), pagesize=A4)
        document.drawString(40, 800, "Selectable CV validation fixture " + " ".join(METRICS))
        document.drawString(40, 780, "x" * 120)
        document.save()
        validate_pdf(temporary)
    finally:
        temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate-only", type=Path)
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--temporary", type=Path)
    args = parser.parse_args()
    if args.validate_only:
        validate_pdf(args.validate_only)
    elif args.self_test:
        self_test(args.temporary)
    else:
        build_pdf(temporary=args.temporary)


if __name__ == "__main__":
    main()
