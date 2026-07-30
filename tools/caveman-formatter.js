#!/usr/bin/env node
/**
 * Caveman Formatter: Compress AI responses by 75% while preserving technical information
 * Usage: node tools/caveman-formatter.js --input "<text>" --mode [lite|full|ultra]
 */

const fs = require('fs');

const TOKENS_PER_WORD = 1.3;

function countTokens(text) {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount * TOKENS_PER_WORD);
}

function compressLite(text) {
  // Remove verbose explanations, keep code and key points
  // ~50% reduction
  text = text.replace(/[,\s]+(?=\n)/g, ''); // Remove trailing spaces/commas
  text = text.replace(/\b(The|This|That|these|those|It|is|are|was|were)\b/gi, ''); // Remove articles/helpers
  text = text.replace(/\s+/g, ' '); // Normalize whitespace
  return text.trim();
}

function compressFull(text) {
  // Aggressive compression - remove explanations, keep code & logic
  // ~75% reduction
  let compressed = text;

  // Remove common filler phrases
  const fillers = [
    /because\s+.*?\./gi,
    /in\s+other\s+words[,:].*?\./gi,
    /for\s+example[,:].*?\./gi,
    /as\s+mentioned[,:].*?\./gi,
    /note\s+that.*?\./gi,
    /you\s+might\s+notice.*?\./gi,
    /\bI\s+(?:think|believe|would|suggest|recommend).*?\./gi,
  ];

  fillers.forEach((filler) => {
    compressed = compressed.replace(filler, '');
  });

  // Remove verbose transitions
  compressed = compressed.replace(/^\s*(?:Also|Furthermore|Additionally|Moreover|However|But|So)\s+/gm, '');

  // Remove trailing explanations after code blocks
  compressed = compressed.replace(/```\n([\s\S]*?)\n```[\s\S]*?(?=\n\n|$)/g, '```\n$1\n```');

  // Remove repeated info
  compressed = compressed.replace(/(.{20,})\1+/g, '$1');

  // Clean up excessive whitespace
  compressed = compressed.replace(/\n\n\n+/g, '\n\n');
  compressed = compressed.replace(/^\s+$/gm, '');

  return compressed.trim();
}

function compressUltra(text) {
  // Extreme compression - abbreviations, minimal explanation
  // ~85% reduction
  let compressed = compressFull(text);

  // Use abbreviations
  const abbreviations = {
    /\bcannot\b/gi: "can't",
    /\brequires?\b/gi: 'needs',
    /\bimplementation\b/gi: 'impl',
    /\bconfiguration\b/gi: 'config',
    /\bdatabase\b/gi: 'db',
    /\binformation\b/gi: 'info',
    /\bfunction\b/gi: 'fn',
    /\bproblem\b/gi: 'issue',
    /\bdeprecated\b/gi: 'deprecated',
    /\binstead\b/gi: 'use',
    /\bsolution\b/gi: 'fix',
  };

  Object.entries(abbreviations).forEach(([pattern, replacement]) => {
    compressed = compressed.replace(new RegExp(pattern, 'g'), replacement);
  });

  // Remove punctuation where possible
  compressed = compressed.replace(/,\s+/g, ' ');
  compressed = compressed.replace(/:\s+/g, ':');
  compressed = compressed.replace(/\.\s+(?=[a-z])/g, '. '); // Keep sentence ends

  // Remove examples that aren't code
  compressed = compressed.replace(/Example:\s+[^\n]*\n/gi, '');

  return compressed.trim();
}

function parseArgs(args) {
  const result = {
    input: null,
    mode: 'full',
    file: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && i + 1 < args.length) {
      result.input = args[i + 1];
      i++;
    } else if (args[i] === '--mode' && i + 1 < args.length) {
      result.mode = args[i + 1];
      i++;
    } else if (args[i] === '--file' && i + 1 < args.length) {
      result.file = args[i + 1];
      i++;
    }
  }

  return result;
}

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  let inputText = '';

  if (options.file) {
    inputText = fs.readFileSync(options.file, 'utf-8');
  } else if (options.input) {
    inputText = options.input;
  } else {
    console.error('Usage: node tools/caveman-formatter.js --input "<text>" --mode [lite|full|ultra]');
    console.error('       node tools/caveman-formatter.js --file <path> --mode [lite|full|ultra]');
    process.exit(1);
  }

  const originalTokens = Math.ceil((inputText.split(/\s+/).length * 1.3));
  let compressed = '';

  switch (options.mode) {
    case 'lite':
      compressed = compressLite(inputText);
      break;
    case 'ultra':
      compressed = compressUltra(inputText);
      break;
    case 'full':
    default:
      compressed = compressFull(inputText);
      break;
  }

  const compressedTokens = Math.ceil((compressed.split(/\s+/).length * 1.3));
  const reduction = ((1 - compressedTokens / originalTokens) * 100).toFixed(1);

  console.log('\n=== CAVEMAN COMPRESSION REPORT ===\n');
  console.log(`Mode:                 ${options.mode.toUpperCase()}`);
  console.log(`Original Tokens:      ${originalTokens}`);
  console.log(`Compressed Tokens:    ${compressedTokens}`);
  console.log(`Reduction:            ${reduction}%\n`);

  console.log('=== COMPRESSED OUTPUT ===\n');
  console.log(compressed);
  console.log(`\n=== SAVINGS ===`);
  console.log(`Tokens saved: ${originalTokens - compressedTokens}`);
  console.log(`Cost saved (at $0.00003/token): $${((originalTokens - compressedTokens) * 0.00003).toFixed(4)}\n`);
}

main();
