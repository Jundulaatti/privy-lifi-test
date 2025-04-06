"use client";

import { useEffect, useState } from "react";
import { initializeLiFiSDK } from "../lib/lifi/config";

export default function LiFiInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeLiFiSDK();
      setInitialized(true);
    }
  }, [initialized]);

  return null; // This component doesn't render anything
}
