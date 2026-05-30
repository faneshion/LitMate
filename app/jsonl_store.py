from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Any, Callable, Dict, Generic, Iterable, List, Optional, Type, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class JSONLStore(Generic[T]):
    """Small local JSONL repository.

    The store rewrites the whole file for updates. This is acceptable for a local
    research prototype and keeps the persistence transparent and easy to inspect.
    """

    _locks: Dict[str, threading.Lock] = {}

    def __init__(self, path: Path, model: Type[T]):
        self.path = path
        self.model = model
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.touch(exist_ok=True)
        self.lock = self._locks.setdefault(str(path), threading.Lock())

    def _read_raw(self) -> List[Dict[str, Any]]:
        records: List[Dict[str, Any]] = []
        with self.path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return records

    def list(self) -> List[T]:
        return [self.model.model_validate(r) for r in self._read_raw()]

    def get(self, item_id: str) -> Optional[T]:
        for item in self.list():
            if getattr(item, "id", None) == item_id:
                return item
        return None

    def append(self, item: T) -> T:
        with self.lock:
            with self.path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(item.model_dump(mode="json"), ensure_ascii=False) + "\n")
        return item

    def upsert(self, item: T) -> T:
        with self.lock:
            records = self._read_raw()
            found = False
            item_dict = item.model_dump(mode="json")
            for idx, record in enumerate(records):
                if record.get("id") == item_dict.get("id"):
                    records[idx] = item_dict
                    found = True
                    break
            if not found:
                records.append(item_dict)
            self._write_raw(records)
        return item

    def update(self, item_id: str, updater: Callable[[T], T]) -> Optional[T]:
        with self.lock:
            records = self._read_raw()
            updated: Optional[T] = None
            for idx, record in enumerate(records):
                if record.get("id") == item_id:
                    item = self.model.model_validate(record)
                    updated = updater(item)
                    records[idx] = updated.model_dump(mode="json")
                    break
            if updated:
                self._write_raw(records)
            return updated

    def delete(self, item_id: str) -> bool:
        with self.lock:
            records = self._read_raw()
            new_records = [r for r in records if r.get("id") != item_id]
            if len(new_records) == len(records):
                return False
            self._write_raw(new_records)
            return True

    def filter(self, predicate: Callable[[T], bool]) -> List[T]:
        return [item for item in self.list() if predicate(item)]

    def replace_all(self, items: Iterable[T]) -> None:
        with self.lock:
            self._write_raw([item.model_dump(mode="json") for item in items])

    def _write_raw(self, records: List[Dict[str, Any]]) -> None:
        tmp_path = self.path.with_suffix(self.path.suffix + ".tmp")
        with tmp_path.open("w", encoding="utf-8") as f:
            for record in records:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
        tmp_path.replace(self.path)
