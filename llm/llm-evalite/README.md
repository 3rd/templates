# llm-evalite

TypeScript starter for writing prompts, validating structured responses, and
scoring results with Evalite, the AI SDK, and Zod.

## Setup

Install [Bun](https://bun.sh/), then run these commands from the template directory:

```bash
bun install
cp .env.example .env
```

Set the API credentials in `.env` for the provider configured in your evaluation.
The client loads this file automatically, and Git ignores it. Evaluations make
live API calls and may incur provider charges.

## Commands

Run the evaluation once:

```bash
bun run evals
```

Rerun evaluations as files change:

```bash
bun run evals:watch
```

## Writing Evaluations

Keep each prompt and its evaluation together under `src/prompts/<prompt-name>/`:

- `<prompt-name>.prompt.ts` builds the messages and defines the Zod output schema.
- `<prompt-name>.eval.ts` configures the model, test cases, task, and scorers.

Use [the example prompt](./src/prompts/example/example.prompt.ts) and
[its evaluation](./src/prompts/example/example.eval.ts) as a starting point. Replace
the example cases and scorers with checks for the behavior your prompt must satisfy.

Import provider wrappers and completion functions from [src/llm](./src/llm/index.ts)
to keep calls connected to Evalite tracing. Use `complete()` for text responses or
`completeStructured()` with a Zod schema for structured output.

Run the evaluation after a change and inspect failed cases alongside their scores.
The included example checks mathematical results and step counts; define scoring
criteria that fit your own task.
