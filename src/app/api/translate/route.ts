import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, source = "en", target = "ko" } = await req.json();
  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }
  const clientId = process.env.PAPAGO_CLIENT_ID;
  const clientSecret = process.env.PAPAGO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Papago API credentials missing" },
      { status: 500 }
    );
  }
  try {
    const res = await fetch(
      "https://papago.apigw.ntruss.com/nmt/v1/translation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-NCP-APIGW-API-KEY-ID": clientId,
          "X-NCP-APIGW-API-KEY": clientSecret,
        },
        body: new URLSearchParams({
          source,
          target,
          text,
        }),
      }
    );
    const data = await res.json();
    if (data.message?.result?.translatedText) {
      return NextResponse.json({
        translatedText: data.message.result.translatedText,
      });
    } else {
      return NextResponse.json(
        { error: "Translation failed", detail: data },
        { status: 500 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Papago API error", detail: String(e) },
      { status: 500 }
    );
  }
}
