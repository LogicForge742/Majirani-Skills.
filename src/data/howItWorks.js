import { Search, UserCheck, MessageCircle, Star } from "lucide-react";

/** @typedef {import('@/types').HowItWorksStep} HowItWorksStep */

/** @type {HowItWorksStep[]} */
export const howItWorksSteps = [
  {
    icon: Search,
    title: "Search & Browse",
    description: "Find artisans by service, location, and ratings in your community",
  },
  {
    icon: UserCheck,
    title: "View Profiles",
    description: "Review portfolios, ratings, and verified credentials before choosing",
  },
  {
    icon: MessageCircle,
    title: "Connect Directly",
    description: "Reach out to artisans and discuss your project requirements",
  },
  {
    icon: Star,
    title: "Leave Reviews",
    description: "Share your experience to help others make informed decisions",
  },
];