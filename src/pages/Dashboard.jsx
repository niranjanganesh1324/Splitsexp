import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getExpenses, getGroups, deleteExpense } from '../services/db';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([getExpenses(user.id), getGroups(user.id)])
        .then(([expensesData, groupsData]) => {
          setExpenses(expensesData);
          setGroups(groupsData);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching dashboard data:", err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleDeleteClick = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense? This will restore balances for all participants.")) {
      try {
        await deleteExpense(expenseId);
        setExpenses(expenses.filter(e => e.id !== expenseId));
      } catch (err) {
        console.error("Error deleting expense:", err);
        alert("Failed to delete the expense. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-md flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate real balances based on expenses
  let totalOwed = 0;
  let totalOwe = 0;
  expenses.forEach(exp => {
    if (exp.paidBy === user.id) {
      // User paid, others owe them
      const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
      totalOwed += (exp.amount - myShare);
    } else {
      // Someone else paid, user owes their share
      const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
      totalOwe += myShare;
    }
  });

  // Calculate monthly spending
  const calculateMonthlySpending = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let total = 0;
    expenses.forEach(exp => {
      const expDate = exp.timestamp?.seconds 
        ? new Date(exp.timestamp.seconds * 1000) 
        : new Date(exp.timestamp || Date.now());
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
        total += myShare;
      }
    });
    return total;
  };

  const monthlySpending = calculateMonthlySpending();

  // Weekly spending data (for last 7 days)
  const getWeeklyData = () => {
    const daily = Array(7).fill(0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    expenses.forEach(exp => {
      const expDate = exp.timestamp?.seconds 
        ? new Date(exp.timestamp.seconds * 1000) 
        : new Date(exp.timestamp || Date.now());
      
      const diffTime = today.getTime() - expDate.getTime();
      let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Handle slight clock desync
      if (diffDays < 0 && diffTime > -7200000) {
        diffDays = 0;
      }

      if (diffDays >= 0 && diffDays < 7) {
        const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
        daily[6 - diffDays] += myShare;
      }
    });

    const maxVal = Math.max(...daily);
    
    // Generate day labels (e.g., "Mon", "Tue", etc.)
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    return daily.map((value, idx) => {
      const percentage = maxVal === 0 ? 15 : Math.max((value / maxVal) * 100, 10);
      return {
        day: labels[idx],
        value: value,
        height: percentage
      };
    });
  };

  const weeklyData = getWeeklyData();

  // Dynamic Frequent Friends list
  const getFrequentFriends = () => {
    const friends = {};
    groups.forEach(g => {
      g.members.forEach(m => {
        if (m.id !== user.id) {
          friends[m.name] = (friends[m.name] || 0) + 1;
        }
      });
    });
    return Object.entries(friends)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
  };

  const frequentFriends = getFrequentFriends();

  const handleCreateGroupClick = () => {
    navigate('/groups', { state: { openCreateModal: true } });
  };

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-md">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Good Morning, {user.name.split(' ')[0]}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Here's what's happening with your expenses today.</p>
        </div>
        <div className="flex flex-wrap gap-sm w-full md:w-auto">
          <Link to="/manual" className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-primary text-on-primary px-md py-sm rounded-xl font-label-md ambient-shadow hover:opacity-90 transition-all">
            <span className="material-symbols-outlined">edit_note</span>
            Manual Entry
          </Link>
          <Link to="/scan" className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-surface-container-lowest text-primary border border-outline-variant px-md py-sm rounded-xl font-label-md ambient-shadow hover:bg-primary-fixed transition-all">
            <span className="material-symbols-outlined">camera_enhance</span>
            Scan Bill
          </Link>
          <button 
            onClick={handleCreateGroupClick} 
            className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-surface-container-lowest text-outline border border-outline-variant px-md py-sm rounded-xl font-label-md ambient-shadow hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined">group_add</span>
            Create Group
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
        
        {/* Total Balance Card */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-md ambient-shadow border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Balance</span>
            <h2 className="font-headline-xl text-headline-xl text-on-surface mt-xs">${Math.abs(totalOwed - totalOwe).toFixed(2)}</h2>
          </div>
          <div className="grid grid-cols-2 gap-md mt-xl">
            <div className="p-md rounded-lg bg-secondary-container/20 border border-secondary-container/30">
              <div className="flex items-center gap-xs text-secondary mb-xs">
                <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                <span className="font-label-md text-label-md">You are owed</span>
              </div>
              <span className="font-headline-md text-headline-md text-secondary">${totalOwed.toFixed(2)}</span>
            </div>
            <div className="p-md rounded-lg bg-primary-container/10 border border-primary-container/20">
              <div className="flex items-center gap-xs text-primary mb-xs">
                <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                <span className="font-label-md text-label-md">You owe</span>
              </div>
              <span className="font-headline-md text-headline-md text-primary">${totalOwe.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-md ambient-shadow border border-outline-variant/30 flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">Monthly Spending</span>
          <div className="flex items-end gap-xs mb-sm">
            <span className="font-headline-md text-headline-md text-on-surface">${monthlySpending.toFixed(2)}</span>
          </div>
          <div className="flex-grow flex items-end gap-sm h-36 mt-sm pb-xs">
            {weeklyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-inverse-surface text-inverse-on-surface text-[10px] font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  ${data.value.toFixed(2)}
                </div>
                
                {/* Bar */}
                <div 
                  className={`w-full rounded-t-sm transition-all duration-300 ease-out cursor-pointer origin-bottom hover:scale-y-[1.03] ${
                    i === 6 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-primary-container/30 hover:bg-primary-container/50'
                  }`}
                  style={{ height: `${data.height}%` }}
                ></div>
                
                {/* Day label */}
                <span className="font-label-sm text-[10px] text-on-surface-variant mt-2 select-none uppercase tracking-wider">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">Your dynamic 7-day spending distribution index.</p>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-7 bg-surface-container-lowest rounded-xl p-md ambient-shadow border border-outline-variant/30">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
            <Link to="/history" className="font-label-md text-label-md text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-base">
            {expenses.length === 0 ? (
              <p className="text-on-surface-variant font-body-sm py-4">No recent activity found. Add an expense to start tracking!</p>
            ) : (
              expenses.slice(0, 3).map((exp, idx) => {
                const iPaid = exp.paidBy === user.id;
                const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
                const impactAmount = iPaid ? (exp.amount - myShare) : myShare;
                
                return (
                  <div key={exp.id || idx} className="flex items-center justify-between py-sm border-b border-outline-variant/20 last:border-0">
                    <div className="flex items-center gap-md">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-lg">
                          {(exp.title || exp.description || 'E').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">{exp.title || exp.description}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Paid by {iPaid ? 'You' : 'Someone else'} in <span className="font-medium text-on-surface">{exp.group || "No Group"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div className="text-right">
                        {iPaid ? (
                          <div className="text-right">
                            <p className="font-label-sm text-label-sm text-secondary">You lent</p>
                            <p className="font-headline-sm text-headline-sm text-secondary">${impactAmount.toFixed(2)}</p>
                          </div>
                        ) : (
                          <>
                            <p className="font-label-md text-label-md text-primary">You owe</p>
                            <p className="font-headline-md text-headline-md text-primary">${impactAmount.toFixed(2)}</p>
                          </>
                        )}
                      </div>
                      {iPaid && (
                        <button 
                          onClick={() => handleDeleteClick(exp.id)}
                          className="text-error hover:text-error/80 transition-colors p-xs bg-transparent border-none cursor-pointer inline-flex items-center justify-center"
                          title="Delete expense"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Friends & Groups */}
        <div className="md:col-span-5 flex flex-col gap-md">
          {/* Top Friends Card */}
          <div className="bg-surface-container-lowest rounded-xl p-md ambient-shadow border border-outline-variant/30">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Frequent Friends</h3>
            <div className="flex gap-sm overflow-x-auto pb-xs">
              {frequentFriends.length === 0 ? (
                <p className="text-on-surface-variant font-body-sm py-2">Create groups to add friends.</p>
              ) : (
                frequentFriends.map((name, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-xs min-w-[64px]">
                    <div className="w-12 h-12 rounded-full border-2 border-primary bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-md uppercase">
                      {name.charAt(0)}
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface overflow-hidden text-ellipsis whitespace-nowrap max-w-[64px]">{name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Groups Card */}
          <div className="bg-surface-container-lowest rounded-xl p-md ambient-shadow border border-outline-variant/30 flex-grow">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Active Groups</h3>
            <div className="space-y-sm">
              {groups.length === 0 ? (
                <p className="text-on-surface-variant font-body-sm py-4">No groups yet. Start your first circle!</p>
              ) : (
                groups.slice(0, 3).map((group, idx) => (
                  <div key={group.id || idx} className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low hover:bg-surface-container hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-label-md text-label-md">{group.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{group.members.length} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-body-xs font-semibold text-secondary px-xs py-[2px] bg-secondary-container/30 rounded uppercase">Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
