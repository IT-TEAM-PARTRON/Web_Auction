from fastapi import Request
import os
from babel.support import Translations

def get_locale(request: Request):
    return getattr(request.state, "locale", "en")

def get_translations(locale):
    translations_dir = os.path.join(os.path.dirname(__file__), "translations")
    try:
        return Translations.load(translations_dir, [locale])
    except Exception:
        return Translations.load(translations_dir, ["en"])

def _(text, request: Request):
    locale = get_locale(request)
    translations = get_translations(locale)
    return translations.gettext(text)