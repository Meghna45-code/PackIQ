"""
Vercel Serverless Function entry point.
Adds the backend directory to sys.path so FastAPI modules can be imported,
then re-exports the app object for Vercel's ASGI handler.
"""
import sys
import os

# Make backend modules importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app  # noqa: F401 – Vercel picks up `app` automatically
