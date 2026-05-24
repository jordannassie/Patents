/**
 * Shared AI Patent Opportunity Analysis Helper
 * Extracts analysis logic for reuse across API routes and Hunter workers
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// OpenAI integration (conditionally imported)
let OpenAI: any = null;
try {
  OpenAI = require('openai').default;
} catch {
  console.warn('[Analyze Helper] OpenAI package not found, will use demo mode');
}

export interface PatentAnalysisResult {
  reportId: string;
  opportunity_score: number;
  recommendation: string;
  summary: string;
  modernization_angles: string[];
  isDemo: boolean;
}

/**
 * Analyze a patent opportunity and save the report to Supabase
 * Returns the saved report or reuses existing report
 * 
 * @param patentResultId - UUID of patent_results row
 * @param force - If true, regenerate even if report exists
 * @param category - Optional category for bottleneck-specific analysis
 * @returns Analysis result with report ID and key fields
 */
export async function analyzePatentOpportunity(
  patentResultId: string,
  force: boolean = false,
  category?: string
): Promise<PatentAnalysisResult> {
  const supabase = getSupabaseAdmin();

  // Step 1: Load patent result
  const { data: patentResult, error: patentError } = await supabase
    .from('patent_results')
    .select('*')
    .eq('id', patentResultId)
    .single();

  if (patentError || !patentResult) {
    throw new Error(`Patent result not found: ${patentResultId}`);
  }

  // Step 2: Check if report already exists (unless force=true)
  if (!force) {
    const { data: existingReport } = await supabase
      .from('patent_opportunity_reports')
      .select('*')
      .eq('patent_result_id', patentResultId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingReport) {
      console.log('[Analyze Helper] reusing existing report:', existingReport.id);
      return {
        reportId: existingReport.id,
        opportunity_score: existingReport.opportunity_score,
        recommendation: existingReport.recommendation,
        summary: existingReport.summary,
        modernization_angles: existingReport.modernization_angles || [],
        isDemo: false,
      };
    }
  }

  // Step 3: Generate AI report
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  let reportData;
  let isDemo = false;

  if (hasOpenAIKey && OpenAI) {
    try {
      reportData = await generateOpenAIReport(patentResult, category);
    } catch (error) {
      console.error('[Analyze Helper] OpenAI error:', error);
      reportData = generateDemoReport(patentResult);
      isDemo = true;
    }
  } else {
    reportData = generateDemoReport(patentResult);
    isDemo = true;
  }

  // Step 4: Calculate final opportunity score and recommendation
  const opportunityScore = calculateOpportunityScore(reportData);
  reportData.opportunity_score = opportunityScore;
  reportData.recommendation = getRecommendation(opportunityScore);

  // Step 5: Save report to Supabase
  const { data: savedReport, error: saveError } = await supabase
    .from('patent_opportunity_reports')
    .insert({
      patent_result_id: patentResultId,
      opportunity_score: reportData.opportunity_score,
      future_market_score: reportData.future_market_score,
      ai_upgrade_score: reportData.ai_upgrade_score,
      patentability_score: reportData.patentability_score,
      buildability_score: reportData.buildability_score,
      revenue_score: reportData.revenue_score,
      strategic_fit_score: reportData.strategic_fit_score,
      summary: reportData.summary,
      modernization_angles: reportData.modernization_angles,
      venture_concepts: reportData.venture_concepts,
      new_patent_directions: reportData.new_patent_directions,
      risks: reportData.risks,
      recommendation: reportData.recommendation,
    })
    .select()
    .single();

  if (saveError) {
    throw new Error(`Failed to save opportunity report: ${saveError.message}`);
  }

  console.log('[Analyze Helper] report saved:', savedReport.id);

  return {
    reportId: savedReport.id,
    opportunity_score: savedReport.opportunity_score,
    recommendation: savedReport.recommendation,
    summary: savedReport.summary,
    modernization_angles: savedReport.modernization_angles || [],
    isDemo,
  };
}

/**
 * Generate AI opportunity report using OpenAI
 */
async function generateOpenAIReport(patentResult: any, category?: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = buildAnalysisPrompt(patentResult, category);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an AI patent opportunity analyst and venture strategist specializing in future bottleneck inventions. Return valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(responseText);

  // Map bottleneck-focused scores to database fields
  return {
    future_market_score: parsed.future_bottleneck_score || parsed.market_inevitability_score || parsed.future_market_score || 50,
    ai_upgrade_score: parsed.ai_acceleration_score || parsed.ai_upgrade_score || 50,
    patentability_score: parsed.patentability_upgrade_score || parsed.patentability_score || 50,
    buildability_score: parsed.buildability_score || 50,
    revenue_score: parsed.revenue_potential_score || parsed.licensing_royalty_score || parsed.revenue_score || 50,
    strategic_fit_score: parsed.market_inevitability_score || parsed.infrastructure_dependency_score || parsed.strategic_fit_score || 50,
    summary: parsed.summary || 'Analysis completed.',
    modernization_angles: parsed.modernization_angles || [],
    venture_concepts: parsed.venture_concepts || [],
    new_patent_directions: parsed.new_patent_directions || [],
    risks: parsed.risks || 'Attorney review required before proceeding. This report is not legal advice.',
    defense_relevance: parsed.defense_relevance || null,
    opportunity_score: 0, // Will be calculated
    recommendation: 'RESEARCH MORE', // Will be calculated
  };
}

/**
 * Build the AI analysis prompt with bottleneck focus
 */
function buildAnalysisPrompt(patentResult: any, category?: string): string {
  const categoryContext = category ? `\n\nBottleneck Category: ${category}\nFocus your analysis on how this patent relates to this specific bottleneck.` : '';

  return `You are an AI patent opportunity analyst specializing in identifying future bottleneck inventions.

Your job is to identify whether this old patent maps to a future bottleneck. A bottleneck is an unavoidable constraint that large markets must solve in order to scale.

Core thesis: "PatentBoom finds old inventions that become valuable when the future finally needs them."
${categoryContext}

LOOK FOR CONSTRAINTS CREATED OR INTENSIFIED BY:
- AI growth (compute demand, agent control, identity fraud)
- Automation expansion (robotics safety, command systems, liability)
- Energy demand (grid reliability, power storage, utility control)
- Cybersecurity threats (data exfiltration, attack surfaces)
- Digital identity crisis (deepfakes, synthetic media, fraud)
- Autonomous machines (defense, vehicles, drones, industrial robots)
- Healthcare labor shortages (automation, liability, patient safety)
- Fintech risk (fraud detection, transaction verification, instant settlement)
- Crypto irreversibility (wallet safety, scam prevention, pre-send checks)
- Edge compute demand (trusted execution, hardware security, distributed processing)
- Compliance liability (audit trails, regulatory proof, risk reduction)

DARPA / DEFENSE MODE:
When the category includes "DARPA", "Defense", "Command", "Military", "Battlefield", "Drone Swarm", "Space/Satellite", or "Secure Communications", evaluate dual-use defense potential, DARPA program relevance, SBIR/STTR angles, and government contractor solutions. Focus on: autonomy control, cyber defense, secure command authorization, AI governance, robotics safety, drone coordination, space resilience, battlefield logistics, human-machine teaming, and secure communications. Keep analysis at system/governance/safety/verification level.

Analyze this patent:

Title: ${patentResult.title || 'N/A'}
Patent Number: ${patentResult.patent_number || 'N/A'}
Abstract: ${patentResult.abstract || 'N/A'}
Filing Date: ${patentResult.filing_date || 'N/A'}
Grant Date: ${patentResult.grant_date || 'N/A'}
Assignee: ${patentResult.assignee || 'N/A'}
Status Estimate: ${patentResult.status_estimate || 'Unknown'}

Return valid JSON only with this structure:
{
  "future_bottleneck_score": number (1-100),
  "market_inevitability_score": number (1-100),
  "ai_acceleration_score": number (1-100),
  "patentability_upgrade_score": number (1-100),
  "licensing_royalty_score": number (1-100),
  "buildability_score": number (1-100),
  "infrastructure_dependency_score": number (1-100),
  "summary": string (2-3 sentences: what bottleneck, why too early, why valuable now),
  "modernization_angles": string[] (5-7 ways to modernize),
  "venture_concepts": [{"name": string, "description": string, "target_customer": string, "business_model": string}] (2-3 concepts),
  "new_patent_directions": string[] (4-6 improvement directions),
  "risks": string (risks + attorney review requirement),
  "defense_relevance": {"darpa_relevance": string, "dual_use_potential": string, "government_buyer": string, "commercial_market": string, "proposal_angle": string} | null
}

Rules:
- Do not give legal advice
- Do not claim patentability is guaranteed
- Do not claim the old patent is safe to copy
- Always include "Attorney review required"
- Focus on new improvements, not copying the old patent
- BUILD NOW: strong bottleneck, inevitable demand, clear path
- STRONG WATCH: real bottleneck, needs more research
- RESEARCH MORE: interesting but unclear inevitability
- SKIP: small feature, low defensibility, not a major bottleneck`;
}

/**
 * Generate demo report (fallback)
 */
function generateDemoReport(patentResult: any) {
  return {
    future_market_score: 75,
    ai_upgrade_score: 80,
    patentability_score: 70,
    buildability_score: 65,
    revenue_score: 70,
    strategic_fit_score: 60,
    summary: `This patent describes ${patentResult.title?.toLowerCase() || 'an invention'}. While the original approach was limited by technology of its era, modern AI, cloud infrastructure, and cybersecurity advances create opportunities for significant improvement and new patent directions.`,
    modernization_angles: [
      'Apply modern AI/ML for enhanced decision-making',
      'Implement cloud-native architecture with API-first design',
      'Add real-time cybersecurity monitoring and threat detection',
      'Integrate blockchain for immutable audit trails',
      'Build mobile-first user experience',
      'Add compliance dashboard for regulatory requirements',
      'Implement autonomous agent workflows',
    ],
    venture_concepts: [
      {
        name: 'Enterprise Security Platform',
        description: 'SaaS platform modernizing the core concept with AI-powered risk scoring',
        target_customer: 'Mid-market and enterprise companies',
        business_model: 'Subscription-based with usage tiers',
      },
      {
        name: 'Developer API Service',
        description: 'API-first service enabling developers to integrate the modernized technology',
        target_customer: 'Software developers and tech companies',
        business_model: 'Usage-based pricing with free tier',
      },
    ],
    new_patent_directions: [
      'AI-enhanced method for improving accuracy and reducing false positives',
      'Distributed architecture enabling real-time processing at scale',
      'Novel integration of blockchain for tamper-evident audit trails',
      'Advanced user interface patterns for complex workflow visualization',
      'Hybrid cloud-edge computing approach for latency-sensitive operations',
      'Zero-knowledge proof methods for privacy-preserving verification',
    ],
    risks: 'This is a demo analysis. For production use, configure OPENAI_API_KEY. Attorney review is required before relying on any patent status, patentability assessment, or commercialization strategy. This report is not legal advice.',
    opportunity_score: 0,
    recommendation: 'RESEARCH MORE',
  };
}

/**
 * Calculate weighted opportunity score (bottleneck focus)
 */
function calculateOpportunityScore(reportData: any): number {
  const weights = {
    future_market: 0.35, // Highest: Future bottleneck criticality
    ai_upgrade: 0.15, // AI/automation acceleration
    patentability: 0.15, // New patent defensibility
    buildability: 0.15, // Technical feasibility
    revenue: 0.1, // Revenue/licensing potential
    strategic_fit: 0.1, // Market inevitability
  };

  const score =
    reportData.future_market_score * weights.future_market +
    reportData.ai_upgrade_score * weights.ai_upgrade +
    reportData.patentability_score * weights.patentability +
    reportData.buildability_score * weights.buildability +
    reportData.revenue_score * weights.revenue +
    reportData.strategic_fit_score * weights.strategic_fit;

  return Math.round(score);
}

/**
 * Get recommendation based on opportunity score
 */
function getRecommendation(score: number): string {
  if (score >= 85) return 'BUILD NOW';
  if (score >= 70) return 'STRONG WATCH';
  if (score >= 50) return 'RESEARCH MORE';
  return 'SKIP';
}
