import { ValidationError } from '../errors';

export function sanitizeText(input: string, max_length: number): string {
    const cleaned = input.replace(/<[^>]*>/g, '').trim();
    if (cleaned.length > max_length) {
        throw new ValidationError(`Text exceeds maximum length of ${max_length} characters`, 'text');
    }
    return cleaned;
}
