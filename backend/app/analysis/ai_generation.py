from pathlib import Path

from PIL import Image

from app.analysis.base import create_analysis_output


MODEL_VERSION = "not_available"


def analyze_ai_generation(evidence):

    file_path = Path(evidence.file_path)

    if not file_path.exists():
        return create_analysis_output(
            analysis_type="AI_GENERATION",
            evidence_id=evidence.id,
            status="ERROR",
            result=None,
            message="Evidence file not found."
        )

    if file_path.suffix.lower() == ".pdf":
        return create_analysis_output(
            analysis_type="AI_GENERATION",
            evidence_id=evidence.id,
            status="NOT_SUPPORTED",
            result=None,
            message="AI-generated image detection is not supported for PDF files yet."
        )

    try:

        # Confirm that the file is a readable image.
        with Image.open(file_path) as image:
            width = image.width
            height = image.height
            image_format = image.format

        result = {
            "model_available": False,
            "model_version": MODEL_VERSION,
            "prediction": None,
            "ai_generated_probability": None,
            "real_image_probability": None,
            "confidence": None,
            "input": {
                "width": width,
                "height": height,
                "format": image_format
            }
        }

        return create_analysis_output(
            analysis_type="AI_GENERATION",
            evidence_id=evidence.id,
            status="NOT_IMPLEMENTED",
            result=result,
            message=(
                "AI-generated image detection model "
                "has not been implemented yet."
            )
        )

    except Exception as error:

        return create_analysis_output(
            analysis_type="AI_GENERATION",
            evidence_id=evidence.id,
            status="ERROR",
            result=None,
            message=f"AI-generation analysis failed: {str(error)}"
        )