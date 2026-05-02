from config import Config
from fastapi import FastAPI

config = Config()

app = FastAPI(title="Meridian API")


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=config.HOST, port=config.PORT)
