from app.analysis.base import create_analysis_output


def analyze_uncertainty(
    claim,
    verification_run
):

    try:

        results = verification_run.analysis_results

        total_analyses = 0
        completed_analyses = 0
        incomplete_analyses = 0
        unsupported_analyses = 0
        error_analyses = 0

        for analysis in results:

            total_analyses += 1

            if analysis.status == "COMPLETED":
                completed_analyses += 1

            elif analysis.status == "NOT_IMPLEMENTED":
                incomplete_analyses += 1

            elif analysis.status == "NOT_SUPPORTED":
                unsupported_analyses += 1

            elif analysis.status == "ERROR":
                error_analyses += 1

        evidence_count = len(
            claim.evidence
        )

        expected_evidence_count = 3

        missing_evidence_count = max(
            expected_evidence_count - evidence_count,
            0
        )

        if total_analyses > 0:
            completion_ratio = round(
                completed_analyses / total_analyses,
                4
            )
        else:
            completion_ratio = 0

        uncertainty_factors = []

        if missing_evidence_count > 0:
            uncertainty_factors.append(
                "MISSING_EVIDENCE"
            )

        if incomplete_analyses > 0:
            uncertainty_factors.append(
                "INCOMPLETE_ANALYSIS"
            )

        if unsupported_analyses > 0:
            uncertainty_factors.append(
                "UNSUPPORTED_ANALYSIS"
            )

        if error_analyses > 0:
            uncertainty_factors.append(
                "ANALYSIS_ERRORS"
            )

        if completion_ratio < 1:
            uncertainty_factors.append(
                "INCOMPLETE_PIPELINE"
            )

        result = {
            "evidence_count": evidence_count,
            "expected_evidence_count": (
                expected_evidence_count
            ),
            "missing_evidence_count": (
                missing_evidence_count
            ),
            "total_analyses": total_analyses,
            "completed_analyses": completed_analyses,
            "incomplete_analyses": incomplete_analyses,
            "unsupported_analyses": unsupported_analyses,
            "error_analyses": error_analyses,
            "analysis_completion_ratio": (
                completion_ratio
            ),
            "uncertainty_factors": (
                uncertainty_factors
            )
        }

        return create_analysis_output(
            analysis_type="UNCERTAINTY",
            evidence_id=None,
            status="COMPLETED",
            result=result,
            message=(
                "Uncertainty analysis completed. "
                "This is a diagnostic uncertainty "
                "assessment and is not yet a calibrated "
                "probability."
            )
        )

    except Exception as error:

        return create_analysis_output(
            analysis_type="UNCERTAINTY",
            evidence_id=None,
            status="ERROR",
            result=None,
            message=(
                f"Uncertainty analysis failed: "
                f"{str(error)}"
            )
        )