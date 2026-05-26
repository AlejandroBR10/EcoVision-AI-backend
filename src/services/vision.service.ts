import axios from "axios";
import { azureConfig } from "../config/azure.config";

export async function analyzeImageWithAzure(imageUrl: string): Promise<string[]> {
  const { key, endpoint } = azureConfig.vision;

  const url = `${endpoint}/vision/v3.2/analyze?visualFeatures=Tags`;

  const response = await axios.post(
    url,
    { url: imageUrl },
    {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/json",
      },
    }
  );

  const tags: string[] = response.data.tags
    .filter((tag: any) => tag.confidence > 0.7)
    .map((tag: any) => tag.name);

  return tags;
}