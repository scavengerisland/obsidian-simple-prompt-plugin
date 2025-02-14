import { GoogleGenerativeAI } from "@google/generative-ai";
import { LlmStreamingResponseFn, SimplePromptPluginSettings } from "src/types";
import { notice } from "src/utils";

export async function generate(
    settings: SimplePromptPluginSettings,
    prompt: string,
    onSuccess: (result: string) => void,
) {
    const genAI = new GoogleGenerativeAI(settings.apiKey.gemini ?? "");
    const model = genAI.getGenerativeModel({ model: settings.model.gemini });

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        onSuccess(text);
    } catch (e) {
        console.error(e);
        notice(`Error generating content: ${e}`);
    }
}

export async function generateStreaming(
    settings: SimplePromptPluginSettings,
    prompt: string,
    onChunk: LlmStreamingResponseFn,
    onStart?: () => void,
    onEnd?: () => void,
) {
    const genAI = new GoogleGenerativeAI(settings.apiKey.gemini ?? "");
    const model = genAI.getGenerativeModel({ model: settings.model.gemini });

    try {
        if (onStart) onStart();
        
        const result = await model.generateContentStream(prompt);
        
        for await (const chunk of result.stream) {
            const text = chunk.text();
            onChunk(text);
        }
        
        if (onEnd) onEnd();
    } catch (e) {
        console.error(e);
        notice(`Error generating content: ${e}`);
    }
}
