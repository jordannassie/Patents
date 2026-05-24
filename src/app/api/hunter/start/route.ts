/**
 * POST /api/hunter/start
 * Creates a Hunter run and task rows without processing
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getQueriesForCategory } from '@/lib/hunter/categories';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      runType = 'manual',
      name,
      categories = [],
      minScore = 75,
      maxQueriesPerCategory = 2,
      maxResultsPerQuery = 25,
      maxAiAnalyses = 20,
    } = body;

    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    console.log('[Hunter Start] Creating run:', {
      runType,
      categories: categories.length,
      maxQueriesPerCategory,
    });

    // Create run record
    const { data: run, error: runError } = await supabase
      .from('opportunity_hunter_runs')
      .insert({
        run_type: runType,
        name: name || `${runType} - ${new Date().toISOString()}`,
        status: 'running',
        categories: categories,
        min_score: minScore,
        max_queries_per_category: maxQueriesPerCategory,
        max_results_per_query: maxResultsPerQuery,
        max_ai_analyses: maxAiAnalyses,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError || !run) {
      console.error('[Hunter Start] Failed to create run:', runError);
      return NextResponse.json(
        { error: 'Failed to create run', message: runError?.message },
        { status: 500 }
      );
    }

    // Create task rows for each category + query combination
    const tasks: any[] = [];
    for (const category of categories) {
      const queries = getQueriesForCategory(category, maxQueriesPerCategory);
      for (const query of queries) {
        tasks.push({
          run_id: run.id,
          category,
          query,
          status: 'pending',
        });
      }
    }

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: 'No tasks generated for selected categories' },
        { status: 400 }
      );
    }

    const { error: tasksError } = await supabase
      .from('opportunity_hunter_tasks')
      .insert(tasks);

    if (tasksError) {
      console.error('[Hunter Start] Failed to create tasks:', tasksError);
      return NextResponse.json(
        { error: 'Failed to create tasks', message: tasksError.message },
        { status: 500 }
      );
    }

    // Update run with total task count
    await supabase
      .from('opportunity_hunter_runs')
      .update({
        total_tasks: tasks.length,
        pending_tasks: tasks.length,
      })
      .eq('id', run.id);

    console.log('[Hunter Start] Created run with', tasks.length, 'tasks');

    return NextResponse.json({
      runId: run.id,
      taskCount: tasks.length,
      status: 'running',
      message: `Created ${tasks.length} tasks. Use /api/hunter/process-next to process them.`,
    });
  } catch (error) {
    console.error('[Hunter Start] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start hunter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
