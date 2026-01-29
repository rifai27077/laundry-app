
import { NextResponse } from "next/server";
import { getQrCode, getStatus } from "@/lib/whatsapp";
import QRCode from "qrcode";

// Prevent caching
export const dynamic = 'force-dynamic';

// GET — Dashboard WhatsApp Status & QR (MySQL Ready)
export async function GET() {
    const rawQr = getQrCode();
    const status = getStatus();
    
    let qrImage = null;
    if (rawQr) {
        try {
            qrImage = await QRCode.toDataURL(rawQr);
        } catch (err) {
            console.error("QR Gen Error:", err);
        }
    }

    return NextResponse.json({
        qr: qrImage, // Data URL
        status,
        timestamp: Date.now()
    });
}
