const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('No GEMINI_API_KEY found');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function translateBatch(batch, batchIndex) {
  console.log(`Translating batch ${batchIndex} (${batch.length} items)...`);
  const prompt = `You are an expert Marathi translator for a Maharashtra conversation learning app ("Smart English Sathi") featuring student Riya and Teacher Anjali.
Translate the following Hindi sentences/terms into natural, grammatically correct, polite Marathi (मराठी).

Return ONLY valid JSON in the form of a key-value object where each key is the exact original Hindi string and the value is the Marathi translation:
{
  "मूल हिंदी वाक्य": "अचूक मराठी भाषांतर"
}

Hindi strings to translate:
${JSON.stringify(batch, null, 2)}`;

  let attempts = 0;
  while (attempts < 5) {
    try {
      attempts++;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text;
      const parsed = JSON.parse(text);
      return parsed;
    } catch (err) {
      console.warn(`Attempt ${attempts} failed for batch ${batchIndex}: ${err.message || err.status}`);
      if (attempts >= 5) throw err;
      const delay = Math.min(1000 * Math.pow(2, attempts), 8000);
      console.log(`Waiting ${delay}ms before retrying batch ${batchIndex}...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function run() {
  const allHindi = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted_hindi.json'), 'utf8'));
  const uniqueHindi = [...new Set(allHindi)];
  console.log(`Total unique Hindi strings: ${uniqueHindi.length}`);

  const translationsPath = path.join(__dirname, 'marathi_translations.json');
  let translations = {};
  if (fs.existsSync(translationsPath)) {
    try {
      translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
    } catch {
      translations = {};
    }
  }
  console.log(`Already translated: ${Object.keys(translations).length}`);

  const remaining = uniqueHindi.filter((h) => !translations[h]);
  console.log(`Remaining to translate: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log('All items already translated!');
    return;
  }

  const BATCH_SIZE = 20;
  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);
    const result = await translateBatch(batch, Math.floor(i / BATCH_SIZE) + 1);
    Object.assign(translations, result);
    fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf8');
    console.log(`Saved progress: ${Object.keys(translations).length}/${uniqueHindi.length}`);
    // Pause to avoid burst rate limits
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  console.log(`Successfully finished all translations! Total: ${Object.keys(translations).length}`);
}

run().catch(console.error);
