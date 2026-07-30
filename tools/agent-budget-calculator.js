#!/usr/bin/env node
/**
 * Agent Budget Calculator: Plan multi-agent pipelines with per-agent context budgets
 * Usage: node tools/agent-budget-calculator.js --scenario <scenario> --budget <total-budget>
 */

const scenarios = {
  'code-review': {
    name: 'Code Review',
    singleAgent: {
      turns: 6,
      tokensPerTurn: 28000,
      description: 'Read, analyze, review, suggest fixes, implement, test',
    },
    multiAgent: [
      {
        name: 'Analyzer',
        turns: 2,
        tokensPerTurn: 10000,
        description: 'Read diff, categorize issues',
      },
      {
        name: 'Implementer',
        turns: 2,
        tokensPerTurn: 25000,
        description: 'Generate fixes, refactor',
      },
      {
        name: 'Reviewer',
        turns: 1,
        tokensPerTurn: 8000,
        description: 'Quality check, report',
      },
    ],
  },
  refactoring: {
    name: 'Database Schema Refactoring',
    singleAgent: {
      turns: 8,
      tokensPerTurn: 30000,
      description: 'Analyze schema, plan migration, generate code, test, deploy',
    },
    multiAgent: [
      {
        name: 'Analyzer',
        turns: 2,
        tokensPerTurn: 15000,
        description: 'Analyze current schema, identify issues',
      },
      {
        name: 'Designer',
        turns: 2,
        tokensPerTurn: 20000,
        description: 'Design new schema, plan migration',
      },
      {
        name: 'Implementer',
        turns: 2,
        tokensPerTurn: 40000,
        description: 'Generate migration scripts',
      },
      {
        name: 'Tester',
        turns: 1,
        tokensPerTurn: 12000,
        description: 'Verify migrations, edge cases',
      },
    ],
  },
  'bug-hunt': {
    name: 'Bug Hunt & Fix',
    singleAgent: {
      turns: 5,
      tokensPerTurn: 35000,
      description: 'Parse logs, identify bug, locate code, fix, verify',
    },
    multiAgent: [
      {
        name: 'LogAnalyzer',
        turns: 1,
        tokensPerTurn: 5000,
        description: 'Parse errors (local grep), identify pattern',
      },
      {
        name: 'Debugger',
        turns: 2,
        tokensPerTurn: 18000,
        description: 'Locate bug in codebase',
      },
      {
        name: 'Fixer',
        turns: 2,
        tokensPerTurn: 25000,
        description: 'Generate fix, create tests',
      },
    ],
  },
};

function parseArgs(args) {
  const result = {
    scenario: null,
    budget: 100000,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scenario' && i + 1 < args.length) {
      result.scenario = args[i + 1];
      i++;
    } else if (args[i] === '--budget' && i + 1 < args.length) {
      result.budget = parseInt(args[i + 1].replace(/K|k/, '000'), 10);
      i++;
    }
  }

  return result;
}

function formatTokens(count) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function calculateSingleAgent(scenario) {
  const totalTokens = scenario.singleAgent.turns * scenario.singleAgent.tokensPerTurn;
  return {
    type: 'single',
    totalTokens,
    executionTimeMin: Math.ceil(scenario.singleAgent.turns * 0.5),
    costUSD: totalTokens * 0.00003,
  };
}

function calculateMultiAgent(scenario) {
  let totalTokens = 0;
  let maxExecutionTime = 0;
  const agents = [];

  scenario.multiAgent.forEach((agent) => {
    const agentTokens = agent.turns * agent.tokensPerTurn;
    totalTokens += agentTokens;

    // Assume agents can run in parallel within reason (serial for now for simplicity)
    const agentTime = agent.turns * 0.5;
    maxExecutionTime += agentTime;

    agents.push({
      name: agent.name,
      tokens: agentTokens,
      turns: agent.turns,
      description: agent.description,
    });
  });

  return {
    type: 'multi',
    totalTokens,
    executionTimeMin: Math.ceil(maxExecutionTime * 0.75), // 25% parallelism benefit
    agents,
    costUSD: totalTokens * 0.00003,
  };
}

function printReport(scenario, options) {
  const single = calculateSingleAgent(scenario);
  const multi = calculateMultiAgent(scenario);

  const savings = single.totalTokens - multi.totalTokens;
  const savingsPercent = ((savings / single.totalTokens) * 100).toFixed(1);
  const speedup = (single.executionTimeMin / multi.executionTimeMin).toFixed(2);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║ SCENARIO: ${scenario.name.toUpperCase().padEnd(49)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('━━━ SINGLE AGENT (CURRENT STATE) ━━━\n');
  console.log(`Turns:                  ${single.type === 'single' ? scenario.singleAgent.turns : '?'}`);
  console.log(`Tokens per turn:        ${scenario.singleAgent.tokensPerTurn.toLocaleString()}`);
  console.log(`Total tokens:           ${formatTokens(single.totalTokens).padStart(8)} (${single.totalTokens.toLocaleString()})`);
  console.log(`Execution time:         ${single.executionTimeMin} min`);
  console.log(`Cost:                   $${single.costUSD.toFixed(4)}\n`);

  console.log('━━━ MULTI-AGENT PIPELINE (OPTIMIZED) ━━━\n');
  multi.agents.forEach((agent, idx) => {
    console.log(`Agent ${idx + 1}: ${agent.name}`);
    console.log(`  Turns:                ${agent.turns}`);
    console.log(`  Tokens:               ${formatTokens(agent.tokens).padStart(8)} (${agent.tokens.toLocaleString()})`);
    console.log(`  Purpose:              ${agent.description}`);
  });

  console.log(`\nTotal tokens:           ${formatTokens(multi.totalTokens).padStart(8)} (${multi.totalTokens.toLocaleString()})`);
  console.log(`Execution time:         ${multi.executionTimeMin} min`);
  console.log(`Cost:                   $${multi.costUSD.toFixed(4)}\n`);

  console.log('━━━ COMPARISON ━━━\n');
  console.log(`Token reduction:        ${savingsPercent}% (${formatTokens(savings)} tokens saved)`);
  console.log(`Cost reduction:         ${savingsPercent}% ($${(single.costUSD - multi.costUSD).toFixed(4)} saved)`);
  console.log(`Speedup:                ${speedup}x faster\n`);

  // Budget analysis
  if (multi.totalTokens > options.budget) {
    console.log(`⚠️  Budget Analysis: OVER BUDGET`);
    console.log(`    Budget:             ${formatTokens(options.budget)}`);
    console.log(`    Projected:          ${formatTokens(multi.totalTokens)}`);
    console.log(`    Overage:            ${formatTokens(multi.totalTokens - options.budget)}\n`);
  } else {
    const remaining = options.budget - multi.totalTokens;
    const utilization = ((multi.totalTokens / options.budget) * 100).toFixed(1);
    console.log(`✅ Budget Analysis: WITHIN BUDGET`);
    console.log(`    Budget:             ${formatTokens(options.budget)}`);
    console.log(`    Projected:          ${formatTokens(multi.totalTokens)}`);
    console.log(`    Remaining:          ${formatTokens(remaining)} (${utilization}% utilized)\n`);
  }

  console.log('━━━ RECOMMENDATIONS ━━━\n');
  if (savingsPercent > 50) {
    console.log(`✅ Multi-agent pipeline offers ${savingsPercent}% token savings.`);
    console.log('   Recommendation: IMPLEMENT MULTI-AGENT APPROACH\n');
  } else {
    console.log(`ℹ️  Moderate savings (${savingsPercent}%). Consider if pipeline adds operational complexity.\n`);
  }

  // Per-agent budget guide
  console.log('━━━ PER-AGENT BUDGET GUIDE ━━━\n');
  const budgetPerAgent = (options.budget / multi.agents.length).toFixed(0);
  console.log(`Total budget: ${formatTokens(options.budget)}`);
  console.log(`Agents: ${multi.agents.length}`);
  console.log(`Budget per agent (equal split): ${formatTokens(budgetPerAgent)}\n`);

  // Optimal allocation
  console.log('━━━ OPTIMAL ALLOCATION ━━━\n');
  multi.agents.forEach((agent) => {
    const pct = ((agent.tokens / multi.totalTokens) * 100).toFixed(1);
    const optimalBudget = Math.ceil((options.budget * (agent.tokens / multi.totalTokens)) / 1000) * 1000;
    console.log(`${agent.name.padEnd(15)} ${pct.padStart(5)}%  ${formatTokens(agent.tokens).padStart(7)} tokens (allocate ${formatTokens(optimalBudget)})`);
  });
  console.log();
}

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.scenario || !scenarios[options.scenario]) {
    console.error('Usage: node tools/agent-budget-calculator.js --scenario <scenario> --budget <budget>');
    console.error('\nAvailable scenarios:');
    Object.keys(scenarios).forEach((key) => {
      console.error(`  ${key.padEnd(20)} - ${scenarios[key].name}`);
    });
    process.exit(1);
  }

  const scenario = scenarios[options.scenario];
  printReport(scenario, options);
}

main();
