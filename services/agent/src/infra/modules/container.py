from dependency_injector import containers, providers
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from motor.motor_asyncio import AsyncIOMotorClient

from src.application.usecases.create_agent import CreateAgentUseCase
from src.application.usecases.delete_agent import DeleteAgentUseCase
from src.application.usecases.get_agent import GetAgentUseCase
from src.application.usecases.get_agents_by_conversation_ids import GetAgentsByConversationIdsUseCase
from src.application.usecases.ingest_documents import IngestDocumentsUseCase
from src.application.usecases.list_agents import ListAgentsUseCase
from src.application.usecases.query_agent import QueryAgentUseCase
from src.application.usecases.update_agent import UpdateAgentUseCase
from src.config import settings
from src.infra.langchain.conversation_memory import ConversationMemory
from src.infra.langchain.mongo_vector_store import MongoVectorStore
from src.infra.langchain.rag_pipeline import RagPipeline
from src.infra.redis.rag_cache import RagCache
from src.infra.repositories.mongo_agent_repository import MongoAgentRepository


class Container(containers.DeclarativeContainer):
    config = providers.Configuration()
    config.from_dict({
        "grpc_port": settings.grpc_port,
        "http_port": settings.http_port,
        "mongodb_url": settings.mongodb_url,
        "mongodb_db": settings.mongodb_db,
        "openai_api_key": settings.openai_api_key,
        "openai_embedding_model": settings.openai_embedding_model,
        "openai_chat_model": settings.openai_chat_model,
    })

    mongo_client = providers.Singleton(AsyncIOMotorClient, settings.mongodb_url)
    mongo_db = providers.Singleton(lambda client: client[settings.mongodb_db], client=mongo_client)

    embeddings = providers.Singleton(
        OpenAIEmbeddings,
        model=settings.openai_embedding_model,
        api_key=settings.openai_api_key,
    )
    llm = providers.Singleton(
        ChatOpenAI,
        model=settings.openai_chat_model,
        api_key=settings.openai_api_key,
    )

    rag_pipeline = providers.Singleton(RagPipeline, llm=llm)
    agent_repository = providers.Singleton(MongoAgentRepository, db=mongo_db)
    vector_store = providers.Singleton(
        MongoVectorStore,
        embeddings=embeddings,
        mongo_client=mongo_client,
        db_name=settings.mongodb_db,
    )
    rag_cache = providers.Singleton(RagCache)
    conversation_memory = providers.Singleton(ConversationMemory, llm=llm)

    get_agents_by_conversation_ids_uc = providers.Factory(
        GetAgentsByConversationIdsUseCase, repo=agent_repository
    )
    create_agent_uc = providers.Factory(CreateAgentUseCase, repo=agent_repository)
    get_agent_uc = providers.Factory(GetAgentUseCase, repo=agent_repository)
    list_agents_uc = providers.Factory(ListAgentsUseCase, repo=agent_repository)
    update_agent_uc = providers.Factory(UpdateAgentUseCase, repo=agent_repository)
    delete_agent_uc = providers.Factory(DeleteAgentUseCase, repo=agent_repository)
    ingest_documents_uc = providers.Factory(IngestDocumentsUseCase, vector_store=vector_store)
    query_agent_uc = providers.Factory(
        QueryAgentUseCase,
        repo=agent_repository,
        vector_store=vector_store,
        llm_gateway=rag_pipeline,
        rag_cache=rag_cache,
        conversation_memory=conversation_memory,
    )
