from fastapi import FastAPI, HTTPException, Request
from fastapi.exception_handlers import http_exception_handler
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import and initialize Logfire-aware logging
from app.logfire_setup import setup_logging, instrument_app
from app.routers import deals

logger = setup_logging()

app = FastAPI(title="FastAPI Starter API", version="1.0.0")

# Instrument app with Logfire tracing (HTTP requests, DB queries, outbound calls)
instrument_app(app)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions with logging"""
    import traceback
    import sys

    # Log with logger
    logger.exception(
        "Unhandled exception",
        extra={
            "method": request.method,
            "path": request.url.path,
        },
    )

    # Also print full traceback to stderr (ensures it appears in server.log)
    print("=" * 60, file=sys.stderr)
    print(f"UNHANDLED EXCEPTION: {type(exc).__name__}: {exc}", file=sys.stderr)
    print(f"Request: {request.method} {request.url.path}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    print("=" * 60, file=sys.stderr)

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    """Log HTTP exceptions with 5xx status codes"""
    if exc.status_code >= 500:
        extra = {
            "method": request.method,
            "path": request.url.path,
            "status_code": exc.status_code,
        }
        logger.error("HTTP 5xx response", extra=extra)
    return await http_exception_handler(request, exc)


# Configure CORS to allow requests from any origin
# This is necessary for frontend apps deployed to different domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for generated apps
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handling is done via exception handlers above (sync-compatible)

# 🚨 CRITICAL: Include your API routers here
# After creating any router file (app/routers/users.py), you MUST:
# 1. Import the router: from app.routers import users
# 2. Include the router: app.include_router(users.router)
#
# Example:
# from app.routers import users, products, orders
# app.include_router(users.router)
# app.include_router(products.router)
# app.include_router(orders.router)

app.include_router(deals.router)


@app.get("/")
def root():
    return {"message": "FastAPI Starter API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
