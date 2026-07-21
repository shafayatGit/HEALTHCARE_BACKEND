import { envVars } from "../../config/env";

export class EmbeddingService {
    private apiKey: string;
    private apiUrl: string = "https://api.openrouter.ai/v1";
    private embeddingModel: string;
     constructor() {
        this.apiKey = envVars.OPENROUTER_API_KEY || "";
        this.embeddingModel = envVars.OPENROUTER_EMBEDDING_MODEL || "nvidia/llama-nemotron-embed-vl-1b-v2:free";

        // check if the api key is set
        if(!this.apiKey) {
            throw new Error("OPENROUTER_API_KEY is not set");
        }
    }

    async generateEmbedding(text:string){
        try {
            const response = await 
        } catch (error) {
            console.log(error)
        }
    }

   
}