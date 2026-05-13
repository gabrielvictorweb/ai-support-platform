from src.application.ports.output.vector_store import IVectorStore
from src.config import settings
from src.domain.entities.document import Document
from src.domain.entities.rag_chunk import RagChunk


class MongoVectorStore(IVectorStore):
    """
    Uses MongoDBAtlasVectorSearch when USE_LOCAL_VECTOR_SEARCH=false (production/Atlas).
    Falls back to brute-force cosine similarity for local development.

    Atlas requirement: vector index named 'vector_index' on collection 'agent_chunks',
    field 'embedding' (1536 dims for text-embedding-3-small).
    """

    def __init__(self, embeddings: object, mongo_client: object, db_name: str) -> None:
        self._embeddings = embeddings
        self._mongo_client = mongo_client
        self._db_name = db_name

    async def add_documents(self, agent_id: str, documents: list[Document]) -> list[str]:
        if settings.use_local_vector_search:
            return await self._add_documents_local(agent_id, documents)
        return await self._add_documents_atlas(agent_id, documents)

    async def similarity_search(
        self, agent_id: str, query: str, top_k: int = 4
    ) -> list[RagChunk]:
        if settings.use_local_vector_search:
            return await self._similarity_search_local(agent_id, query, top_k)
        return await self._similarity_search_atlas(agent_id, query, top_k)

    async def _add_documents_local(self, agent_id: str, documents: list[Document]) -> list[str]:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        import uuid

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        col = self._mongo_client[self._db_name]["agent_chunks"]
        ids: list[str] = []

        for doc in documents:
            chunks = splitter.split_text(doc.content)
            texts = chunks if chunks else [doc.content]
            embeddings = await self._embeddings.aembed_documents(texts)
            for text, embedding in zip(texts, embeddings):
                chunk_id = str(uuid.uuid4())
                await col.insert_one({
                    "_id": chunk_id,
                    "agent_id": agent_id,
                    "content": text,
                    "source": doc.source,
                    "metadata": doc.metadata,
                    "embedding": embedding,
                })
                ids.append(chunk_id)

        return ids

    async def _similarity_search_local(
        self, agent_id: str, query: str, top_k: int
    ) -> list[RagChunk]:
        import numpy as np

        col = self._mongo_client[self._db_name]["agent_chunks"]
        query_embedding = await self._embeddings.aembed_query(query)
        query_vec = np.array(query_embedding)

        chunks: list[tuple[float, dict]] = []
        async for doc in col.find({"agent_id": agent_id}):
            doc_vec = np.array(doc["embedding"])
            score = float(np.dot(query_vec, doc_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(doc_vec) + 1e-9))
            chunks.append((score, doc))

        chunks.sort(key=lambda x: x[0], reverse=True)
        return [
            RagChunk(
                chunk_id=str(doc["_id"]),
                content=doc["content"],
                score=score,
                source=doc.get("source", ""),
            )
            for score, doc in chunks[:top_k]
        ]

    async def _add_documents_atlas(self, agent_id: str, documents: list[Document]) -> list[str]:
        from langchain_mongodb import MongoDBAtlasVectorSearch
        from langchain_core.documents import Document as LCDocument
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        store = MongoDBAtlasVectorSearch(
            collection=self._mongo_client[self._db_name]["agent_chunks"],
            embedding=self._embeddings,
            index_name="vector_index",
            text_key="content",
            embedding_key="embedding",
        )
        lc_docs: list[LCDocument] = []
        for doc in documents:
            chunks = splitter.split_text(doc.content)
            for chunk in chunks or [doc.content]:
                lc_docs.append(LCDocument(
                    page_content=chunk,
                    metadata={"agent_id": agent_id, "source": doc.source, **doc.metadata},
                ))
        return await store.aadd_documents(lc_docs)

    async def _similarity_search_atlas(
        self, agent_id: str, query: str, top_k: int
    ) -> list[RagChunk]:
        from langchain_mongodb import MongoDBAtlasVectorSearch

        store = MongoDBAtlasVectorSearch(
            collection=self._mongo_client[self._db_name]["agent_chunks"],
            embedding=self._embeddings,
            index_name="vector_index",
            text_key="content",
            embedding_key="embedding",
        )
        results = await store.asimilarity_search_with_score(
            query,
            k=top_k,
            pre_filter={"agent_id": {"$eq": agent_id}},
        )
        return [
            RagChunk(
                chunk_id=str(doc.metadata.get("_id", "")),
                content=doc.page_content,
                score=float(score),
                source=doc.metadata.get("source", ""),
            )
            for doc, score in results
        ]
