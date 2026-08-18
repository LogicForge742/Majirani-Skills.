/**
 * ArtisanDashboard — stale token dependency test
 *
 * Regression test for the bug where the dashboard's useEffect has an empty
 * dependency array ([]) but reads `token` from a captured outer-scope closure.
 * When the auth token changes after the component first mounts, the dashboard
 * must re-fetch data with the new token instead of silently using the stale one.
 *
 * Expected behaviour (after fix):
 *   - On mount, fetch is called with the token present in localStorage.
 *   - When localStorage.token is updated and a storage event is dispatched,
 *     the component re-fetches using the new token value.
 */

import { render, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ArtisanDashboard from "../pages/artisan/Dashboard";

// ── Constants ─────────────────────────────────────────────────────────────────

const INITIAL_TOKEN = "token-aaa";
const REFRESHED_TOKEN = "token-bbb";

const mockUser = { name: "Test Artisan", email: "artisan@test.com" };

const mockArtisan = {
  id: "artisan-1",
  skill: "Plumber",
  verificationScore: 50,
  profileCompletion: 60,
  verified: false,
  verification: { verificationStatus: "UNVERIFIED" },
  rankCache: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds a minimal fetch mock that records the Authorization header used for
 * requests to /api/verification/status and returns stub data for every
 * endpoint the dashboard hits during loadData().
 */
function buildFetchMock(capturedTokens) {
  return vi.fn(async (url, options) => {
    const auth = options?.headers?.Authorization ?? null;

    if (url.includes("/api/verification/status")) {
      capturedTokens.push(auth);
      return { ok: true, json: async () => mockArtisan };
    }
    if (url.includes("/api/services/artisan/")) {
      return { ok: true, json: async () => [] };
    }
    if (url.includes("/api/reviews/artisan/")) {
      return { ok: true, json: async () => [] };
    }
    if (url.includes("/api/portfolio/")) {
      return { ok: true, json: async () => [] };
    }
    if (url.includes("/api/skill-categories")) {
      return { ok: true, json: async () => [] };
    }
    if (url.includes("/api/artisans/me/views-stats")) {
      return { ok: true, json: async () => ({ totalViews: 0 }) };
    }
    return { ok: false, json: async () => ({}) };
  });
}

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ArtisanDashboard />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ArtisanDashboard — auth token reactivity", () => {
  beforeEach(() => {
    localStorage.setItem("token", INITIAL_TOKEN);
    localStorage.setItem("user", JSON.stringify(mockUser));
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("fetches dashboard data on initial mount using the stored token", async () => {
    const capturedTokens = [];
    global.fetch = buildFetchMock(capturedTokens);

    renderDashboard();

    await waitFor(() => {
      expect(capturedTokens.length).toBeGreaterThan(0);
    });

    // First load must use the initial token
    expect(capturedTokens[0]).toBe(`Bearer ${INITIAL_TOKEN}`);
  });

  it("re-fetches with the new token when localStorage.token changes", async () => {
    const capturedTokens = [];
    global.fetch = buildFetchMock(capturedTokens);

    renderDashboard();

    // Wait for initial fetch to complete
    await waitFor(() => expect(capturedTokens.length).toBeGreaterThan(0));

    // Simulate token refresh (e.g. silent re-login from another tab)
    await act(async () => {
      localStorage.setItem("token", REFRESHED_TOKEN);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "token",
          oldValue: INITIAL_TOKEN,
          newValue: REFRESHED_TOKEN,
          storageArea: localStorage,
        })
      );
    });

    // After the token update, the component must re-fetch using the new token
    await waitFor(() => {
      const usedRefreshed = capturedTokens.some(
        (t) => t === `Bearer ${REFRESHED_TOKEN}`
      );
      expect(usedRefreshed).toBe(true);
    });
  });
});
