import os
import json
import base64
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Load Google credentials from env var (base64 encoded JSON)
_google_creds_b64 = os.getenv("GOOGLE_CREDENTIALS_B64")
if _google_creds_b64:
    _creds_json = base64.b64decode(_google_creds_b64).decode("utf-8")
    _creds_path = "/tmp/google_credentials.json"
    with open(_creds_path, "w") as f:
        f.write(_creds_json)
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = _creds_path

from routes.health import router as health_router
from routes.translate import router as translate_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Mzansi Translate API starting up...")
    yield
    print("Mzansi Translate API shutting down...")


app = FastAPI(
    title="Mzansi Voice Translate API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(translate_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
