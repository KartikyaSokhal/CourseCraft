# ai_service.py
"""
Gemini-based course generator.
Generates course structure and recommended video titles.
Obtains real embeddable videos via yt_service.
"""

import json
import re
import time
from pathlib import Path
from typing import Optional, Any, Dict
import requests
from requests.adapters import HTTPAdapter, Retry
from django.conf import settings
from .yt_service import get_embed_for_query # Removed unused imports

# Config
TMP_DIR = Path(getattr(settings, "BASE_DIR", ".")) / "tmp"
TMP_DIR.mkdir(parents=True, exist_ok=True)

GEMINI_MODEL_DEFAULT = "gemini-1.5-flash"
GEMINI_API_TIMEOUT = 60 # Increased timeout for potentially larger responses
GEMINI_API_RETRIES = 2

def _session_with_retries(retries: int = GEMINI_API_RETRIES) -> requests.Session:
    s = requests.Session()
    r = Retry(
        total=retries,
        backoff_factor=0.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=["POST", "GET"]
    )
    s.mount("https://", HTTPAdapter(max_retries=r))
    return s

def _save_raw(text: str, name_prefix: str = "gemini_raw"):
    ts = int(time.time())
    fname = f"{name_prefix}_{ts}.txt"
    p = TMP_DIR / fname
    p.write_text(text, encoding="utf-8")
    return str(p)

def _strip_code_fences(s: str) -> str:
    return re.sub(r"```(?:json)?\n?([\s\S]*?)```", r"\1", s, flags=re.IGNORECASE)

def _find_first_balanced_json(s: str) -> Optional[str]:
    start = s.find("{")
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(s)):
        ch = s[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return s[start:i + 1]
    return None

def _remove_trailing_commas(s: str) -> str:
    s = re.sub(r",\s*([}\]])", r"\1", s)
    s = re.sub(r",\s*(\n\s*[}\]])", r"\1", s)
    return s

def _basic_schema_ok(obj: Any, expected_lessons: int) -> Optional[str]:
    if not isinstance(obj, dict):
        return "Top-level JSON is not an object."
    for k in ("title", "description", "course_duration_days", "lessons"):
        if k not in obj:
            return f"Missing required key: {k}"
    if not isinstance(obj["lessons"], list):
        return "lessons must be a list."
    if expected_lessons and len(obj["lessons"]) != expected_lessons:
        return f"Expected {expected_lessons} lessons but got {len(obj['lessons'])}."
    for i, lesson in enumerate(obj["lessons"], start=1):
        if not isinstance(lesson, dict):
            return f"Lesson {i} is not an object."
        # ⭐ CHANGED: Now checks for the new 'youtube_search_query' key
        for key in ("title", "youtube_search_query", "questions"):
            if key not in lesson:
                return f"Lesson {i} missing required key: {key}."
        if not isinstance(lesson["questions"], list) or len(lesson["questions"]) < 1:
            return f"Lesson {i} must have at least 1 question."
    return None

def generate_course_with_gemini(prompt: str, modules: int = 5, duration_days: int = 30) -> Dict[str, Any]:
    api_key = getattr(settings, "GEMINI_API_KEY", None)
    model = getattr(settings, "GEMINI_MODEL", None) or GEMINI_MODEL_DEFAULT
    if not api_key:
        return {"error": "GEMINI_API_KEY not configured."}

    # ⭐ CHANGED: Major prompt enhancement to get specific search queries
    system_prompt = (
        f"You are an expert instructional designer. Create a detailed, {modules}-lesson online course outline based on the user's request.\n"
        f"The total course should be structured to be completed over {duration_days} days.\n\n"
        "IMPORTANT OUTPUT RULES:\n"
        "1. Your entire output must be a single, valid JSON object and nothing else.\n"
        "2. For each lesson, you MUST provide a 'youtube_search_query'.\n"
        "3. This query should be a concise, targeted search phrase (5-10 words) to find a short, specific video for THAT lesson's topic. AVOID generic queries.\n"
        "   - GOOD query example for a Python lesson on 'loops': 'python for loop and while loop tutorial for beginners explained'\n"
        "   - BAD query example: 'python tutorial'\n"
        "4. Ensure all JSON strings are properly escaped. Do not include trailing commas.\n\n"
        'JSON SCHEMA:\n'
        '{ "title": "string", "description": "string", "course_duration_days": int, "lessons": [ '
        '{ "title": "string", "youtube_search_query": "string", "duration_seconds": int, "order": int, "questions": [{"question":"string","choices":["..."],"correct_index":0}] } ] }'
    )

    payload = {"contents": [{"parts": [{"text": system_prompt + "\nUser request: " + prompt}]}]}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    session = _session_with_retries()
    try:
        r = session.post(url, json=payload, timeout=GEMINI_API_TIMEOUT)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        return {"error": f"Network/HTTP error contacting Gemini API: {e}"}

    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    raw_path = _save_raw(text)
    stripped = _strip_code_fences(text).strip()

    parsed = None
    try:
        parsed = json.loads(stripped)
    except Exception:
        obj_text = _find_first_balanced_json(stripped)
        if obj_text:
            try:
                parsed = json.loads(_remove_trailing_commas(obj_text))
            except Exception:
                parsed = None
    if parsed is None:
        return {"error": "Could not parse JSON from Gemini response.", "raw_path": raw_path}
    
    schema_err = _basic_schema_ok(parsed, expected_lessons=modules)
    if schema_err:
        return {"error": f"Schema validation failed: {schema_err}", "raw_path": raw_path}

    # ⭐ CHANGED: Simplified video fetching loop
    youtube_had_fallbacks = False
    used_video_ids = set() # Keep track of videos to avoid duplicates

    for lesson in parsed.get("lessons", []):
        # Use the highly specific query from Gemini
        specific_query = lesson.get("youtube_search_query")
        
        # get_embed_for_query is now more robust. It returns the embed URL and a flag if it had to use a fallback.
        embed_url, had_fallback = get_embed_for_query(
            query=specific_query, 
            exclude_ids=used_video_ids
        )
        
        lesson["video_url"] = embed_url
        if had_fallback:
            youtube_had_fallbacks = True
            
        # Add the found video ID to the exclusion set for subsequent searches
        video_id_match = re.search(r"/embed/([A-Za-z0-9_\-]+)", embed_url)
        if video_id_match:
            used_video_ids.add(video_id_match.group(1))

    parsed["_meta"] = {"raw_path": raw_path, "youtube_had_fallbacks": youtube_had_fallbacks}
    return parsed