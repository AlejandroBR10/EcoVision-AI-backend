import { Router, Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import { azureConfig } from "../config/azure.config";
import { classifyWaste } from "../data/knowledge";
import {
  uploadFile,
  generateFileName,
  getPublicUrl,
} from "../services/blob.service";

const router = Router();

// Configurar multer para guardar en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Solo se permiten imágenes"));
    } else {
      cb(null, true);
    }
  },
});

/**
 * POST /analyze
 * Analizar una imagen: subir a Azure → Azure Vision → Clasificar
 */
router.post(
  "/analyze",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No se recibió ninguna imagen" });
      }

      console.log(
        `📸 Analizando imagen: ${file.originalname} (${file.size} bytes)`,
      );

      // ✅ PASO 1: Subir imagen a Azure Blob Storage
      const fileName = generateFileName(file.originalname);
      const imageUrl = await uploadFile(fileName, file.buffer, file.mimetype);
      console.log(`✅ Imagen subida a Azure: ${imageUrl}`);

      // ✅ PASO 2: Enviar URL a Azure Vision API para análisis
      const { key, endpoint } = azureConfig.vision;

      if (!key || !endpoint) {
        return res.status(500).json({
          error: "Credenciales de Azure Vision no configuradas",
        });
      }

      const visionUrl = `${endpoint}/vision/v3.2/analyze?visualFeatures=Tags`;

      console.log(`🔍 Enviando a Azure Vision API...`);
      const visionResponse = await axios.post(
        visionUrl,
        { url: imageUrl }, // Usar URL pública del blob
        {
          headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/json",
          },
        },
      );

      // ✅ PASO 3: Procesar tags de Azure Vision
      const tags: string[] = visionResponse.data.tags
        .filter((tag: any) => tag.confidence > 0.7)
        .map((tag: any) => tag.name);

      console.log(`📊 Tags detectados:`, tags);

      // ✅ PASO 4: Clasificar residuo con base de datos local
      const classification = classifyWaste(tags);

      // ✅ PASO 5: Retornar resultado con URL de imagen
      const result = {
        ...classification,
        imageUrl: imageUrl, // URL pública para mostrar en frontend
        fileName: fileName, // Nombre del archivo en Azure
        analysisDate: new Date().toISOString(),
      };

      return res.json(result);
    } catch (error: any) {
      console.error("❌ Error al analizar imagen:", error.message);
      return res.status(500).json({
        error: "Error al procesar la imagen",
        details: error.message,
      });
    }
  },
);

/**
 * GET /health
 * Health check del servidor
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "EcoVision backend corriendo",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /image/:fileName
 * Obtener información pública de una imagen almacenada
 */
router.get(
  "/image/:fileName",
  (req: Request<{ fileName: string }>, res: Response) => {
    const { fileName } = req.params;
    const imageUrl = getPublicUrl(fileName);

    res.json({
      fileName,
      url: imageUrl,
      timestamp: new Date().toISOString(),
    });
  },
);

export default router;
