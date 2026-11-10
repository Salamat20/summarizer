import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // 1. Validate input
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Please enter some text." }, { status: 400 });
    }
    if (text.length > 20000) {
      return NextResponse.json({ error: "Text is too long (max 20,000 characters)." }, { status: 400 });
    }

    // 2. Read secrets from the server environment
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest";
    if (!apiKey) {
      return NextResponse.json({ error: "Server is missing the API key." }, { status: 500 });
    }

    // 3. Build the prompt and request
    const prompt =
      `Summarize the following text in 3 to 5 short bullet points. ` +
      `Use plain text with "- " for bullets and no bold or Markdown:\n\n${text}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    });

    // 4. Call the LLM API, retrying if the service is busy
    let res: Response | undefined;
    for (let attempt = 1; attempt <= 3; attempt++) {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body,
      });
      // Only retry on "busy" (503) or "too many requests" (429)
      if (res.status !== 503 && res.status !== 429) break;
      console.warn(`AI service busy (attempt ${attempt}), retrying...`);
      await new Promise((r) => setTimeout(r, 1000 * attempt)); // wait 1s, then 2s
    }

    if (!res) {
      return NextResponse.json({ error: "No response from the AI service." }, { status: 502 });
    }

    if (!res.ok) {
      console.error("LLM error:", await res.text());
      const busy = res.status === 503 || res.status === 429;
      return NextResponse.json(
        {
          error: busy
            ? "The AI service is busy right now. Please try again in a minute."
            : "The AI service returned an error. Try again.",
        },
        { status: busy ? 503 : 502 }
      );
    }

    // 5. Pull the text out of the response
    const data = await res.json();
    const summary =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim() ?? "";

    if (!summary) {
      return NextResponse.json({ error: "The AI returned an empty summary. Try again." }, { status: 502 });
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}