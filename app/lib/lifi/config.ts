import { createConfig } from "@lifi/sdk";

// Initialize LI.FI SDK with your app name
export function initializeLiFiSDK() {
  createConfig({
    integrator: "Terminal", // Replace with your app/company name
    apiKey: process.env.NEXT_PUBLIC_LIFI_API_KEY, // Add your API key here
  });
}
