from pathlib import Path

import pytesseract
from PIL import Image

from app.analysis.base import create_analysis_output


TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def analyze_ocr(evidence):

    file_path = Path(evidence.file_path)

    if not file_path.exists():
        return create_analysis_output(
            analysis_type="OCR",
            evidence_id=evidence.id,
            status="ERROR",
            result=None,
            message="Evidence file not found."
        )

    if file_path.suffix.lower() == ".pdf":
        return create_analysis_output(
            analysis_type="OCR",
            evidence_id=evidence.id,
            status="NOT_SUPPORTED",
            result=None,
            message="OCR for PDF files is not implemented yet."
        )

    try:

        pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

        with Image.open(file_path) as image:

            extracted_text = pytesseract.image_to_string(
                image
            )

        extracted_text = extracted_text.strip()

        result = {
            "text": extracted_text,
            "text_length": len(extracted_text),
            "word_count": len(
                extracted_text.split()
            )
        }

        return create_analysis_output(
            analysis_type="OCR",
            evidence_id=evidence.id,
            status="COMPLETED",
            result=result,
            message="OCR extraction completed successfully."
        )

    except Exception as error:

        return create_analysis_output(
            analysis_type="OCR",
            evidence_id=evidence.id,
            status="ERROR",
            result=None,
            message=f"OCR extraction failed: {str(error)}"
        )