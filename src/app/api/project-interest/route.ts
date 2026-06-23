import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/spam-protection";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(getClientIp(request));
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    const body = await request.json();

    if (isHoneypotFilled(body)) {
      return NextResponse.json({ success: true });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const story = typeof body.story === "string" ? body.story.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const instagram =
      typeof body.instagram === "string" ? body.instagram.trim() : "";
    const projectTitle =
      typeof body.projectTitle === "string" ? body.projectTitle.trim() : "";

    if (!name || !email || !story) {
      return NextResponse.json(
        { error: "Name, email, and your story are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (
      name.length > 200 ||
      email.length > 200 ||
      phone.length > 200 ||
      instagram.length > 200 ||
      projectTitle.length > 200 ||
      story.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields exceed the allowed length." },
        { status: 400 },
      );
    }

    if (!writeClient) {
      console.error("SANITY_API_TOKEN is not configured. Project interest submission was not saved.");
      return NextResponse.json(
        { error: "Unable to process your request at this time. Please try again later." },
        { status: 500 },
      );
    }

    await writeClient.create({
      _type: "projectInterest",
      name,
      email,
      phone: phone || undefined,
      instagram: instagram || undefined,
      story,
      projectTitle: projectTitle || undefined,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
