const HUNK_HEADER_RE = /^@@\s.*?\s@@\s*(.+)?$/;

export function extractSymbolsFromHunks(patch: string): string[] {
    const symbols: string[] = [];
    for (const line of patch.split('\n')) {
        const match = line.match(HUNK_HEADER_RE);
        if (match?.[1]) {
            const context = match[1].trim();
            const func_match = context.match(/(?:function|async\s+function)\s+(\w+)/);
            const class_match = context.match(/(?:class|interface)\s+(\w+)/);
            const method_match = context.match(/(?:async\s+)?(\w+)\s*\(/);

            if (func_match) {
                symbols.push(func_match[1]!);
            } else if (class_match) {
                symbols.push(class_match[1]!);
            } else if (method_match) {
                symbols.push(method_match[1]!);
            }
        }
    }
    return [...new Set(symbols)];
}
