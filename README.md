# IP Contingency MCP Server

Intelligent analysis server for IP assignment compliance. Provides AI-powered insights on IP ownership gaps.

## Tools

1. **analyzeGaps** - Identify patterns in IP ownership gaps
2. **recommendActions** - Get specific actions for resolving gaps
3. **detectAnomalies** - Find red flags and unusual patterns
4. **generateAdvisory** - Generate executive compliance reports
5. **rankPriorities** - Intelligently rank gaps by urgency
6. **queryAssignments** - Natural language search
7. **checkCompliance** - Validate against jurisdiction rules
8. **predictRisk** - Predict likely outcomes

## Architecture

```
src/
├── index.ts           # Main server entry
├── tools/             # Intelligence tools (8 tools)
├── prompts/           # System prompts for each tool
├── utils/             # Utilities (LLM client, data formatters)
└── types/             # TypeScript interfaces
```

## Installation

```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

## Development

```bash
npm run build
npm run dev
```

## Usage Example

```typescript
import { processTool } from './src/index.js';

const gaps = [
  {
    id: "gap1",
    personName: "John Doe",
    personRole: "EMPLOYEE",
    assetType: "PATENT",
    jurisdiction: "CN",
    riskScore: 85,
    riskLevel: "HIGH",
    daysOverdue: 120,
    // ... other fields
  }
];

const result = await processTool({
  tool: 'analyzeGaps',
  input: { gaps }
});

console.log(result.data);
```

## Integration with IP Contingency Tracker

The MCP server provides intelligence endpoints that the main app calls:

- `GET /api/v1/intelligence/analyze-gaps` → calls `analyzeGaps`
- `GET /api/v1/intelligence/recommendations` → calls `recommendActions`
- `GET /api/v1/intelligence/anomalies` → calls `detectAnomalies`
- etc.

## Modular Design

Each tool is:
- **Independent** - Can be used separately
- **Testable** - Has clear inputs/outputs
- **Reusable** - Can be called from multiple places
- **Typed** - Full TypeScript support

## Tool Categories

### Pattern Analysis
- analyzeGaps
- detectAnomalies
- rankPriorities

### Recommendations
- recommendActions
- generateAdvisory
- predictRisk

### Search & Validation
- queryAssignments
- checkCompliance
