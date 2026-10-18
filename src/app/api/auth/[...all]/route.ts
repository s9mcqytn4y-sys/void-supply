import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export async function GET(req: NextRequest) {
  try {
    return await handler.GET(req);
  } catch (error: any) {
    console.error("[AUTH_GET_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal Auth Error", stack: error?.stack },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handler.POST(req);
  } catch (error: any) {
    console.error("[AUTH_POST_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal Auth Error", stack: error?.stack },
      { status: 500 }
    );
  }
}
