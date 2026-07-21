import { envVars } from "../../config/env";

export class EmbeddingService {
  private apiKey: string;
  private apiUrl: string = "https://api.openrouter.ai/v1";
  private embeddingModel: string;
  constructor() {
    this.apiKey = envVars.OPENROUTER_API_KEY || "";
    this.embeddingModel =
      envVars.OPENROUTER_EMBEDDING_MODEL ||
      "nvidia/llama-nemotron-embed-vl-1b-v2:free";

    // check if the api key is set
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }
  }

  async generateEmbedding(text: string) {
    try {
      const response = await fetch(`${this.apiUrl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text,
          model: this.embeddingModel,
        }),
      });
      if (!response.ok) {
        throw new Error(`Open Router Api Error ${response.status}`);
      }
      const data = await response.json();
      if (!data.data || data.data.length == 0) {
        throw new Error(`No Embedding Data Returned`);
      }
      return data.data[0].embedding;
    } catch (error) {
      console.log(error);
    }
  }
}
