import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const TOOLS = [
  {
    name: "hello",
    description: "Simple hello tool",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
] as const;

const server = new Server(
  {
    name: "my-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "hello":
      return {
        content: [
          {
            type: "text",
            text: "Hello from MCP server!",
          },
        ],
      };

    default:
      throw new McpError(
        ErrorCode.InvalidParams,
        `Unknown tool: ${request.params.name}`
      );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Stdio MCP servers must keep stdout reserved for protocol messages.
  console.error("MCP server running");
}

main().catch((error) => {
  console.error("Failed to start MCP server", error);
  process.exit(1);
});
