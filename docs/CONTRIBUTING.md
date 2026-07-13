# Contributing to VibeCast

Thanks for considering contributing. VibeCast is a hackathon project that became something people might actually use. PRs and issues are welcome.

## Code of conduct

Be kind. Assume good faith. No harassment, no trolling, no spam. We're building something together.

## How to contribute

### Reporting bugs

Open an issue on GitHub with:
- VibeCast version (`/health` shows it)
- The exact request that failed (`curl` command or browser steps)
- The response (status code, error body)
- Your environment (Render, Fly.io, local)

### Suggesting features

Open an issue with the `enhancement` label. Describe:
- What you want to build
- Why it would help users
- Any implementation ideas (optional)

### Submitting code

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-idea`
3. Make your changes
4. Add tests if applicable (run `npm test`)
5. Update the README if you change user-facing behavior
6. Submit a PR with a clear description

## Development setup

```bash
git clone https://github.com/your-username/Vibecast.git
cd Vibecast
npm install --no-audit --no-fund
cp .env.example .env
# Add OPENAI_API_KEY and SUPADATA_API_KEY (both have free tiers)
npm run dev
# Open http://localhost:3000
```

## Code style

- **JavaScript** (Node 18+, ES modules, no TypeScript for simplicity)
- **2-space indent**, no semicolons? Actually, semicolons. **Use semicolons.**
- **One blank line** between functions
- **Comments** for non-obvious logic
- **No abbreviations** in variable names (`req`, `res`, `ip` are fine; `tx` is not)

## Testing

Run the smoke test suite before submitting:
```bash
npm test
```

This starts the server on port 3000 and runs 15 assertions against it.

## Project structure

- `src/` — application code
- `test/` — test suite
- `docs/` — documentation
- `render.yaml` — Render Blueprint
- `Dockerfile` — Docker image for Fly.io etc.

## Areas where help is most needed

1. **Caching layer** — per-video-ID transcript cache to reduce Supadata API usage
2. **Audio podcast support** — Whisper fallback for non-captioned content
3. **Multi-language** — auto-translate captions
4. **Better voices** — community-contributed voice prompts
5. **A2A mode** — the negotiated, escrow-based service mode (vs the current A2MCP)

## License

By contributing, you agree your code will be licensed under MIT.

## Questions?

Open an issue. I'll respond when I can.
