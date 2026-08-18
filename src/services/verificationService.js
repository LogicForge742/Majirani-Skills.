const API_BASE = 'http://localhost:3000/api';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─── Skill Categories ─────────────────────────────────────────────────────────

export const getSkillCategories = async () => {
  const res = await fetch(`${API_BASE}/skill-categories`);
  if (!res.ok) throw new Error('Failed to load skill categories.');
  return res.json();
};

// ─── Artisan Personal Info ────────────────────────────────────────────────────

export const updatePersonalInfo = async (data) => {
  const res = await fetch(`${API_BASE}/artisans/me/personal-info`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update personal information.');
  }
  return res.json();
};

// ─── Verification Submission ──────────────────────────────────────────────────

/**
 * @param {{ nationalIdNumber: string, idFrontImage: File, idBackImage: File, selfieImage: File }} data
 */
export const submitVerification = async (data) => {
  const formData = new FormData();
  formData.append('nationalIdNumber', data.nationalIdNumber);
  formData.append('idFrontImage', data.idFrontImage);
  formData.append('idBackImage', data.idBackImage);
  formData.append('selfieImage', data.selfieImage);

  const res = await fetch(`${API_BASE}/verification/submit`, {
    method: 'POST',
    headers: authHeaders(), // No Content-Type — browser sets multipart boundary
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Verification submission failed.');
  }
  return res.json();
};

// ─── Get Own Status ───────────────────────────────────────────────────────────

export const getVerificationStatus = async () => {
  const res = await fetch(`${API_BASE}/verification/status`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Could not fetch verification status.');
  }
  return res.json();
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminGetVerifications = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE}/admin/verifications${query}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load verifications.');
  return res.json();
};

export const adminGetVerification = async (id) => {
  const res = await fetch(`${API_BASE}/admin/verifications/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load verification.');
  return res.json();
};

/**
 * @param {string} id
 * @param {{ action: 'APPROVE'|'REJECT'|'SUSPEND', adminNote?: string }} data
 */
export const adminReviewVerification = async (id, data) => {
  const res = await fetch(`${API_BASE}/admin/verifications/${id}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Review action failed.');
  }
  return res.json();
};
