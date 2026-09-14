from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_KEY: str
    DATABASE_URL: str = "sqlite:///./rag.db"
    MODEL_NAME: str = "gemini-2.5-flash"

    class Config:
        env_file = ".env"


settings = Settings()