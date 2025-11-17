import { GoogleGenAI } from "@google/genai";
import { TableRow } from "../state/types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const extractDataFromImage = async (
  image: { mimeType: string; data: string }
): Promise<TableRow[]> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    };

    const prompt = `
      You are an expert data extraction AI. Your primary function is to analyze an image of a document and convert it into structured JSON data.

      Analyze the image and first classify the document into one of the following types: 'table', 'receipt', 'structured_list', 'note', or 'other'.

      Then, extract the data according to the rules for that type and return it as a JSON array of objects.

      **Extraction Rules:**

      1.  **'table'**:
          *   Identify the header row to use as JSON keys. Be robust to multi-line headers.
          *   Each subsequent row in the table should be a JSON object.
          *   Example: \`[{"ItemID": "A1", "Product": "Widget"}, {"ItemID": "A2", "Product": "Gadget"}]\`

      2.  **'receipt'**:
          *   Extract key-value pairs. Prioritize: 'merchant_name', 'total_amount', 'transaction_date', 'transaction_time'.
          *   Also extract line items into an 'items' array if possible, with 'description', 'quantity', and 'price' for each.
          *   Return a single object in an array. If a value isn't found, use \`null\`.
          *   Example: \`[{"merchant_name": "Corner Store", "total_amount": "15.75", "transaction_date": "2023-11-15", "items": [{"description": "Milk", "price": "3.50"}]}]\`

      3.  **'structured_list'**: (For documents with repeating blocks of information, not in a strict grid table)
          *   Identify the distinct, repeating groups of text.
          *   For each group, extract the main data points into a JSON object. Use consistent keys across all objects.
          *   Common keys might be 'title'/'name', 'description', 'status', 'category'. Infer the keys from the content.
          *   Example: \`[{"description": "Solar Panels (90k Units)", "category": "Solar Energy", "status": "Unused"}, {"description": "KACO Inverters (296 Items)", "category": "Solar Energy", "status": "Unused"}]\`

      4.  **'note'**: (For handwritten or typed notes)
          *   Transcribe the full text content.
          *   Identify a 'title' and 'date' if they are present.
          *   Return a single object in an array with 'title', 'date', and 'content' keys.
          *   Example: \`[{"title": "Project Ideas", "date": null, "content": "Explore new UI components..."}]\`

      5.  **'other'**:
          *   If the document doesn't fit the above categories, perform a general OCR.
          *   Return a single object in an array with an 'extracted_text' key containing all the text found.
          *   Example: \`[{"extracted_text": "Annual Report..."}]\`

      **IMPORTANT INSTRUCTIONS:**
      *   **ALWAYS** return a valid JSON array.
      *   If no usable data can be extracted from the image, return an empty array \`[]\`.
      *   Do not invent data. If a value is missing, represent it as \`null\`.
      *   Clean the extracted text: trim whitespace, correct obvious OCR errors if confident.
      *   Ignore irrelevant background text or image watermarks.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    
    // The Gemini API may wrap the JSON in markdown backticks. This removes them.
    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const parsedData = JSON.parse(cleanedJsonText);
    
    if (!Array.isArray(parsedData)) {
        if (typeof parsedData === 'object' && parsedData !== null) {
            return [parsedData];
        }
        throw new Error("API did not return a valid JSON array or object.");
    }
    
    // Filter out any completely empty objects that might be returned.
    return parsedData.filter(row => Object.keys(row).length > 0);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to extract data from image. The API call failed.");
  }
};