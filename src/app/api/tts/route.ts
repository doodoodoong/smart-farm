import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: "텍스트가 필요합니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const ttsRequest = {
      input: { text },
      voice: { languageCode: "ko-KR", ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const ttsRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ttsRequest),
    });

    if (!ttsRes.ok) {
      const error = await ttsRes.json();
      return NextResponse.json(
        { error: "TTS API 호출 실패", details: error },
        { status: 500 }
      );
    }

    const ttsData = await ttsRes.json();
    if (!ttsData.audioContent) {
      return NextResponse.json({ error: "오디오 생성 실패" }, { status: 500 });
    }

    // audioContent는 base64 인코딩된 mp3
    const audioBuffer = Buffer.from(ttsData.audioContent, "base64");
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="tts.mp3"',
      },
    });
  } catch (error) {
    console.error("TTS API 서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류", details: String(error) },
      { status: 500 }
    );
  }
}
