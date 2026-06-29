import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
const BACKEND_TOKEN = process.env.NEXT_PUBLIC_BACKEND_TOKEN || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(BACKEND_API_URL, BACKEND_TOKEN, body);

    const { data } = await axios.post(
      `${BACKEND_API_URL}ai/expenses/chat/`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          ...(BACKEND_TOKEN
            ? { Authorization: `Bearer ${BACKEND_TOKEN}` }
            : {}),
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data ?? { error: "Backend request failed" },
        {
          status: error.response?.status ?? 502,
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to connect to AI service" },
      { status: 502 }
    );
  }
}