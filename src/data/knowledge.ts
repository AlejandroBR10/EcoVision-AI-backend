export const wasteKnowledge: Record<string, any> = {
  bottle: {
    object: "Botella de plastico",
    material: "PET #1",
    category: "Reciclable",
    container: "Azul",
    containerColor: "blue",
    degradation: "450 anos",
    recommendation: "Lavar antes de reciclar y retirar la tapa.",
  },
  can: {
    object: "Lata de aluminio",
    material: "Aluminio",
    category: "Reciclable",
    container: "Azul",
    containerColor: "blue",
    degradation: "80-100 anos",
    recommendation: "Enjuagar y aplastar antes de depositar.",
  },
  banana: {
    object: "Residuo organico",
    material: "Organico",
    category: "Organico",
    container: "Verde",
    containerColor: "green",
    degradation: "2-4 semanas",
    recommendation: "Depositar en composta o contenedor organico.",
  },
  battery: {
    object: "Bateria",
    material: "Materiales peligrosos",
    category: "Peligroso",
    container: "Especial",
    containerColor: "red",
    degradation: "100+ anos",
    recommendation: "Llevar a punto limpio o centro de acopio especial.",
  },
  paper: {
    object: "Papel",
    material: "Papel",
    category: "Reciclable",
    container: "Azul",
    containerColor: "blue",
    degradation: "2-6 semanas",
    recommendation: "Mantener seco y libre de grasa.",
  },
};

export function classifyWaste(tags: string[]): any {
  for (const tag of tags) {
    const match = wasteKnowledge[tag.toLowerCase()];
    if (match) return { ...match, confidence: 90 };
  }
  return {
    object: "Residuo no identificado",
    material: "Desconocido",
    category: "No reciclable",
    container: "Gris",
    containerColor: "gray",
    degradation: "Desconocido",
    confidence: 0,
    recommendation: "Llevar a centro de acopio para clasificacion manual.",
  };
}