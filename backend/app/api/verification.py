from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Claim,VerificationRun
from app.services.verification_pipeline import create_verification_run


router = APIRouter(
    prefix="/claims",
    tags=["Verification"]
)


@router.post("/{claim_id}/verify")
def start_verification(
    claim_id: int,
    db: Session = Depends(get_db)
):

    claim = (
        db.query(Claim)
        .filter(Claim.id == claim_id)
        .first()
    )

    if not claim:
        raise HTTPException(
            status_code=404,
            detail="Claim not found."
        )

    if not claim.evidence:
        raise HTTPException(
            status_code=400,
            detail="No evidence uploaded for this claim."
        )

    run = create_verification_run(
        db=db,
        claim=claim
    )

    claim.status = "VERIFICATION_STARTED"

    db.commit()

    return {
        "message": "Verification started successfully.",
        "claim_id": claim.id,
        "claim_number": claim.claim_number,
        "verification_run_id": run.id,
        "status": run.status
    }


@router.get("/verification/{run_id}")
def get_verification_run(
    run_id: int,
    db: Session = Depends(get_db)
):

    run = (
        db.query(VerificationRun)
        .filter(VerificationRun.id == run_id)
        .first()
    )

    if not run:
        raise HTTPException(
            status_code=404,
            detail="Verification run not found."
        )

    return {
        "id": run.id,
        "claim_id": run.claim_id,
        "status": run.status,
        "pipeline_version": run.pipeline_version,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "analysis_results": [
            {
                "id": result.id,
                "evidence_id": result.evidence_id,
                "analysis_type": result.analysis_type,
                "status": result.status,
                "result": result.result,
                "message": result.message
            }
            for result in run.analysis_results
        ]
    }