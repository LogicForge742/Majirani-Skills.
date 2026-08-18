const API_BASE = 'http://localhost:3000/api';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─── Public — view any artisan's portfolio ────────────────────────────────────

export const getPortfolio = async (artisanId) => {
  const res = await fetch(`${API_BASE}/portfolio/${artisanId}`);
  if (!res.ok) throw new Error('Failed to load portfolio.');
  return res.json();
};

// ─── Artisan — upload a new photo ────────────────────────────────────────────

/**
 * @param {{ image: File, caption?: string }} data
 */
export const uploadPortfolioItem = async ({ image, caption }) => {
  const formData = new FormData();
  formData.append('image', image);
  if (caption) formData.append('caption', caption);

  const res = await fetch(`${API_BASE}/portfolio`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Upload failed.');
  }
  return res.json();
};

// ─── Artisan — update caption ─────────────────────────────────────────────────

export const updatePortfolioItem = async (id, { caption }) => {
  const res = await fetch(`${API_BASE}/portfolio/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ caption }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Update failed.');
  }
  return res.json();
};

// ─── Artisan — reorder ────────────────────────────────────────────────────────

export const reorderPortfolio = async (orderedIds) => {
  const res = await fetch(`${API_BASE}/portfolio/reorder/save`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Reorder failed.');
  }
  return res.json();
};

// ─── Artisan — delete ─────────────────────────────────────────────────────────

export const deletePortfolioItem = async (id) => {
  const res = await fetch(`${API_BASE}/portfolio/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Delete failed.');
  }
  return res.json();
};
