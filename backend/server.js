const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { dbRun, dbGet, dbAll } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "splitsexp_local_secret_key_987654321";

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from local frontend
  credentials: true
}));
app.use(express.json());

// Token verification middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// AUTH ENDPOINTS
// ==========================================

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    // Check if email already exists
    const existingUser = await dbGet("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const userId = 'user-' + crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = Date.now();

    await dbRun(
      "INSERT INTO users (id, name, email, password, createdAt) VALUES (?, ?, ?, ?, ?)",
      [userId, name, email, hashedPassword, createdAt]
    );

    const userPayload = { id: userId, name, email };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: userPayload, token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const userPayload = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: userPayload, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get Current User Profile (Token validation check)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet("SELECT id, name, email FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get user details error:", err);
    res.status(500).json({ message: "Server error fetching user details" });
  }
});

// ==========================================
// GROUPS ENDPOINTS
// ==========================================

// Create Group
app.post('/api/groups', authenticateToken, async (req, res) => {
  const { name, members } = req.body; // members: array of { id, name, email }

  if (!name || !Array.isArray(members)) {
    return res.status(400).json({ message: "Group name and members array are required" });
  }

  const groupId = 'group-' + crypto.randomBytes(8).toString('hex');
  const createdAt = Date.now();

  try {
    // Create group
    await dbRun(
      "INSERT INTO groups (id, name, createdBy, createdAt) VALUES (?, ?, ?, ?)",
      [groupId, name, req.user.id, createdAt]
    );

    // Create group members
    for (const member of members) {
      const memberId = member.id || ('friend-' + crypto.randomBytes(4).toString('hex'));
      await dbRun(
        "INSERT INTO group_members (groupId, memberId, name, email) VALUES (?, ?, ?, ?)",
        [groupId, memberId, member.name, member.email || null]
      );
    }

    // Retrieve full group details
    const savedMembers = await dbAll("SELECT memberId AS id, name, email FROM group_members WHERE groupId = ?", [groupId]);
    res.status(201).json({
      id: groupId,
      name,
      createdBy: req.user.id,
      timestamp: createdAt,
      members: savedMembers,
      memberIds: savedMembers.map(m => m.id)
    });
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ message: "Server error creating group" });
  }
});

// List Groups involving current user
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    // Find groups where the user is listed in members
    const groups = await dbAll(
      `SELECT g.* FROM groups g
       INNER JOIN group_members gm ON g.id = gm.groupId
       WHERE gm.memberId = ?`,
      [req.user.id]
    );

    const enrichedGroups = [];
    for (const group of groups) {
      const members = await dbAll(
        "SELECT memberId AS id, name, email FROM group_members WHERE groupId = ?",
        [group.id]
      );
      enrichedGroups.push({
        id: group.id,
        name: group.name,
        createdBy: group.createdBy,
        timestamp: group.createdAt,
        members,
        memberIds: members.map(m => m.id)
      });
    }

    res.json(enrichedGroups);
  } catch (err) {
    console.error("List groups error:", err);
    res.status(500).json({ message: "Server error listing groups" });
  }
});

// Add member to group
app.post('/api/groups/:id/members', authenticateToken, async (req, res) => {
  const groupId = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Member name is required" });
  }

  try {
    // Verify group exists
    const group = await dbGet("SELECT id FROM groups WHERE id = ?", [groupId]);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const memberId = 'friend-' + crypto.randomBytes(4).toString('hex');
    await dbRun(
      "INSERT INTO group_members (groupId, memberId, name, email) VALUES (?, ?, ?, ?)",
      [groupId, memberId, name.trim(), null]
    );

    res.status(201).json({ id: memberId, name: name.trim() });
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Server error adding member" });
  }
});

// Delete Group
app.delete('/api/groups/:id', authenticateToken, async (req, res) => {
  const groupId = req.params.id;

  try {
    const group = await dbGet("SELECT createdBy FROM groups WHERE id = ?", [groupId]);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only allow deletion if user is the creator of the group
    if (group.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Only the group creator can delete this group" });
    }

    await dbRun("DELETE FROM groups WHERE id = ?", [groupId]);
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Delete group error:", err);
    res.status(500).json({ message: "Server error deleting group" });
  }
});

// ==========================================
// EXPENSES ENDPOINTS
// ==========================================

// Create Expense
app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { title, amount, paidBy, group, participants } = req.body;

  if (!title || !amount || !paidBy || !group || !Array.isArray(participants)) {
    return res.status(400).json({ message: "Missing required expense details" });
  }

  const expenseId = 'expense-' + crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();

  try {
    // Insert expense base
    await dbRun(
      "INSERT INTO expenses (id, title, amount, paidBy, groupName, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
      [expenseId, title, parseFloat(amount), paidBy, group, timestamp]
    );

    // Insert participants
    for (const p of participants) {
      await dbRun(
        "INSERT INTO expense_participants (expenseId, participantId, name, amount) VALUES (?, ?, ?, ?)",
        [expenseId, p.id, p.name, parseFloat(p.amount)]
      );
    }

    const savedParticipants = await dbAll(
      "SELECT participantId AS id, name, amount FROM expense_participants WHERE expenseId = ?",
      [expenseId]
    );

    const userIds = [paidBy, ...savedParticipants.map(p => p.id)];
    res.status(201).json({
      id: expenseId,
      title,
      amount: parseFloat(amount),
      paidBy,
      group,
      timestamp: { seconds: Math.floor(timestamp / 1000) },
      participants: savedParticipants,
      userIds: [...new Set(userIds)]
    });
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(500).json({ message: "Server error creating expense" });
  }
});

// List Expenses involving user
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    // Retrieve expenses where paidBy is user OR user is in participants
    const expenses = await dbAll(
      `SELECT DISTINCT e.* FROM expenses e
       LEFT JOIN expense_participants ep ON e.id = ep.expenseId
       WHERE e.paidBy = ? OR ep.participantId = ?`,
      [req.user.id, req.user.id]
    );

    const enrichedExpenses = [];
    for (const exp of expenses) {
      const participants = await dbAll(
        "SELECT participantId AS id, name, amount FROM expense_participants WHERE expenseId = ?",
        [exp.id]
      );
      const userIds = [exp.paidBy, ...participants.map(p => p.id)];
      enrichedExpenses.push({
        id: exp.id,
        title: exp.title,
        amount: exp.amount,
        paidBy: exp.paidBy,
        group: exp.groupName,
        timestamp: { seconds: Math.floor(exp.timestamp / 1000) },
        participants,
        userIds: [...new Set(userIds)]
      });
    }

    // Sort by timestamp descending
    enrichedExpenses.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
    res.json(enrichedExpenses);
  } catch (err) {
    console.error("List expenses error:", err);
    res.status(500).json({ message: "Server error listing expenses" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
