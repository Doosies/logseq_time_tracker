---
name: orchestrator
description: Agent orchestration and workflow management skill. Use for task classification, quality gate management, subagent coordination, parallel execution, and progress monitoring.
disable-model-invocation: true
---

# Orchestrator Skill

Meta skill for main agent orchestration and workflow management.

## When to Use

- Classifying incoming tasks (feature, bugfix, refactor, docs, hotfix, chore)
- Managing quality gates between workflow stages
- Coordinating subagent communication
- Decomposing complex tasks into subtasks
- Selecting appropriate agents for each subtask
- Managing parallel execution strategies
- Monitoring workflow progress

## Detailed References

Read from `references/` directory as needed:

### Task Management
- `references/task-classifier.md` - Task type classification rules
- `references/quality-gate.md` - Quality gate criteria and validation
- `references/workflow-manager.md` - Workflow pattern selection

### Subagent Coordination
- `references/subagent-communication.md` - Subagent communication protocol
- `references/agent-selection.md` - Agent selection criteria
- `references/task-decomposition.md` - Task decomposition methodology

### Execution Management
- `references/parallel-execution.md` - Parallel execution strategies
- `references/workflow-orchestration.md` - Workflow orchestration patterns
- `references/dependency-management.md` - Task dependency management
- `references/progress-monitoring.md` - Progress monitoring and reporting
