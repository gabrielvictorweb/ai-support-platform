from abc import ABC, abstractmethod


class ILlmGateway(ABC):
    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_query: str,
        context_chunks: list[str],
        conversation_history: list[dict],
    ) -> str: ...
