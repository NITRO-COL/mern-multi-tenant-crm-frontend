/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 writes AGENTS.md / CLAUDE.md into the project on dev; not wanted here.
  agentRules: false,
};

export default nextConfig;
