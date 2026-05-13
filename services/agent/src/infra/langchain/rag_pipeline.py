from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from src.application.ports.output.llm_gateway import ILlmGateway

RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "{system_prompt}\n\nContext:\n{context}"),
    ("placeholder", "{history}"),
    ("human", "{query}"),
])


class RagPipeline(ILlmGateway):
    def __init__(self, llm: object) -> None:
        self._chain = RAG_PROMPT | llm | StrOutputParser()

    async def generate(
        self,
        system_prompt: str,
        user_query: str,
        context_chunks: list[str],
        conversation_history: list[dict],
    ) -> str:
        history_messages = [
            ("human" if m["role"] == "user" else "ai", m["content"])
            for m in conversation_history
        ]
        return await self._chain.ainvoke({
            "system_prompt": system_prompt,
            "context": "\n\n---\n\n".join(context_chunks),
            "history": history_messages,
            "query": user_query,
        })
