import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./lifeos.db"
    SECRET_KEY: str = "super-secret-jwt-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Google OAuth / Calendar Credentials Configuration
    # Define these in your local .env file or export them as env variables
    GOOGLE_CLIENT_ID: str = "your_google_client_id_here"
    GOOGLE_CLIENT_SECRET: str = "your_google_client_secret_here"

    class Config:
        env_file = ".env"


settings = Settings()
