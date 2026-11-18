import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

const rootEnvironment = resolve(process.cwd(), "../../.env");
if (!process.env.DATABASE_URL && existsSync(rootEnvironment)) {
  process.loadEnvFile(rootEnvironment);
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;