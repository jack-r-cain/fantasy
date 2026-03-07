"""Supabase Python client initialized with the service-role key.

Service-role operations bypass Row Level Security — use only in backend
tasks and trusted server-side code, never expose this key to clients.
"""

from supabase import Client, create_client

from app.config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)
