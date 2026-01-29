import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@whiskeysockets/baileys', 'pino', 'thread-stream'],
};

export default nextConfig;
