import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PaginatedData } from '@/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function normalizePaginatedData<T>(data: any): PaginatedData<T> {
    return {
        data: data.data || [],
        from: data.from || 0,
        to: data.to || 0,
        total: data.total || 0,
        links: data.links || []
    };
}
