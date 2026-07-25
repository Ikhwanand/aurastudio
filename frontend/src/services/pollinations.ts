import axios from "axios";
import type { PoseRecommendation } from "../types/photobooth";

const BASE_URL = "https://gen.pollinations.ai";
const MEDIA_URL = "https://media.pollinations.ai";
const IMAGE_MODEL = import.meta.env.VITE_IMAGE_MODEL_ID || "flux";
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL_ID || "openai";

/**
 * Dynamically retrieves API key from localStorage or fallback env
 */
function getApiKey(): string {
  if (typeof window !== "undefined") {
    const userKey = localStorage.getItem("pollinations_api_key");
    if (userKey && userKey.trim() !== "") {
      return userKey.trim();
    }
  }
  return import.meta.env.VITE_POLLINATIONS_API_KEY || "";
}

export const pollinationsService = {
  /**
   * Uploads base64 webcam image to Pollinations Media Storage
   */
  async uploadWebcamPhoto(base64DataUrl: string): Promise<string | null> {
    const apiKey = getApiKey();
    try {
      const response = await axios.post(
        `${MEDIA_URL}/upload`,
        {
          data: base64DataUrl,
          contentType: "image/png",
          name: `webcam-${Date.now()}.png`,
        },
        {
          headers: {
            Authorization: apiKey ? `Bearer ${apiKey}` : "",
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data?.url) {
        return response.data.url;
      }
    } catch (err) {
      console.warn("Failed to upload image to Pollinations Media:", err);
    }
    return null;
  },

  /**
   * Constructs Image-to-Image or Text-to-Image URL for Pollinations AI
   */
  getImageUrl(
    prompt: string,
    model: string = IMAGE_MODEL,
    width: number = 1024,
    height: number = 1024,
    seed?: number,
    referenceImageUrl?: string,
  ): string {
    const apiKey = getApiKey();
    const activeModel = model || IMAGE_MODEL;
    const encodedPrompt = encodeURIComponent(prompt);
    let url = `${BASE_URL}/image/${encodedPrompt}?model=${activeModel}&width=${width}&height=${height}&nologo=true`;

    if (apiKey) {
      url += `&key=${encodeURIComponent(apiKey)}`;
    }
    if (seed !== undefined) {
      url += `&seed=${seed}`;
    }
    if (referenceImageUrl) {
      url += `&image=${encodeURIComponent(referenceImageUrl)}`;
    }
    return url;
  },

  /**
   * LIVE AI POSE GENERATOR (Pollinations LLM + Image Engine + Dynamic SVG Silhouette)
   */
  async generateAIPoses(userPreference: string): Promise<PoseRecommendation[]> {
    const apiKey = getApiKey();
    const promptText = `You are an AI Photobooth Pose Director. The user wants poses for the theme: "${userPreference}".
Generate 3 unique, highly creative photobooth pose recommendations.

Return ONLY a valid JSON array without any extra text or markdown formatting:
[
  {
    "id": "pose-1",
    "title": "Pose Name (3-4 words)",
    "category": "Solo",
    "description": "Clear step-by-step 1-sentence pose instruction",
    "imagePrompt": "photobooth portrait of a person doing <describe pose here> in ${userPreference} style",
    "svgPath": "M 200 130 Q 200 100 225 100 T 250 130 Q 250 170 200 200 Q 150 170 150 130 T 175 100 T 200 130 Z",
    "tips": ["Tip 1", "Tip 2"]
  }
]`;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await axios.post(
        `${BASE_URL}/v1/chat/completions`,
        {
          model: LLM_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a JSON-only API. Respond strictly with raw JSON array.",
            },
            { role: "user", content: promptText },
          ],
          temperature: 0.8,
        },
        { headers },
      );

      const rawContent = response.data.choices?.[0]?.message?.content || "";
      const jsonString = rawContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsedArray = JSON.parse(jsonString);

      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        return parsedArray.map((p: any, idx: number) => {
          const imagePrompt =
            p.imagePrompt || `photobooth portrait ${p.title} ${userPreference}`;
          const seed = Math.floor(Math.random() * 90000) + 10000;

          return {
            id: `ai-pose-${Date.now()}-${idx}`,
            title: p.title || `AI Pose ${idx + 1}`,
            category: p.category || "Solo",
            description: p.description || "Follow the AI pose guide.",
            visualUrl: this.getImageUrl(imagePrompt, IMAGE_MODEL, 512, 512, seed),
            svgOverlayPath: p.svgPath || generateDynamicSvgPath(idx),
            tips: Array.isArray(p.tips)
              ? p.tips
              : ["Align shoulders", "Follow pose silhouette"],
          };
        });
      }
    } catch (err) {
      console.error("LLM API error, generating fallback dynamic AI poses:", err);
    }

    return generateDynamicAIPosesFallback(userPreference);
  },
};

function generateDynamicSvgPath(index: number): string {
  const paths = [
    "M 200 130 Q 200 100 225 100 T 250 130 Q 250 170 200 200 Q 150 170 150 130 T 175 100 T 200 130 Z",
    "M 140 150 C 140 100 220 100 220 150 M 180 170 L 180 260",
    "M 170 140 L 140 90 M 170 140 L 190 95 M 230 140 L 210 90 M 230 140 L 245 95",
    "M 130 200 L 270 200 M 150 175 L 250 175",
  ];
  return paths[index % paths.length];
}

function generateDynamicAIPosesFallback(
  preference: string,
): PoseRecommendation[] {
  return [
    {
      id: `ai-pose-1-${Date.now()}`,
      title: `${preference} Profile`,
      category: "Solo",
      description: `Angle body 45 degrees for a stylish ${preference} aesthetic shot.`,
      visualUrl: pollinationsService.getImageUrl(
        `portrait of person posing ${preference} photobooth`,
        IMAGE_MODEL,
        512,
        512,
        Math.floor(Math.random() * 80000),
      ),
      svgOverlayPath: generateDynamicSvgPath(0),
      tips: ["Tilt head 15 degrees", "Look directly into camera lens"],
    },
    {
      id: `ai-pose-2-${Date.now()}`,
      title: `${preference} Expression`,
      category: "Fun",
      description: `Bring hands near face with a candid ${preference} expression.`,
      visualUrl: pollinationsService.getImageUrl(
        `playful person pose ${preference} photobooth portrait`,
        IMAGE_MODEL,
        512,
        512,
        Math.floor(Math.random() * 80000),
      ),
      svgOverlayPath: generateDynamicSvgPath(1),
      tips: ["Relax shoulders", "Natural expressive smile"],
    },
    {
      id: `ai-pose-3-${Date.now()}`,
      title: `${preference} Power Pose`,
      category: "Vibe",
      description: `Confident upright stance tailored for ${preference} photobooth style.`,
      visualUrl: pollinationsService.getImageUrl(
        `confident model power pose ${preference} photobooth`,
        IMAGE_MODEL,
        512,
        512,
        Math.floor(Math.random() * 80000),
      ),
      svgOverlayPath: generateDynamicSvgPath(3),
      tips: ["Keep chin up", "Strong direct eye contact"],
    },
  ];
}
