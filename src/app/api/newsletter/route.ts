import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (!writeClient) {
      console.error("SANITY_API_TOKEN is not configured. Newsletter subscription was not saved.");
      return NextResponse.json(
        { error: "Unable to subscribe at this time. Please try again later." },
        { status: 500 },
      );
    }

    await writeClient.create({
      _type: "newsletterSubscriber",
      email,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
