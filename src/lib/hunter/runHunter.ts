/**
 * Opportunity Hunter Runner
 * 
 * Orchestrates automated patent opportunity discovery runs.
 * Rate-limit safe: controlled searches, pre-scoring, limited AI analyses.
 */

import { getSupabaseAdmin } from '../supabaseAdmin';
import { searchPatents } from '../patents/searchPatents';
import { scorePreAiOpportunity, extractBottleneckReason } from './scorePreAiOpportunity';

export interface HunterRunOptions {
  runType: 'manual' | 'daily_scout' | 'weekly_deep';
  name?: string;
  categories: string[];
  minScore: number;
  maxCategories: number;
  maxQueriesPerCategory: number;
  maxResultsPerQuery: number;
  maxAiAnalyses: number;
}

// Predefined queries for each category
const CATEGORY_QUERIES: Record<string, string[]> = {
  'Compute Bottleneck': [
    'distributed computing resource allocation',
    'processor workload scheduling system',
    'memory optimization computing system',
  ],
  'Energy / Grid Bottleneck': [
    'electrical grid control authorization',
    'distributed energy resource management',
    'power system fault detection control',
  ],
  'AI-Agent Control Bottleneck': [
    'software agent authorization system',
    'autonomous agent task execution control',
    'automated decision approval workflow',
  ],
  'Cybersecurity / Data Exfiltration Bottleneck': [
    'data exfiltration prevention system',
    'access control policy enforcement',
    'intrusion prevention authorization',
  ],
  'Digital Identity / Deepfake Trust Bottleneck': [
    'voice authentication system',
    'biometric identity verification',
    'digital identity authorization',
  ],
  'DARPA / Defense Autonomy Bottleneck': [
    'autonomous defense system control',
    'autonomous vehicle command verification',
    'mission safety autonomous system',
  ],
  'Command & Control Authorization Bottleneck': [
    'command authorization system',
    'secure command and control approval',
    'military command verification system',
  ],
  'Drone Swarm / Coordination Bottleneck': [
    'drone swarm coordination system',
    'unmanned aerial vehicle control authorization',
    'swarm communication verification',
  ],
};

export async function runOpportunityHunter(options: HunterRunOptions) {
  const supabase = getSupabaseAdmin();
  
  console.log('[Hunter] Starting run:', options.runType);
  
  // Create run record
  const { data: run, error: runError } = await supabase
    .from('opportunity_hunter_runs')
    .insert({
      run_type: options.runType,
      name: options.name || `${options.runType} - ${new Date().toISOString()}`,
      status: 'running',
      categories: options.categories,
      min_score: options.minScore,
      max_categories: options.maxCategories,
      max_queries_per_category: options.maxQueriesPerCategory,
      max_results_per_query: options.maxResultsPerQuery,
      max_ai_analyses: options.maxAiAnalyses,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (runError || !run) {
    console.error('[Hunter] Failed to create run:', runError);
    throw new Error('Failed to create hunter run');
  }

  const runId = run.id;
  let totalRecordsPulled = 0;
  let totalCandidatesPrescored = 0;
  let totalAnalyzed = 0;
  let totalSaved = 0;
  const allCandidates: any[] = [];

  try {
    // Limit categories
    const categoriesToProcess = options.categories.slice(0, options.maxCategories);

    for (const category of categoriesToProcess) {
      const queries = CATEGORY_QUERIES[category] || [];
      const queriesToUse = queries.slice(0, options.maxQueriesPerCategory);

      for (const query of queriesToUse) {
        // Create task
        const { data: task } = await supabase
          .from('opportunity_hunter_tasks')
          .insert({
            run_id: runId,
            category,
            query,
            status: 'running',
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!task) continue;

        try {
          // Execute search using existing provider
          const searchResult = await searchPatents(query);
          const results = searchResult.results.slice(0, options.maxResultsPerQuery);

          totalRecordsPulled += results.length;
          totalCandidatesPrescored += results.length;

          // Pre-score candidates
          const scored = results.map(result => ({
            ...result,
            category,
            query,
            preAiScore: scorePreAiOpportunity({
              patent_number: result.patent_number,
              title: result.title,
              abstract: result.abstract,
              filing_date: result.filing_date,
              grant_date: result.grant_date,
              status_estimate: result.status_estimate,
              category,
            }),
            bottleneckReason: extractBottleneckReason({
              patent_number: result.patent_number,
              title: result.title,
              abstract: result.abstract,
              filing_date: result.filing_date,
              grant_date: result.grant_date,
              status_estimate: result.status_estimate,
              category,
            }),
          }));

          // Select candidates above threshold
          const candidates = scored.filter(s => s.preAiScore >= 60).sort((a, b) => b.preAiScore - a.preAiScore);
          allCandidates.push(...candidates);

          // Update task
          await supabase
            .from('opportunity_hunter_tasks')
            .update({
              status: 'completed',
              results_count: results.length,
              candidates_selected: candidates.length,
              completed_at: new Date().toISOString(),
            })
            .eq('id', task.id);

        } catch (error) {
          console.error('[Hunter] Task error:', error);
          await supabase
            .from('opportunity_hunter_tasks')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              completed_at: new Date().toISOString(),
            })
            .eq('id', task.id);
        }
      }
    }

    // Select top candidates for AI analysis
    const topCandidates = allCandidates
      .sort((a, b) => b.preAiScore - a.preAiScore)
      .slice(0, options.maxAiAnalyses);

    console.log(`[Hunter] Analyzing top ${topCandidates.length} candidates with AI`);

    // AI analysis would happen here via existing /api/patents/analyze
    // For now, save candidates with pre-AI scores
    for (const candidate of topCandidates) {
      const { data: item } = await supabase
        .from('opportunity_hunter_items')
        .insert({
          run_id: runId,
          category: candidate.category,
          query: candidate.query,
          title: candidate.title,
          patent_number: candidate.patent_number,
          status_estimate: candidate.status_estimate,
          pre_ai_score: candidate.preAiScore,
          bottleneck_reason: candidate.bottleneckReason,
          reason_saved: `Pre-AI score: ${candidate.preAiScore}/100`,
        })
        .select()
        .single();

      if (item) totalSaved++;
    }

    // Update run as completed
    await supabase
      .from('opportunity_hunter_runs')
      .update({
        status: 'completed',
        total_queries: categoriesToProcess.reduce((acc, cat) => acc + Math.min((CATEGORY_QUERIES[cat] || []).length, options.maxQueriesPerCategory), 0),
        total_records_pulled: totalRecordsPulled,
        total_candidates_prescored: totalCandidatesPrescored,
        total_analyzed: totalAnalyzed,
        total_saved: totalSaved,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);

    return {
      runId,
      status: 'completed',
      summary: {
        totalQueries: categoriesToProcess.reduce((acc, cat) => acc + Math.min((CATEGORY_QUERIES[cat] || []).length, options.maxQueriesPerCategory), 0),
        totalRecordsPulled,
        totalCandidatesPrescored,
        totalAnalyzed,
        totalSaved,
      },
    };

  } catch (error) {
    console.error('[Hunter] Run failed:', error);
    
    // Update run as failed
    await supabase
      .from('opportunity_hunter_runs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        total_records_pulled: totalRecordsPulled,
        total_candidates_prescored: totalCandidatesPrescored,
        total_analyzed: totalAnalyzed,
        total_saved: totalSaved,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);

    throw error;
  }
}
