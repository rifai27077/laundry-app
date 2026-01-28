
import OpenAI from 'openai';

const rawKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
const apiKey = rawKey.trim();

// Fail gracefully if no key, but warn
if (!apiKey) {
    console.warn("WARN: AI_API_KEY or OPENAI_API_KEY not set. AI features will fallback to template.");
}

// Check for Groq API Key
const isGroq = apiKey.startsWith('gsk_');
const baseURL = isGroq ? 'https://api.groq.com/openai/v1' : undefined;
const defaultModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo';

console.log(`[AI Config] Key Prefix: ${apiKey.substring(0, 4)}... isGroq: ${isGroq} BaseURL: ${baseURL || "default(openai)"} Model: ${defaultModel}`);

const openai = new OpenAI({
    apiKey: apiKey || 'dummy', 
    baseURL: baseURL,
    dangerouslyAllowBrowser: true
});

export async function generateWhatsAppMessage(
    memberName: string, 
    invoiceCode: string, 
    status: string,
    outletName: string = "Laundry App"
): Promise<string> {
    
    // Internal intent mapping for fallback
    let intentDesc = "pembaruan pesanan";
    if (status === 'baru') intentDesc = "pencatatan pesanan baru";
    if (status === 'proses') intentDesc = "sedang dalam proses cuci/setrika";
    if (status === 'selesai') intentDesc = "pesanan sudah siap diambil";
    if (status === 'diambil') intentDesc = "pesanan telah diambil (terima kasih)";

    // Fallback template
    const fallback = `Halo ${memberName}, ${intentDesc} untuk nomor invoice ${invoiceCode}. Terima kasih!`;

    if (!apiKey) return fallback;

    try {
        const prompt = `
        You are a friendly customer service assistant for a Laundry business named "${outletName}".
        Create a short, polite, and friendly WhatsApp message (in Indonesian) for a customer named "${memberName}".
        
        Context:
        - Invoice: ${invoiceCode}
        - Situation: ${
            status === 'baru' ? 'Order just received' : 
            status === 'selesai' ? 'Order is cleaned and ready for pickup' : 
            status === 'diambil' ? 'Customer has just picked up their laundry. Say thank you!' :
            'Order is currently being processed (washing/ironing)'
        }
        
        CRITICAL Instructions:
        - DO NOT mention the technical status name (like "baru", "proses", "selesai", "diambil") in the message.
        - If situation is "baru", say "Pesanan Anda sudah kami terima dan segera dikerjakan!".
        - If situation is "selesai", say "Pesanan Anda sudah harum dan siap diambil!".
        - If situation is "diambil", say "Terima kasih sudah mencuci di ${outletName}! Semoga hari Anda menyenangkan!".
        - Use emojis relevant to laundry/cleanliness.
        - Keep it under 50 words.
        - Don't use quotes around the message.
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: defaultModel,
        });

        return completion.choices[0].message.content || fallback;

    } catch (error) {
        console.error("AI Generation Error:", error);
        return fallback; 
    }
}

export async function generateChatReply(
    userMessage: string,
    senderNumber: string,
    contextInfo?: string
): Promise<string> {
    if (!apiKey) return "Maaf, saya sedang offline (No AI Key).";

    try {
        const prompt = `
        You are a smart and friendly customer service assistant for "Laundry App".
        User (${senderNumber}) says: "${userMessage}"
        
        ${contextInfo ? `SYSTEM DATA (Use this to answer accurately): \n${contextInfo}` : ''}
        
        Instructions:
        - Answer politely in Indonesian.
        - If the user asks about their balance (saldo) or points, check SYSTEM DATA and tell them clearly.
        - NEVER mention internal status labels (like "baru", "proses"). If you see transaction data, just say if it's "sedang dikerjakan" or "siap diambil".
        - If SYSTEM DATA is empty and they ask for specific info, ask for their name or invoice code.
        - Keep it helpful and concise (max 3 sentences).
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: defaultModel,
        });

        return completion.choices[0].message.content || "Maaf, saya tidak mengerti.";

    } catch (error) {
        console.error("AI Chat Error:", error);
        return "Maaf, terjadi kesalahan pada sistem AI."; 
    }
}
