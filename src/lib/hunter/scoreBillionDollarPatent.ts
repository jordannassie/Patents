/**
 * $1B Patent Hunter Scoring Helper
 * Evaluates patents for billion-dollar venture potential based on future bottlenecks
 */

export interface BillionDollarScore {
  billion_dollar_score: number;
  future_bottleneck_score: number;
  market_inevitability_score: number;
  ai_upgrade_score: number;
  scarcity_chokepoint_score: number;
  buyer_demand_score: number;
  regulatory_pressure_score: number;
  patentability_upgrade_score: number;
  licensing_royalty_score: number;
  buildability_score: number;
  status_quality_score: number;
  reason: string;
  verdict: 'TOP_TARGET' | 'STRONG_CANDIDATE' | 'WATCH' | 'SKIP';
}

interface ScoreInput {
  patent_result: any;
  hunter_context?: any;
  ai_report?: any;
}

/**
 * Score a patent for $1B+ venture potential
 */
export function scoreBillionDollarPatent(input: ScoreInput): BillionDollarScore {
  const { patent_result, hunter_context, ai_report } = input;

  // Extract key data
  const title = (patent_result.title || '').toLowerCase();
  const abstract = (patent_result.abstract || '').toLowerCase();
  const category = hunter_context?.category || '';
  const status = patent_result.status_estimate || '';
  const filingDate = patent_result.filing_date;
  const grantDate = patent_result.grant_date;

  // Calculate individual scores
  const futureBottleneck = scoreFutureBottleneck(title, abstract, category);
  const marketInevitability = scoreMarketInevitability(title, abstract, category, ai_report);
  const aiUpgrade = scoreAiUpgrade(title, abstract, category, ai_report);
  const scarcityChokepoint = scoreScarcityChokepoint(title, abstract, category);
  const buyerDemand = scoreBuyerDemand(title, abstract, category);
  const regulatoryPressure = scoreRegulatoryPressure(title, abstract, category);
  const patentabilityUpgrade = scorePatentabilityUpgrade(title, abstract, filingDate, grantDate);
  const licensingRoyalty = scoreLicensingRoyalty(title, abstract, category);
  const buildability = scoreBuildability(title, abstract, category);
  const statusQuality = scoreStatusQuality(status, filingDate, grantDate);

  // Weighted average for final billion-dollar score
  const weights = {
    futureBottleneck: 0.25, // Highest weight
    marketInevitability: 0.20,
    aiUpgrade: 0.15,
    scarcityChokepoint: 0.10,
    buyerDemand: 0.10,
    regulatoryPressure: 0.05,
    patentabilityUpgrade: 0.05,
    licensingRoyalty: 0.05,
    buildability: 0.03,
    statusQuality: 0.02,
  };

  const billionDollarScore = Math.round(
    futureBottleneck * weights.futureBottleneck +
    marketInevitability * weights.marketInevitability +
    aiUpgrade * weights.aiUpgrade +
    scarcityChokepoint * weights.scarcityChokepoint +
    buyerDemand * weights.buyerDemand +
    regulatoryPressure * weights.regulatoryPressure +
    patentabilityUpgrade * weights.patentabilityUpgrade +
    licensingRoyalty * weights.licensingRoyalty +
    buildability * weights.buildability +
    statusQuality * weights.statusQuality
  );

  // Determine verdict
  let verdict: 'TOP_TARGET' | 'STRONG_CANDIDATE' | 'WATCH' | 'SKIP';
  if (billionDollarScore >= 90) verdict = 'TOP_TARGET';
  else if (billionDollarScore >= 80) verdict = 'STRONG_CANDIDATE';
  else if (billionDollarScore >= 70) verdict = 'WATCH';
  else verdict = 'SKIP';

  // Generate reason
  const reason = generateReason(verdict, {
    futureBottleneck,
    marketInevitability,
    aiUpgrade,
    scarcityChokepoint,
    buyerDemand,
    category,
  });

  return {
    billion_dollar_score: billionDollarScore,
    future_bottleneck_score: futureBottleneck,
    market_inevitability_score: marketInevitability,
    ai_upgrade_score: aiUpgrade,
    scarcity_chokepoint_score: scarcityChokepoint,
    buyer_demand_score: buyerDemand,
    regulatory_pressure_score: regulatoryPressure,
    patentability_upgrade_score: patentabilityUpgrade,
    licensing_royalty_score: licensingRoyalty,
    buildability_score: buildability,
    status_quality_score: statusQuality,
    reason,
    verdict,
  };
}

/**
 * Score: Future Bottleneck - Does this solve an unavoidable future constraint?
 */
function scoreFutureBottleneck(title: string, abstract: string, category: string): number {
  let score = 50;

  // High-value bottleneck categories
  const bottleneckCategories = [
    'compute', 'energy', 'grid', 'ai agent', 'autonomous', 'cybersecurity',
    'digital identity', 'deepfake', 'fraud', 'crypto', 'transaction',
    'defense', 'darpa', 'robotics', 'healthcare', 'liability', 'compliance',
    'audit', 'space', 'satellite'
  ];

  if (bottleneckCategories.some(term => category.toLowerCase().includes(term))) {
    score += 20;
  }

  // Bottleneck keywords in title/abstract
  const bottleneckKeywords = [
    'authorization', 'verification', 'authentication', 'identity', 'security',
    'control', 'command', 'safety', 'risk', 'fraud', 'trust', 'integrity',
    'audit', 'compliance', 'liability', 'governance', 'policy', 'enforcement',
    'autonomous', 'agent', 'coordination', 'swarm', 'distributed', 'resilience',
    'energy', 'power', 'grid', 'compute', 'processing', 'latency', 'real-time'
  ];

  const matchCount = bottleneckKeywords.filter(keyword => 
    title.includes(keyword) || abstract.includes(keyword)
  ).length;

  score += Math.min(matchCount * 3, 30);

  return Math.min(score, 100);
}

/**
 * Score: Market Inevitability - Will the world almost certainly need this solved?
 */
function scoreMarketInevitability(title: string, abstract: string, category: string, aiReport: any): number {
  let score = 50;

  // Use AI report future market score if available
  if (aiReport?.future_market_score) {
    score = aiReport.future_market_score * 0.7 + score * 0.3;
  }

  // Infrastructure/platform keywords
  const infrastructureKeywords = [
    'system', 'method', 'platform', 'network', 'infrastructure', 'framework',
    'protocol', 'standard', 'interface', 'layer', 'architecture'
  ];

  if (infrastructureKeywords.some(keyword => title.includes(keyword) || abstract.includes(keyword))) {
    score += 15;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Score: AI Upgrade - Can AI/cloud/API/automation make this far more valuable now?
 */
function scoreAiUpgrade(title: string, abstract: string, category: string, aiReport: any): number {
  let score = 50;

  // Use AI report score if available
  if (aiReport?.ai_upgrade_score) {
    return aiReport.ai_upgrade_score;
  }

  // AI-upgradeable patterns
  const aiUpgradeKeywords = [
    'decision', 'classification', 'detection', 'prediction', 'recognition',
    'matching', 'scoring', 'analysis', 'monitoring', 'optimization'
  ];

  if (aiUpgradeKeywords.some(keyword => title.includes(keyword) || abstract.includes(keyword))) {
    score += 25;
  }

  // Automation potential
  const automationKeywords = ['manual', 'operator', 'user', 'administrator'];
  if (automationKeywords.some(keyword => abstract.includes(keyword))) {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Score: Scarcity/Chokepoint - Near critical infrastructure?
 */
function scoreScarcityChokepoint(title: string, abstract: string, category: string): number {
  let score = 40;

  const chokepointDomains = [
    'payment', 'transaction', 'financial', 'money', 'currency', 'wallet',
    'identity', 'credential', 'certificate', 'key', 'signature',
    'energy', 'power', 'grid', 'utility',
    'compute', 'processor', 'memory', 'storage',
    'network', 'bandwidth', 'latency', 'throughput',
    'defense', 'military', 'weapon', 'missile', 'command',
    'healthcare', 'patient', 'medical', 'hospital', 'drug',
    'data', 'database', 'record', 'information'
  ];

  const matchCount = chokepointDomains.filter(term =>
    title.includes(term) || abstract.includes(term)
  ).length;

  score += Math.min(matchCount * 10, 50);

  return Math.min(score, 100);
}

/**
 * Score: Buyer Demand - Would enterprises/governments/banks pay for this?
 */
function scoreBuyerDemand(title: string, abstract: string, category: string): number {
  let score = 50;

  // Enterprise/government buyer keywords
  const buyerKeywords = [
    'enterprise', 'government', 'military', 'defense', 'bank', 'financial',
    'hospital', 'healthcare', 'insurance', 'compliance', 'regulatory',
    'critical', 'mission-critical', 'secure', 'certified'
  ];

  if (buyerKeywords.some(keyword => title.includes(keyword) || abstract.includes(keyword))) {
    score += 30;
  }

  // B2B patterns
  if (abstract.includes('system') || abstract.includes('method') || abstract.includes('process')) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Score: Regulatory Pressure - Does liability/safety/compliance make this urgent?
 */
function scoreRegulatoryPressure(title: string, abstract: string, category: string): number {
  let score = 40;

  const regulatoryKeywords = [
    'compliance', 'regulation', 'safety', 'liability', 'audit', 'certified',
    'approved', 'standard', 'requirement', 'mandatory', 'legal', 'law',
    'privacy', 'security', 'protected', 'confidential', 'encrypted'
  ];

  const matchCount = regulatoryKeywords.filter(keyword =>
    title.includes(keyword) || abstract.includes(keyword)
  ).length;

  score += Math.min(matchCount * 8, 40);

  return Math.min(score, 100);
}

/**
 * Score: Patentability Upgrade - Room for NEW modern improvement?
 */
function scorePatentabilityUpgrade(title: string, abstract: string, filingDate: any, grantDate: any): number {
  let score = 60;

  // Older patents have more room for modern improvements
  const year = grantDate ? new Date(grantDate).getFullYear() : 
                filingDate ? new Date(filingDate).getFullYear() : 2020;
  const age = 2026 - year;

  if (age >= 20) score += 30;
  else if (age >= 15) score += 20;
  else if (age >= 10) score += 10;

  return Math.min(score, 100);
}

/**
 * Score: Licensing/Royalty - Could this become infrastructure/standard?
 */
function scoreLicensingRoyalty(title: string, abstract: string, category: string): number {
  let score = 40;

  const licensingKeywords = [
    'standard', 'protocol', 'interface', 'api', 'platform', 'framework',
    'method', 'process', 'algorithm', 'technique', 'approach'
  ];

  if (licensingKeywords.some(keyword => title.includes(keyword) || abstract.includes(keyword))) {
    score += 30;
  }

  return Math.min(score, 100);
}

/**
 * Score: Buildability - Can MVP be built with software/API/AI?
 */
function scoreBuildability(title: string, abstract: string, category: string): number {
  let score = 60;

  // Software-centric patterns
  const softwareKeywords = [
    'software', 'algorithm', 'method', 'process', 'system', 'computer',
    'processor', 'network', 'data', 'information', 'signal', 'communication'
  ];

  if (softwareKeywords.some(keyword => title.includes(keyword) || abstract.includes(keyword))) {
    score += 20;
  }

  // Penalize heavy hardware requirements
  const hardwareKeywords = ['device', 'apparatus', 'equipment', 'machine', 'tool'];
  if (hardwareKeywords.some(keyword => title.includes(keyword))) {
    score -= 10;
  }

  return Math.max(Math.min(score, 100), 30);
}

/**
 * Score: Status Quality - Older/likely expired gets higher score
 */
function scoreStatusQuality(status: string, filingDate: any, grantDate: any): number {
  let score = 50;

  const statusLower = status.toLowerCase();

  if (statusLower.includes('likely expired') || statusLower.includes('expired')) {
    score += 40;
  } else if (statusLower.includes('abandoned')) {
    score += 35;
  } else if (statusLower.includes('unclear') || statusLower.includes('unknown')) {
    score += 20;
  } else if (statusLower.includes('active')) {
    score -= 20; // Active patents are less attractive unless highly strategic
  }

  return Math.max(Math.min(score, 100), 10);
}

/**
 * Generate human-readable reason for verdict
 */
function generateReason(
  verdict: string,
  scores: {
    futureBottleneck: number;
    marketInevitability: number;
    aiUpgrade: number;
    scarcityChokepoint: number;
    buyerDemand: number;
    category: string;
  }
): string {
  const { futureBottleneck, marketInevitability, aiUpgrade, scarcityChokepoint, buyerDemand, category } = scores;

  const topScores = [
    { name: 'future bottleneck', score: futureBottleneck },
    { name: 'market inevitability', score: marketInevitability },
    { name: 'AI upgrade potential', score: aiUpgrade },
    { name: 'scarcity/chokepoint', score: scarcityChokepoint },
    { name: 'buyer demand', score: buyerDemand },
  ].sort((a, b) => b.score - a.score).slice(0, 2);

  if (verdict === 'TOP_TARGET') {
    return `Exceptional ${topScores[0].name} (${topScores[0].score}) and ${topScores[1].name} (${topScores[1].score}). Strong $1B+ potential in ${category || 'this category'}.`;
  } else if (verdict === 'STRONG_CANDIDATE') {
    return `High ${topScores[0].name} (${topScores[0].score}). Promising $1B opportunity in ${category || 'this space'}.`;
  } else if (verdict === 'WATCH') {
    return `Moderate ${topScores[0].name} (${topScores[0].score}). Worth monitoring for ${category || 'this sector'}.`;
  } else {
    return `Limited bottleneck value or market potential. Lower priority for $1B ventures.`;
  }
}
