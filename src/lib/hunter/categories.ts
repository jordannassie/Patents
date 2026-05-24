/**
 * Bottleneck Categories and Query Templates
 */

export const BOTTLENECK_CATEGORIES = [
  'Compute Bottleneck',
  'Energy / Grid Bottleneck',
  'AI-Agent Control Bottleneck',
  'Cybersecurity / Data Exfiltration Bottleneck',
  'Digital Identity / Deepfake Trust Bottleneck',
  'Robotics Safety Bottleneck',
  'Defense Autonomy / Command Bottleneck',
  'DARPA / Defense Autonomy Bottleneck',
  'Command & Control Authorization Bottleneck',
  'Drone Swarm / Coordination Bottleneck',
  'Human-Machine Teaming Bottleneck',
  'Space / Satellite Resilience Bottleneck',
  'Healthcare Labor / Liability Bottleneck',
  'Payments / Fraud Bottleneck',
  'Crypto Irreversible Transaction Bottleneck',
  'Semiconductor / Edge Compute Bottleneck',
  'Compliance / Audit / Liability Bottleneck',
];

// Query templates for each category
export const CATEGORY_QUERY_TEMPLATES: Record<string, string[]> = {
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
  'Robotics Safety Bottleneck': [
    'robot safety verification system',
    'autonomous robot control authorization',
    'robotic system fault detection',
  ],
  'Defense Autonomy / Command Bottleneck': [
    'autonomous defense system control',
    'autonomous vehicle command verification',
    'mission safety autonomous system',
  ],
  'DARPA / Defense Autonomy Bottleneck': [
    'military autonomous system authorization',
    'defense command and control verification',
    'tactical decision approval system',
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
  'Human-Machine Teaming Bottleneck': [
    'human machine interface authorization',
    'collaborative robot control system',
    'human approval automated system',
  ],
  'Space / Satellite Resilience Bottleneck': [
    'satellite communication control system',
    'spacecraft command authorization',
    'orbital system fault detection',
  ],
  'Healthcare Labor / Liability Bottleneck': [
    'medical automation liability system',
    'healthcare decision authorization',
    'patient safety automated system',
  ],
  'Payments / Fraud Bottleneck': [
    'payment transaction authorization',
    'fraud detection prevention system',
    'transaction verification control',
  ],
  'Crypto Irreversible Transaction Bottleneck': [
    'blockchain transaction authorization',
    'cryptocurrency wallet control system',
    'digital asset verification',
  ],
  'Semiconductor / Edge Compute Bottleneck': [
    'edge computing resource allocation',
    'semiconductor device control system',
    'distributed processing authorization',
  ],
  'Compliance / Audit / Liability Bottleneck': [
    'compliance verification system',
    'audit trail authorization control',
    'regulatory approval automated system',
  ],
};

export function getQueriesForCategory(category: string, maxQueries: number): string[] {
  const templates = CATEGORY_QUERY_TEMPLATES[category] || [];
  return templates.slice(0, maxQueries);
}
