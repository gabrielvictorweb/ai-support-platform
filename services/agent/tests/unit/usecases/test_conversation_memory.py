import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from src.infra.langchain.conversation_memory import ConversationMemory


def _make_history(n_turns: int) -> list[dict]:
    history = []
    for i in range(n_turns):
        history.append({"role": "user", "content": f"user msg {i}"})
        history.append({"role": "assistant", "content": f"assistant msg {i}"})
    return history


@pytest.fixture
def mock_llm():
    llm = MagicMock()
    llm.__or__ = MagicMock(return_value=llm)
    return llm


@pytest.fixture
def mock_redis():
    redis = AsyncMock()
    redis.get.return_value = None
    return redis


@pytest.fixture
def memory_without_llm():
    return ConversationMemory(llm=None)


@pytest.fixture
def memory_with_llm(mock_llm):
    with patch("src.infra.langchain.conversation_memory.ChatPromptTemplate") as mock_prompt, \
         patch("src.infra.langchain.conversation_memory.StrOutputParser"):
        chain = AsyncMock()
        chain.ainvoke = AsyncMock(return_value="Summary: user reported issue #123.")
        mock_prompt.from_messages.return_value.__or__ = MagicMock(return_value=chain)
        mem = ConversationMemory.__new__(ConversationMemory)
        mem._llm = mock_llm
        mem._summarize_chain = chain
        return mem


async def test_save_appends_messages(memory_without_llm, mock_redis):
    with patch("src.infra.langchain.conversation_memory.get_redis_client", return_value=mock_redis):
        await memory_without_llm.save("conv-1", "hello", "hi there")

    saved = json.loads(mock_redis.set.call_args[0][1])
    assert saved[-2] == {"role": "user", "content": "hello"}
    assert saved[-1] == {"role": "assistant", "content": "hi there"}


async def test_sliding_window_applied_without_llm(memory_without_llm, mock_redis):
    existing = _make_history(20)
    mock_redis.get.return_value = json.dumps(existing)

    with patch("src.infra.langchain.conversation_memory.get_redis_client", return_value=mock_redis):
        await memory_without_llm.save("conv-1", "new user msg", "new assistant msg")

    saved = json.loads(mock_redis.set.call_args[0][1])
    assert len(saved) == 40
    assert saved[-1]["content"] == "new assistant msg"


async def test_summarization_triggered_at_threshold(memory_with_llm, mock_redis):
    existing = _make_history(20)
    mock_redis.get.return_value = json.dumps(existing)

    with patch("src.infra.langchain.conversation_memory.get_redis_client", return_value=mock_redis), \
         patch("src.infra.langchain.conversation_memory.settings") as mock_settings:
        mock_settings.memory_summarize_after_turns = 20
        mock_settings.memory_turns_to_summarize = 10
        mock_settings.conversation_memory_ttl_seconds = 3600

        await memory_with_llm.save("conv-1", "turn 21 user", "turn 21 assistant")

    saved = json.loads(mock_redis.set.call_args[0][1])

    assert saved[0]["role"] == "system"
    assert "Summary" in saved[0]["content"]
    assert len(saved) < 42


async def test_summarization_failure_falls_back_to_sliding_window(mock_redis):
    failing_chain = AsyncMock()
    failing_chain.ainvoke = AsyncMock(side_effect=Exception("LLM timeout"))

    mem = ConversationMemory.__new__(ConversationMemory)
    mem._llm = MagicMock()
    mem._summarize_chain = failing_chain

    existing = _make_history(20)
    mock_redis.get.return_value = json.dumps(existing)

    with patch("src.infra.langchain.conversation_memory.get_redis_client", return_value=mock_redis), \
         patch("src.infra.langchain.conversation_memory.settings") as mock_settings:
        mock_settings.memory_summarize_after_turns = 20
        mock_settings.memory_turns_to_summarize = 10
        mock_settings.conversation_memory_ttl_seconds = 3600

        await mem.save("conv-1", "new msg", "new answer")

    saved = json.loads(mock_redis.set.call_args[0][1])
    assert len(saved) == 40
    assert saved[0]["role"] != "system"
