// d:\neiroQC\NeiroWork\backend\src\config\doubao.ts
import { OpenAI } from "openai";
import dotenv from 'dotenv';

dotenv.config();

// Инициализация клиента Volcano Ark (совместимо с OpenAI SDK)
export const doubaoClient = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY || '30c68fcc-adf1-4c94-a44c-8f779121a895', // ВСТАВЬ СВОЙ КЛЮЧ
  baseURL: process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
});

// ПРАВИЛЬНОЕ НАЗВАНИЕ МОДЕЛИ (ИСПРАВЛЕНО!)
export const DOUBAO_MODEL = "doubao-seed-2-0-mini-260215";

export const getChatCompletion = async (messages: Array<{ role: string, content: string | Array<{ type: string, text?: string, image_url?: { url: string } }> }>): Promise<string> => {
  try {
    const response = await doubaoClient.chat.completions.create({
      model: process.env.DOUBAO_MODEL || DOUBAO_MODEL,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content?.trim() || 'I couldn\'t generate a response.';
  } catch (error) {
    console.error('Error calling Doubao API:', error);
    return 'Sorry, I couldn\'t process your request.';
  }
};

export const getChatCompletionWithPrompt = async (prompt: string, context: string): Promise<string> => {
  try {
    const messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: context }
    ];

    const response = await doubaoClient.chat.completions.create({
      model: process.env.DOUBAO_MODEL || DOUBAO_MODEL,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0]?.message?.content?.trim() || 'I couldn\'t generate a response.';
  } catch (error) {
    console.error('Error calling Doubao API with prompt:', error);
    return 'Sorry, I couldn\'t process your request.';
  }
};