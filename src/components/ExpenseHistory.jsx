import React, { useState, useEffect } from 'react';
import { getExpenses } from '../services/db';

function ExpenseHistory({ user }) {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    setExpenses(getExpenses(user.id));
  }, [user]);

  // Calculate balances
  // Positive means people owe user. Negative means user owes people.
  const calculateBalances = () => {
    let owedToMe = 0;
    let iOwe = 0;

    expenses.forEach(exp => {
      const isPaidByMe = exp.paidBy === user.id;
      const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
      
      if (isPaidByMe) {
        owedToMe += (exp.amount - myShare);
      } else {
        iOwe += myShare;
      }
    });

    return { owedToMe, iOwe, total: owedToMe - iOwe };
  };

  const balances = calculateBalances();

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You Owe</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--danger)' }}>${balances.iOwe.toFixed(2)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You are Owed</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>${balances.owedToMe.toFixed(2)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Balance</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: balances.total >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            ${Math.abs(balances.total).toFixed(2)} {balances.total >= 0 ? '(Cr)' : '(Dr)'}
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Recent Expenses</h3>
      {expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          No expenses found. Start by adding one!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {expenses.map(exp => {
            const isPaidByMe = exp.paidBy === user.id;
            const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
            const involvedAmount = isPaidByMe ? (exp.amount - myShare) : myShare;

            return (
              <div key={exp.id} className="expense-card">
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px' }}>{exp.description}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(exp.timestamp).toLocaleDateString()} • Paid by {isPaidByMe ? 'You' : 'Someone else'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>${exp.amount.toFixed(2)}</div>
                  <div style={{ fontSize: '0.85rem', color: isPaidByMe ? 'var(--success)' : 'var(--danger)' }}>
                    {isPaidByMe ? '+' : '-'}${involvedAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExpenseHistory;
