import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, temperature = 0.3, max_tokens = 2048 } = body;

    const endpoint = process.env.NEXT_PUBLIC_THAILLM_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_THAILLM_API_KEY;

    if (!endpoint || !apiKey) {
      return NextResponse.json(
        { error: "Missing ThaiLLM API configuration" },
        { status: 500 }
      );
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openthaigpt-thaillm-8b-instruct-v7.2",
        messages,
        max_tokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ThaiLLM API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/chat route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
