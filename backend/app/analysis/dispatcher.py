from app.analysis.image_quality import (
    analyze_image_quality
)

from app.analysis.forensics import (
    analyze_forensics
)

from app.analysis.ai_generation import (
    analyze_ai_generation
)

from app.analysis.metadata import (
    analyze_metadata
)

from app.analysis.ocr import (
    analyze_ocr
)


ANALYZERS = {

    "IMAGE_QUALITY":
        analyze_image_quality,

    "FORENSICS":
        analyze_forensics,

    "AI_GENERATION":
        analyze_ai_generation,

    "METADATA":
        analyze_metadata,

    "OCR":
        analyze_ocr,

}


def run_analysis(
    analysis_type,
    evidence
):

    analyzer = ANALYZERS.get(
        analysis_type
    )

    if analyzer is None:

        return {
            "status": "ERROR",
            "analysis_type": analysis_type,
            "evidence_id": evidence.id,
            "result": None,
            "message": (
                f"No analyzer registered "
                f"for {analysis_type}"
            )
        }

    return analyzer(evidence)