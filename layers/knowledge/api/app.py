from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from routers import tests, Options, Functions, KnowledgeItems, SolutionSpaces, Solutions, Views
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title=f"{os.getenv('NEXT_PUBLIC_APP_NAME')} Knowledge Layer API",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(tests.router)
app.include_router(KnowledgeItems.router)
app.include_router(Options.router)
app.include_router(Functions.router)
app.include_router(SolutionSpaces.router)
app.include_router(Solutions.router)
app.include_router(Views.router)

@app.get("/", include_in_schema=False)
async def root():
    return 'OK'

@app.get("/docs", include_in_schema=False)
async def api_documentation(request: Request):
    return HTMLResponse("""
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Elements in HTML</title>

    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
  </head>
  <body>

    <elements-api
      apiDescriptionUrl="openapi.json"
      router="hash"
      hideSchemas="true"
    />

  </body>
</html>""")
