import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import type { CrRagConfig } from '../types/config.js';

export async function loadConfig(project_root: string): Promise<CrRagConfig> {
    const config_path = `${project_root}/.cursor/cr-rag-mcp.yaml`;
    try {
        const raw = await readFile(config_path, 'utf-8');
        return parse(raw) as CrRagConfig;
    } catch {
        return {};
    }
}
