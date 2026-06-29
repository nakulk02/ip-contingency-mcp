# IP Contingency MCP Server - Integration Guide

## Overview

This MCP (Model Context Protocol) server provides intelligent IP assignment analysis tools for the IP Contingency Tracker app.

## Tools Available (8 Tools)

### 1. **analyzeGaps** ✅
- **Purpose**: Identify patterns in IP ownership gaps
- **Input**: Array of assignment gaps
- **Output**: Patterns, risk areas, recommendations, summary
- **Commit**: `de01918`

### 2. **recommendActions** ✅
- **Purpose**: Generate specific actions for resolving gaps
- **Input**: Single gap object
- **Output**: Priority, reason, actions, timeline, jurisdiction notes
- **Commit**: `b8c4f6f`

### 3. **detectAnomalies** ✅
- **Purpose**: Find red flags and unusual patterns
- **Input**: Array of gaps + optional context
- **Output**: Array of anomalies with severity and evidence
- **Commit**: `e493e5b`

### 4. **generateAdvisory** ✅
- **Purpose**: Create executive compliance reports
- **Input**: Array of gaps + company context
- **Output**: Structured advisory report with narrative
- **Commit**: `0db635f`

### 5. **rankPriorities** ✅
- **Purpose**: Intelligent strategic prioritization
- **Input**: Array of gaps
- **Output**: Ranked gaps with scores and urgency factors
- **Commit**: `4f2ae13`

### 6. **queryAssignments** ✅
- **Purpose**: Natural language search/filtering
- **Input**: Question string + gaps array
- **Output**: Filtered results with explanation
- **Commit**: `4d11dea`

### 7. **checkCompliance** ✅
- **Purpose**: Validate against jurisdiction rules
- **Input**: Single gap object
- **Output**: Compliance status, issues, recommendations
- **Commit**: `ef5c5b6`

### 8. **predictRisk** ✅
- **Purpose**: Predict likely outcomes
- **Input**: Gap + optional historical context
- **Output**: Prediction, confidence, factors, intervention
- **Commit**: `eace67e`

## Architecture

```
src/
├── index.ts              # MCP server entry point
├── tools/
│   ├── index.ts          # Tool registry
│   ├── analyze-gaps.ts
│   ├── recommend-actions.ts
│   ├── detect-anomalies.ts
│   ├── generate-advisory.ts
│   ├── rank-priorities.ts
│   ├── query-assignments.ts
│   ├── check-compliance.ts
│   └── predict-risk.ts
├── prompts/
│   └── index.ts          # System prompts for each tool
├── utils/
│   ├── LLM-client.ts   # LLM API wrapper
│   └── data-formatter.ts  # Data transformation utilities
└── types/
    └── index.ts          # TypeScript interfaces
```

## Integration with IP Contingency Tracker

### Setup Steps

1. **Clone and install MCP server**
```bash
cd ../ip_contingency_mcp
npm install
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
```

2. **Add to main app**
```bash
# In ip_contingency_tracker root
npm install ../ip_contingency_mcp
```

3. **Create API routes** in main app:
```typescript
// src/app/api/v1/intelligence/[endpoint]/route.ts
import { processTool } from '@ip-contingency-mcp';

export async function GET(req: Request) {
  const tool = req.nextUrl.searchParams.get('tool');
  const data = await req.json();
  const result = await processTool({ tool, input: data });
  return Response.json(result);
}
```

### Data Flow

```
IP Contingency Tracker
        ↓
GET /api/v1/intelligence/:tool
        ↓
MCP Server (this repo)
        ↓
LLM API (analyzeGaps, rankPriorities, etc.)
        ↓
Structured JSON response
        ↓
Dashboard visualization
```

## API Endpoints (to implement in main app)

```
GET /api/v1/intelligence/analyze-gaps?gaps=...
GET /api/v1/intelligence/recommendations?gap=...
GET /api/v1/intelligence/anomalies?gaps=...
GET /api/v1/intelligence/advisory?gaps=...
GET /api/v1/intelligence/priorities?gaps=...
POST /api/v1/intelligence/query?question=...&gaps=...
GET /api/v1/intelligence/compliance?gap=...
GET /api/v1/intelligence/predict?gap=...
```

## Deployment

### Local Development
```bash
npm run build
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Key Design Principles

✅ **Modularity** - Each tool is independent and testable
✅ **Type Safety** - Full TypeScript support with interfaces
✅ **Separation of Concerns** - Prompts, tools, utils are isolated
✅ **Error Handling** - All tools return ToolResponse wrapper
✅ **Extensibility** - Easy to add new tools following same pattern
✅ **Performance** - One LLM call per tool (no nested calls)
✅ **Reusability** - Tools work independently of Next.js framework

## Next Steps

1. **Build app integration endpoints** in main IP Contingency repo
2. **Connect dashboard UI** to intelligence endpoints
3. **Add caching layer** for expensive analysis (Redis)
4. **Implement real-time updates** via WebSocket
5. **Add batch operations** for bulk analysis

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development|production
```

## Type Definitions

All types are exported from `src/types/index.ts`:
- AssignmentGap
- AnalysisResult
- Recommendation
- Anomaly
- AdvisoryReport
- RankedGap
- Prediction
- ComplianceCheckResult
- QueryResult
- ToolResponse

## Testing Tools

```typescript
import { processTool } from '@ip-contingency-mcp';

const gaps = [...]; // your gaps

const analysis = await processTool({
  tool: 'analyzeGaps',
  input: { gaps }
});

console.log(analysis.data);
```

## Commit History

```
8722343 feat: add MCP server main entry point
9939420 feat: add tool registry and exports
eace67e feat(tool): add predictRisk for outcome prediction
ef5c5b6 feat(tool): add checkCompliance for jurisdiction validation
4d11dea feat(tool): add queryAssignments for natural language search
4f2ae13 feat(tool): add rankPriorities for strategic gap prioritization
0db635f feat(tool): add generateAdvisory for executive compliance reports
e493e5b feat(tool): add detectAnomalies for red flag identification
b8c4f6f feat(tool): add recommendActions for gap resolution guidance
de01918 feat(tool): add analyzeGaps for pattern detection in IP gaps
fc1df14 init: core infrastructure and types
```

## Status

✅ All 8 tools implemented
✅ Type-safe interfaces
✅ Modular architecture
✅ Error handling
✅ Documentation
🚀 Ready for app integration
