
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable is not set. Using a placeholder key.");
    process.env.API_KEY = "YOUR_API_KEY_HERE"; 
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image:", error);
    // Return a placeholder image URL on error
    return `https://picsum.photos/512/512?random=${Math.random()}`;
  }
};

export const getWordGameChallenge = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Genera una parola italiana semplice (massimo 5 lettere) per un bambino di 5 anni e una descrizione per un'immagine in stile cartone animato che la rappresenti. L'immagine deve essere semplice, colorata e su sfondo bianco.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: {
              type: Type.STRING,
              description: 'La parola italiana, in minuscolo.'
            },
            imagePrompt: {
              type: Type.STRING,
              description: "Una descrizione per l'immagine da generare, in inglese."
            }
          }
        }
      }
    });

    const content = JSON.parse(response.text);
    const imageUrl = await getImage(content.imagePrompt);
    return { word: content.word.toLowerCase(), imageUrl };
  } catch (error) {
    console.error("Error getting word game challenge:", error);
    return { word: "errore", imageUrl: `https://picsum.photos/512/512?random=${Math.random()}` };
  }
};

export const getMathGameChallenge = async () => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Crea un semplice problema di addizione per un bambino di 4 anni usando numeri tra 1 e 5. Fornisci i due numeri, la risposta e una descrizione per un'immagine che rappresenti il problema in stile cartone animato (es. '2 mele + 3 mele').",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        num1: { type: Type.INTEGER },
                        num2: { type: Type.INTEGER },
                        answer: { type: Type.INTEGER },
                        imagePrompt: { 
                            type: Type.STRING,
                            description: "Una descrizione per l'immagine, in inglese (es. 'Cartoon drawing of 2 red apples next to 3 green apples on a white background')."
                        }
                    }
                }
            }
        });

        const problem = JSON.parse(response.text);
        const imageUrl = await getImage(problem.imagePrompt);
        
        // Generate distractors
        const options = new Set<number>([problem.answer]);
        while(options.size < 4) {
            const distractor = problem.answer + Math.floor(Math.random() * 5) - 2;
            if (distractor >= 0 && distractor !== problem.answer) {
                options.add(distractor);
            }
        }
        
        return { 
            ...problem, 
            imageUrl,
            options: Array.from(options).sort(() => Math.random() - 0.5)
        };
    } catch (error) {
        console.error("Error getting math game challenge:", error);
        return { num1: 2, num2: 1, answer: 3, imageUrl: `https://picsum.photos/512/512?random=${Math.random()}`, options: [3,1,4,2] };
    }
};
