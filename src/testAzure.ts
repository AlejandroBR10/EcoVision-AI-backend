import dotenv from "dotenv";
dotenv.config();

import {
  initializeBlobClient,
  uploadFile,
  listFiles,
  getPublicUrl,
  generateFileName,
} from "./services/blob.service";
import fs from "fs";
import path from "path";

/**
 * Script de prueba para Azure Blob Storage
 * Ejecutar: npm run test:azure
 */
async function runTests() {
  console.log("🧪 Iniciando pruebas de Azure Blob Storage...\n");

  try {
    // TEST 1: Inicializar cliente
    console.log("1️⃣  Inicializando cliente de Azure Blob Storage...");
    initializeBlobClient();
    console.log("✅ Cliente inicializado correctamente\n");

    // TEST 2: Generar nombre único
    console.log("2️⃣  Generando nombre único para archivo...");
    const uniqueName = generateFileName("test.jpg");
    console.log(`✅ Nombre generado: ${uniqueName}\n`);

    // TEST 3: Crear archivo de prueba
    console.log("3️⃣  Creando archivo de prueba...");
    const testFileName = "test-upload.txt";
    const testContent = Buffer.from(
      `Prueba de Azure Blob Storage\nFecha: ${new Date().toISOString()}`
    );
    console.log(`✅ Archivo de prueba creado (${testContent.length} bytes)\n`);

    // TEST 4: Subir archivo
    console.log("4️⃣  Subiendo archivo a Azure Blob Storage...");
    const uploadedUrl = await uploadFile(
      uniqueName,
      testContent,
      "text/plain"
    );
    console.log(`✅ Archivo subido exitosamente`);
    console.log(`📍 URL: ${uploadedUrl}\n`);

    // TEST 5: Obtener URL pública
    console.log("5️⃣  Obteniendo URL pública...");
    const publicUrl = getPublicUrl(uniqueName);
    console.log(`✅ URL pública: ${publicUrl}\n`);

    // TEST 6: Listar archivos
    console.log("6️⃣  Listando archivos en el contenedor...");
    const files = await listFiles();
    console.log(`✅ Se encontraron ${files.length} archivo(s)`);
    if (files.length > 0) {
      console.log("📋 Primeros archivos:");
      files.slice(0, 5).forEach((file) => console.log(`   - ${file}`));
    }
    console.log("");

    // TEST 7: Prueba con imagen simulada
    console.log("7️⃣  Prueba de subida de imagen simulada...");
    const imageName = generateFileName("test-image.jpg");
    // Crear un buffer simulado (1KB)
    const fakeImageBuffer = Buffer.alloc(1024, "image data");
    const imageUrl = await uploadFile(
      imageName,
      fakeImageBuffer,
      "image/jpeg"
    );
    console.log(`✅ Imagen simulada subida`);
    console.log(`📍 URL: ${imageUrl}\n`);

    // Resumen
    console.log("════════════════════════════════════════════════");
    console.log("🎉 ¡TODAS LAS PRUEBAS EXITOSAS!");
    console.log("════════════════════════════════════════════════");
    console.log("\n📊 Resumen:");
    console.log(`✅ Cliente de Blob Storage funciona correctamente`);
    console.log(`✅ Conexión a Azure establecida`);
    console.log(`✅ Upload de archivos funciona`);
    console.log(`✅ URLs públicas generadas correctamente`);
    console.log(`✅ Listado de archivos funciona`);
    console.log("\n🚀 El backend está listo para procesar imágenes!\n");
  } catch (error: any) {
    console.error("❌ Error durante las pruebas:");
    console.error(error.message);
    console.error("\n⚠️  Verifica que:");
    console.error("1. El archivo .env existe en backend/");
    console.error("2. Las credenciales de Azure son correctas");
    console.error("3. El container 'uploads' existe en Azure");
    console.error("4. Tienes conexión a internet");
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests();
