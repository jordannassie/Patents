/**
 * Pre-AI Opportunity Scoring
 * 
 * Scores patents 0-100 before AI analysis to filter candidates.
 * Rewards: old dates, expired status, bottleneck keywords, category relevance
 * Penalizes: recent dates, vague titles, entertainment/games, low-defensibility
 */

interface PatentCandidate {
  patent_number: string;
  title: string;
  abstract: string;
  filing_date: string | null;
  grant_date: string | null;
  status_estimate: string;
  category?: string;
}

// Bottleneck keywords that indicate future constraint relevance
const BOTTLENECK_KEYWORDS = [
  'authorization', 'verification', 'control', 'fraud', 'identity', 'risk',
  'safety', 'secure', 'transaction', 'command', 'policy', 'autonomous',
  'agent', 'biometric', 'wallet', 'approval', 'audit', 'compliance',
  'energy', 'grid', 'compute', 'defense', 'robotics', 'satellite',
  'authentication', 'permission', 'governance', 'coordination', 'trust',
  'prevention', 'detection', 'monitoring', 'encryption', 'cybersecurity',
  'exfiltration', 'intrusion', 'medical', 'diagnostic', 'patient',
  'drone', 'swarm', 'communication', 'signal', 'spacecraft', 'battlefield',
  'logistics', 'triage', 'power', 'distribution', 'resource', 'allocation'
];

// Low-value keywords that suggest not a bottleneck
const LOW_VALUE_KEYWORDS = [
  'game', 'entertainment', 'toy', 'decorative', 'ornamental', 'display',
  'interface design', 'user interface', 'gui', 'graphical interface',
  'advertising', 'promotional', 'marketing', 'social network', 'social media'
];

export function scorePreAiOpportunity(candidate: PatentCandidate): number {
  let score = 50; // Start neutral

  // AGE SCORING (0-30 points)
  const ageScore = scoreByAge(candidate.filing_date, candidate.grant_date);
  score += ageScore;

  // STATUS SCORING (0-15 points)
  const statusScore = scoreByStatus(candidate.status_estimate);
  score += statusScore;

  // KEYWORD RELEVANCE (0-25 points)
  const keywordScore = scoreByKeywords(candidate.title, candidate.abstract);
  score += keywordScore;

  // TITLE QUALITY (0-10 points or -10 for missing)
  const titleScore = scoreByTitle(candidate.title);
  score += titleScore;

  // CATEGORY MATCH (0-10 points)
  const categoryScore = scoreByCategory(candidate.category, candidate.title, candidate.abstract);
  score += categoryScore;

  // PENALTY FOR LOW-VALUE INVENTIONS (-20 points)
  const penaltyScore = penalizeByKeywords(candidate.title, candidate.abstract);
  score += penaltyScore;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreByAge(filingDate: string | null, grantDate: string | null): number {
  const now = new Date();
  let score = 0;

  // Prefer grant date, fall back to filing date
  const dateToUse = grantDate || filingDate;
  if (!dateToUse) return 0;

  const patentDate = new Date(dateToUse);
  const yearsOld = (now.getTime() - patentDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  if (yearsOld >= 25) score += 30; // Very old - likely expired
  else if (yearsOld >= 20) score += 25; // 20+ years - possibly expired
  else if (yearsOld >= 15) score += 20; // 15-20 years - approaching expiration
  else if (yearsOld >= 10) score += 15; // 10-15 years
  else if (yearsOld >= 7) score += 10; // 7-10 years
  else if (yearsOld >= 5) score += 5; // 5-7 years
  // Recent patents score 0 unless highly strategic

  return score;
}

function scoreByStatus(statusEstimate: string): number {
  if (!statusEstimate) return 0;

  const status = statusEstimate.toLowerCase();
  
  if (status.includes('likely expired')) return 15;
  if (status.includes('possibly active')) return 10;
  if (status.includes('abandoned')) return 12;
  if (status.includes('unknown')) return 5;

  return 0;
}

function scoreByKeywords(title: string, abstract: string): number {
  const text = `${title} ${abstract}`.toLowerCase();
  let matchCount = 0;

  for (const keyword of BOTTLENECK_KEYWORDS) {
    if (text.includes(keyword)) {
      matchCount++;
    }
  }

  // Score: 0-25 points based on keyword density
  if (matchCount >= 5) return 25;
  if (matchCount >= 4) return 20;
  if (matchCount >= 3) return 15;
  if (matchCount >= 2) return 10;
  if (matchCount >= 1) return 5;
  
  return 0;
}

function scoreByTitle(title: string): number {
  if (!title || title === 'Unknown' || title === 'Untitled Patent Application') {
    return -10; // Penalty for missing title
  }

  // Reward longer, more descriptive titles
  if (title.length >= 50) return 10;
  if (title.length >= 30) return 5;
  
  return 0;
}

function scoreByCategory(category: string | undefined, title: string, abstract: string): number {
  if (!category) return 0;

  const text = `${title} ${abstract}`.toLowerCase();
  const cat = category.toLowerCase();

  // Check if title/abstract contains category-relevant terms
  if (cat.includes('compute') && (text.includes('compute') || text.includes('processor') || text.includes('resource'))) return 10;
  if (cat.includes('energy') && (text.includes('energy') || text.includes('power') || text.includes('grid'))) return 10;
  if (cat.includes('agent') && (text.includes('agent') || text.includes('autonomous') || text.includes('automated'))) return 10;
  if (cat.includes('cyber') && (text.includes('cyber') || text.includes('security') || text.includes('intrusion'))) return 10;
  if (cat.includes('identity') && (text.includes('identity') || text.includes('biometric') || text.includes('authentication'))) return 10;
  if (cat.includes('robot') && (text.includes('robot') || text.includes('machine') || text.includes('autonomous'))) return 10;
  if (cat.includes('defense') && (text.includes('defense') || text.includes('military') || text.includes('command'))) return 10;
  if (cat.includes('medical') && (text.includes('medical') || text.includes('patient') || text.includes('healthcare'))) return 10;
  if (cat.includes('payment') && (text.includes('payment') || text.includes('transaction') || text.includes('fraud'))) return 10;
  if (cat.includes('crypto') && (text.includes('crypto') || text.includes('blockchain') || text.includes('digital asset'))) return 10;
  if (cat.includes('drone') && (text.includes('drone') || text.includes('unmanned') || text.includes('uav'))) return 10;
  if (cat.includes('space') && (text.includes('satellite') || text.includes('spacecraft') || text.includes('space'))) return 10;

  return 0;
}

function penalizeByKeywords(title: string, abstract: string): number {
  const text = `${title} ${abstract}`.toLowerCase();
  let penalty = 0;

  for (const keyword of LOW_VALUE_KEYWORDS) {
    if (text.includes(keyword)) {
      penalty -= 20; // Harsh penalty for entertainment/games/UI
      break; // Only apply penalty once
    }
  }

  return penalty;
}

export function extractBottleneckReason(candidate: PatentCandidate): string {
  const text = `${candidate.title} ${candidate.abstract}`.toLowerCase();
  
  // Identify primary bottleneck area
  if (text.includes('authorization') || text.includes('approval') || text.includes('permission')) {
    return 'Authorization/approval control bottleneck';
  }
  if (text.includes('fraud') || text.includes('verification') || text.includes('authentication')) {
    return 'Identity verification/fraud prevention bottleneck';
  }
  if (text.includes('security') || text.includes('intrusion') || text.includes('exfiltration')) {
    return 'Cybersecurity/data protection bottleneck';
  }
  if (text.includes('autonomous') || text.includes('agent') || text.includes('automated')) {
    return 'Autonomous system control bottleneck';
  }
  if (text.includes('energy') || text.includes('power') || text.includes('grid')) {
    return 'Energy/grid management bottleneck';
  }
  if (text.includes('robot') || text.includes('drone') || text.includes('machine')) {
    return 'Robotics/autonomous machine safety bottleneck';
  }
  if (text.includes('medical') || text.includes('patient') || text.includes('healthcare')) {
    return 'Healthcare automation/liability bottleneck';
  }
  if (text.includes('command') || text.includes('military') || text.includes('defense')) {
    return 'Defense command/control bottleneck';
  }
  if (text.includes('transaction') || text.includes('payment') || text.includes('wallet')) {
    return 'Transaction verification/fraud bottleneck';
  }
  if (text.includes('compute') || text.includes('processor') || text.includes('resource')) {
    return 'Compute resource allocation bottleneck';
  }
  
  return 'Future market constraint';
}
