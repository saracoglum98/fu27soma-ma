from fastapi import FastAPI
from routers import file

app = FastAPI(
    title="File Management API",
    description="API for managing and processing files in the system",
    version="1.0.0",
    contact={
        "name": "API Support",
        "email": "support@example.com"
    }
)

# Include routers
app.include_router(file.router)

@app.get("/")
async def root():
    return {"status": "OK", "message": "Root endpoint"}
