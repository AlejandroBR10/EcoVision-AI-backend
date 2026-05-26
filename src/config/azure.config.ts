export const azureConfig = {
  vision: {
    key: process.env.AZURE_VISION_KEY || "",
    endpoint: process.env.AZURE_VISION_ENDPOINT || "",
  },
  storage: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || "",
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || "",
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || "",
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads",
    baseUrl: process.env.AZURE_STORAGE_BASE_URL || "",
  },
};
