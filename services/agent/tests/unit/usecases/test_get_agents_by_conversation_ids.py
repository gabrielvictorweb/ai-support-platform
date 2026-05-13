import pytest
from unittest.mock import AsyncMock

from src.application.usecases.get_agents_by_conversation_ids import GetAgentsByConversationIdsUseCase
from src.domain.entities.agent import Agent
from datetime import datetime


@pytest.fixture
def mock_repo():
    return AsyncMock()


@pytest.fixture
def use_case(mock_repo):
    return GetAgentsByConversationIdsUseCase(repo=mock_repo)


async def test_returns_agents_grouped_by_conversation_id(use_case, mock_repo, sample_agent):
    agent2 = Agent(
        id="agent-2",
        conversation_id="conv-2",
        name="HelperBot",
        system_prompt="",
        model="gpt-4o-mini",
        created_at=datetime(2026, 1, 1),
        updated_at=datetime(2026, 1, 1),
    )
    mock_repo.find_by_conversation_ids.return_value = {
        "conv-1": [sample_agent],
        "conv-2": [agent2],
    }

    result = await use_case.execute(["conv-1", "conv-2"])

    assert len(result["conv-1"]) == 1
    assert result["conv-1"][0].id == "agent-1"
    assert result["conv-1"][0].name == "SupportBot"
    assert len(result["conv-2"]) == 1
    assert result["conv-2"][0].id == "agent-2"


async def test_returns_empty_list_for_conversation_with_no_agents(use_case, mock_repo):
    mock_repo.find_by_conversation_ids.return_value = {"conv-99": []}

    result = await use_case.execute(["conv-99"])

    assert result["conv-99"] == []


async def test_calls_repo_with_correct_ids(use_case, mock_repo):
    mock_repo.find_by_conversation_ids.return_value = {}

    await use_case.execute(["conv-1", "conv-2", "conv-3"])

    mock_repo.find_by_conversation_ids.assert_called_once_with(["conv-1", "conv-2", "conv-3"])
