/**
 * USPTO ODP Endpoint Discovery Debug Route
 * GET /api/debug/uspto-endpoints
 *
 * Tests multiple possible USPTO ODP API endpoints to find the correct one.
 * Returns status, response previews, and identifies working endpoints.
 *
 * NEVER returns actual API key values - only true/false for existence.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const usptoKey = process.env.USPTO_API_KEY;
  
  console.log("[USPTO Endpoint Discovery] starting test");
  console.log("[USPTO Endpoint Discovery] USPTO_API_KEY exists:", !!usptoKey);

  if (!usptoKey) {
    return NextResponse.json({
      keyExists: false,
      testedAt: new Date().toISOString(),
      message: "USPTO_API_KEY not configured",
      attempts: [],
    });
  }

  const attempts: any[] = [];
  let firstWorkingEndpoint: any = null;

  // Endpoint candidates to test
  const endpointCandidates = [
    "https://api.uspto.gov/api/v1/patent/applications/search",
    "https://api.uspto.gov/api/v1/patent/application/search",
    "https://api.uspto.gov/api/v1/patent/file-wrapper/search",
    "https://api.uspto.gov/api/v1/patent/file-wrapper/search/search",
    "https://api.uspto.gov/api/v1/patent/application/search/download",
    "https://api.uspto.gov/api/v1/patent/applications/search/download",
    "https://api.uspto.gov/api/v1/patent/applications",
    "https://api.uspto.gov/api/v1/patent/application",
    "https://api.uspto.gov/search/v1/patent",
    "https://api.uspto.gov/api/v1/patents/search",
    "https://api.uspto.gov/api/v1/patent/search",
  ];

  // Body format options to try
  const bodyFormats = [
    {
      name: "criteria",
      body: {
        criteria: [
          {
            field: "inventionTitle",
            operator: "contains",
            value: "blockchain",
          },
        ],
        pagination: {
          offset: 0,
          limit: 5,
        },
      },
    },
    {
      name: "q",
      body: {
        q: "blockchain voting",
        pagination: {
          offset: 0,
          limit: 5,
        },
      },
    },
    {
      name: "q_simple",
      body: {
        q: "blockchain voting",
        rows: 5,
        start: 0,
      },
    },
    {
      name: "search",
      body: {
        search: "blockchain voting",
        limit: 5,
        offset: 0,
      },
    },
  ];

  // Test each endpoint
  for (const url of endpointCandidates) {
    console.log(`[USPTO Endpoint Discovery] testing: ${url}`);

    // Try POST with each body format
    for (const bodyFormat of bodyFormats) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "X-API-KEY": usptoKey,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyFormat.body),
        });

        const bodyText = await response.text();
        const bodyPreview = bodyText.substring(0, 500);
        
        let parsedCount = 0;
        let parsedData: any = null;
        let firstResultKeys: string[] = [];

        try {
          parsedData = JSON.parse(bodyText);
          
          // Try to find results in various possible response structures
          const results = 
            parsedData.response?.docs || 
            parsedData.docs || 
            parsedData.results || 
            parsedData.patents || 
            parsedData.applications ||
            parsedData.data ||
            [];
          
          parsedCount = Array.isArray(results) ? results.length : 0;
          
          if (results.length > 0) {
            firstResultKeys = Object.keys(results[0]);
          }
        } catch (e) {
          // Not JSON or parsing failed
        }

        const attempt = {
          url: url.replace(usptoKey, "[REDACTED]"),
          method: "POST",
          bodyShape: bodyFormat.name,
          status: response.status,
          ok: response.ok,
          bodyPreview,
          parsedCount,
          firstResultKeys: firstResultKeys.length > 0 ? firstResultKeys : null,
        };

        attempts.push(attempt);

        console.log(`[USPTO Endpoint Discovery] ${url} POST ${bodyFormat.name}: ${response.status} ${response.ok ? 'OK' : 'FAIL'} (${parsedCount} results)`);

        // If successful and we found results, mark as working
        if (response.ok && parsedCount > 0 && !firstWorkingEndpoint) {
          firstWorkingEndpoint = {
            url: url.replace(usptoKey, "[REDACTED]"),
            method: "POST",
            bodyShape: bodyFormat.name,
            parsedCount,
            responseStructure: parsedData ? Object.keys(parsedData) : null,
            firstResultKeys,
          };
          console.log(`[USPTO Endpoint Discovery] ✓ WORKING ENDPOINT FOUND: ${url} with ${bodyFormat.name}`);
          // Don't break - let's test all to see all options
        }
      } catch (error) {
        attempts.push({
          url: url.replace(usptoKey, "[REDACTED]"),
          method: "POST",
          bodyShape: bodyFormat.name,
          status: null,
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`[USPTO Endpoint Discovery] ${url} POST ${bodyFormat.name} failed:`, error);
      }
    }

    // Also try GET for endpoints that might support it
    try {
      const getUrl = `${url}?q=blockchain&limit=5`;
      const response = await fetch(getUrl, {
        method: "GET",
        headers: {
          "X-API-KEY": usptoKey,
          "Accept": "application/json",
        },
      });

      const bodyText = await response.text();
      const bodyPreview = bodyText.substring(0, 500);
      
      let parsedCount = 0;
      let parsedData: any = null;
      let firstResultKeys: string[] = [];

      try {
        parsedData = JSON.parse(bodyText);
        const results = 
          parsedData.response?.docs || 
          parsedData.docs || 
          parsedData.results || 
          parsedData.patents || 
          parsedData.applications ||
          parsedData.data ||
          [];
        
        parsedCount = Array.isArray(results) ? results.length : 0;
        
        if (results.length > 0) {
          firstResultKeys = Object.keys(results[0]);
        }
      } catch (e) {
        // Not JSON
      }

      const attempt = {
        url: url.replace(usptoKey, "[REDACTED]"),
        method: "GET",
        bodyShape: "query_string",
        status: response.status,
        ok: response.ok,
        bodyPreview,
        parsedCount,
        firstResultKeys: firstResultKeys.length > 0 ? firstResultKeys : null,
      };

      attempts.push(attempt);

      console.log(`[USPTO Endpoint Discovery] ${url} GET: ${response.status} ${response.ok ? 'OK' : 'FAIL'} (${parsedCount} results)`);

      if (response.ok && parsedCount > 0 && !firstWorkingEndpoint) {
        firstWorkingEndpoint = {
          url: url.replace(usptoKey, "[REDACTED]"),
          method: "GET",
          bodyShape: "query_string",
          parsedCount,
          responseStructure: parsedData ? Object.keys(parsedData) : null,
          firstResultKeys,
        };
        console.log(`[USPTO Endpoint Discovery] ✓ WORKING ENDPOINT FOUND: ${url} with GET`);
      }
    } catch (error) {
      attempts.push({
        url: url.replace(usptoKey, "[REDACTED]"),
        method: "GET",
        bodyShape: "query_string",
        status: null,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error(`[USPTO Endpoint Discovery] ${url} GET failed:`, error);
    }
  }

  return NextResponse.json({
    keyExists: true,
    testedAt: new Date().toISOString(),
    totalAttempts: attempts.length,
    attempts,
    firstWorkingEndpoint,
    summary: {
      totalTested: endpointCandidates.length,
      workingFound: !!firstWorkingEndpoint,
      recommendation: firstWorkingEndpoint 
        ? `Use ${firstWorkingEndpoint.url} with method ${firstWorkingEndpoint.method} and body format ${firstWorkingEndpoint.bodyShape}`
        : "No working endpoint found. Check API key validity or review USPTO API documentation.",
    },
  });
}
