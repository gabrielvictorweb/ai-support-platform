import uuid
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase

from src.application.ports.output.agent_repository import IAgentRepository
from src.domain.entities.agent import Agent


class MongoAgentRepository(IAgentRepository):
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["agents"]

    async def create(self, agent: Agent) -> Agent:
        doc = {
            "_id": agent.id,
            "conversation_id": agent.conversation_id,
            "name": agent.name,
            "system_prompt": agent.system_prompt,
            "model": agent.model,
            "created_at": agent.created_at.isoformat(),
            "updated_at": agent.updated_at.isoformat(),
        }
        await self._col.insert_one(doc)
        return self._to_entity(doc)

    async def find_by_id(self, id: str) -> Agent | None:
        doc = await self._col.find_one({"_id": id})
        return self._to_entity(doc) if doc else None

    async def find_by_conversation_ids(
        self, conversation_ids: list[str]
    ) -> dict[str, list[Agent]]:
        result: dict[str, list[Agent]] = {cid: [] for cid in conversation_ids}
        async for doc in self._col.find({"conversation_id": {"$in": conversation_ids}}):
            cid = doc["conversation_id"]
            result[cid].append(self._to_entity(doc))
        return result

    async def find_by_conversation_id(self, conversation_id: str) -> list[Agent]:
        return [
            self._to_entity(doc)
            async for doc in self._col.find({"conversation_id": conversation_id})
        ]

    async def update(self, id: str, **fields: object) -> Agent | None:
        fields["updated_at"] = datetime.utcnow().isoformat()
        await self._col.update_one({"_id": id}, {"$set": fields})
        return await self.find_by_id(id)

    async def delete(self, id: str) -> bool:
        result = await self._col.delete_one({"_id": id})
        return result.deleted_count > 0

    def _to_entity(self, doc: dict) -> Agent:
        return Agent(
            id=doc["_id"],
            conversation_id=doc["conversation_id"],
            name=doc["name"],
            system_prompt=doc.get("system_prompt", ""),
            model=doc.get("model", "gpt-4o-mini"),
            created_at=datetime.fromisoformat(doc["created_at"]),
            updated_at=datetime.fromisoformat(doc["updated_at"]),
        )
