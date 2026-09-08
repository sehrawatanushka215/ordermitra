/** @type {import('next').NextConfig} */
const nextConfig = {
  // ai's dependency tree ships ESM-only builds several levels deep
  // (ai -> @ai-sdk/gateway -> @ai-sdk/provider-utils -> @workflow/serde), so each
  // package that needs syntax transforming is listed explicitly to avoid
  // transpiling the whole of node_modules.
  transpilePackages: [
    "ai",
    "@ai-sdk/react",
    "@ai-sdk/groq",
    "@ai-sdk/gateway",
    "@ai-sdk/provider",
    "@ai-sdk/provider-utils",
    "@workflow/serde",
  ],
};

export default nextConfig;
