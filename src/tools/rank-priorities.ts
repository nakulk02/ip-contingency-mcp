import { callClaudeJSON } from "../utils/claude-client.js";
import { getPrompt } from "../prompts/index.js";
import { AssignmentGap, RankedGap, ToolResponse } from "../types/index.js";
import { formatGapsForAnalysis, sortByRiskScore } from "../utils/data-formatter.js";

interface RankingInput {
  gaps: AssignmentGap[];
}

interface RankingResult {
  ranked: RankedItem[];
  methodology: string;
}

interface RankedItem {
  gapId: string;
  priorityScore: number;
  priorityRank: number;
  urgencyFactors: string[];
  estimatedResolutionTime: string;
}

/**
 * Rank gaps by strategic priority
 */
export async function rankPriorities(input: RankingInput): Promise<ToolResponse<RankedGap[]>> {
  try {
    const { gaps } = input;

    if (!gaps || gaps.length === 0) {
      return {
        success: false,
        error: "No gaps provided for ranking",
        timestamp: new Date(),
      };
    }

    const sortedByRisk = sortByRiskScore(gaps);
    const formattedGaps = formatGapsForAnalysis(sortedByRisk);

    const userMessage = `
Rank these IP assignment gaps by strategic priority.

Consider:
1. Legal urgency (compliance deadlines)
2. Financial impact (asset value)
3. Deadline proximity
4. Complexity
5. Likelihood of issues

${formattedGaps}

Provide priority scores (1-100) and explain reasoning.
    `.trim();

    const rankingResult = await callClaudeJSON<RankingResult>(
      userMessage,
      getPrompt("RANK_PRIORITIES"),
      { maxTokens: 2000 }
    );

    // Combine ranking with original gap data
    const ranked = rankingResult.ranked.map((item, idx) => {
      const gap = gaps.find((g) => g.id === item.gapId);
      if (!gap) throw new Error(`Gap ${item.gapId} not found`);

      return {
        ...gap,
        priorityScore: item.priorityScore,
        priorityRank: idx + 1,
        urgencyFactors: item.urgencyFactors,
        estimatedResolutionTime: item.estimatedResolutionTime,
      } as RankedGap;
    });

    return {
      success: true,
      data: ranked,
      reasoning: rankingResult.methodology,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to rank priorities: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date(),
    };
  }
}

export default rankPriorities;
