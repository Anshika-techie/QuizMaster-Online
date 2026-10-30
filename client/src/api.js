const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('qm_token');
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  me: () => request('/auth/me'),
  quizzes: () => request('/quizzes'),
  quiz: (id) => request(`/quizzes/${id}`),
  createQuiz: (body) => request('/quizzes', { method: 'POST', body }),
  deleteQuiz: (id) => request(`/quizzes/${id}`, { method: 'DELETE' }),
  submit: (id, body) => request(`/results/${id}/submit`, { method: 'POST', body }),
  myResults: () => request('/results/mine'),
  result: (id) => request(`/results/${id}`),
};
