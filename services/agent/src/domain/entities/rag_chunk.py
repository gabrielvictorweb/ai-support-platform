from dataclasses import dataclass


@dataclass
class RagChunk:
    chunk_id: str
    content: str
    score: float
    source: str
