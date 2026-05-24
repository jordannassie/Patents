/**
 * Patent Status Estimation Helper
 *
 * LEGAL DISCLAIMER: These are ESTIMATES ONLY based on general patent term rules.
 * - U.S. utility patents filed after June 8, 1995 typically have a 20-year term from filing date
 * - Patents can expire early due to failure to pay maintenance fees
 * - Patent status can be affected by terminal disclaimers, extensions, or other factors
 * - ALWAYS include "Attorney Review Required" in status estimates
 * - NEVER claim a patent is definitively expired or safe to copy
 */

/**
 * Estimate patent status based on grant date and filing date
 *
 * @param grantDate - Patent grant date (e.g., "1998-02-15")
 * @param filingDate - Patent filing date (e.g., "1996-06-10")
 * @returns Status estimate string with attorney review disclaimer
 */
export function estimatePatentStatus(
  grantDate?: string | null,
  filingDate?: string | null
): string {
  const now = new Date();

  // Try to parse grant date
  if (grantDate) {
    const grantDateObj = new Date(grantDate);
    const yearsSinceGrant = now.getFullYear() - grantDateObj.getFullYear();

    // Typical patent term is 20 years from filing, but we check 20 years from grant as a simple heuristic
    if (yearsSinceGrant >= 20) {
      return "Likely Expired - Attorney Review Required";
    } else if (yearsSinceGrant >= 17) {
      // Close to expiration
      return "Possibly Nearing Expiration - Attorney Review Required";
    } else {
      return "Possibly Active - Attorney Review Required";
    }
  }

  // If no grant date but filing date exists
  if (filingDate) {
    const filingDateObj = new Date(filingDate);
    const yearsSinceFiling = now.getFullYear() - filingDateObj.getFullYear();

    // If filed more than 21 years ago (20 year term + 1 year for processing)
    if (yearsSinceFiling >= 21) {
      return "Likely Expired or Abandoned - Attorney Review Required";
    } else {
      return "Status Unclear - Attorney Review Required";
    }
  }

  // No dates available
  return "Unknown - Attorney Review Required";
}

/**
 * Calculate years since grant for sorting/filtering
 * @param grantDate - Patent grant date
 * @returns Number of years since grant, or null if date invalid
 */
export function yearsSinceGrant(grantDate?: string | null): number | null {
  if (!grantDate) return null;

  try {
    const grantDateObj = new Date(grantDate);
    const now = new Date();
    return now.getFullYear() - grantDateObj.getFullYear();
  } catch {
    return null;
  }
}

/**
 * Format date string for display
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "Feb 15, 1998")
 */
export function formatPatentDate(dateString?: string | null): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
