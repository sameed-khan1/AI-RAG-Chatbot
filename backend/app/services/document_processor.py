from pathlib import Path
from pypdf import PdfReader
from docx import Document


def extract_text(file_path: str):
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".pdf":
        return extract_pdf(path)

    if extension == ".docx":
        return extract_docx(path)

    if extension == ".txt":
        return extract_txt(path)

    raise ValueError("Unsupported file type")


def extract_pdf(path):
    reader = PdfReader(path)
    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""

        pages.append({
            "page": page_number,
            "text": text.strip()
        })

    return pages


def extract_docx(path):
    document = Document(path)

    text = "\n".join(
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    )

    return [{
        "page": None,
        "text": text.strip()
    }]


def extract_txt(path):
    text = path.read_text(encoding="utf-8")

    return [{
        "page": None,
        "text": text.strip()
    }]