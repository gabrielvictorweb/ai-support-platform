import pytest
from datetime import datetime

from src.domain.entities.agent import Agent
from src.domain.entities.rag_chunk import RagChunk


@pytest.fixture
def sample_agent() -> Agent:
    return Agent(
        id="agent-1",
        conversation_id="conv-1",
        name="SupportBot",
        system_prompt="You are a helpful support agent.",
        model="gpt-4o-mini",
        created_at=datetime(2026, 1, 1),
        updated_at=datetime(2026, 1, 1),
    )


@pytest.fixture
def sample_chunks() -> list[RagChunk]:
    return [
        RagChunk(chunk_id="c1", content="Relevant context A", score=0.92, source="doc1.txt"),
        RagChunk(chunk_id="c2", content="Relevant context B", score=0.85, source="doc2.txt"),
    ]
