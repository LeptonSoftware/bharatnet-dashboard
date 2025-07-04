import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCircleName(circle: string): string {
  const circleMap: Record<string, string> = {
    upe: 'UP East',
    upw: 'UP West',
    westBengal: 'West Bengal',
    bihar: 'Bihar',
    mp: 'Madhya Pradesh',
    rajasthan: 'Rajasthan',
    gujarat: 'Gujarat',
    maharashtra: 'Maharashtra',
    jharkhand: 'Jharkhand',
    odisha: 'Odisha'
  };
  
  return circleMap[circle] || circle.toUpperCase();
}