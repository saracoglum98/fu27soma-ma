from fastapi import FastAPI
from routers import file, llm, Options, Functions, KnowledgeItems
app = FastAPI(
    title="fu27soma-ma API",
    version="1.0.0",
)

# Include routers
app.include_router(file.router)
app.include_router(llm.router)
app.include_router(Options.router)
app.include_router(Functions.router)
app.include_router(KnowledgeItems.router)
@app.get("/")
async def root():
    return {"status": "OK", "message": "Root endpoint"}
