from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base
from app.db import models
from app.api.claims import router as claims_router
from app.api.uploads import router as uploads_router
from app.api.verification import router as verification_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="TrustLens API",
    description="Multimodal Claim Evidence Verification System",
    version="0.1.0"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(claims_router)
app.include_router(uploads_router)
app.include_router(verification_router)

@app.get("/")
def root():
    return {
        "message": "TrustLens API is running",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }