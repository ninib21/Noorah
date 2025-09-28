export interface PricingCategory {
  title: string;
  items: string[];
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  billing: string;
  description: string;
  cta: string;
  popular?: boolean;
  color: string;
  categories: PricingCategory[];
  includesUpTo: number[];
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'aurora-core',
    name: 'Aurora Core',
    price: '$49',
    billing: 'per household / month',
    description: 'Signature Noorah AI matching, real-time verification, and mission-critical scheduling.',
    cta: 'Start with Aurora Core',
    color: 'rgba(124, 58, 237, 0.65)',
    includesUpTo: [1, 10],
    categories: [
      {
        title: 'Core Experience',
        items: [
          'AI Sitter–Parent Matching Engine 2.0',
          'Real-time background verification + biometric ID',
          'Escrow-based payment vault with blockchain receipts',
          'Dynamic sitter intelligence & trust scoring',
          'Auto-generated parent & sitter digital contracts',
          'Panic / SOS button with EMS escalation',
          'AI-powered scheduling assistant with calendar sync',
          'Smart invoicing with instant PDF receipts',
          'Liability insurance integration',
          'Live GPS sitter tracking with geofence alerts',
        ],
      },
      {
        title: 'Security Baseline',
        items: [
          'Zero trust login architecture + MFA',
          'Geo-fenced session locks for sitter devices',
          'Post-quantum encrypted messaging & calls',
          'Tamper-proof attendance logs on blockchain',
        ],
      },
    ],
  },
  {
    id: 'nebula-pro',
    name: 'Nebula Pro',
    price: '$129',
    billing: 'per household / month',
    description: 'Guardian AI trust stack, proactive wellness, and immersive parent control.',
    cta: 'Upgrade to Nebula Pro',
    popular: true,
    color: 'rgba(14, 165, 233, 0.65)',
    includesUpTo: [1, 30],
    categories: [
      {
        title: 'Trust & Safety',
        items: [
          'Guardian AI monitoring agent with consent-based sensors',
          'Fraud detection AI for identity spoofing & duplicate profiles',
          'Secure live video check-ins for parents',
          'Digital heirloom capture for milestones & creative moments',
          'Facial recognition for secure pickup authorization',
          'Child wellness monitoring with optional sensor kit',
          'Parent–child codeword safety system',
          'AI mood analyzer for stress & emotional shifts',
        ],
      },
      {
        title: 'Experience Upgrades',
        items: [
          '3D sitter avatars & interactive intros',
          'Augmented reality parent check-ins',
          'AI babysitting coach with real-time suggestions',
          'Instant multilingual translation (voice + text)',
          'Child learning journal with gamified tracking',
          'Sitter reputation passport (blockchain verified)',
          'Gamified activity playlists for kids',
          'Cultural sensitivity AI for tailored care plans',
          'Optional health/DNA informed sitter matching',
          'Dynamic skill badges verified by AI',
        ],
      },
    ],
  },
  {
    id: 'quantum-elite',
    name: 'Quantum Elite',
    price: '$349',
    billing: 'per household / month',
    description: 'Enterprise-grade automation, predictive care analytics, and multisite coordination.',
    cta: 'Command with Quantum Elite',
    color: 'rgba(236, 72, 153, 0.6)',
    includesUpTo: [1, 45],
    categories: [
      {
        title: 'Security Command Center',
        items: [
          'Stealth mode document vaults',
          'Biometric voice + face + palm logins',
          'Blockchain audit trail for every interaction',
          'AI threat response & auto session lockdowns',
          'Poison pill data protection for intrusions',
          'Multi-signature sitter unlock workflows',
          'Dead man’s switch with interval alerts',
        ],
      },
      {
        title: 'Enterprise & Agency Ops',
        items: [
          'White-label agency mode with custom branding',
          'District & school partnership support',
          'Smart contracts for automated sitter payroll',
          'Donation wallet integration for social impact',
          'Corporate childcare subsidies & benefits',
          'VR babysitting interviews & simulations',
          'Predictive child development analytics',
          'Family dashboard with AI-driven insights',
          'Multi-child / multi-site care orchestration',
          'AI life event tracker for contextual recommendations',
        ],
      },
    ],
  },
  {
    id: 'unicorn-infinity',
    name: 'Unicorn Infinity',
    price: 'Let’s co-create',
    billing: 'custom transformation retainer',
    description: 'Noorah’s moonshot lab for generational childcare intelligence and holographic experiences.',
    cta: 'Summon Unicorn Lab',
    color: 'rgba(245, 158, 11, 0.6)',
    includesUpTo: [1, 60],
    categories: [
      {
        title: 'Avant-Garde Intelligence',
        items: [
          'Quantum babysitting simulation engine',
          'AI parenting style matcher for philosophy alignment',
          'Child personality digital twin modelling',
          'Emotion-aware narration & bedtime storytelling',
          'NFT milestone memory minting for families',
          'AI dream guardian sleep companion',
        ],
      },
      {
        title: 'Immersive Realities',
        items: [
          'Holographic play mode with AR environments',
          'Eco-balance sitter guidance for sustainable care',
          'AI peer sitter network with verified relief sitters',
          'Generational family vault for 100-year memory keeping',
        ],
      },
    ],
  },
];
