import { getErrorKey, getErrorMessage } from "@zcom/storefront-kit/core";
import { zcomConfig } from "@/zcom.config";

/**
 * A message fit to show a shopper, from whatever the Zcom API or fetch threw: the kit's message for
 * a known error (and for network trouble), else the caller's fallback for this action.
 */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  const key = getErrorKey(error);
  if (key === "UNKNOWN") return fallback;
  return getErrorMessage(error, zcomConfig.errorMessages) || fallback;
}
