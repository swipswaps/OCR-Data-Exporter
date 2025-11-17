// This declaration is necessary because heic2any is loaded from a CDN script
declare const heic2any: any;

const convertHeicToJpg = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    })
    .then((conversionResult: Blob | Blob[]) => {
      const resultBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
      const convertedFile = new File([resultBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", {
        type: "image/jpeg",
        lastModified: Date.now()
      });
      resolve(convertedFile);
    })
    .catch(reject);
  });
};

/**
 * Creates a temporary local URL for displaying a file, converting HEIC/HEIF if necessary.
 */
export const getDisplayUrl = (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const fileNameLower = file.name.toLowerCase();
            if (file.type === 'image/heic' || file.type === 'image/heif' || fileNameLower.endsWith('.heic') || fileNameLower.endsWith('.heif')) {
                const convertedFile = await convertHeicToJpg(file);
                resolve(URL.createObjectURL(convertedFile));
            } else {
                resolve(URL.createObjectURL(file));
            }
        } catch (error) {
            console.error("Error creating display URL:", error);
            reject(error);
        }
    });
};

/**
 * Converts a file to a base64 encoded string, handling HEIC/HEIF conversion first.
 */
export const fileToBase64 = async (file: File): Promise<{ mimeType: string; data: string }> => {
  let processedFile = file;
  const fileNameLower = file.name.toLowerCase();
  if (file.type === 'image/heic' || file.type === 'image/heif' || fileNameLower.endsWith('.heic') || fileNameLower.endsWith('.heif')) {
      processedFile = await convertHeicToJpg(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(processedFile);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ mimeType: processedFile.type, data: base64Data });
    };
    reader.onerror = (error) => reject(error);
  });
};