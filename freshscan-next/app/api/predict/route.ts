/* Proxy route — forwards multipart image upload to HF Space FastAPI backend.
 * Keeps HF_SPACE_URL server-side only, preventing CORS issues. */
export const runtime = "nodejs";

/** 120-second timeout to handle HF Space cold start (~30-60s) */
const TIMEOUT_MS = 120_000;

export async function POST(request: Request): Promise<Response> {
  const hfSpaceUrl = process.env.HF_SPACE_URL;

  if (!hfSpaceUrl) {
    return Response.json(
      { error: "HF_SPACE_URL environment variable is not configured" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Invalid form data in request" },
      { status: 400 }
    );
  }

  /* AbortController provides the 120s timeout */
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${hfSpaceUrl}/predict`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      return Response.json(
        { error: `Model inference failed: ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === "AbortError") {
      return Response.json(
        { error: "Request timed out after 120 seconds. The model may still be warming up." },
        { status: 504 }
      );
    }

    return Response.json(
      { error: "Failed to connect to inference backend" },
      { status: 502 }
    );
  }
}
