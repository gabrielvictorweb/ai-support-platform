from dataclasses import dataclass

from src.domain.entities.rag_chunk import RagChunk


@dataclass
class QueryResult:
    answer: str
    sources: list[RagChunk]


@dataclass
class IngestResult:
    ingested_count: int
    chunk_ids: list[str]
