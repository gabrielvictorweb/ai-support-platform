from src.domain.entities.rag_chunk import RagChunk
from src.presentation.grpc.generated import agents_pb2


class RagPresenter:
    @staticmethod
    def chunk_to_proto(chunk: RagChunk) -> agents_pb2.RetrievedChunk:
        return agents_pb2.RetrievedChunk(
            chunk_id=chunk.chunk_id,
            content=chunk.content,
            score=chunk.score,
            source=chunk.source,
        )
