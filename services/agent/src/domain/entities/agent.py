from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Agent:
    id: str
    conversation_id: str
    name: str
    system_prompt: str
    model: str
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
