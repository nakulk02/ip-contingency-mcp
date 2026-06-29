import { callLLMJSON } from "../utils/llm-client".js";
import { getPrompt } from "../prompts/index.js";
import { AssignmentGap, Recommendation, ToolResponse } from "../types/index.js";
import { formatGapForAnalysis } from "../utils/data-formatter.js";

interface RecommendationInput {
  gap: AssignmentGap;
}

/**
 * Generate recommendations for resolving a specific gap
 */
export async function recommendActions(
  input: RecommendationInput
): Promise<ToolResponse<Recommendation>> {
  try {
    const { gap } = input;

    if (!gap) {
      return {
        success: false,
        error: "No gap provided",
        timestamp: new Date(),
      };
    }

    const formattedGap = formatGapForAnalysis(gap);

    const userMessage = `
Generate recommendations to resolve this IP assignment gap:

${formattedGap}

Provide specific, actionable recommendations for next steps.
    `.trim();

    const result = await callLLMJSON<Recommendation>(
      userMessage,
      getPrompt("RECOMMEND_ACTIONS"),
      { maxTokens: 1500 }
    );

    // Ensure gapId is included
    result.gapId = gap.id;

    return {
      success: true,
      data: result,
      reasoning: "Generated recommendations based on gap analysis",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate recommendations: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

export default recommendActions;
