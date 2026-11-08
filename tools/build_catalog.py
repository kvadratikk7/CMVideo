#!/usr/bin/env python3
"""Собирает каталог из content/{movies,cartoons}/<id>/info.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
items = []
for category in ("movies", "cartoons"):
    for info_path in sorted((CONTENT / category).glob("*/info.json")):
        try:
            item = json.loads(info_path.read_text(encoding="utf-8"))
            item["category"] = category
            folder = info_path.parent.relative_to(ROOT).as_posix()
            item["poster"] = f"{folder}/{item.get('poster', 'poster.jpg')}"
            item["video"] = f"{folder}/{item.get('video', 'video.mp4')}"
            if not item.get("id"):
                item["id"] = info_path.parent.name
            items.append(item)
        except Exception as exc:
            print(f"Пропуск {info_path}: {exc}")
out = ROOT / "assets" / "js" / "catalog.js"
out.write_text("// Создано tools/build_catalog.py — не редактируй вручную.\\nwindow.CMVIDEO_CATALOG = " +
               json.dumps(items, ensure_ascii=False, indent=2) + ";\\n", encoding="utf-8")
print(f"Готово: {len(items)} записей → {out}")
