"""
OpenAI-based course generator.
Generates course structure and recommended video titles.
Obtains real embeddable videos via yt_service.
"""

import os
import json
import re
import time
from pathlib import Path
from typing import Optional, Any, Dict
from django.conf import settings
from openai import OpenAI
from .yt_service import get_embed_for_query

# Config
TMP_DIR = Path(getattr(settings, "BASE_DIR", ".")) / "tmp"
TMP_DIR.mkdir(parents=True, exist_ok=True)

OPENAI_MODEL_DEFAULT = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")

# Create OpenAI client
client = OpenAI(api_key=getattr(settings, "OPENAI_API_KEY", None))


def _save_raw(text: str, name_prefix: str = "openai_raw"):
    ts = int(time.time())
    fname = f"{name_prefix}_{ts}.txt"
    p = TMP_DIR / fname
    p.write_text(text, encoding="utf-8")
    return str(p)


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
        for key in ("title", "youtube_search_query", "questions"):
            if key not in lesson:
                return f"Lesson {i} missing required key: {key}."
        if not isinstance(lesson["questions"], list) or len(lesson["questions"]) < 1:
            return f"Lesson {i} must have at least 1 question."
    return None


def generate_course_with_openai(prompt: str, modules: int = 5, duration_days: int = 30) -> Dict[str, Any]:
    """
    Calls OpenAI to generate a JSON course structure and enriches with YouTube embeds.
    """
    api_key = getattr(settings, "OPENAI_API_KEY", None)
    model = getattr(settings, "OPENAI_MODEL", OPENAI_MODEL_DEFAULT)
    if not api_key:
        return {"error": "OPENAI_API_KEY not configured."}

    system_prompt = (
        f"You are an expert instructional designer. Create a detailed, {modules}-lesson online course outline "
        f"based on the user's request. The total course should be structured to be completed over {duration_days} days.\n\n"
        "IMPORTANT OUTPUT RULES:\n"
        "1. Output must be a single, valid JSON object and nothing else.\n"
        "2. For each lesson, include a 'youtube_search_query' (5-10 words) specific to that lesson's topic.\n"
        "3. Each lesson must have at least 1 MCQ in 'questions'.\n"
        "4. No trailing commas, no explanations outside JSON.\n\n"
        "JSON SCHEMA:\n"
        '{ "title": "string", "description": "string", "course_duration_days": int, '
        '"lessons": [ { "title": "string", "youtube_search_query": "string", "duration_seconds": int, "order": int, '
        '"questions": [{"question":"string","choices":["..."],"correct_index":0}] } ] }'
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        text = response.choices[0].message.content.strip()
    except Exception as e:
        return {"error": f"OpenAI API error: {e}"}

    raw_path = _save_raw(text)

    # Try parsing JSON directly
    parsed = None
    try:
        parsed = json.loads(text)
    except Exception:
        obj_text = _find_first_balanced_json(text)
        if obj_text:
            try:
                parsed = json.loads(_remove_trailing_commas(obj_text))
            except Exception:
                parsed = None

    if parsed is None:
        return {"error": "Could not parse JSON from OpenAI response.", "raw_path": raw_path}

    schema_err = _basic_schema_ok(parsed, expected_lessons=modules)
    if schema_err:
        return {"error": f"Schema validation failed: {schema_err}", "raw_path": raw_path}

    # Fetch YouTube videos
    youtube_had_fallbacks = False
    used_video_ids = set()

    for lesson in parsed.get("lessons", []):
        specific_query = lesson.get("youtube_search_query")
        embed_url, had_fallback = get_embed_for_query(
            query=specific_query,
            exclude_ids=used_video_ids
        )
        lesson["video_url"] = embed_url
        if had_fallback:
            youtube_had_fallbacks = True

        # Track used video IDs
        video_id_match = re.search(r"/embed/([A-Za-z0-9_\-]+)", embed_url)
        if video_id_match:
            used_video_ids.add(video_id_match.group(1))

    parsed["_meta"] = {"raw_path": raw_path, "youtube_had_fallbacks": youtube_had_fallbacks}
    return parsed
