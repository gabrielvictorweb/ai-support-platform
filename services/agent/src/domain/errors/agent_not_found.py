class AgentNotFoundError(Exception):
    def __init__(self, agent_id: str) -> None:
        super().__init__(f"Agent '{agent_id}' not found")
        self.agent_id = agent_id
