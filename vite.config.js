import { defineConfig, loadEnv } from "vite";
import localApi from "./server/localApi.js";

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return {
    plugins: [localApi()],
  };
});
