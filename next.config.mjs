/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    agentUpgrade: 'security',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.pinpoint.ng',
      },
      {
        protocol: 'https',
        hostname: 'static.thesolaceinitiative.org',
      },
    ],
  },
  async headers() {
    const environment = process.env.VERCEL_ENV;
    const developmentScriptPolicy = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
    const contentSecurityPolicy =
      "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; " +
      `script-src 'self' 'unsafe-inline'${developmentScriptPolicy}; ` +
      "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; " +
      "font-src 'self' data:; connect-src 'self' https:; worker-src 'self' blob:; manifest-src 'self';";
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
    ];
    if (environment === 'preview') headers.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
    if (environment === 'production') {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      });
    }
    return [{ source: '/:path*', headers }];
  },
};

export default nextConfig;
