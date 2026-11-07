import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const gemini = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const generateAIResponse = async (prompt) => {
    // Try Gemini first
    try {
        console.log("Trying Gemini...");


        const response = await gemini.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt
        });


        if (!response.text) {
            throw new Error("Gemini returned an empty response");
        }



        console.log("Gemini successful");

        return response.text;

    } catch (error) {
        const status = Number(error.status || error.code);

        console.error("Gemini failed:", error.message);

        // Only fall back for temporary failures or key-specific errors.
        if (
            [429, 500, 502, 503, 504, 401, 403].includes(status) ||
            ["AbortError", "TimeoutError", "TypeError"].includes(error.name)
        ) {
            console.log("Switching to Groq...");
        } else {
            throw error;
        }
    }

    // Try Groq as fallback
    try {
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        const text = response.choices[0]?.message?.content;

        // const text = "";

        if (!text) {
            throw new Error("Groq returned an empty response");
        }

        console.log("Groq successful");

        return text;

    } catch (error) {
        console.error("Groq failed:", error.message);

        throw new Error("Both Gemini and Groq are currently unavailable");
    }
};