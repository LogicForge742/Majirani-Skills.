/**
 * Shared JSDoc type definitions for Majirani Skills.
 * Importable in any JS/JSX file via:
 *   /** @typedef {import('@/types').Artisan} Artisan *\/
 */

/**
 * @typedef {Object} Location
 * @property {string} city
 * @property {string} [area]
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} author
 * @property {number} rating
 * @property {string} comment
 * @property {string} date
 */

/**
 * @typedef {Object} Artisan
 * @property {number} id
 * @property {string} name
 * @property {string} skill
 * @property {string} location
 * @property {number} rating
 * @property {number} reviews
 * @property {string} experience
 * @property {boolean} verified
 */

/**
 * @typedef {Object} ServiceCategory
 * @property {string} name
 * @property {import('lucide-react').LucideIcon} icon
 * @property {number} count
 */

/**
 * @typedef {Object} HowItWorksStep
 * @property {import('lucide-react').LucideIcon} icon
 * @property {string} title
 * @property {string} description
 */

export {};