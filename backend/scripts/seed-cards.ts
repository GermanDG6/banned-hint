import * as fs from 'fs';
import * as path from 'path';
import mongoose, { connect, disconnect } from 'mongoose';

/**
 * Seed script para cargar cartas desde CSV a MongoDB
 * Uso: ts-node -r tsconfig-paths/register scripts/seed-cards.ts
 */

interface CardRecord {
  word: string;
  bannedWords: string[];
}

/**
 * Parsea el campo bannedWords que viene en formato:
 * "['palabra1', 'palabra2', 'palabra3', 'palabra4']"
 */
function parseBannedWords(bannedWordsStr: string): string[] {
  try {
    // Reemplazar comillas simples por dobles para JSON válido
    const jsonStr = bannedWordsStr.trim().replace(/'/g, '"');

    // Parsear como JSON
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed)) {
      // Limpiar espacios en blanco de cada palabra
      return parsed.map((word: string) => (word as string).trim());
    }
    return [];
  } catch (error) {
    console.error(`Error parseando bannedWords: "${bannedWordsStr}"`, error);
    return [];
  }
}

/**
 * Lee el CSV y retorna array de registros de cartas
 */
function readCardsFromCsv(filePath: string): CardRecord[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const records: CardRecord[] = [];

  // Saltar la línea de cabecera (línea 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Saltar líneas vacías
    if (!line) continue;

    // Parse CSV simple: word,bannedWords
    // El campo bannedWords puede contener comas dentro de las comillas
    const match = line.match(/^([^,]+),"(.+)"$/);

    if (!match || match.length < 3) {
      console.warn(`Saltando línea inválida ${i + 1}: ${line}`);
      continue;
    }

    const word = match[1].trim();
    const bannedWordsStr = match[2].trim();

    if (!word) {
      console.warn(`Saltando línea ${i + 1}: palabra vacía`);
      continue;
    }

    const bannedWords = parseBannedWords(bannedWordsStr);

    if (bannedWords.length === 0) {
      console.warn(`Saltando línea ${i + 1}: bannedWords vacío o inválido`);
      continue;
    }

    records.push({
      word,
      bannedWords,
    });
  }

  return records;
}

/**
 * Conecta a MongoDB e inserta las cartas
 */
async function seedDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/banned-hint';

  console.log(`🔗 Conectando a MongoDB: ${mongoUri}`);

  try {
    await connect(mongoUri);
    console.log('✅ Conexión a MongoDB establecida');

    // Acceder a la colección a través de la conexión de mongoose
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('No se pudo obtener la instancia de base de datos');
    }

    const cardsCollection = db.collection('cards');

    // Limpiar colección existente
    console.log('🧹 Limpiando colección de cartas...');
    await cardsCollection.deleteMany({});
    console.log('✅ Colección limpiada');

    // Leer CSV
    const csvPath = path.join(__dirname, 'data', 'cards.csv');
    console.log(`📖 Leyendo CSV desde: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      throw new Error(`Archivo CSV no encontrado: ${csvPath}`);
    }

    const cards = readCardsFromCsv(csvPath);
    console.log(`📋 Se leyeron ${cards.length} cartas del CSV`);

    if (cards.length === 0) {
      console.warn('⚠️  No hay cartas para insertar');
      await disconnect();
      process.exit(0);
    }

    // Insertar cartas
    console.log(`💾 Insertando ${cards.length} cartas en MongoDB...`);
    const result = await cardsCollection.insertMany(cards);
    console.log(`✅ ${result.insertedCount} cartas insertadas correctamente`);

    // Verificar
    const count = await cardsCollection.countDocuments();
    console.log(`📊 Total de cartas en la base de datos: ${count}`);

    await disconnect();
    console.log('✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    await disconnect();
    process.exit(1);
  }
}

// Ejecutar seed
seedDatabase();
