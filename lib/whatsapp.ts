
import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    WASocket
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';

// Store QR code in memory to be served via API
let qrCode: string | null = null;
let sock: WASocket | null = null;
let isConnecting = false;

export const getQrCode = () => qrCode;
export const getStatus = () => {
    if (sock?.user) return 'connected';
    if (qrCode) return 'scanning';
    return 'disconnected';
};

async function connectToWhatsApp() {
    if (isConnecting || sock?.user) return;
    isConnecting = true;

    const { state, saveCreds } = await useMultiFileAuthState('wa_auth');
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
        version,
        logger: pino({ level: 'silent' }) as any, 
        printQRInTerminal: true, // Also print to console for dev
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }) as any),
        },
        generateHighQualityLinkPreview: true,
    });

    socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCode = qr;
            console.log('[WA] New QR Code generated');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('[WA] Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            qrCode = null;
            sock = null;
            isConnecting = false;
            // reconnect if not logged out
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 2000); // retry
            }
        } else if (connection === 'open') {
            console.log('[WA] Opened connection to ' + socket.user?.id);
            qrCode = null;
            sock = socket;
            isConnecting = false;
        }
    });

    // Handle Incoming Messages
    socket.ev.on('messages.upsert', async ({ messages, type }) => {
        console.log(`[WA DEBUG] messages.upsert type=${type} count=${messages.length}`);
        if (type !== 'notify') return;

        for (const msg of messages) {
            console.log(`[WA DEBUG] Message: fromMe=${msg.key.fromMe} remoteJid=${msg.key.remoteJid}`);
            
            // IGNORE STATUS UPDATES AND GROUPS
            if (msg.key.remoteJid === 'status@broadcast') continue;
            if (msg.key.remoteJid?.endsWith('@g.us')) {
                console.log(`[WA DEBUG] Ignored Group Message: ${msg.key.remoteJid}`);
                continue;
            }

            if (!msg.key.fromMe && msg.message) {
                const sender = msg.key.remoteJid;
                // Get text content (could be discussion, conversation, extendedTextMessage etc)
                const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

                console.log(`[WA DEBUG] Text received: "${text}" from ${sender}`);

                if (text && sender) {
                    try {
                        // Dynamic Import
                        const { generateChatReply } = require('./ai');
                        
                        // 1. DATA LOOKUP
                        let contextInfo = "";
                        try {
                            // Convert 628... to 08...
                            const pureNum = sender.replace('@s.whatsapp.net', '');
                            const tlpIndo = pureNum.startsWith('62') ? '0' + pureNum.slice(2) : pureNum;
                            
                            // Import prisma dynamically or assume global? 
                            // Better use global singleton if available or dynamic import to avoid circular issues with lib/db
                            const { prisma } = require('./db');

                            const member = await prisma.member.findFirst({
                                where: { tlp: tlpIndo }
                            });

                            if (member) {
                                console.log(`[WA DEBUG] Found member: ${member.nama}`);
                                contextInfo += `Customer Name: ${member.nama}\n`;
                                contextInfo += `Points: ${member.poin || 0}\n`;
                                contextInfo += `Balance (Saldo): ${member.saldo || 0}\n`;
                                
                                const lastTrans = await prisma.transaksi.findMany({
                                    where: { id_member: member.id, status: { not: 'diambil' } },
                                    orderBy: { tgl: 'desc' },
                                    take: 3
                                });

                                if (lastTrans.length > 0) {
                                    contextInfo += `Active Transactions:\n`;
                                    lastTrans.forEach((t:any) => {
                                        // Removed Status: ${t.status} as requested by user
                                        contextInfo += `- Invoice: ${t.kode_invoice}, Total: ${t.grand_total}, Paid: ${t.dibayar}\n`;
                                    });
                                } else {
                                    contextInfo += `No active transactions (all collected or none).\n`;
                                }
                            } else {
                                console.log(`[WA DEBUG] Sender not registered as member (tlp: ${tlpIndo})`);
                            }
                        } catch (dbErr) {
                            console.error("[WA DEBUG] Database info fetch failed:", dbErr);
                        }

                        console.log(`[WA DEBUG] Generating reply for: ${text} with Context Length: ${contextInfo.length}`);
                        // Show "typing..." state
                        await socket.sendPresenceUpdate('composing', sender);
                        
                        const reply = await generateChatReply(text, sender.split('@')[0], contextInfo);
                        console.log(`[WA DEBUG] Reply generated: "${reply}"`);
                        
                        await socket.sendMessage(sender, { text: reply });
                        console.log(`[WA DEBUG] Reply SENT.`);
                        
                        // Stop "typing..."
                         await socket.sendPresenceUpdate('paused', sender);

                    } catch (e) {
                         console.error("[WA] Auto-Reply Error:", e);
                    }
                } else {
                    console.log("[WA DEBUG] No text content found in message.");
                }
            } else {
                console.log("[WA DEBUG] Ignored (fromMe or no message content)");
            }
        }
    });

    socket.ev.on('creds.update', saveCreds);
    sock = socket;
}

// Initial connection
// We invoke this lazily or when imported? 
// For dev server, let's just run it.
if (!global.hasWaStarted) {
    global.hasWaStarted = true;
    connectToWhatsApp().catch(err => console.error("[WA] Init Error:", err));
}

export async function sendWhatsAppMessage(to: string, text: string) {
    if (!sock) {
        console.warn("[WA] Not connected. Trying to connect...");
        // connectToWhatsApp(); // Don't await, just trigger? or maybe fail.
        return false;
    }

    try {
        // Format number: if starts with 08, replace with 628. Remove non-digits.
        let jid = to.replace(/[^0-9]/g, '');
        if (jid.startsWith('0')) {
            jid = '62' + jid.slice(1);
        }
        if (!jid.endsWith('@s.whatsapp.net')) {
            jid += '@s.whatsapp.net';
        }

        await sock.sendMessage(jid, { text });
        return true;
    } catch (error) {
        console.error("[WA] Send Error:", error);
        return false;
    }
}

// Global augmentation for hot-reload safety
declare global {
    var hasWaStarted: boolean;
}
