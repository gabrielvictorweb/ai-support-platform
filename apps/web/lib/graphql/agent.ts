import { gql } from "@apollo/client";

export interface AgentSource {
  content: string;
  source: string;
  score: number;
}

export interface AgentAnswer {
  answer: string;
  sources: AgentSource[];
}

export const ASK_AGENT_MUTATION = gql`
  mutation AskAgent($query: String!) {
    askAgent(query: $query) {
      answer
      sources {
        content
        source
        score
      }
    }
  }
`;
