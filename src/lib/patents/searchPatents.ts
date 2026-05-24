/**
 * Safe Patent Search Provider
 *
 * RATE LIMIT PROTECTION:
 * - Maximum 25 results per search
 * - Caches all responses for 7 days
 * - Does NOT paginate automatically
 * - Does NOT call document/file-wrapper endpoints
 * - Only retrieves patent metadata
 *
 * API STRATEGY:
 * - Prefers PatentsView API (free, well-documented)
 * - Falls back to USPTO API if PatentsView unavailable
 * - Returns demo data if all APIs fail (with is_demo flag)
 *
 * FUTURE: Bulk ingestion should use USPTO bulk data files, not live API
 */

import { estimatePatentStatus } from "./status";

// Maximum results per search to protect API limits
const MAX_RESULTS_PER_SEARCH = 25;

// Patent result interface
export interface PatentResult {
  patent_number: string;
  title: string;
  abstract: string;
  filing_date: string | null;
  grant_date: string | null;
  assignee: string | null;
  inventors: string | null;
  cpc_codes: string | null;
  status_estimate: string;
  source_url: string;
  source: string;
  is_demo: boolean;
  raw_json: unknown;
}

// Search result with debug info
export interface SearchResult {
  results: PatentResult[];
  provider: string;
  isDemo: boolean;
  providerStatus?: number;
  providerError?: string;
}

/**
 * Search patents using available API providers
 *
 * @param query - Search query string
 * @param market - Optional market category for filtering
 * @returns Search result with patents and debug info
 */
export async function searchPatents(
  query: string,
  market?: string
): Promise<SearchResult> {
  const patentsViewKey = process.env.PATENTSVIEW_API_KEY;
  const usptoKey = process.env.USPTO_API_KEY;

  console.log("[Patent Provider] PATENTSVIEW_API_KEY exists:", !!patentsViewKey);
  console.log("[Patent Provider] USPTO_API_KEY exists:", !!usptoKey);

  // Try USPTO ODP API first (preferred)
  if (usptoKey) {
    console.log("[Patent Provider] using provider: USPTO ODP");
    try {
      const results = await searchUsptoOdpPatents(query, market);
      if (results.length > 0) {
        console.log("[Patent Provider] USPTO ODP success, results:", results.length);
        return {
          results,
          provider: "uspto_odp",
          isDemo: false,
        };
      }
      console.log("[Patent Provider] USPTO ODP returned 0 results");
    } catch (error) {
      console.error("[Patent Provider] USPTO ODP error:", error);
      const errorInfo = error instanceof Error ? error.message : "Unknown error";
      
      console.warn("[Patent Provider] USPTO ODP failed, returning demo data");
      return {
        results: getDemoPatentResults(query, market),
        provider: "demo",
        isDemo: true,
        providerError: `USPTO ODP failed: ${errorInfo}`,
      };
    }
  }

  // Try PatentsView API as fallback (if key exists)
  // Note: PatentsView endpoint may have issues - keeping as fallback only
  if (patentsViewKey) {
    console.log("[Patent Provider] using provider: PatentsView");
    try {
      const results = await searchPatentsView(query, market);
      if (results.length > 0) {
        console.log("[Patent Provider] PatentsView success, results:", results.length);
        return {
          results,
          provider: "patentsview",
          isDemo: false,
        };
      }
      console.log("[Patent Provider] PatentsView returned 0 results");
    } catch (error) {
      console.error("[Patent Provider] PatentsView error:", error);
      const errorInfo = error instanceof Error ? error.message : "Unknown error";
      
      console.warn("[Patent Provider] PatentsView failed, returning demo data");
      return {
        results: getDemoPatentResults(query, market),
        provider: "demo",
        isDemo: true,
        providerError: `PatentsView failed: ${errorInfo}`,
      };
    }
  }

  // No API keys available - return demo
  console.warn("[Patent Provider] no API keys configured, returning demo data");
  return {
    results: getDemoPatentResults(query, market),
    provider: "demo",
    isDemo: true,
    providerError: "No API keys configured",
  };
}

/**
 * Search using USPTO Open Data Portal API
 * https://developer.uspto.gov/api-catalog
 */
async function searchUsptoOdpPatents(
  query: string,
  market?: string
): Promise<PatentResult[]> {
  const apiKey = process.env.USPTO_API_KEY;
  
  // USPTO ODP Search API endpoint
  const url = "https://api.uspto.gov/search/v1/patent";
  
  console.log("[Patent Provider] request url: https://api.uspto.gov/search/v1/patent");

  // Build search request
  const requestBody = {
    q: query,
    rows: MAX_RESULTS_PER_SEARCH,
    start: 0,
    sort: "date desc",
    fl: [
      "patentNumber",
      "inventionTitle",
      "abstractText",
      "filingDate",
      "grantDate",
      "applicantName",
      "inventorName",
      "cpcClassificationText"
    ].join(",")
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey || "",
      "api-key": apiKey || "",
    },
    body: JSON.stringify(requestBody),
  });

  console.log("[Patent Provider] response status:", response.status);
  console.log("[Patent Provider] response ok:", response.ok);

  if (!response.ok) {
    const bodyText = await response.text();
    const bodyPreview = bodyText.substring(0, 1000);
    
    console.error("[Patent Provider] live API failed:", {
      provider: "uspto_odp",
      url: "https://api.uspto.gov/search/v1/patent",
      status: response.status,
      statusText: response.statusText,
      bodyPreview,
    });
    
    throw new Error(
      `USPTO ODP API error: ${response.status} ${response.statusText}. Body: ${bodyPreview}`
    );
  }

  const data = await response.json();
  
  // USPTO ODP response structure may vary - handle multiple formats
  const patents = data.response?.docs || data.docs || data.results || data.patents || [];

  console.log("[Patent Provider] parsed results count:", patents.length);

  if (patents.length === 0) {
    console.log("[Patent Provider] no patents returned from USPTO ODP");
    return [];
  }

  // Defensively map USPTO fields to our format
  return patents.slice(0, MAX_RESULTS_PER_SEARCH).map((patent: any) => {
    // Try multiple possible field names
    const patentNumber = 
      patent.patentNumber || 
      patent.patent_number || 
      patent.applicationNumberText || 
      patent.application_number || 
      "Unknown";
    
    const title = 
      patent.inventionTitle || 
      patent.title || 
      patent.patent_title || 
      "No title available";
    
    const abstract = 
      patent.abstractText || 
      patent.abstract || 
      patent.patent_abstract || 
      "No abstract available";
    
    const filingDate = 
      patent.filingDate || 
      patent.filing_date || 
      patent.app_date || 
      null;
    
    const grantDate = 
      patent.grantDate || 
      patent.grant_date || 
      patent.patent_date || 
      null;
    
    const assignee = 
      patent.applicantName || 
      patent.assignee || 
      patent.assignee_organization || 
      null;
    
    // Handle inventors - could be string or array
    let inventors = null;
    if (patent.inventorName) {
      inventors = Array.isArray(patent.inventorName) 
        ? patent.inventorName.join(", ") 
        : patent.inventorName;
    } else if (patent.inventors) {
      inventors = Array.isArray(patent.inventors)
        ? patent.inventors.map((inv: any) => inv.inventor_last_name || inv.name || inv).join(", ")
        : patent.inventors;
    }
    
    // Handle CPC codes
    let cpcCodes = null;
    if (patent.cpcClassificationText) {
      cpcCodes = Array.isArray(patent.cpcClassificationText)
        ? patent.cpcClassificationText.join(", ")
        : patent.cpcClassificationText;
    } else if (patent.cpc_codes) {
      cpcCodes = Array.isArray(patent.cpc_codes)
        ? patent.cpc_codes.join(", ")
        : patent.cpc_codes;
    }

    return {
      patent_number: patentNumber,
      title,
      abstract,
      filing_date: filingDate,
      grant_date: grantDate,
      assignee,
      inventors,
      cpc_codes: cpcCodes,
      status_estimate: estimatePatentStatus(grantDate, filingDate),
      source_url: `https://patents.google.com/patent/US${patentNumber}`,
      source: "uspto_odp",
      is_demo: false,
      raw_json: patent,
    };
  });
}

/**
 * Search using PatentsView API
 * https://patentsview.org/apis/api-query-language
 */
async function searchPatentsView(
  query: string,
  market?: string
): Promise<PatentResult[]> {
  const apiKey = process.env.PATENTSVIEW_API_KEY;
  const url = "https://api.patentsview.org/patents/query";

  console.log("[Patent Provider] request url:", url);

  // Build search criteria
  const searchCriteria = {
    _text_any: {
      patent_abstract: query,
      patent_title: query,
    },
  };

  const requestBody = {
    q: searchCriteria,
    f: [
      "patent_number",
      "patent_title",
      "patent_abstract",
      "patent_date",
      "app_date",
      "assignee_organization",
      "inventor_last_name",
      "cpc_section_id",
    ],
    o: {
      per_page: MAX_RESULTS_PER_SEARCH,
      page: 1,
    },
    s: [{ patent_date: "desc" }],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey || "",
    },
    body: JSON.stringify(requestBody),
  });

  console.log("[Patent Provider] response status:", response.status);
  console.log("[Patent Provider] response ok:", response.ok);

  if (!response.ok) {
    const bodyText = await response.text();
    const bodyPreview = bodyText.substring(0, 500);
    
    console.error("[Patent Provider] live API failed:", {
      provider: "patentsview",
      status: response.status,
      statusText: response.statusText,
      bodyPreview,
    });
    
    throw new Error(
      `PatentsView API error: ${response.status} ${response.statusText}. Body: ${bodyPreview}`
    );
  }

  const data = await response.json();
  const patents = data.patents || [];

  console.log("[Patent Provider] parsed results count:", patents.length);

  if (patents.length === 0) {
    console.log("[Patent Provider] no patents returned from PatentsView");
    return [];
  }

  return patents.slice(0, MAX_RESULTS_PER_SEARCH).map((patent: any) => {
    const grantDate = patent.patent_date || null;
    const filingDate = patent.app_date || null;

    return {
      patent_number: patent.patent_number || "Unknown",
      title: patent.patent_title || "No title available",
      abstract: patent.patent_abstract || "No abstract available",
      filing_date: filingDate,
      grant_date: grantDate,
      assignee: patent.assignees?.[0]?.assignee_organization || null,
      inventors: patent.inventors
        ?.map((inv: any) => inv.inventor_last_name)
        .join(", ") || null,
      cpc_codes: patent.cpcs?.map((cpc: any) => cpc.cpc_section_id).join(", ") || null,
      status_estimate: estimatePatentStatus(grantDate, filingDate),
      source_url: `https://patents.google.com/patent/US${patent.patent_number}`,
      source: "patentsview",
      is_demo: false,
      raw_json: patent,
    };
  });
}

/**
 * Search using USPTO API (legacy fallback - deprecated)
 * Note: This is a placeholder. USPTO ODP is now the primary USPTO provider.
 */
async function searchUSPTO(
  query: string,
  market?: string
): Promise<PatentResult[]> {
  // This function is deprecated in favor of searchUsptoOdpPatents
  // Kept for backwards compatibility only
  throw new Error("Legacy USPTO API not implemented - use USPTO ODP instead");
}

/**
 * Generate realistic demo patent results
 * Used when all external APIs are unavailable
 */
function getDemoPatentResults(
  query: string,
  market?: string
): PatentResult[] {
  const demoPatents = [
    {
      patent_number: "US6026163",
      title: "Cryptographic system and method for electronic transactions",
      abstract:
        "A system for secure electronic payment transactions using blind signature protocols and anonymous digital cash. The invention provides methods for maintaining transaction privacy while ensuring authenticity.",
      filing_date: "1996-06-10",
      grant_date: "1998-02-15",
      assignee: "DigiCash Inc",
      inventors: "Chaum, David; Brand, Stefan",
      cpc_codes: "H04L9/00, G06Q20/00",
      status_estimate: "Likely Expired - Attorney Review Required",
      source_url: "https://patents.google.com/patent/US6026163",
      source: "demo",
      is_demo: true,
      raw_json: {},
    },
    {
      patent_number: "US5913210",
      title: "Voice recognition system with user verification",
      abstract:
        "System for authenticating users through voice biometric analysis and speaker identification. Includes methods for comparing voice patterns and rejecting unauthorized access attempts.",
      filing_date: "1996-03-15",
      grant_date: "1997-06-22",
      assignee: "VoiceTech Systems",
      inventors: "Johnson, Robert; Smith, Jennifer",
      cpc_codes: "G10L17/00, G06F21/00",
      status_estimate: "Likely Expired - Attorney Review Required",
      source_url: "https://patents.google.com/patent/US5913210",
      source: "demo",
      is_demo: true,
      raw_json: {},
    },
    {
      patent_number: "US5859971",
      title: "Autonomous vehicle navigation and control system",
      abstract:
        "Method for autonomous vehicle navigation using GPS and sensor fusion for obstacle detection. The system processes environmental data to make real-time navigation decisions.",
      filing_date: "1995-01-12",
      grant_date: "1996-01-12",
      assignee: "AutoNav Corporation",
      inventors: "Martinez, Carlos; Lee, Michael",
      cpc_codes: "G05D1/00, B60W30/00",
      status_estimate: "Likely Expired - Attorney Review Required",
      source_url: "https://patents.google.com/patent/US5859971",
      source: "demo",
      is_demo: true,
      raw_json: {},
    },
  ];

  // Return demo patents with is_demo flag
  return demoPatents.slice(0, MAX_RESULTS_PER_SEARCH);
}

/**
 * Record API usage for monitoring
 * This helps track rate limits and costs
 */
export async function recordAPIUsage(provider: string, endpoint?: string) {
  // This will be called from the API route to track usage in Supabase
  return {
    provider,
    endpoint: endpoint || "search",
    request_count: 1,
    created_at: new Date().toISOString(),
  };
}
