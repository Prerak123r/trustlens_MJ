from app.analysis.base import create_analysis_output


def analyze_trust_assessment(
    claim,
    verification_run
):

    try:

        uncertainty_result = None
        fusion_result = None
        cross_evidence_result = None

        # --------------------------------------------------
        # Collect upstream analysis results
        # --------------------------------------------------

        for analysis in verification_run.analysis_results:

            if analysis.analysis_type == "UNCERTAINTY":
                uncertainty_result = analysis.result

            elif analysis.analysis_type == "FUSION":
                fusion_result = analysis.result

            elif analysis.analysis_type == "CROSS_EVIDENCE":
                cross_evidence_result = analysis.result

        # --------------------------------------------------
        # Safe defaults
        # --------------------------------------------------

        uncertainty_sources = []

        if uncertainty_result:
            uncertainty_sources = (
                uncertainty_result.get(
                    "uncertainty_sources",
                    []
                )
            )

        missing_evidence_count = 0

        if uncertainty_result:
            missing_evidence_count = (
                uncertainty_result.get(
                    "missing_evidence_count",
                    0
                )
            )

        analysis_completion_ratio = 0.0

        if uncertainty_result:
            analysis_completion_ratio = (
                uncertainty_result.get(
                    "analysis_completion_ratio",
                    0.0
                )
            )

        # --------------------------------------------------
        # Identify specific conditions
        # --------------------------------------------------

        has_analysis_error = (
            "ANALYSIS_ERROR" in uncertainty_sources
            or "ANALYSIS_ERRORS" in uncertainty_sources
        )

        has_model_unavailable = (
            "AI_GENERATION_ANALYSIS_UNAVAILABLE"
            in uncertainty_sources
        )

        has_quality_warning = (
            "EVIDENCE_QUALITY_WARNING"
            in uncertainty_sources
        )

        has_limited_comparability = (
            "LIMITED_CROSS_EVIDENCE_COMPARABILITY"
            in uncertainty_sources
        )

        has_incomplete_analysis = (
            "INCOMPLETE_ANALYSIS"
            in uncertainty_sources
        )

        has_incomplete_pipeline = (
            "INCOMPLETE_PIPELINE"
            in uncertainty_sources
        )

        # --------------------------------------------------
        # Determine assessment
        # --------------------------------------------------

        reasons = []

        # Missing evidence has the strongest baseline effect.
        if missing_evidence_count > 0:

            assessment = "INCONCLUSIVE"

            reasons.append(
                "Required evidence is missing."
            )

        # Actual analysis errors mean the system encountered
        # an unexpected processing failure.
        elif has_analysis_error:

            assessment = "INCONCLUSIVE"

            reasons.append(
                "One or more analysis stages "
                "encountered processing errors."
            )

        else:

            assessment = "LOW_CONCERN"

            # Model unavailable is a capability limitation,
            # not a processing error.
            if has_model_unavailable:

                assessment = "REVIEW_NEEDED"

                reasons.append(
                    "AI-generated image analysis is "
                    "currently unavailable because "
                    "the trained model is not available."
                )

            if has_quality_warning:

                assessment = "REVIEW_NEEDED"

                reasons.append(
                    "One or more evidence items "
                    "have quality warnings."
                )

            if has_limited_comparability:

                assessment = "REVIEW_NEEDED"

                reasons.append(
                    "Some cross-evidence comparisons "
                    "could not be established under "
                    "the current applicability rules."
                )

            if has_incomplete_analysis:

                assessment = "REVIEW_NEEDED"

                reasons.append(
                    "One or more analysis stages "
                    "did not produce completed results."
                )

            if has_incomplete_pipeline:

                assessment = "REVIEW_NEEDED"

                reasons.append(
                    "The verification pipeline "
                    "is not fully complete."
                )

        # --------------------------------------------------
        # Fallback explanation
        # --------------------------------------------------

        if not reasons:

            reasons.append(
                "No current baseline uncertainty "
                "condition requiring additional review "
                "was detected."
            )

        # --------------------------------------------------
        # Interpretation
        # --------------------------------------------------

        interpretation = {
            "low_concern": (
                "No current baseline uncertainty "
                "condition requiring additional review "
                "was detected."
            ),

            "inconclusive": (
                "The system does not have enough valid "
                "information to perform a meaningful "
                "baseline assessment."
            ),

            "review_needed": (
                "Evidence is available, but limitations "
                "or uncertainty require additional review."
            )
        }

        # --------------------------------------------------
        # Assessment basis
        # --------------------------------------------------

        if assessment == "INCONCLUSIVE":

            assessment_basis = (
                "The available evidence is insufficient "
                "for a meaningful baseline assessment."
            )

        elif assessment == "REVIEW_NEEDED":

            assessment_basis = (
                "Evidence is available, but one or more "
                "uncertainty or capability limitations "
                "require additional review."
            )

        else:

            assessment_basis = (
                "Available baseline evidence does not "
                "currently indicate a condition requiring "
                "additional review."
            )

        # --------------------------------------------------
        # Build result
        # --------------------------------------------------

        result = {
            "assessment": assessment,

            "reasons": reasons,

            "assessment_basis": assessment_basis,

            "interpretation": interpretation,

            "inputs_available": {
                "fusion": fusion_result is not None,
                "uncertainty": uncertainty_result is not None,
                "cross_evidence": (
                    cross_evidence_result is not None
                )
            },

            "uncertainty_factors": uncertainty_sources,

            "missing_evidence_count": (
                missing_evidence_count
            ),

            "analysis_completion_ratio": (
                analysis_completion_ratio
            )
        }

        return create_analysis_output(
            analysis_type="TRUST_ASSESSMENT",
            evidence_id=None,
            status="COMPLETED",
            result=result,
            message=(
                "Baseline trust assessment completed. "
                "The assessment distinguishes evidence "
                "limitations, processing errors, and "
                "model capability limitations. It does "
                "not represent a calibrated authenticity "
                "probability or numerical trust score."
            )
        )

    except Exception as error:

        return create_analysis_output(
            analysis_type="TRUST_ASSESSMENT",
            evidence_id=None,
            status="ERROR",
            result=None,
            message=(
                f"Trust assessment failed: "
                f"{str(error)}"
            )
        )