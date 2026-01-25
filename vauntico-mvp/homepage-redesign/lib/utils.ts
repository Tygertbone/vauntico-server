import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Smoke test function to verify build completes successfully
export function smokeTest() {
  return new Date().toISOString(); // Returns current timestamp as build verification
}
