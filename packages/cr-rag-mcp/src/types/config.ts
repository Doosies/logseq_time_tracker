export interface CrRagConfig {
    file_roles?: {
        custom_rules?: Array<{ pattern: string; role: string }>;
        additional_roles?: string[];
        use_builtin_patterns?: boolean;
    };
    grouping?: {
        time_gap_minutes?: number;
        require_file_overlap?: boolean;
    };
    diff_size_gate?: {
        normal_max_lines?: number;
    };
}
