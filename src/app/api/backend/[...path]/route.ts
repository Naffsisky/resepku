import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = process.env.API_BASE_URL || "http://43.157.202.20/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const subpath = path.join("/");
    const search = request.nextUrl.search; // preserves ?s=... &c=... etc.
    const url = `${UPSTREAM_API}/${subpath}${search}`;

    const upstreamResponse = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      // Cache with Next.js revalidation for 60 seconds to stay well below the 100 req/min limit
      next: { revalidate: 60 },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${upstreamResponse.statusText}` },
        { status: upstreamResponse.status }
      );
    }

    const data = await upstreamResponse.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: "Gagal memuat data dari server resep", details: errorMessage },
      { status: 502 }
    );
  }
}
