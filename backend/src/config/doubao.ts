import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const doubao = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY,
  baseURL: process.env.DOUBAO_BASE_URL,
});

export const getChatCompletion = async (messages: Array<{ role: string, content: string }>): Promise<string> => {
  try {
    const response = await doubao.chat.completions.create({
      model: process.env.DOUBAO_MODEL || 'doubao-seed-2.0-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content?.trim() || 'I couldn\'t generate a response.';
  } catch (error) {
    console.error('Error calling Doubao API:', error);
    return 'Sorry, I couldn\'t process your request.';
  }
};
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const doubao = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY,
  baseURL: process.env.DOUBAO_BASE_URL,
});

export const getChatCompletion = async (messages: Array<{ role: string, content: string }>): Promise<string> => {
  try {
    const response = await doubao.chat.completions.create({
      model: process.env.DOUBAO_MODEL || 'doubao-seed-2.0-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content?.trim() || 'I couldn\'t generate a response.';
  } catch (error) {
    console.error('Error calling Doubao API:', error);
    return 'Sorry, I couldn\'t process your request.';
  }
};