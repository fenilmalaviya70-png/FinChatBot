"""
Application Configuration
Loads environment variables and provides settings throughout the app
"""

from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # Groq API Key (FREE and FAST)
    GROQ_API_KEY: str = ""
    
    # OpenAI API Key
    OPENAI_API_KEY: str = ""
    
    # OpenRouter API Key
    OPENROUTER_API_KEY: str = ""
    
    # Optional: Your site URL and app name (not needed for Groq)
    OPENROUTER_SITE_URL: str = "http://localhost:5173"
    OPENROUTER_APP_NAME: str = "FinChatBot"
    
    # Node.js Backend URL (for webhook callbacks)
    NODE_WEBHOOK_URL: str = "http://localhost:8000"
    
    # Server Configuration
    PORT: int = 5000
    
    # Vector Store Configuration
    VECTOR_STORE_PATH: str = "./vector_store"  # Local directory for FAISS indices
    
    # Embedding Model Configuration
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # LLM Configuration
    LLM_PROVIDER: str = "groq"  # 'openai' or 'groq' - Groq is free and fast
    LLM_MODEL: str = "llama-3.3-70b-versatile"  # Groq's best free model
    LLM_TEMPERATURE: float = 0.0
    LLM_MAX_TOKENS: int = 2000

    # Vision Configuration (for PDF image analysis)
    # Options: 'openrouter' (free), 'openai' (paid), 'none' (skip images)
    VISION_PROVIDER: str = "openrouter"
    VISION_MODEL: str = "qwen/qwen2.5-vl-72b-instruct:free"  # Free vision model on OpenRouter
    
    # Context Management
    MAX_CONTEXT_CHARACTERS: int = 15000  # Approx 4000 tokens
    
    # Document Processing Configuration
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 150
    
    # Retrieval Configuration
    TOP_K_RESULTS: int = 5  # Number of relevant chunks to retrieve
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

# Create global settings instance
settings = Settings()

# Ensure vector store directory exists
os.makedirs(settings.VECTOR_STORE_PATH, exist_ok=True)
