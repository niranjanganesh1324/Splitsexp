import React, { useState } from 'react';
import { addExpense } from '../services/db';

function AddExpense({ user, onComplete, initialData = null }) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  // For simplicity in prototype: comma-separated list of friend names
  const [friendsStr, setFriendsStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
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
