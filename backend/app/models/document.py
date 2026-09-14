from dataclasses import dataclass
from typing import Optional


@dataclass
class DocumentChunk:
    document_id: str
    document_name: str
    chunk_id: str
    text: str
    page: Optional[int] = None