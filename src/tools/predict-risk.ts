import { callLLMJSON } from "../utils/llm-client".js";
import { getPrompt } from "../prompts/index.js";
import { AssignmentGap, Prediction, ToolResponse } from "../types/index.js";
import { formatGapForAnalysis } from "../utils/data-formatter.js";

interface PredictionInput {
  gap: AssignmentGap;
  historicalContext?: {
    similarGaps?: AssignmentGap[];
    successRate?: number;
    avgResolutionDays?: number;
  };
}

/**
 * Predict likely outcome for a gap
 */
export async function predictRisk(input: PredictionInput): Promise<ToolResponse<Prediction>> {
  try {
    const { gap, historicalContext = {} } = input;

    if (!gap) {
      return {
        success: false,
        error: "No gap provided",
        timestamp: new Date(),
      };
    }

    const formattedGap = formatGapForAnalysis(gap);

    const contextInfo = historicalContext.similarGaps
      ? `\nContext: ${historicalContext.similarGaps.length} similar gaps tracked. Success rate: ${historicalContext.successRate || "unknown"}%. Avg resolution time: ${historicalContext.avgResolutionDays || "unknown"} days.`
      : "";

    const userMessage = `
Predict the likely outcome for this IP assignment gap:

${formattedGap}${contextInfo}

Based on the characteristics, predict whether this gap will likely:
1. Be resolved successfully
2. Be at risk of non-resolution
3. Likely fail to resolve

Provide confidence level and reasoning.
    `.trim();

    const result = await callLLMJSON<Prediction>(
      userMessage,
      getPrompt("PREDICT_RISK"),
      { maxTokens: 1500 }
    );

    // Ensure gapId is set
    result.gapId = gap.id;

    return {
      success: true,
      data: result,
      reasoning: "Predicted outcome based on gap characteristics",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to predict risk: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

export default predictRisk;
