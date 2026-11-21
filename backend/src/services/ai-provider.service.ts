
import {
  googleProviders,
  groqProviders,
} from "../config/ai-providers.ts";

type ProviderFamily = "google" | "groq";

const allProviders = [
  ...googleProviders,
  ...groqProviders,
];

const unavailableProviders = new Map<string, number>();

let currentProviderIndex = 0;

const DEFAULT_COOLDOWN_MS = 60_000;

/**
 * Returns providers in rotation order,
 * excluding providers currently in cooldown.
 */
export const getAvailableProviders = () => {
  const now = Date.now();

  const orderedProviders = [
    ...allProviders.slice(currentProviderIndex),
    ...allProviders.slice(0, currentProviderIndex),
  ];

  const availableProviders = orderedProviders.filter((entry) => {
    const unavailableUntil = unavailableProviders.get(entry.id);

    if (!unavailableUntil) {
      return true;
    }

    if (now >= unavailableUntil) {
      unavailableProviders.delete(entry.id);
      return true;
    }

    return false;
  });

  return availableProviders;
};

/**
 * Moves the rotation position forward.
 */
export const moveToNextProvider = () => {
  if (allProviders.length === 0) {
    return;
  }

  currentProviderIndex =
    (currentProviderIndex + 1) % allProviders.length;
};

/**
 * Temporarily disables a provider after a retryable failure.
 */
export const markProviderUnavailable = (
  providerId: string,
  cooldownMs = DEFAULT_COOLDOWN_MS,
) => {
  unavailableProviders.set(
    providerId,
    Date.now() + cooldownMs,
  );
};

/**
 * Temporarily disables every key for a provider family.
 */
export const markProviderFamilyUnavailable = (
  family: ProviderFamily,
  cooldownMs = DEFAULT_COOLDOWN_MS,
) => {
  for (const entry of allProviders) {
    if (entry.family === family) {
      markProviderUnavailable(entry.id, cooldownMs);
    }
  }
};

/**
 * Makes a provider available again.
 */
export const markProviderAvailable = (providerId: string) => {
  unavailableProviders.delete(providerId);
};
