import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyze.routes";
import { initializeBlobClient } from "./services/blob.service";

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Inicializar cliente de Azure Blob Storage
try {
  initializeBlobClient();
} catch (error: any) {
  console.error("❌ Error al inicializar Blob Storage:", error.message);
  console.error("Asegúrate de que .env está configurado correctamente");
  process.exit(1);
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rutas
app.use("/", analyzeRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "EcoVision backend corriendo",
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`
🌱 EcoVision Backend
✅ Servidor corriendo en puerto ${PORT}
✅ Azure Blob Storage inicializado
🔗 http://localhost:${PORT}
  `);
});
