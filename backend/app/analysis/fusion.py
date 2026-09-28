from app.analysis.base import create_analysis_output


def analyze_fusion(
    claim,
    verification_run
):

    try:

        analysis_results = (
            verification_run.analysis_results
        )

        evidence_results = {}

        for result in analysis_results:

            if result.evidence_id is None:
                continue

            evidence_id = result.evidence_id

            if evidence_id not in evidence_results:
                evidence_results[evidence_id] = {}

            evidence_results[evidence_id][
                result.analysis_type
            ] = {
                "status": result.status,
                "result": result.result
            }

        analysis_summary = {}

        for evidence_id, results in evidence_results.items():

            analysis_summary[str(evidence_id)] = {
                analysis_type: {
                    "status": data["status"]
                }
                for analysis_type, data
                in results.items()
            }

        completed_count = 0
        total_count = 0

        for results in evidence_results.values():

            for data in results.values():

                total_count += 1

                if data["status"] == "COMPLETED":
                    completed_count += 1

        result = {
            "evidence_count": len(
                claim.evidence
            ),
            "analysis_count": total_count,
            "completed_analysis_count": (
                completed_count
            ),
            "analysis_completion_ratio": (
                round(
                    completed_count / total_count,
                    4
                )
                if total_count > 0
                else 0
            ),
            "evidence_analysis_summary": (
                analysis_summary
            )
        }

        return create_analysis_output(
            analysis_type="FUSION",
            evidence_id=None,
            status="COMPLETED",
            result=result,
            message=(
                "Evidence fusion baseline completed. "
                "No authenticity or trust score is "
                "generated at this stage."
            )
        )

    except Exception as error:

        return create_analysis_output(
            analysis_type="FUSION",
            evidence_id=None,
            status="ERROR",
            result=None,
            message=f"Evidence fusion failed: {str(error)}"
        )