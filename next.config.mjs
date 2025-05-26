/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const headers = [];
    if (
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ) {
      headers.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index',
          },
          {
            key: 'Link',
            value: ' < https://portfolio-codegiyu.vercel.app >; rel="canonical"',
          },
        ],
        source: '/:path*',
      });
    }
    return headers;
  },
};

export default nextConfig;
