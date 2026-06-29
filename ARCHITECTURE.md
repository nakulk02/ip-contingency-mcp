# MCP Server Architecture

## Design Philosophy

This codebase follows **modular, incremental, and best-practice software architecture**:

### Core Principles

1. **Single Responsibility** - Each tool handles exactly one analysis task
2. **Composition over Inheritance** - Tools are independent functions
3. **Type Safety** - Full TypeScript for compile-time safety
4. **Separation of Concerns** - Prompts, utils, and tools are isolated
5. **Extensibility** - Adding new tools requires minimal changes
6. **Testing** - Each tool can be tested independently
7. **Error Handling** - Consistent error response wrapper

## Modular Structure

```
src/
├── index.ts                    # Server orchestrator (10 lines)
├── tools/                      # Intelligence tools (8 files)
│   ├── index.ts               # Tool registry
│   ├── analyze-gaps.ts        # Pattern detection
│   ├── recommend-actions.ts   # Resolution guidance
│   ├── detect-anomalies.ts    # Red flag detection
│   ├── generate-advisory.ts   # Report generation
│   ├── rank-priorities.ts     # Strategic ranking
│   ├── query-assignments.ts   # NL search
│   ├── check-compliance.ts    # Jurisdiction validation
│   └── predict-risk.ts        # Outcome prediction
├── prompts/                    # System prompts (isolated)
│   └── index.ts               # 8 independent prompts
├── utils/                      # Reusable utilities
│   ├── LLM-client.ts       # API wrapper
│   └── data-formatter.ts      # Data transformations
└── types/                      # TypeScript interfaces
    └── index.ts               # 12 exported types
```

## Tool Architecture

Each tool follows this pattern:

```typescript
// Tool file: src/tools/my-tool.ts

interface ToolInput { /* ... */ }

export async function myTool(input: ToolInput): Promise<ToolResponse<OutputType>> {
  try {
    // 1. Validate input
    // 2. Format data for LLM
    // 3. Call LLM with prompt
    // 4. Parse & structure response
    // 5. Return in ToolResponse wrapper
    return {
      success: true,
      data: result,
      reasoning: "explanation",
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed: ${error.message}`,
      timestamp: new Date(),
    };
  }
}

export default myTool;
```

## LLM Integration Pattern

Each tool follows the same pattern:

```typescript
const userMessage = `Formatted data for LLM`;
const systemPrompt = getPrompt('TOOL_NAME');

const result = await callLLMJSON<OutputType>(
  userMessage,
  systemPrompt,
  { maxTokens: 2000 }
);
```

Benefits:
- ✅ One LLM call per tool (no nesting)
- ✅ Structured JSON responses
- ✅ Consistent error handling
- ✅ Easy to test and mock

## Data Flow

```
Input Validation
    ↓
Data Formatting (data-formatter.ts)
    ↓
LLM API Call (LLM-client.ts)
    ↓
JSON Parsing
    ↓
ToolResponse Wrapper
    ↓
Return to Caller
```

## Type Safety

Full TypeScript throughout:

```typescript
// Types are centralized in src/types/index.ts
// Exported for use across the codebase

// Example usage
import {
  AssignmentGap,
  AnalysisResult,
  ToolResponse,
} from '../types/index.js';

// Compiler ensures type correctness
const result: ToolResponse<AnalysisResult> = await analyzeGaps({
  gaps: [],
});
```

## Tool Independence

Each tool is independent and can be:
- ✅ Tested in isolation
- ✅ Called directly without others
- ✅ Swapped out without affecting others
- ✅ Migrated to different framework

```typescript
import analyzeGaps from './tools/analyze-gaps.js';

// Use directly
const result = await analyzeGaps({ gaps: [...] });
```

## Utility Functions

### Data Formatting (data-formatter.ts)
```typescript
// Human-readable formatting for LLM
formatGapForAnalysis(gap) // Single gap
formatGapsForAnalysis(gaps) // Multiple gaps

// Grouping utilities
groupGapsByJurisdiction(gaps)
groupGapsByAssetType(gaps)
groupGapsByPerson(gaps)

// Filtering utilities
filterByJurisdiction(gaps, 'CN')
filterByRiskLevel(gaps, 'HIGH')
getCriticalGaps(gaps)

// Statistics
calculateGapStatistics(gaps)
```

### LLM Client (LLM-client.ts)
```typescript
// Text responses
await callLLM(message, prompt, options)

// JSON responses (auto-parsed)
await callLLMJSON<T>(message, prompt, options)
```

## Prompt Management

System prompts are centralized and isolated:

```typescript
// src/prompts/index.ts
export const PROMPTS = {
  ANALYZE_GAPS: "You are an IP compliance expert...",
  RECOMMEND_ACTIONS: "You are a strategic advisor...",
  DETECT_ANOMALIES: "You are an audit specialist...",
  // ... 8 more
};

// Used by tools
const prompt = getPrompt('ANALYZE_GAPS');
```

Benefits:
- ✅ Easy to update prompts
- ✅ No prompt changes break code
- ✅ Version control friendly
- ✅ Can be externalized to config files

## Error Handling

Consistent error response:

```typescript
interface ToolResponse<T> {
  success: boolean;      // true/false
  data?: T;              // Only on success
  error?: string;        // Only on failure
  reasoning?: string;    // Explanation
  timestamp: Date;       // When called
}
```

Usage:
```typescript
const result = await analyzeGaps({ gaps });

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## Extensibility Pattern

Adding a new tool:

1. Create `src/tools/new-tool.ts`
2. Define input interface
3. Call LLM with formatted data
4. Return ToolResponse wrapper
5. Add to `src/tools/index.ts` exports
6. Create system prompt in `src/prompts/index.ts`

```typescript
// 1. Define input
interface NewToolInput { /* ... */ }

// 2. Create tool
export async function newTool(
  input: NewToolInput
): Promise<ToolResponse<OutputType>> {
  // ... implementation
}

// 3. Register in index.ts
export { newTool };

// 4. Add prompt
export const PROMPTS = {
  // ... existing
  NEW_TOOL: "You are a ...",
};
```

## Testing Strategy

Each tool can be tested independently:

```typescript
import { analyzeGaps } from '../tools/index.js';

test('analyzeGaps identifies patterns', async () => {
  const result = await analyzeGaps({
    gaps: [/* test data */],
  });

  expect(result.success).toBe(true);
  expect(result.data.patterns).toHaveLength(3);
});
```

## Performance Considerations

- ✅ One LLM call per tool (no nested calls)
- ✅ Parallel tool execution possible
- ✅ Caching not needed (stateless)
- ✅ Error recovery simple (retry logic)
- ✅ No database dependencies

## Deployment Flexibility

Architecture supports multiple deployment scenarios:

```
Node.js (native)
├─ npm run build
└─ npm start

AWS Lambda
├─ Wrap processTool in handler
└─ Deploy

Docker
├─ npm run build
├─ Create container
└─ Run

Vercel Functions
├─ Export handler
└─ Deploy

Multiple processes
├─ Horizontal scaling
└─ No state to sync
```

## Future Enhancements

Possible without major changes:

- Add caching layer (memoization)
- Add request queue (for rate limiting)
- Add metrics/observability
- Add prompt versioning
- Add multi-model support (LLM + GPT)
- Add streaming responses
- Add concurrent tool execution
- Add custom validators

## Dependencies

Minimal dependencies:
- `@anthropic-ai/sdk` - LLM API
- `dotenv` - Environment variables
- `typescript` - Type checking (dev only)

No framework lock-in!

## Summary

This architecture provides:
- **Modularity** - Tools are independent
- **Maintainability** - Clear structure
- **Testability** - Each tool testable alone
- **Extensibility** - Easy to add features
- **Type Safety** - Compile-time checking
- **Performance** - Efficient LLM usage
- **Flexibility** - Works anywhere
