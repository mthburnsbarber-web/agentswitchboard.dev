# MCP Catalog Query Prompts

Point an MCP-capable client at:

```json
{
  "mcpServers": {
    "agentswitchboard": {
      "url": "https://agentswitchboard.dev/api/mcp"
    }
  }
}
```

Then try these prompts.

## Find a tool

- Search Agent Switchboard for MCP servers that can query a database.
- Search Agent Switchboard for browser automation agents with CLI access.
- Search Agent Switchboard for open-source coding agents with local execution.
- Search Agent Switchboard for payment or x402 related agents.
- Search Agent Switchboard for security review tools with API access.

## Compare options

- List three tools for document retrieval and explain the access method for
  each.
- Which listed tools support MCP and have public docs?
- Which agents look useful for a local developer workflow?
- Which entries need more verification before a business should rely on them?

## Update the catalog

- Find an entry with a stale description and draft a corrected JSON patch.
- Search for duplicate-looking entries by provider name.
- List entries missing a clear API, MCP, CLI, or extension path.
- Suggest tags for an agent based only on its documented capabilities.
