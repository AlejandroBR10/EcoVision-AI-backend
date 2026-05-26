import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

// Configuración
const connectionString =
  process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";
const baseUrl = process.env.AZURE_STORAGE_BASE_URL || "";

let blobServiceClient: BlobServiceClient;
let containerClient: ContainerClient;

/**
 * Inicializar cliente de Azure Blob Storage
 */
export function initializeBlobClient() {
  if (!connectionString) {
    throw new Error(
      "AZURE_STORAGE_CONNECTION_STRING no está configurada en .env"
    );
  }

  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient(containerName);

  console.log(`✅ Cliente de Blob Storage inicializado para container: ${containerName}`);
}

/**
 * Obtener cliente del contenedor
 */
export function getContainerClient(): ContainerClient {
  if (!containerClient) {
    initializeBlobClient();
  }
  return containerClient;
}

/**
 * Subir archivo a Azure Blob Storage
 * @param fileName Nombre del archivo
 * @param fileBuffer Buffer del archivo
 * @param contentType Tipo de contenido (ej: image/jpeg)
 * @returns URL pública del archivo
 */
export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string = "application/octet-stream"
): Promise<string> {
  try {
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Subir el archivo
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    // Generar URL pública
    const publicUrl = `${baseUrl}/${fileName}`;

    console.log(`✅ Archivo subido exitosamente: ${publicUrl}`);
    return publicUrl;
  } catch (error: any) {
    console.error("❌ Error al subir archivo:", error.message);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
}

/**
 * Descargar archivo desde Azure Blob Storage
 * @param fileName Nombre del archivo
 * @returns Buffer del archivo
 */
export async function downloadFile(fileName: string): Promise<Buffer> {
  try {
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Verificar si el archivo existe
    const exists = await blockBlobClient.exists();
    if (!exists) {
      throw new Error(`Archivo no encontrado: ${fileName}`);
    }

    // Descargar el archivo
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const fileBuffer = await streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody!
    );

    console.log(`✅ Archivo descargado: ${fileName}`);
    return fileBuffer;
  } catch (error: any) {
    console.error("❌ Error al descargar archivo:", error.message);
    throw new Error(`Error al descargar archivo: ${error.message}`);
  }
}

/**
 * Eliminar archivo de Azure Blob Storage
 * @param fileName Nombre del archivo
 */
export async function deleteFile(fileName: string): Promise<void> {
  try {
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.delete();

    console.log(`✅ Archivo eliminado: ${fileName}`);
  } catch (error: any) {
    console.error("❌ Error al eliminar archivo:", error.message);
    throw new Error(`Error al eliminar archivo: ${error.message}`);
  }
}

/**
 * Listar archivos en el contenedor
 * @returns Array de nombres de archivos
 */
export async function listFiles(): Promise<string[]> {
  try {
    const containerClient = getContainerClient();
    const fileNames: string[] = [];

    for await (const blob of containerClient.listBlobsFlat()) {
      fileNames.push(blob.name);
    }

    console.log(`✅ Se encontraron ${fileNames.length} archivos`);
    return fileNames;
  } catch (error: any) {
    console.error("❌ Error al listar archivos:", error.message);
    throw new Error(`Error al listar archivos: ${error.message}`);
  }
}

/**
 * Obtener URL pública de un archivo
 * @param fileName Nombre del archivo
 * @returns URL pública
 */
export function getPublicUrl(fileName: string): string {
  return `${baseUrl}/${fileName}`;
}

/**
 * Generar nombre único para archivo
 * @param originalName Nombre original del archivo
 * @returns Nombre único con timestamp
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop() || "bin";
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Convertir stream a buffer (helper)
 */
async function streamToBuffer(
  readableStream: NodeJS.ReadableStream
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data: Buffer) => {
      chunks.push(data);
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}
