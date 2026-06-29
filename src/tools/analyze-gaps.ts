import { callLLMJSON } from "../utils/llm-client".js";
import { getPrompt } from "../prompts/index.js";
import { AssignmentGap, AnalysisResult, ToolResponse } from "../types/index.js";
import {
  formatGapsForAnalysis,
  groupGapsByJurisdiction,
  groupGapsByAssetType,
  calculateGapStatistics,
} from "../utils/data-formatter.js";

interface AnalysisInput {
  gaps: AssignmentGap[];
}

/**
 * Analyze IP ownership gaps to identify patterns
 */
export async function analyzeGaps(input: AnalysisInput): Promise<ToolResponse<AnalysisResult>> {
  try {
    const { gaps } = input;

    if (!gaps || gaps.length === 0) {
      return {
        success: false,
        error: "No gaps provided for analysis",
        timestamp: new Date(),
      };
    }

    // Prepare data for LLM
    const formattedGaps = formatGapsForAnalysis(gaps);
    const byJurisdiction = groupGapsByJurisdiction(gaps);
    const byAssetType = groupGapsByAssetType(gaps);
    const statistics = calculateGapStatistics(gaps);

    const userMessage = `
Analyze these ${gaps.length} IP ownership gaps:

${formattedGaps}

STATISTICS:
${JSON.stringify(statistics, null, 2)}

BY JURISDICTION:
${Object.entries(byJurisdiction)
  .map(([jurisdiction, items]) => `- ${jurisdiction}: ${items.length} gaps`)
  .join("\n")}

BY ASSET TYPE:
${Object.entries(byAssetType)
  .map(([type, items]) => `- ${type}: ${items.length} gaps`)
  .join("\n")}

Identify patterns and provide analysis.
    `.trim();

    const result = await callLLMJSON<AnalysisResult>(
      userMessage,
      getPrompt("ANALYZE_GAPS"),
      { maxTokens: 2000 }
    );

    return {
      success: true,
      data: result,
      reasoning: "Analyzed gaps using pattern detection",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to analyze gaps: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

export default analyzeGaps;
