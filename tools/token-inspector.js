#!/usr/bin/env node
/**
 * Token Inspector: Measure token consumption across system prompt, tools, history, and context
 * Usage: node tools/token-inspector.js --config <config-file> [--verbose]
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_ENCODING = 'utf-8';

// Rough token estimates (words ≈ 1.3 tokens for English)
const TOKENS_PER_WORD = 1.3;

function countTokensRough(text) {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount * TOKENS_PER_WORD);
}

function parseArgs(args) {
  const result = {
    config: null,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && i + 1 < args.length) {
      result.config = args[i + 1];
      i++;
    } else if (args[i] === '--verbose') {
      result.verbose = true;
    }
  }

  return result;
}

function inspectConfig(configPath) {
  try {
    const configContent = fs.readFileSync(configPath, DEFAULT_ENCODING);
    const config = JSON.parse(configContent);

    const results = {
      systemPrompt: 0,
      toolDefinitions: 0,
      conversationHistory: 0,
      loadedContext: 0,
      totalOverhead: 0,
      tools: [],
    };

    // System prompt
    if (config.systemPrompt) {
      results.systemPrompt = countTokensRough(config.systemPrompt);
    }

    // Tool definitions
    if (config.tools && Array.isArray(config.tools)) {
      let toolTokens = 0;
      config.tools.forEach((tool) => {
        const toolJson = JSON.stringify(tool);
        const tokens = countTokensRough(toolJson);
        toolTokens += tokens;
        results.tools.push({
          name: tool.name || 'unknown',
          tokens: tokens,
        });
      });
      results.toolDefinitions = toolTokens;
    }

    // Conversation history
    if (config.conversationHistory) {
      results.conversationHistory = countTokensRough(config.conversationHistory);
    }

    // Loaded context
    if (config.context) {
      results.loadedContext = countTokensRough(config.context);
    }

    results.totalOverhead =
      results.systemPrompt +
      results.toolDefinitions +
      results.conversationHistory +
      results.loadedContext;

    return results;
  } catch (err) {
    console.error(`Error reading config: ${err.message}`);
    process.exit(1);
  }
}

function formatTokenCount(count) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function printReport(results, configPath, verbose) {
  console.log('\n=== TOKEN BASELINE REPORT ===');
  console.log(`Config: ${path.basename(configPath)}\n`);

  console.log(`System Prompt:         ${formatTokenCount(results.systemPrompt).padStart(8)} tokens`);
  console.log(
    `Tool Definitions:      ${formatTokenCount(results.toolDefinitions).padStart(8)} tokens ${results.toolDefinitions > 40000 ? '⚠️  (BLOAT!)' : ''}`
  );
  console.log(`Conversation History:  ${formatTokenCount(results.conversationHistory).padStart(8)} tokens`);
  console.log(`Loaded Context:        ${formatTokenCount(results.loadedContext).padStart(8)} tokens`);
  console.log('─────────────────────────────');
  console.log(
    `TOTAL OVERHEAD:        ${formatTokenCount(results.totalOverhead).padStart(8)} tokens`
  );
  console.log('(Before you type a single prompt)\n');

  if (verbose && results.tools.length > 0) {
    console.log('=== TOOL BREAKDOWN ===');
    results.tools
      .sort((a, b) => b.tokens - a.tokens)
      .forEach((tool) => {
        const pct = ((tool.tokens / results.toolDefinitions) * 100).toFixed(1);
        console.log(`  ${tool.name.padEnd(30)} ${formatTokenCount(tool.tokens).padStart(8)} tokens (${pct}%)`);
      });
    console.log();
  }
}

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.config) {
    console.error('Usage: node tools/token-inspector.js --config <config-file> [--verbose]');
    console.error('Example: node tools/token-inspector.js --config demo/mcp-configs/full-tools.json');
    process.exit(1);
  }

  const configPath = path.resolve(options.config);

  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    process.exit(1);
  }

  const results = inspectConfig(configPath);
  printReport(results, configPath, options.verbose);
}

main();
