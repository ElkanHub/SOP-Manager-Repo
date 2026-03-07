import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://kvqiebiwpdxnzhypjshw.supabase.co https://*.supabase.co;
    font-src 'self';
    connect-src 'self' https://kvqiebiwpdxnzhypjshw.supabase.co wss://kvqiebiwpdxnzhypjshw.supabase.co https://*.supabase.co wss://*.supabase.co;
    frame-ancestors 'none';
`.replace(/\n/g, '')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ]
  }
};

export default nextConfig;
