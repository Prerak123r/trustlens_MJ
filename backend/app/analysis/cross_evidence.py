from app.analysis.base import create_analysis_output


REQUIRED_EVIDENCE_TYPES = {
    "invoice",
    "product",
    "damage"
}


def analyze_cross_evidence(
    claim,
    verification_run
):

    try:

        evidence_items = claim.evidence

        evidence_types = {
            evidence.evidence_type
            for evidence in evidence_items
        }

        missing_evidence = sorted(
            REQUIRED_EVIDENCE_TYPES - evidence_types
        )

        evidence_presence = {
            evidence_type: evidence_type in evidence_types
            for evidence_type in sorted(
                REQUIRED_EVIDENCE_TYPES
            )
        }

        ocr_results = {}

        for result in verification_run.analysis_results:

            if result.analysis_type != "OCR":
                continue

            if result.evidence is None:
                continue

            evidence_type = (
                result.evidence.evidence_type
            )

            text = ""

            if result.result:
                text = result.result.get(
                    "text",
                    ""
                )

            ocr_results[evidence_type] = {
                "available": bool(text.strip()),
                "text_length": len(text),
                "word_count": (
                    len(text.split())
                    if text.strip()
                    else 0
                )
            }

        checks = {
            "required_evidence_present": (
                len(missing_evidence) == 0
            ),
            "invoice_ocr_available": (
                ocr_results
                .get("invoice", {})
                .get("available", False)
            ),
            "product_ocr_available": (
                ocr_results
                .get("product", {})
                .get("available", False)
            ),
            "damage_ocr_available": (
                ocr_results
                .get("damage", {})
                .get("available", False)
            )
        }

        result = {
            "evidence_count": len(
                evidence_items
            ),
            "evidence_types": sorted(
                evidence_types
            ),
            "missing_evidence": missing_evidence,
            "evidence_presence": evidence_presence,
            "ocr_availability": ocr_results,
            "checks": checks
        }

        return create_analysis_output(
            analysis_type="CROSS_EVIDENCE",
            evidence_id=None,
            status="COMPLETED",
            result=result,
            message=(
                "Cross-evidence analysis completed. "
                "Detailed semantic consistency checks "
                "will be added in later research stages."
            )
        )

    except Exception as error:

        return create_analysis_output(
            analysis_type="CROSS_EVIDENCE",
            evidence_id=None,
            status="ERROR",
            result=None,
            message=(
                f"Cross-evidence analysis failed: "
                f"{str(error)}"
            )
        )