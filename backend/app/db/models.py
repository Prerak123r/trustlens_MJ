from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import JSONB

from app.db.database import Base


class Claim(Base):
    __tablename__ = "claims"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    claim_number = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    status = Column(
        String,
        default="PENDING",
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    evidence = relationship(
        "Evidence",
        back_populates="claim",
        cascade="all, delete-orphan"
    )

    verification_runs = relationship(
        "VerificationRun",
        back_populates="claim",
        cascade="all, delete-orphan"
    )


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    claim_id = Column(
        Integer,
        ForeignKey("claims.id"),
        nullable=False
    )

    evidence_type = Column(
        String,
        nullable=False
    )

    original_filename = Column(
        String,
        nullable=False
    )

    stored_filename = Column(
        String,
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    claim = relationship(
        "Claim",
        back_populates="evidence"
    )

    analysis_results = relationship(
        "AnalysisResult",
        back_populates="evidence",
        cascade="all, delete-orphan"
    )


class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    claim_id = Column(
        Integer,
        ForeignKey("claims.id"),
        nullable=False
    )

    status = Column(
        String,
        default="PENDING",
        nullable=False
    )

    pipeline_version = Column(
        String,
        default="0.1.0",
        nullable=False
    )

    started_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    claim = relationship(
        "Claim",
        back_populates="verification_runs"
    )

    analysis_results = relationship(
        "AnalysisResult",
        back_populates="verification_run",
        cascade="all, delete-orphan"
    )


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    verification_run_id = Column(
        Integer,
        ForeignKey("verification_runs.id"),
        nullable=False
    )

    evidence_id = Column(
        Integer,
        ForeignKey("evidence.id"),
        nullable=True
    )

    analysis_type = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="PENDING",
        nullable=False
    )

    result = Column(
        JSONB,
        nullable=True
    )

    message = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    verification_run = relationship(
        "VerificationRun",
        back_populates="analysis_results"
    )

    evidence = relationship(
        "Evidence",
        back_populates="analysis_results"
    )