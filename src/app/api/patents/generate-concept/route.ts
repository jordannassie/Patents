/**
 * POST /api/patents/generate-concept
 * Generate a $1B patent concept inspired by an old patent and future bottlenecks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// OpenAI integration
let OpenAI: any = null;
try {
  OpenAI = require('openai').default;
} catch {
  console.warn('[Generate Concept] OpenAI package not found');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { patentResultId, force = false } = body;

    if (!patentResultId || typeof patentResultId !== 'string') {
      return NextResponse.json(
        { error: 'patentResultId is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('[Generate Concept] Starting for patent:', patentResultId);

    // Step 1: Load patent result
    const { data: patentResult, error: patentError } = await supabase
      .from('patent_results')
      .select('*')
      .eq('id', patentResultId)
      .single();

    if (patentError || !patentResult) {
      return NextResponse.json(
        { error: 'Patent result not found' },
        { status: 404 }
      );
    }

    // Step 2: Check if concept already exists (unless force=true)
    if (!force) {
      const { data: existingConcept } = await supabase
        .from('patent_concept_reports')
        .select('*')
        .eq('patent_result_id', patentResultId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingConcept) {
        console.log('[Generate Concept] Reusing existing concept:', existingConcept.id);
        return NextResponse.json({
          concept: existingConcept,
          cached: true,
        });
      }
    }

    // Step 3: Load opportunity report (optional context)
    const { data: opportunityReport } = await supabase
      .from('patent_opportunity_reports')
      .select('*')
      .eq('patent_result_id', patentResultId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Step 4: Load hunter item (optional context)
    const { data: hunterItem } = await supabase
      .from('opportunity_hunter_items')
      .select('*')
      .eq('patent_result_id', patentResultId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Step 5: Generate concept with OpenAI
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    let conceptData;
    let isDemo = false;

    if (hasOpenAIKey && OpenAI) {
      try {
        conceptData = await generateOpenAIConcept(
          patentResult,
          opportunityReport,
          hunterItem
        );
      } catch (error) {
        console.error('[Generate Concept] OpenAI error:', error);
        conceptData = generateDemoConcept(patentResult);
        isDemo = true;
      }
    } else {
      conceptData = generateDemoConcept(patentResult);
      isDemo = true;
    }

    // Step 6: Save concept to database
    const { data: savedConcept, error: saveError } = await supabase
      .from('patent_concept_reports')
      .insert({
        patent_result_id: patentResultId,
        opportunity_hunter_item_id: hunterItem?.id || null,
        patent_opportunity_report_id: opportunityReport?.id || null,
        concept_title: conceptData.concept_title,
        bottleneck_solved: conceptData.bottleneck_solved,
        why_now: conceptData.why_now,
        old_invention_insight: conceptData.old_invention_insight,
        new_invention_concept: conceptData.new_invention_concept,
        system_architecture: conceptData.system_architecture,
        ai_upgrade_layers: conceptData.ai_upgrade_layers,
        possible_claim_directions: conceptData.possible_claim_directions,
        venture_concept: conceptData.venture_concept,
        target_customers: conceptData.target_customers,
        billion_dollar_thesis: conceptData.billion_dollar_thesis,
        darpa_relevance: conceptData.darpa_relevance,
        risks: conceptData.risks,
        attorney_review_notes: conceptData.attorney_review_notes,
        provisional_draft_starter: conceptData.provisional_draft_starter,
        overall_score: conceptData.overall_score,
      })
      .select()
      .single();

    if (saveError) {
      console.error('[Generate Concept] Save error:', saveError);
      throw new Error(`Failed to save concept: ${saveError.message}`);
    }

    console.log('[Generate Concept] Concept saved:', savedConcept.id);

    return NextResponse.json({
      concept: savedConcept,
      isDemo,
      cached: false,
    });
  } catch (error) {
    console.error('[Generate Concept] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate concept',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate concept using OpenAI
 */
async function generateOpenAIConcept(
  patentResult: any,
  opportunityReport: any,
  hunterItem: any
) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = buildConceptPrompt(patentResult, opportunityReport, hunterItem);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are an elite patent strategist, deep-tech venture analyst, and future bottleneck researcher. Return valid JSON only. Do NOT claim old patents are safe to copy. Do NOT guarantee patentability. Always require attorney review.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(responseText);

  // Generate provisional draft starter from concept data
  const provisionalDraftStarter = {
    field_of_invention: `This invention relates to ${parsed.bottleneck_solved || 'a new system and method'}.`,
    problem: parsed.why_now || 'Description of problem',
    summary_of_invention: parsed.new_invention_concept || 'Summary of new invention',
    key_components: parsed.system_architecture || [],
    method_flow: parsed.ai_upgrade_layers || [],
    claim_themes: parsed.possible_claim_directions || [],
    commercial_uses: parsed.target_customers || [],
  };

  return {
    ...parsed,
    provisional_draft_starter: provisionalDraftStarter,
  };
}

/**
 * Build the OpenAI prompt
 */
function buildConceptPrompt(
  patentResult: any,
  opportunityReport: any,
  hunterItem: any
): string {
  return `You are an elite patent strategist, deep-tech venture analyst, and future bottleneck researcher.

Your task is NOT to copy the old patent. Your task is to use the old patent/application as prior-art inspiration and identify a NEW, modern, non-obvious improvement direction that could become a patent-backed venture.

Analyze this information:

Patent/Application:
Title: ${patentResult.title || 'N/A'}
Patent/Application Number: ${patentResult.patent_number || 'N/A'}
Abstract: ${patentResult.abstract || 'N/A'}
Filing Date: ${patentResult.filing_date || 'N/A'}
Grant Date: ${patentResult.grant_date || 'N/A'}
Assignee: ${patentResult.assignee || 'N/A'}
Inventors: ${patentResult.inventors || 'N/A'}
CPC Codes: ${patentResult.cpc_codes || 'N/A'}
Status Estimate: ${patentResult.status_estimate || 'Unknown'}

${hunterItem ? `
Hunter Context:
Category: ${hunterItem.category}
Query: ${hunterItem.query}
Pre-AI Score: ${hunterItem.pre_ai_score}
Opportunity Score: ${hunterItem.opportunity_score}
Bottleneck Reason: ${hunterItem.bottleneck_reason}
Modernization Angle: ${hunterItem.modernization_angle}
` : ''}

${opportunityReport ? `
Existing AI Opportunity Report:
Summary: ${opportunityReport.summary}
Modernization Angles: ${JSON.stringify(opportunityReport.modernization_angles)}
Venture Concepts: ${JSON.stringify(opportunityReport.venture_concepts)}
New Patent Directions: ${JSON.stringify(opportunityReport.new_patent_directions)}
Risks: ${opportunityReport.risks}
` : ''}

Return valid JSON only with this structure:

{
  "concept_title": "string - catchy title for the new patent concept",
  "bottleneck_solved": "string - what future bottleneck this solves",
  "why_now": "string - why this is valuable now (2-3 sentences)",
  "old_invention_insight": "string - what was useful about the old invention",
  "new_invention_concept": "string - the NEW non-obvious improvement (3-4 sentences)",
  "system_architecture": [
    {
      "component": "string",
      "function": "string",
      "why_it_matters": "string"
    }
  ],
  "ai_upgrade_layers": [
    {
      "layer": "string",
      "description": "string"
    }
  ],
  "possible_claim_directions": [
    {
      "claim_direction": "string",
      "description": "string",
      "novelty_angle": "string"
    }
  ],
  "venture_concept": {
    "name": "string",
    "description": "string",
    "business_model": "string",
    "pricing_or_revenue_model": "string"
  },
  "target_customers": [
    {
      "customer": "string",
      "why_they_need_it": "string"
    }
  ],
  "billion_dollar_thesis": "string - why this could be $1B+ (2-3 sentences)",
  "darpa_relevance": "string - defense/DARPA applications if relevant, else null",
  "risks": "string - technical risks, market risks, legal risks",
  "attorney_review_notes": "string - always say 'Attorney review required before filing. This is not legal advice.'",
  "overall_score": number (1-100)
}

Rules:
- Do not say the old patent is safe to copy.
- Do not guarantee patentability.
- Do not give legal advice.
- Always include attorney review required.
- The new concept must be a NEW improvement, not a restatement of the old patent.
- Prioritize future bottlenecks: AI agents, cyber defense, digital identity, crypto transaction safety, fintech fraud, defense autonomy, robotics, energy/grid, compute, healthcare liability, compliance/audit, space/satellite resilience.
- Prefer $1B+ potential: infrastructure, enterprise, government, regulated markets, mission-critical workflows, unavoidable constraints, high-liability environments, network effects, licensing/royalty potential.
- Avoid small consumer apps, generic features, content tools, and low-defensibility ideas.
- For defense categories, stay at safety, authorization, governance, command verification, resilience, logistics, cyber defense, and human-machine teaming level. Do not provide weapon construction, targeting, or harmful operational instructions.`;
}

/**
 * Generate demo concept (fallback)
 */
function generateDemoConcept(patentResult: any) {
  const provisionalDraftStarter = {
    field_of_invention: 'This invention relates to modern AI-powered systems and methods.',
    problem: 'Legacy systems lack real-time AI capabilities and scalable architecture.',
    summary_of_invention: 'A novel system combining AI, cloud infrastructure, and security.',
    key_components: [
      { component: 'AI Engine', function: 'Real-time analysis', why_it_matters: 'Enables automation' },
    ],
    method_flow: [
      { layer: 'Input Layer', description: 'Receives data from multiple sources' },
    ],
    claim_themes: [
      { claim_direction: 'AI-enhanced method', description: 'Novel use of AI', novelty_angle: 'Real-time processing' },
    ],
    commercial_uses: [
      { customer: 'Enterprise companies', why_they_need_it: 'Scalability and security' },
    ],
  };

  return {
    concept_title: `AI-Powered ${patentResult.title || 'System'} Platform`,
    bottleneck_solved: 'Scaling modern AI systems in mission-critical environments',
    why_now: 'AI adoption is accelerating, creating demand for secure, scalable infrastructure. This is a demo concept. Configure OPENAI_API_KEY for production.',
    old_invention_insight: `The original invention (${patentResult.title}) identified key workflow patterns that are now bottlenecks in AI-era systems.`,
    new_invention_concept: 'A new system architecture that modernizes the core concept with AI agents, real-time cloud processing, cybersecurity verification, and compliance dashboards.',
    system_architecture: [
      { component: 'AI Decision Engine', function: 'Real-time risk scoring', why_it_matters: 'Automation at scale' },
      { component: 'Blockchain Audit Trail', function: 'Immutable record keeping', why_it_matters: 'Compliance' },
      { component: 'Zero-Trust Security Layer', function: 'Identity verification', why_it_matters: 'Defense-grade security' },
    ],
    ai_upgrade_layers: [
      { layer: 'AI Agent Layer', description: 'Autonomous workflow orchestration' },
      { layer: 'Cloud-Native API Layer', description: 'Scalable microservices architecture' },
      { layer: 'Compliance Dashboard Layer', description: 'Real-time regulatory reporting' },
    ],
    possible_claim_directions: [
      { claim_direction: 'AI-enhanced method for real-time processing', description: 'Novel AI integration', novelty_angle: 'Real-time bottleneck resolution' },
      { claim_direction: 'Distributed architecture with blockchain', description: 'Immutable audit trails', novelty_angle: 'Tamper-evident compliance' },
      { claim_direction: 'Zero-knowledge verification system', description: 'Privacy-preserving identity', novelty_angle: 'Novel cryptographic approach' },
    ],
    venture_concept: {
      name: 'Enterprise Security Platform',
      description: 'SaaS platform for AI-powered risk management',
      business_model: 'Subscription-based with usage tiers',
      pricing_or_revenue_model: 'Per-seat pricing + API usage fees',
    },
    target_customers: [
      { customer: 'Fortune 500 companies', why_they_need_it: 'Regulatory compliance and liability reduction' },
      { customer: 'Government agencies', why_they_need_it: 'Mission-critical security requirements' },
      { customer: 'Financial institutions', why_they_need_it: 'Fraud prevention and audit trails' },
    ],
    billion_dollar_thesis: 'As AI and automation expand, enterprises need secure, compliant infrastructure. This creates a $1B+ market opportunity for patent-protected platform solutions.',
    darpa_relevance: 'Relevant for defense autonomy, command verification, and cyber resilience programs.',
    risks: 'This is a demo analysis. Configure OPENAI_API_KEY for production. Technical risks: integration complexity. Market risks: competition from incumbents. Legal risks: freedom-to-operate analysis required.',
    attorney_review_notes: 'Attorney review required before filing. This is not legal advice. Patentability, freedom to operate, and infringement risk must be assessed by a qualified patent attorney.',
    provisional_draft_starter: provisionalDraftStarter,
    overall_score: 75,
  };
}
