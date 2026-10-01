from fastapi import APIRouter
from app.api.schemas import APIResponse

router = APIRouter()

@router.get("/health", response_model=APIResponse)
def health_check():
    return {"success": True, "result": {"status": "ok"}, "warnings": []}
