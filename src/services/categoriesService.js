import { serviceCategories, popularServices } from "@/data/serviceCategories";

/** @typedef {import('@/types').ServiceCategory} ServiceCategory */

/** @returns {Promise<ServiceCategory[]>} */
export async function getServiceCategories() {
  return Promise.resolve(serviceCategories);
}

/** @returns {Promise<string[]>} */
export async function getPopularServices() {
  return Promise.resolve(popularServices);
}