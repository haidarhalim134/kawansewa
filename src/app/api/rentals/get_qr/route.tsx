import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rentId = searchParams.get("rentId");

  try {
    // Generate a data URL containing the QR code
    const qrDataUrl = await QRCode.toDataURL(`https://example.com?p=${rentId}`, {
      errorCorrectionLevel: "H",
      width: 300,
    });

    // Convert base64 data URL to binary image buffer
    const base64Data = qrDataUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=qr.png",
      },
    });
  } catch (error) {
    console.error("QR generation failed:", error);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
