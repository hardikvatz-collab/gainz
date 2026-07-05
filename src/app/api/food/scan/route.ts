import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Model used for reading the food photo. Gemini 2.5 Flash has a free tier
// (no credit card required) that's generous enough for personal use — get a
// key at https://aistudio.google.com/apikey. Swap this if you want a
// different model; check ai.google.dev/gemini-api/docs/models for current
// free-tier options.
const MODEL = "gemini-2.5-flash";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set on the server" },
      { status: 500 }
    );
  }

  try {
    const { imageBase64, mediaType, notes } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const prompt = `You are estimating nutrition facts from a photo of a meal. ${
      notes ? `Dietary context from the user: ${notes}.` : ""
    }
Look carefully at the portion sizes visible in the photo. Respond with ONLY a JSON object, no other text, no markdown fences, in exactly this shape:
{"name": "short dish name", "calories": number, "protein": number, "carbs": number, "fat": number}
All macro values are grams, calories is kcal, all whole numbers. Make your best estimate even if uncertain.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { inline_data: { mime_type: mediaType || "image/jpeg", data: imageBase64 } },
                { text: prompt },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "Failed to analyze photo" }, { status: 502 });
    }

    const data = await response.json();
    const raw = (data.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .trim()
      .replace(/^```json\s*|```$/g, "");

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Could not read a clear result from the photo" }, { status: 502 });
    }

    return NextResponse.json({
      name: parsed.name || "Meal",
      calories: Math.round(parsed.calories) || 0,
      protein: Math.round(parsed.protein) || 0,
      carbs: Math.round(parsed.carbs) || 0,
      fat: Math.round(parsed.fat) || 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

