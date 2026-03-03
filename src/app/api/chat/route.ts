import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase-server";
import { toolDeclarations, executeTool } from "@/lib/chat-tools";
import { MEI_SYSTEM_PROMPT } from "@/lib/mei-system-prompt";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow longer execution time for LLM logic

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!messages?.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 },
      );
    }

    // 3. Build conversation contents for Gemini
    const contents = messages.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.text }],
    }));

    // 4. Call Gemini with tools
    let response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: MEI_SYSTEM_PROMPT,
        tools: [{ functionDeclarations: toolDeclarations }],
        temperature: 1.0,
      },
    });

    // 5. Tool Calling loop — max 5 iterations to prevent infinite loops
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      const candidate = response.candidates?.[0];
      if (!candidate?.content?.parts) break;

      // Check if there are function calls
      const functionCalls = candidate.content.parts.filter(
        (part) => part.functionCall,
      );

      if (functionCalls.length === 0) break; // No more tool calls, we have the final answer

      // Execute each function call
      const functionResponses = [];
      for (const part of functionCalls) {
        const call = part.functionCall!;
        const toolName = call.name!;
        const toolArgs = (call.args as Record<string, unknown>) ?? {};

        try {
          const result = await executeTool(
            toolName,
            toolArgs as Record<string, string>,
          );
          functionResponses.push({
            functionResponse: {
              name: toolName,
              response: { result: JSON.stringify(result) },
            },
          });
        } catch (err) {
          functionResponses.push({
            functionResponse: {
              name: toolName,
              response: {
                error: `Tool error: ${err instanceof Error ? err.message : "Unknown error"}`,
              },
            },
          });
        }
      }

      // Send tool results back to Gemini
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...contents,
          { role: "model" as const, parts: candidate.content.parts },
          { role: "user" as const, parts: functionResponses },
        ],
        config: {
          systemInstruction: MEI_SYSTEM_PROMPT,
          tools: [{ functionDeclarations: toolDeclarations }],
          temperature: 1.0,
        },
      });

      iterations++;
    }

    // 6. Extract final text response
    const finalText =
      response.candidates?.[0]?.content?.parts
        ?.filter((part) => part.text)
        ?.map((part) => part.text)
        ?.join("") ?? "Mei xin lỗi, có lỗi xảy ra 😅";

    return NextResponse.json({ message: finalText });
  } catch (error) {
    console.error("[Chat API Error]", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi kết nối với Mei. Vui lòng thử lại sau 😢" },
      { status: 500 },
    );
  }
}
