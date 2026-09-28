from datetime import datetime

from app.db.models import (
    VerificationRun,
    AnalysisResult
)

from app.analysis.dispatcher import run_analysis
from app.analysis.cross_evidence import analyze_cross_evidence
from app.analysis.fusion import analyze_fusion
from app.analysis.uncertainty import analyze_uncertainty


EVIDENCE_ANALYSIS_STAGES = [
    "IMAGE_QUALITY",
    "FORENSICS",
    "AI_GENERATION",
    "METADATA",
    "OCR"
]


def create_analysis_result(
    db,
    verification_run_id,
    analysis_type,
    evidence_id=None,
    status="PENDING",
    result=None,
    message=None
):

    analysis = AnalysisResult(
        verification_run_id=verification_run_id,
        evidence_id=evidence_id,
        analysis_type=analysis_type,
        status=status,
        result=result,
        message=message
    )

    db.add(analysis)

    return analysis


def create_verification_run(db, claim):

    run = VerificationRun(
        claim_id=claim.id,
        status="RUNNING",
        pipeline_version="0.1.0",
        started_at=datetime.utcnow()
    )

    db.add(run)
    db.flush()

    # -----------------------------------------
    # Evidence-level analysis
    # -----------------------------------------

    for evidence in claim.evidence:

        for stage in EVIDENCE_ANALYSIS_STAGES:

            analysis_output = run_analysis(
                stage,
                evidence
            )

            create_analysis_result(
                db=db,
                verification_run_id=run.id,
                evidence_id=evidence.id,
                analysis_type=stage,
                status=analysis_output["status"],
                result=analysis_output["result"],
                message=analysis_output["message"]
            )

    # -----------------------------------------
    # Cross-evidence analysis
    # -----------------------------------------

    cross_evidence_output = analyze_cross_evidence(
        claim=claim,
        verification_run=run
    )

    create_analysis_result(
        db=db,
        verification_run_id=run.id,
        analysis_type="CROSS_EVIDENCE",
        evidence_id=None,
        status=cross_evidence_output["status"],
        result=cross_evidence_output["result"],
        message=cross_evidence_output["message"]
    )

    # -----------------------------------------
    # Evidence fusion
    # -----------------------------------------

    fusion_output = analyze_fusion(
        claim=claim,
        verification_run=run
    )

    create_analysis_result(
        db=db,
        verification_run_id=run.id,
        analysis_type="FUSION",
        evidence_id=None,
        status=fusion_output["status"],
        result=fusion_output["result"],
        message=fusion_output["message"]
    )

    # -----------------------------------------
    # Uncertainty analysis
    # -----------------------------------------

    uncertainty_output = analyze_uncertainty(
        claim=claim,
        verification_run=run
    )

    create_analysis_result(
        db=db,
        verification_run_id=run.id,
        analysis_type="UNCERTAINTY",
        evidence_id=None,
        status=uncertainty_output["status"],
        result=uncertainty_output["result"],
        message=uncertainty_output["message"]
    )

    # -----------------------------------------
    # Trust assessment
    # -----------------------------------------

    create_analysis_result(
        db=db,
        verification_run_id=run.id,
        analysis_type="TRUST_ASSESSMENT",
        evidence_id=None,
        status="NOT_IMPLEMENTED",
        result=None,
        message=(
            "TRUST_ASSESSMENT module "
            "has not been implemented yet."
        )
    )

    # -----------------------------------------
    # Save verification run
    # -----------------------------------------

    db.commit()

    db.refresh(run)

    return run