import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.db.models import Claim


router = APIRouter(
    prefix="/claims",
    tags=["Claims"]
)


@router.post("/")
def create_claim(
    db: Session = Depends(get_db)
):
    

    claim_number = (
        f"TL-{uuid.uuid4().hex[:8].upper()}"
    )

    claim = Claim(
        claim_number=claim_number,
        status="PENDING"
    )

    db.add(claim)
    db.commit()
    db.refresh(claim)

    return {
        "id": claim.id,
        "claim_number": claim.claim_number,
        "status": claim.status,
        "message": "Claim created successfully"
    }
@router.get("/{claim_id}")
def get_claim(
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

    return {
        "id": claim.id,
        "claim_number": claim.claim_number,
        "status": claim.status,
        "created_at": claim.created_at,
        "evidence": [
            {
                "id": evidence.id,
                "type": evidence.evidence_type,
                "original_filename": evidence.original_filename,
                "file_path": evidence.file_path,
                "created_at": evidence.created_at
            }
            for evidence in claim.evidence
        ]
    }