'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'

interface ReadinessActionPlanProps {
  readinessLevel: 'Beginner' | 'Developing' | 'Advanced' | 'Leader'
}

const readinessActionPlans = {
  Beginner: {
    title: "Your Readiness Level: Beginner",
    meaning: "Your organization is at the early stage of digital readiness. Foundational elements like clear strategy, leadership awareness, budget, and data basics may be missing or not formalized.",
    nextSteps: [
      "Create a simple, phased digital roadmap (1–3 years).",
      "Appoint a digital champion or team.",
      "Allocate a small budget for pilot projects.",
      "Run leadership workshops on Industry 4.0 basics.",
      "Start a low-risk pilot (e.g., predictive maintenance).",
      "Assess your data quality and security.",
      "Communicate clearly with employees about why digitalization matters."
    ]
  },
  Developing: {
    title: "Your Readiness Level: Developing",
    meaning: "You have some digital initiatives in place but they may be isolated or limited in scale. You're still developing your internal capabilities and your overall approach.",
    nextSteps: [
      "Expand successful pilots into larger rollouts.",
      "Formalize your digital transformation roadmap.",
      "Review and strengthen data governance policies.",
      "Invest in employee training for key digital skills.",
      "Align your supply chain partners with your digital vision.",
      "Start defining clear ROI metrics for all digital projects."
    ]
  },
  Advanced: {
    title: "Your Readiness Level: Advanced",
    meaning: "You have multiple digital initiatives working together with good processes and governance. Your workforce is more digitally skilled, and you see clear ROI.",
    nextSteps: [
      "Scale up pilots into enterprise-wide programs.",
      "Continue benchmarking against industry best practices.",
      "Develop advanced analytics or AI capabilities where it makes sense.",
      "Optimize your ecosystem — ensure supply chain partners are connected and aligned.",
      "Identify new revenue streams enabled by digitalization (e.g., new services)."
    ]
  },
  Leader: {
    title: "Your Readiness Level: Leader",
    meaning: "Your organization is an industry leader in digital transformation. Digitalization is embedded in your strategy, culture, and operations, and you continuously innovate.",
    nextSteps: [
      "Invest in continuous improvement — keep refining your digital roadmap.",
      "Explore cutting-edge tech like autonomous systems, advanced robotics, or digital twins.",
      "Share best practices internally and externally to strengthen your brand.",
      "Lead industry partnerships or working groups.",
      "Future-proof your workforce through advanced upskilling and talent retention programs."
    ]
  }
}

export default function ReadinessActionPlan({ readinessLevel }: ReadinessActionPlanProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const actionPlan = readinessActionPlans[readinessLevel]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center">
          <Lightbulb className="h-5 w-5 text-blue-600 mr-3" />
          <span className="text-lg font-semibold text-gray-900">
            Show Recommended Next Steps
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {actionPlan.title}
          </h3>
          
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">What it means:</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {actionPlan.meaning}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Next Steps:</h4>
            <ul className="space-y-2">
              {actionPlan.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 