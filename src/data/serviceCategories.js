import { Hammer, Scissors, Zap, Wrench, PaintBucket, Home } from "lucide-react";

/** @typedef {import('@/types').ServiceCategory} ServiceCategory */

/** @type {ServiceCategory[]} */
export const serviceCategories = [
  { name: "Carpentry", icon: Hammer, count: 45 },
  { name: "Tailoring", icon: Scissors, count: 38 },
  { name: "Electrical", icon: Zap, count: 32 },
  { name: "Plumbing", icon: Wrench, count: 28 },
  { name: "Painting", icon: PaintBucket, count: 26 },
  { name: "Home Repair", icon: Home, count: 52 },
];

export const popularServices = ["Carpentry", "Plumbing", "Electrical", "Tailoring"];