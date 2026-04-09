import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing URL", { status: 400 });
  }

  try {
    // Determine if it needs Range requests forwarded?
    // fetch will automatically handle or we can explicitly pass range headers if provided
    const headers = new Headers();
    headers.set("ngrok-skip-browser-warning", "1");
    
    // Pass along the Range header if the browser sends one (for seeking in video/audio)
    const range = request.headers.get("range");
    if (range) {
      headers.set("range", range);
    }

    const res = await fetch(url, {
      headers,
    });

    // Create a new headers object for the response
    const responseHeaders = new Headers(res.headers);
    // Ensure we don't accidentally enforce bad cache or ngrok specific pages
    responseHeaders.delete("content-security-policy");

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response("Error proxying media", { status: 500 });
  }
}
