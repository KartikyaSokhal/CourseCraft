# yt_service.py
"""
YouTube helper: search, convert, verify embeddability, provide fallback embeds.
"""

import hashlib
import logging
import re
from typing import Optional, Tuple, Set, List
from django.conf import settings
from django.core.cache import cache
import requests
from requests.adapters import HTTPAdapter, Retry

logger = logging.getLogger(__name__)

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
FALLBACK_EMBED = "https://www.youtube.com/embed/dQw4w9WgXcQ"

_session: Optional[requests.Session] = None

def _session_with_retries(retries: int = 2) -> requests.Session:
    global _session
    if _session is None:
        s = requests.Session()
        r = Retry(total=retries, backoff_factor=0.5,
                  status_forcelist=(429, 500, 502, 503, 504),
                  allowed_methods=["GET"])
        s.mount("https://", HTTPAdapter(max_retries=r))
        _session = s
    return _session

def _get_api_key() -> str:
    key = getattr(settings, "YOUTUBE_API_KEY", None)
    if not key:
        raise RuntimeError("YOUTUBE_API_KEY not configured")
    return key

def _fetch_video_ids_from_youtube(query: str, max_results: int = 5) -> List[str]:
    """Performs the actual API call to YouTube to get a list of video IDs."""
    api_key = _get_api_key()
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "order": "relevance",
        "videoEmbeddable": "true",
        "key": api_key,
        "fields": "items(id/videoId)"
    }
    session = _session_with_retries()
    resp = session.get(YOUTUBE_SEARCH_URL, params=params, timeout=8)
    resp.raise_for_status()
    items = resp.json().get("items", [])
    return [item["id"]["videoId"] for item in items if item.get("id", {}).get("videoId")]

def _get_first_embeddable_id(video_ids: List[str]) -> Optional[str]:
    """
    Given a list of video IDs, checks them in a single batch call
    and returns the first one that is public and embeddable.
    """
    if not video_ids:
        return None
        
    api_key = _get_api_key()
    params = {
        "part": "status",
        "id": ",".join(video_ids),
        "key": api_key,
        "fields": "items(id,status(privacyStatus,embeddable))"
    }
    session = _session_with_retries()
    
    try:
        resp = session.get(YOUTUBE_VIDEOS_URL, params=params, timeout=8)
        resp.raise_for_status()
        items = resp.json().get("items", [])
    except Exception as e:
        logger.error("YouTube API video detail fetch failed: %s", e)
        return None

    for item in items:
        status = item.get("status", {})
        if status.get("privacyStatus") == "public" and status.get("embeddable"):
            return item.get("id")
            
    return None

def get_embed_for_query(query: str, exclude_ids: Set[str], cache_ttl: int = 60*60*24) -> Tuple[str, bool]:
    """
    Gets a working, unique YouTube embed URL for a query.

    Caches the list of search results, then iterates through them to find the
    first valid video that has not already been used in the current course.

    Returns: (embed_url, had_to_use_fallback)
    """
    cache_key = "yt_search_results:" + hashlib.md5(query.encode("utf-8")).hexdigest()
    
    # 1. Get a list of potential video IDs (from cache or new API call)
    video_id_candidates = None
    if cache is not None:
        video_id_candidates = cache.get(cache_key)

    if not video_id_candidates:
        try:
            video_id_candidates = _fetch_video_ids_from_youtube(query)
            if cache is not None:
                cache.set(cache_key, video_id_candidates, cache_ttl)
        except Exception as e:
            logger.warning("YouTube search API failed for '%s': %s", query, e)
            return FALLBACK_EMBED, True

    if not video_id_candidates:
        return FALLBACK_EMBED, True

    # 2. Find the first valid ID that isn't in our exclusion set
    ids_to_check = [vid for vid in video_id_candidates if vid not in exclude_ids]
    
    if not ids_to_check:
        logger.warning("No new video candidates found for query '%s' after exclusion.", query)
        return FALLBACK_EMBED, True # All potential videos were already used

    # 3. Check for embeddability and get the first working one
    first_good_id = _get_first_embeddable_id(ids_to_check)

    if first_good_id:
        return f"https://www.youtube.com/embed/{first_good_id}", False
    else:
        logger.warning("None of the top candidates for '%s' were embeddable.", query)
        return FALLBACK_EMBED, True