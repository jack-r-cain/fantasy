from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Supabase
    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str

    # App
    app_env: str = "development"
    allowed_origins: list[str] = ["http://localhost:8081", "http://localhost:19006"]

    # MLB Stats API
    mlb_api_base: str = "https://statsapi.mlb.com/api/v1"
    mlb_api_rate_limit: int = 10  # requests per second

    # Expo Push
    expo_push_url: str = "https://exp.host/--/api/v2/push/send"


settings = Settings()  # type: ignore[call-arg]
