export interface AssessmentQuestion {
  id: number
  question: string
  category: string
}

export const cLevelQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    question: "Our company has a clear digital transformation roadmap.",
    category: "Measures strategic planning."
  },
  {
    id: 2,
    question: "We see digitalization as a long-term competitive advantage.",
    category: "Gauges strategic importance."
  },
  {
    id: 3,
    question: "Our investment decisions consider ROI and long-term impact equally.",
    category: "Balances cost vs value."
  },
  {
    id: 4,
    question: "We have successfully piloted new digital solutions before scaling.",
    category: "Practical proof of readiness."
  },
  {
    id: 5,
    question: "We have budget allocated specifically for digitalization initiatives.",
    category: "Tests financial readiness."
  },
  {
    id: 6,
    question: "We have KPIs in place to measure the impact of digital investments.",
    category: "Shows performance orientation."
  },
  {
    id: 7,
    question: "We leverage advanced engineering tools (e.g., CAD/CAE, PLM) to accelerate product development and reduce time-to-market.",
    category: "Assesses digital engineering maturity"
  },
  {
    id: 8,
    question: "Our cross-functional teams (R&D, manufacturing, operations) collaborate digitally during the early design phase to ensure manufacturability and cost efficiency.",
    category: "Checks integrated engineering and concurrent design maturity"
  },
  {
    id: 9,
    question: "We have vertical integration between our IT and Operational Technology (OT) systems, enabling seamless data flow across ISA-95 levels—from enterprise (Level 4) to plant operations (Level 3) and control systems (Level 2)—to support real-time decision-making and end-to-end digitalization.",
    category: "Assess technology integration"
  },
  {
    id: 10,
    question: "We have a dedicated team or champion for digital transformation.",
    category: "Checks organizational structure"
  },
  {
    id: 11,
    question: "We are willing to change legacy processes that hold us back.",
    category: "Measures change readiness"
  },
  {
    id: 12,
    question: "We are prepared to invest in culture change and training programs.",
    category: "Looks at human factors"
  }
]

export const shopfloorQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    question: "How familiar are your operators with digital tools and technologies?",
    category: "Digital Literacy"
  },
  {
    id: 2,
    question: "What is the current state of your production line automation?",
    category: "Automation"
  },
  {
    id: 3,
    question: "How well do your operators understand Industry 4.0 concepts?",
    category: "Knowledge"
  },
  {
    id: 4,
    question: "What is your current level of real-time data visibility on the shop floor?",
    category: "Data Visibility"
  },
  {
    id: 5,
    question: "How mature is your predictive maintenance program?",
    category: "Maintenance"
  },
  {
    id: 6,
    question: "What is your current level of digital work instructions and training?",
    category: "Training"
  },
  {
    id: 7,
    question: "How well integrated are your quality control systems?",
    category: "Quality"
  },
  {
    id: 8,
    question: "What is your current level of mobile device usage on the shop floor?",
    category: "Mobile Technology"
  },
  {
    id: 9,
    question: "How mature is your energy management and sustainability tracking?",
    category: "Sustainability"
  },
  {
    id: 10,
    question: "What is your current level of cross-functional collaboration on digital initiatives?",
    category: "Collaboration"
  },
  {
    id: 11,
    question: "How well do you track and measure operator performance digitally?",
    category: "Performance Tracking"
  },
  {
    id: 12,
    question: "What is your shop floor's overall readiness for Industry 4.0 implementation?",
    category: "Overall Readiness"
  }
]

export const readinessLevels = {
  c_level: {
    Beginner: { min: 12, max: 24, description: "Basic understanding, needs foundational work" },
    Developing: { min: 25, max: 36, description: "Growing awareness, some initiatives in place" },
    Advanced: { min: 37, max: 48, description: "Strong foundation, actively implementing" },
    Leader: { min: 49, max: 60, description: "Industry leader, driving innovation" }
  },
  shopfloor: {
    Beginner: { min: 12, max: 24, description: "Basic understanding, needs foundational work" },
    Developing: { min: 25, max: 36, description: "Growing awareness, some initiatives in place" },
    Advanced: { min: 37, max: 48, description: "Strong foundation, actively implementing" },
    Leader: { min: 49, max: 60, description: "Industry leader, driving innovation" }
  }
}

export function calculateReadinessLevel(score: number, assessmentType: 'c_level' | 'shopfloor' = 'shopfloor'): 'Beginner' | 'Developing' | 'Advanced' | 'Leader' {
  const levels = readinessLevels[assessmentType]
  
  if (score >= levels.Leader.min) return 'Leader'
  if (score >= levels.Advanced.min) return 'Advanced'
  if (score >= levels.Developing.min) return 'Developing'
  return 'Beginner'
} 