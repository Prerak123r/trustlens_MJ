from pathlib import Path
import shutil

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile
)

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Claim, Evidence


router = APIRouter(
    prefix="/claims",
    tags=["Evidence Upload"]
)


UPLOAD_DIR = Path("uploads")


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf"
}


@router.post("/{claim_id}/upload/{evidence_type}")
def upload_evidence(
    claim_id: int,
    evidence_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # -----------------------------------
    # 1. Validate evidence type
    # -----------------------------------

    allowed_types = {
        "invoice",
        "product",
        "damage"
    }

    if evidence_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid evidence type. Use invoice, product, or damage."
        )


    # -----------------------------------
    # 2. Check whether claim exists
    # -----------------------------------

    claim = db.query(Claim).filter(
        Claim.id == claim_id
    ).first()

    if not claim:
        raise HTTPException(
            status_code=404,
            detail="Claim not found."
        )


    # -----------------------------------
    # 3. Validate file extension
    # -----------------------------------

    original_filename = file.filename or ""

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type."
        )


    # -----------------------------------
    # 4. Create claim upload directory
    # -----------------------------------

    claim_directory = UPLOAD_DIR / f"claim_{claim_id}"

    claim_directory.mkdir(
        parents=True,
        exist_ok=True
    )


    # -----------------------------------
    # 5. Create safe stored filename
    # -----------------------------------

    stored_filename = (
        f"{evidence_type}{extension}"
    )

    file_path = claim_directory / stored_filename


    # -----------------------------------
    # 6. Save uploaded file
    # -----------------------------------

    try:

        with file_path.open("wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Could not save file: {error}"
        )


    # -----------------------------------
    # 7. Store file information in DB
    # -----------------------------------

    evidence = Evidence(
        claim_id=claim_id,
        evidence_type=evidence_type,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=str(file_path)
    )

    db.add(evidence)
    db.commit()
    db.refresh(evidence)


    # -----------------------------------
    # 8. Return response
    # -----------------------------------

    return {
        "message": "Evidence uploaded successfully",

        "evidence": {
            "id": evidence.id,
            "claim_id": evidence.claim_id,
            "type": evidence.evidence_type,
            "original_filename": evidence.original_filename,
            "file_path": evidence.file_path
        }
    }