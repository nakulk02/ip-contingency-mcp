import { callLLMJSON } from "../utils/llm-client".js";
import { getPrompt } from "../prompts/index.js";
import { AssignmentGap, ComplianceCheckResult, ToolResponse } from "../types/index.js";
import { formatGapForAnalysis } from "../utils/data-formatter.js";

interface ComplianceInput {
  gap: AssignmentGap;
}

/**
 * Check compliance of a gap against jurisdiction rules
 */
export async function checkCompliance(
  input: ComplianceInput
): Promise<ToolResponse<ComplianceCheckResult>> {
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
Check IP assignment compliance for this gap:

${formattedGap}

Jurisdiction: ${gap.jurisdiction}
Asset Type: ${gap.assetType}
Asset Status: ${gap.assetStatus}

Analyze against jurisdiction-specific requirements and provide compliance status.
    `.trim();

    const result = await callLLMJSON<ComplianceCheckResult>(
      userMessage,
      getPrompt("CHECK_COMPLIANCE"),
      { maxTokens: 1500 }
    );

    // Ensure jurisdiction is set
    result.jurisdiction = gap.jurisdiction;

    return {
      success: true,
      data: result,
      reasoning: "Analyzed compliance against jurisdiction rules",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to check compliance: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

export default checkCompliance;
