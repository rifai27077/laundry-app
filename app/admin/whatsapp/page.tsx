
"use client";

import { useEffect, useState } from "react";

export default function WhatsappPage() {
    const [status, setStatus] = useState<string>("loading");
    const [qr, setQr] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(fetchStatus, 3000);
        fetchStatus();
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch("/api/whatsapp/qr");
            const data = await res.json();
            setStatus(data.status);
            setQr(data.qr);
        } catch (e) {
            console.error("Failed to fetch WA status", e);
        }
    };

    return (
        <div className="p-8 text-white min-h-screen bg-[#0B1221]">
            <h1 className="text-3xl font-bold mb-6">WhatsApp Connection</h1>
            
            <div className="bg-[#152036] p-8 rounded-2xl max-w-lg border border-gray-700 flex flex-col items-center">
                
                <div className={`text-lg font-semibold px-4 py-2 rounded-full mb-6 ${
                    status === 'connected' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                    status === 'scanning' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                    'bg-red-900/50 text-red-400 border border-red-800'
                }`}>
                    Status: {status.toUpperCase()}
                </div>

                {status === 'connected' ? (
                    <div className="text-center space-y-4">
                         <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                         </div>
                         <p className="text-gray-300">WhatsApp is active. Messages will strictly follow AI formatting.</p>
                         <p className="text-xs text-gray-500">Only authorized numbers can receive updates.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        {qr ? (
                            <div className="bg-white p-4 rounded-xl mb-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qr} alt="Scan QR" className="w-64 h-64" />
                            </div>
                        ) : (
                            <div className="w-64 h-64 bg-gray-800 rounded-xl flex items-center justify-center mb-4 animate-pulse">
                                <span className="text-gray-500">Waiting for QR...</span>
                            </div>
                        )}
                        <p className="text-gray-400 text-sm text-center max-w-xs">
                            Scan this QR code with your WhatsApp (Linked Devices) to connect the bot.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
