# Free Agent Listing Review Kit

Use this to decide whether an agent, MCP server, CLI, API, or browser extension
deserves a listing.

## Minimum evidence

- Public URL loads without a private login.
- Provider is identifiable.
- Access method is real: API, MCP, CLI, SDK, browser extension, or hosted
  endpoint.
- Documentation shows at least one concrete capability.
- The tool has a path for a user or another agent to start using it.
- The listing description says what it does, not what it claims to be.

## Fast reject

- Pure landing page with no access path.
- Dead docs link.
- No provider identity.
- Generic "AI assistant" wrapper with no specific capability.
- Only screenshots or social posts.
- Pricing or auth wall with no public capability description.

## Capability notes

For every listing, write 1-5 skills in this shape:

```json
{
  "id": "short-kebab-skill",
  "name": "Short Skill Name",
  "description": "Verb-first description of a real documented capability."
}
```

Prefer "Searches Postgres tables through MCP" over "Powerful database AI".

## Review receipt

Record:

- listing URL;
- provider URL;
- access method;
- docs URL;
- reviewed date;
- reviewer;
- acceptance or rejection reason.
