import React, { useState, useEffect } from 'react';
import { addExpense, getGroups } from '../services/db';

function AddExpense({ user, onComplete, initialData = null }) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  // For simplicity in prototype: comma-separated list of friend names
  const [friendsStr, setFriendsStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  useEffect(() => {
    if (user) {
      getGroups(user.id)
        .then(data => setGroups(data))
        .catch(err => console.error("Error loading groups in AddExpense:", err));
    }
  }, [user]);

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
    if (!groupId) {
      setFriendsStr('');
      return;
    }
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const others = group.members
        .filter(m => m.id !== user.id)
        .map(m => m.name)
        .join(', ');
      setFriendsStr(others);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalAmount = parseFloat(amount);
    if (!description || isNaN(totalAmount) || totalAmount <= 0 || submitting) return;

    setSubmitting(true);
    const friendsList = friendsStr.split(',').map(f => f.trim()).filter(f => f);
    const totalPeople = friendsList.length + 1; // friends + user
    const splitAmount = totalAmount / totalPeople;

    const participants = [
      { id: user.id, name: user.name, amount: splitAmount },
      ...friendsList.map(name => ({ id: name.toLowerCase().replace(/\s/g,''), name, amount: splitAmount }))
    ];

    try {
      await addExpense({
        description,
        amount: totalAmount,
        paidBy: user.id,
        participants
      });
      onComplete();
    } catch (err) {
      console.error("Error saving expense:", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{initialData ? 'Confirm Scanned Expense' : 'Add New Expense'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Description / Title</label>
          <input 
            type="text" 
            className="form-control" 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g., Dinner at Luigi's"
            required
          />
        </div>
        <div className="form-group">
          <label>Total Amount ($)</label>
          <input 
            type="number" 
            step="0.01"
            className="form-control" 
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        {groups.length > 0 && (
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select Group to Split With</label>
            <select 
              className="form-control" 
              value={selectedGroupId}
              onChange={e => handleGroupSelect(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--bg-panel)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="">-- Or type individual names below --</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Split With (comma-separated names)</label>
          <input 
            type="text" 
            className="form-control" 
            value={friendsStr}
            onChange={e => setFriendsStr(e.target.value)}
            placeholder="e.g., Alice, Bob, Charlie"
          />
          <small style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            Amount will be split equally between you and these friends.
          </small>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
            {submitting ? 'Saving...' : 'Save Expense'}
          </button>
          <button type="button" disabled={submitting} className="btn btn-danger" onClick={onComplete} style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddExpense;
