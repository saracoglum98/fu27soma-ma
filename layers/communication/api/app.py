from fastapi import FastAPI
from routers import file, llm
app = FastAPI(
    title="fu27soma-ma API",
    version="1.0.0",
)

# Include routers
app.include_router(file.router)
app.include_router(llm.router)

@app.get("/")
async def root():
    return {"status": "OK", "message": "Root endpoint"}
