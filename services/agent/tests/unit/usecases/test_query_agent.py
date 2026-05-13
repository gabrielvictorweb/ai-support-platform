import pytest
from unittest.mock import AsyncMock, MagicMock

from src.application.usecases.query_agent import QueryAgentUseCase
from src.application.dtos.rag_dto import QueryResult
from src.domain.errors.agent_not_found import AgentNotFoundError


@pytest.fixture
def mock_repo():
    return AsyncMock()


@pytest.fixture
def mock_vector_store():
    return AsyncMock()


@pytest.fixture
def mock_llm_gateway():
    return AsyncMock()


@pytest.fixture
def mock_rag_cache():
    cache = AsyncMock()
    cache.get.return_value = None
    return cache


@pytest.fixture
def mock_conversation_memory():
    memory = AsyncMock()
    memory.load.return_value = []
    return memory


@pytest.fixture
def use_case(mock_repo, mock_vector_store, mock_llm_gateway, mock_rag_cache, mock_conversation_memory):
    return QueryAgentUseCase(
        repo=mock_repo,
        vector_store=mock_vector_store,
        llm_gateway=mock_llm_gateway,
        rag_cache=mock_rag_cache,
        conversation_memory=mock_conversation_memory,
    )


async def test_returns_cached_result_without_calling_llm(
    use_case, mock_rag_cache, mock_llm_gateway, mock_repo, sample_chunks
):
    mock_rag_cache.get.return_value = {"answer": "cached answer", "sources": sample_chunks}

    result = await use_case.execute("agent-1", "conv-1", "test query")

    assert result.answer == "cached answer"
    mock_llm_gateway.generate.assert_not_called()
    mock_repo.find_by_id.assert_not_called()


async def test_raises_when_agent_not_found(use_case, mock_repo):
    mock_repo.find_by_id.return_value = None

    with pytest.raises(AgentNotFoundError) as exc_info:
        await use_case.execute("missing-agent", "conv-1", "test query")

    assert exc_info.value.agent_id == "missing-agent"


async def test_full_pipeline_on_cache_miss(
    use_case, mock_repo, mock_vector_store, mock_llm_gateway,
    mock_rag_cache, mock_conversation_memory, sample_agent, sample_chunks
):
    mock_repo.find_by_id.return_value = sample_agent
    mock_vector_store.similarity_search.return_value = sample_chunks
    mock_llm_gateway.generate.return_value = "Generated answer"

    result = await use_case.execute("agent-1", "conv-1", "What is X?", top_k=2)

    assert isinstance(result, QueryResult)
    assert result.answer == "Generated answer"
    assert len(result.sources) == 2

    mock_vector_store.similarity_search.assert_called_once_with("agent-1", "What is X?", 2)
    mock_llm_gateway.generate.assert_called_once()
    mock_conversation_memory.save.assert_called_once_with("conv-1", "What is X?", "Generated answer")
    mock_rag_cache.set.assert_called_once()


async def test_passes_conversation_history_to_llm(
    use_case, mock_repo, mock_vector_store, mock_llm_gateway,
    mock_rag_cache, mock_conversation_memory, sample_agent, sample_chunks
):
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there"},
    ]
    mock_conversation_memory.load.return_value = history
    mock_repo.find_by_id.return_value = sample_agent
    mock_vector_store.similarity_search.return_value = sample_chunks
    mock_llm_gateway.generate.return_value = "Follow-up answer"

    await use_case.execute("agent-1", "conv-1", "follow-up question")

    call_kwargs = mock_llm_gateway.generate.call_args.kwargs
    assert call_kwargs["conversation_history"] == history
