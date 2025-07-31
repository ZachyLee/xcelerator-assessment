import { jsPDF } from 'jspdf'

interface AssessmentData {
  assessmentType: 'c_level' | 'shopfloor'
  totalScore: number
  readinessLevel: string
  answers: { [key: number]: number }
  questions: any[]
  completionDate: string
  readinessActionPlan?: any
  aiRecommendations?: any[]
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

function parseAIRecommendations(recommendations: any[]): any[] {
  if (!recommendations || recommendations.length === 0) return []
  if (recommendations.length === 1 && recommendations[0].title === 'AI Analysis Complete' && typeof recommendations[0].description === 'string' && recommendations[0].description.includes('recommendations')) {
    try {
      const match = recommendations[0].description.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return parsed.recommendations
        }
      }
    } catch (error) {
      console.error('Failed to parse AI recommendations JSON:', error)
    }
  }
  return recommendations
}

export const generateAssessmentPDF = async (data: AssessmentData) => {
  try {
    const { assessmentType, totalScore, readinessLevel, answers, questions, completionDate, aiRecommendations } = data
    const actionPlan = readinessActionPlans[readinessLevel as keyof typeof readinessActionPlans]
    const parsedAIRecommendations = parseAIRecommendations(aiRecommendations || [])
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - (2 * margin)
    let yPosition = 20

    // Helper: add text with spacing, returns height used
    const addText = (text: string, x: number, y: number, fontSize = 12, maxWidth = contentWidth, lineHeight = 1.8) => {
      pdf.setFontSize(fontSize)
      const lines: string[] = pdf.splitTextToSize(text, maxWidth)
      lines.forEach((line: string, i: number) => pdf.text(line, x, y + i * fontSize * lineHeight))
      return lines.length * fontSize * lineHeight
    }

    // Helper: add a card, returns height used
    const addCard = (content: (startY: number) => number, minHeight = 30, padY = 12) => {
      const startY = yPosition
      // 1. Calculate height needed for content
      const contentHeight = content(-1) // pass -1 to only calculate height, not draw
      const cardHeight = Math.max(contentHeight + 2 * padY, minHeight)
      // 2. Draw card
      pdf.setDrawColor(229, 231, 235)
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(margin, startY, contentWidth, cardHeight, 3, 3, 'FD')
      // 3. Draw content inside card
      const used = content(startY + padY)
      yPosition = startY + cardHeight + 8 // 8px gap after card
      return cardHeight
    }

    // Helper: check for page break, move to new page if needed
    const ensureSpace = (needed: number) => {
      if (yPosition + needed > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
    }

    // Title page (always on its own page)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Xcelerator Assessment', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20
    pdf.setFontSize(16)
    pdf.text(`${assessmentType === 'c_level' ? 'C-Level Management' : 'Shopfloor Operators'} Assessment`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Completed on ${completionDate}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 30

    // Total Score and Readiness Level
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Assessment Results', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Total Score
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Total Score:', margin + 50, yPosition)
    pdf.setFontSize(16)
    pdf.setTextColor(59, 130, 246)
    pdf.text(`${totalScore}/60`, margin + 120, yPosition)
    pdf.setTextColor(0, 0, 0)
    yPosition += 15

    // Readiness Level
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Readiness Level:', margin + 50, yPosition)
    pdf.setFontSize(16)
    const levelColor = readinessLevel === 'Leader' ? [16, 185, 129] : 
                      readinessLevel === 'Advanced' ? [59, 130, 246] : 
                      readinessLevel === 'Developing' ? [245, 158, 11] : [239, 68, 68]
    pdf.setTextColor(levelColor[0], levelColor[1], levelColor[2])
    pdf.text(readinessLevel, margin + 120, yPosition)
    pdf.setTextColor(0, 0, 0)
    yPosition += 30

    pdf.addPage()
    yPosition = margin

    // Section 1: Questions & Answers (each card never split)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Assessment Questions & Answers', margin, yPosition)
    yPosition += 16
    questions.forEach((question, idx) => {
      const answer = answers[question.id] || 0
      const answerText = answer === 1 ? 'Strongly Disagree' : answer === 2 ? 'Disagree' : answer === 3 ? 'Neutral' : answer === 4 ? 'Agree' : answer === 5 ? 'Strongly Agree' : 'Not Answered'
      pdf.setFontSize(12)
      const qLines = pdf.splitTextToSize(question.question, contentWidth - 30)
      const cLines = pdf.splitTextToSize(question.category, contentWidth - 30)
      const rLines = pdf.splitTextToSize(`Response: ${answerText} (${answer}/5)`, contentWidth - 30)
      const estHeight = 8 + cLines.length * 8 + 8 + qLines.length * 10 + 6 + rLines.length * 8 + 12
      ensureSpace(estHeight)
      addCard((drawY) => {
        let h = 0
        if (drawY !== -1) {
          pdf.setFontSize(10)
          pdf.setTextColor(59, 130, 246)
          h += addText(question.category, margin + 15, drawY + h, 10, contentWidth - 30, 1.1)
          pdf.setTextColor(0, 0, 0)
          pdf.setFontSize(13)
          pdf.setFont('helvetica', 'bold')
          h += addText(`Question ${question.id}`, margin + 15, drawY + h, 13, contentWidth - 30, 1.1)
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(12)
          h += addText(question.question, margin + 15, drawY + h, 12, contentWidth - 30, 1.2)
          pdf.setFont('helvetica', 'bold')
          h += addText(`Response: ${answerText} (${answer}/5)`, margin + 15, drawY + h + 2, 12, contentWidth - 30, 1.1)
          pdf.setTextColor(0, 0, 0)
        } else {
          // Only calculate height
          h += cLines.length * 8
          h += 8
          h += qLines.length * 10
          h += 6
          h += rLines.length * 8
        }
        return h
      }, estHeight, 6)
    })
    pdf.addPage()
    yPosition = margin

    // Section 2: Recommended Next Steps (always starts new page)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Show Recommended Next Steps', margin, yPosition)
    yPosition += 16
    addCard(() => {
      let h = 0
      pdf.setFont('helvetica', 'bold')
      h += addText(actionPlan.title, margin + 10, yPosition + h, 14, contentWidth - 20, 1.1)
      pdf.setFont('helvetica', 'normal')
      h += addText('What it means:', margin + 10, yPosition + h + 4, 12, contentWidth - 20, 1.1)
      h += addText(actionPlan.meaning, margin + 10, yPosition + h, 12, contentWidth - 20, 1.2)
      pdf.setFont('helvetica', 'bold')
      h += addText('Recommended Next Steps:', margin + 10, yPosition + h + 6, 12, contentWidth - 20, 1.1)
      pdf.setFont('helvetica', 'normal')
      actionPlan.nextSteps.forEach((step, i) => {
        h += addText(`${i + 1}. ${step}`, margin + 18, yPosition + h, 12, contentWidth - 28, 1.2)
      })
      return h
    }, 50, 8)
    pdf.addPage()
    yPosition = margin

    // Section 3: AI Recommendations (always starts new page)
    if (parsedAIRecommendations.length > 0) {
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Get AI-Powered Custom Recommendations', margin, yPosition)
      yPosition += 16
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Customized Recommendations Based on Your Assessment', margin, yPosition)
      yPosition += 14
      parsedAIRecommendations.forEach((rec, idx) => {
        // Estimate height needed for this card
        pdf.setFontSize(12)
        const tLines = pdf.splitTextToSize(rec.title, contentWidth - 60)
        const dLines = pdf.splitTextToSize(rec.description, contentWidth - 60)
        const timeLines = pdf.splitTextToSize(`Timeline: ${rec.timeline}`, contentWidth - 60)
        const impLines = pdf.splitTextToSize(`Expected Impact: ${rec.impact}`, contentWidth - 60)
        const estHeight = 20 + tLines.length * 12 + dLines.length * 10 + timeLines.length * 10 + impLines.length * 10 + 40
        ensureSpace(estHeight)
        addCard(() => {
          let h = 0
          
          // First row: Number circle and priority badge only
          // Number circle (left side) - centered text
          pdf.setFillColor(219, 234, 254)
          pdf.circle(margin + 20, yPosition + h + 8, 5, 'F')
          pdf.setFontSize(10)
          pdf.setTextColor(37, 99, 235)
          pdf.text((idx + 1).toString(), margin + 20, yPosition + h + 9, { align: 'center' })
          pdf.setTextColor(0, 0, 0)
          
          // Priority badge (right side) - centered text
          const priorityColor: [number, number, number] = rec.priority === 'High' ? [220, 38, 38] : rec.priority === 'Medium' ? [217, 119, 6] : [34, 197, 94]
          pdf.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2])
          pdf.roundedRect(margin + contentWidth - 45, yPosition + h + 2, 35, 10, 2, 2, 'F')
          pdf.setFontSize(9)
          pdf.setTextColor(255, 255, 255)
          pdf.text(rec.priority, margin + contentWidth - 27.5, yPosition + h + 8, { align: 'center' })
          pdf.setTextColor(0, 0, 0)
          
          h += 16 // Height for first row
          
          // Second row: Title with full width (no badges to compete with)
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(13)
          const titleLines = pdf.splitTextToSize(rec.title, contentWidth - 40) // Full width minus small margins
          titleLines.forEach((line: string, i: number) => {
            pdf.text(line, margin + 20, yPosition + h + 6 + (i * 10))
          })
          h += Math.max(titleLines.length * 10, 14) // Height for title row
          
          pdf.setFont('helvetica', 'normal')
          h += 6
          
          // What to do section
          pdf.setFont('helvetica', 'bold')
          h += addText('What to do:', margin + 32, yPosition + h, 12, contentWidth - 60, 1.1)
          pdf.setFont('helvetica', 'normal')
          h += addText(rec.description, margin + 32, yPosition + h, 12, contentWidth - 60, 1.2)
          h += addText(`Timeline: ${rec.timeline}`, margin + 32, yPosition + h + 2, 12, contentWidth - 60, 1.1)
          h += addText(`Expected Impact: ${rec.impact}`, margin + 32, yPosition + h, 12, contentWidth - 60, 1.1)
          return h
        }, estHeight, 10)
      })
    }

    // Footer
    ensureSpace(30)
    pdf.setFontSize(10)
    pdf.setTextColor(107, 114, 128)
    pdf.text('This assessment was generated by the Xcelerator Digital Transformation Portal.', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8
    pdf.text('For more information and detailed recommendations, please visit the dashboard.', pageWidth / 2, yPosition, { align: 'center' })

    // Download the PDF
    const fileName = `xcelerator-assessment-${assessmentType}-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
} 