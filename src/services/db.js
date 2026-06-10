const API_URL = 'http://localhost:5000/api';

let authStateListener = null;

// Helper to get authorization headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ==========================================
// AUTH SERVICES
// ==========================================

export const signup = async (name, email, password) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Sign up failed");
  }

  const { user, token } = await res.json();
  localStorage.setItem('token', token);

  if (authStateListener) {
    authStateListener(user);
  }

  return user;
};

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Login failed");
  }

  const { user, token } = await res.json();
  localStorage.setItem('token', token);

  if (authStateListener) {
    authStateListener(user);
  }

  return user;
};

export const logout = async () => {
  localStorage.removeItem('token');
  if (authStateListener) {
    authStateListener(null);
  }
};

export const subscribeToAuthChanges = (callback) => {
  authStateListener = callback;
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Immediate callback if no token is stored locally
    setTimeout(() => callback(null), 0);
    return () => {
      authStateListener = null;
    };
  }

  // Fetch logged in profile details
  fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Unauthorized token");
      const user = await res.json();
      callback(user);
    })
    .catch((err) => {
      console.warn("Token validation failed, logging out:", err.message);
      localStorage.removeItem('token');
      callback(null);
    });

  return () => {
    authStateListener = null;
  };
};

// Mock Google Sign-In: registers/logs in a temporary Google test user
export const loginWithGoogle = async () => {
  const randId = Math.random().toString(36).substring(2, 9);
  const name = "Google Tester " + randId.toUpperCase();
  const email = `google_${randId}@example.com`;
  const password = "google_secret_password_12345";
  
  return signup(name, email, password);
};

// ==========================================
// EXPENSES SERVICES
// ==========================================

export const getExpenses = async (userId) => {
  const res = await fetch(`${API_URL}/expenses`, {
    headers: getHeaders()
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch expenses");
  }

  return res.json();
};

export const addExpense = async (expenseData) => {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(expenseData)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to add expense");
  }

  return res.json();
};

export const getBalances = async (userId) => {
  const expenses = await getExpenses(userId);
  const balances = {};

  expenses.forEach((exp) => {
    if (exp.paidBy === userId) {
      exp.participants.forEach((p) => {
        if (p.id !== userId) {
          balances[p.id] = (balances[p.id] || 0) + p.amount;
        }
      });
    } else {
      const myShare = exp.participants.find((p) => p.id === userId)?.amount || 0;
      if (myShare > 0) {
        balances[exp.paidBy] = (balances[exp.paidBy] || 0) - myShare;
      }
    }
  });

  return balances;
};

// ==========================================
// GROUPS SERVICES
// ==========================================

export const createGroup = async (groupName, creatorUser, memberNames = []) => {
  const members = [
    { id: creatorUser.id, name: creatorUser.name, email: creatorUser.email }
  ];

  memberNames.forEach(name => {
    if (name.trim()) {
      members.push({
        name: name.trim()
      });
    }
  });

  const res = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name: groupName, members })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create group");
  }

  return res.json();
};

export const getGroups = async (userId) => {
  const res = await fetch(`${API_URL}/groups`, {
    headers: getHeaders()
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch groups");
  }

  return res.json();
};

export const addMemberToGroup = async (groupId, memberName) => {
  const res = await fetch(`${API_URL}/groups/${groupId}/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name: memberName })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to add member to group");
  }

  return res.json();
};

export const deleteGroup = async (groupId) => {
  const res = await fetch(`${API_URL}/groups/${groupId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete group");
  }

  return res.json();
};