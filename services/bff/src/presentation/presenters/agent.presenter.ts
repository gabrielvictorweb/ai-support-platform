import { AgentOutput } from '../../application/dtos';
import { AgentDto } from '../graphql/dto/agent.dto';

export class AgentPresenter {
  static toGraphql(agent: AgentOutput): AgentDto {
    return {
      id: agent.id,
      name: agent.name,
    };
  }
}
