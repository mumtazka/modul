/** @type {import('next').NextConfig} */
const nextConfig = {
    // Increase body size limit for file uploads (max 50mb)
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    // Prevent leaking framework info
    poweredByHeader: false,

    // Catch common React bugs
    reactStrictMode: true,

    // Security headers
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
