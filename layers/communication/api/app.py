from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from routers import file, llm, Options, Functions, KnowledgeItems
app = FastAPI(
    title="fu27soma-ma API",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
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
      hideSchemaSidebar="true"
    />

  </body>
</html>""")
