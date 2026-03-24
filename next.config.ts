import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-03006b57-d002-483d-9fd0-0ae529396588.space.z.ai',
  ],
};

export default nextConfig;
