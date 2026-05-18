export const generateId = () => Math.random().toString(36).substring(2, 9);

// Auth Mock
export const login = (email, password) => {
  const users = JSON.parse(localStorage.getItem('splitexp_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('splitexp_currentUser', JSON.stringify(user));
    return user;
  }
  throw new Error("Invalid credentials");
};

export const signup = (name, email, password) => {
  const users = JSON.parse(localStorage.getItem('splitexp_users') || '[]');
  if (users.find(u => u.email === email)) {
    throw new Error("Email already exists");
  }
  const newUser = { id: generateId(), name, email, password };
  users.push(newUser);
  localStorage.setItem('splitexp_users', JSON.stringify(users));
  localStorage.setItem('splitexp_currentUser', JSON.stringify(newUser));
  return newUser;
};

export const logout = () => {
  localStorage.removeItem('splitexp_currentUser');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('splitexp_currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

// Expenses Mock
export const getExpenses = (userId) => {
  const expenses = JSON.parse(localStorage.getItem('splitexp_expenses') || '[]');
  return expenses.filter(e => e.participants.some(p => p.id === userId) || e.paidBy === userId).sort((a,b) => b.timestamp - a.timestamp);
};

export const addExpense = (expenseData) => {
  const expenses = JSON.parse(localStorage.getItem('splitexp_expenses') || '[]');
  const newExpense = {
    id: generateId(),
    ...expenseData,
    timestamp: Date.now()
  };
  expenses.push(newExpense);
  localStorage.setItem('splitexp_expenses', JSON.stringify(expenses));
  return newExpense;
};

export const getBalances = (userId) => {
  const expenses = getExpenses(userId);
  const balances = {}; // friendId: balance (positive means they owe me, negative means I owe them)
  
  expenses.forEach(exp => {
    if (exp.paidBy === userId) {
      // I paid, everyone else in participants owes me
      exp.participants.forEach(p => {
        if (p.id !== userId) {
          balances[p.id] = (balances[p.id] || 0) + p.amount;
        }
      });
    } else {
      // Someone else paid. I owe them my share.
      const myShare = exp.participants.find(p => p.id === userId)?.amount || 0;
      if (myShare > 0) {
        balances[exp.paidBy] = (balances[exp.paidBy] || 0) - myShare;
      }
    }
  });
  
  return balances;
};
