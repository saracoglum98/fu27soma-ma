from fastapi import APIRouter

router = APIRouter(
    prefix="/root",
    tags=["root"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", name="Root")
async def root():
    return {"status": "OK", "message": "Root endpoint"}