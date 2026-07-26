import re
import secrets
import string

_ALPHABET = string.ascii_lowercase + string.digits


def random_slug(length: int = 8) -> str:
    """Short, url-safe random slug for shareable public form links."""
    return "".join(secrets.choice(_ALPHABET) for _ in range(length))


def slugify_title(title: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    suffix = random_slug(5)
    return f"{base}-{suffix}" if base else suffix
