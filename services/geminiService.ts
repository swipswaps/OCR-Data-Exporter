import { GoogleGenAI } from "@google/genai";
import { TableRow } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const extractTableDataFromImages = async (
  images: { mimeType: string; data: string }[]
): Promise<TableRow[]> => {
  try {
    const imageParts = images.map(image => ({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    }));

    const prompt = `
      You are a powerful, multi-purpose OCR and data extraction engine. Your task is to analyze an image and intelligently extract structured information.

      First, determine the type of document in the image. It could be one of: 'receipt', 'table', 'handwritten_note', or 'other'.

      Based on the document type, extract the data and format it as a JSON array of objects.

      1.  **If the document is a 'table'**:
          *   Use the first row as column headers.
          *   Each subsequent row should be an object in the array.
          *   Example: [{"ID": "1", "Name": "Product A"}, {"ID": "2", "Name": "Product B"}]

      2.  **If the document is a 'receipt'**:
          *   Extract key information: Merchant Name, Total Amount, Date, and individual line items if available.
          *   Structure the output as a single-object array, with keys for the extracted fields.
          *   Strive to find at least 'merchant', 'total', and 'date'. If a field is not present, use null for its value.
          *   Example: [{"merchant": "SuperMart", "date": "2023-10-27", "total": "25.50", "items": "Milk, Bread"}]

      3.  **If the document is a 'handwritten_note'**:
          *   Transcribe the text of the note.
          *   Identify a potential title and date if possible.
          *   Structure the output as a single-object array.
          *   Example: [{"title": "Meeting Prep", "date": "2023-10-28", "content": "Prepare slides for the weekly sync. Review Q3 performance metrics."}]
      
      4.  **If the document is 'other' or you are unsure**:
          *   Perform a general text extraction (OCR) of all readable text.
          *   Return a single object with a 'extracted_text' key.
          *   Example: [{"extracted_text": "This is some text from an unknown document."}]

      **CRITICAL: ALWAYS return a valid JSON array. If no structured data can be extracted, return an empty array [].**
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }, ...imageParts] },
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }

    const parsedData = JSON.parse(jsonText);
    
    if (!Array.isArray(parsedData)) {
        // If the API returns a single object, wrap it in an array to maintain consistency
        if (typeof parsedData === 'object' && parsedData !== null) {
            return [parsedData];
        }
        throw new Error("API did not return a valid JSON array or object.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to extract data from images. The API call failed.");
  }
};