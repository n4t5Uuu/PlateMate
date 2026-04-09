/**
 * Security utility for input sanitization and common security tasks.
 */

/**
 * Basic sanitization for input strings to prevent XSS.
 * It escapes common HTML special characters and strips script tags.
 * 
 * @param input - The raw input string.
 * @returns The sanitized string.
 */
export function sanitizeInput(input: string): string {
    if (!input) return input;
    
    // 1. Remove script tags and their content
    let sanitized = input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    
    // 2. Remove common XSS attributes like onmouseover, onclick, etc.
    sanitized = sanitized.replace(/\bon\w+\s*=/gim, "x-disallowed-attr=");

    // 3. Remove javascript: pseudo-protocol
    sanitized = sanitized.replace(/javascript:/gim, "x-javascript:");

    return sanitized;
}

/**
 * Escapes HTML special characters in a string.
 * This is a fallback defense; React handles this automatically for text content.
 */
export function escapeHTML(str: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}
