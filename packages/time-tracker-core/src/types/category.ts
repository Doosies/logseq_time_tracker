export interface Category {
    id: string;
    name: string;
    parent_id: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}
