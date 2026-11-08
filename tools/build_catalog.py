#!/usr/bin/env python3

import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
items = []

for category in ("movies", "cartoons"):
    category_dir = CONTENT / category

    if not category_dir.exists():
        continue

    for info_path in sorted(category_dir.glob("*/info.json")):
        try:
            item = json.loads(
                info_path.read_text(encoding="utf-8")
            )

            folder = info_path.parent.relative_to(ROOT).as_posix()

            if not item.get("id"):
                item["id"] = info_path.parent.name

            poster = item.get("poster", "poster.jpg")
            video = item.get("video", "")

            if poster and not urlparse(poster).scheme:
                item["poster"] = f"{folder}/{poster}"

            if video and not urlparse(video).scheme:
                item["video"] = f"{folder}/{video}"

            item["category"] = category
            items.append(item)

            print(f"Добавлено: {item['title']}")

        except Exception as exc:
            print(f"Ошибка {info_path}: {exc}")

out = ROOT / "assets" / "js" / "catalog.js"
out.parent.mkdir(parents=True, exist_ok=True)

content = (
    "// Автоматически создано из info.json.\n"
    "window.CMVIDEO_CATALOG = "
    + json.dumps(items, ensure_ascii=False, indent=2)
    + ";\n"
)

out.write_text(content, encoding="utf-8")

print(f"Готово: {len(items)} записей → {out}")
