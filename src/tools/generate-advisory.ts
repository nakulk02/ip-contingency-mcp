import { callLLM } from "../utils/llm-client".js";
import { getPrompt } from "../prompts/index.js";
import { AssignmentGap, AdvisoryReport, ActionItem, ToolResponse } from "../types/index.js";
import {
  formatGapsForAnalysis,
  getCriticalGaps,
  getHighRiskJurisdictionGaps,
  calculateGapStatistics,
} from "../utils/data-formatter.js";

interface AdvisoryInput {
  gaps: AssignmentGap[];
  companyContext?: {
    name?: string;
    industry?: string;
  };
}

/**
 * Generate executive advisory report
 */
export async function generateAdvisory(input: AdvisoryInput): Promise<ToolResponse<AdvisoryReport>> {
  try {
    const { gaps, companyContext = {} } = input;

    if (!gaps || gaps.length === 0) {
      return {
        success: false,
        error: "No gaps provided for advisory generation",
        timestamp: new Date(),
      };
    }

    const statistics = calculateGapStatistics(gaps);
    const criticalGaps = getCriticalGaps(gaps);
    const highRiskJurisdictionGaps = getHighRiskJurisdictionGaps(gaps);

    const formattedGaps = formatGapsForAnalysis(gaps.slice(0, 15)); // Top 15 for advisory

    const userMessage = `
Generate an executive advisory report for IP assignment gaps.

COMPANY: ${companyContext.name || "Unnamed Company"}
INDUSTRY: ${companyContext.industry || "Unknown"}

STATISTICS:
${JSON.stringify(statistics, null, 2)}

CRITICAL GAPS: ${criticalGaps.length}
HIGH-RISK JURISDICTION GAPS: ${highRiskJurisdictionGaps.length}

TOP GAPS FOR REVIEW:
${formattedGaps}

Write a professional advisory report with:
1. Executive Summary
2. Risk Narrative
3. Action Items (numbered)
4. Timeline
5. Financial Impact (if quantifiable)

Use clear, concise language suitable for legal review.
    `.trim();

    const advisoryText = await callLLM(userMessage, getPrompt("GENERATE_ADVISORY"), {
      maxTokens: 2500,
    });

    // Parse the advisory text into structured format
    const report: AdvisoryReport = {
      generatedAt: new Date(),
      title: "IP Assignment Compliance Advisory",
      executiveSummary: extractSection(advisoryText, "Executive Summary"),
      riskNarrative: extractSection(advisoryText, "Risk Narrative"),
      actionItems: parseActionItems(extractSection(advisoryText, "Action Items")),
      timeline: extractSection(advisoryText, "Timeline"),
      financialImpact: extractSection(advisoryText, "Financial Impact"),
      keyMetrics: statistics,
    };

    return {
      success: true,
      data: report,
      reasoning: "Generated comprehensive advisory report",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate advisory: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Extract section from advisory text
 */
function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(
    `${sectionName}[:\s]+([^]*?)(?=\\n\\d+\\.|\\nFinancial Impact|$)`,
    "i"
  );
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Parse action items from text
 */
function parseActionItems(text: string): ActionItem[] {
  const lines = text.split("\n").filter((line) => line.trim());
  return lines
    .map((line, idx) => ({
      priority: idx + 1,
      action: line.replace(/^\d+\.\s*/, "").trim(),
    }))
    .filter((item) => item.action.length > 0);
}

export default generateAdvisory;
