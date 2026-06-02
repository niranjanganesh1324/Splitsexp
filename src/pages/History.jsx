import React, { useEffect, useState } from 'react';
import { getExpenses } from '../services/db';

function History({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getExpenses(user.id)
        .then(data => {
          setExpenses(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching expenses:", err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayExpenses = expenses;

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      {/* Header Section */}
      <div className="mb-lg">
        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs">Expense History</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Review and manage all your past shared expenses.</p>
      </div>

      {/* Filter Bento Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-lg">
        {/* Search */}
        <div className="md:col-span-2 bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30">
          <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Search Expenses</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md text-body-md" placeholder="Search by description or merchant..." type="text"/>
          </div>
        </div>
        {/* Filters */}
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col justify-center">
          <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Date Range</label>
          <div className="flex items-center justify-between bg-surface-container-low px-sm py-2 rounded-lg border border-outline-variant cursor-pointer hover:bg-surface-container-highest transition-colors">
            <span className="font-body-md text-body-md">Last 30 Days</span>
            <span className="material-symbols-outlined text-outline">calendar_month</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col justify-center">
          <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">More Filters</label>
          <div className="flex items-center justify-between bg-surface-container-low px-sm py-2 rounded-lg border border-outline-variant cursor-pointer hover:bg-surface-container-highest transition-colors">
            <span className="font-body-md text-body-md">Group & Category</span>
            <span className="material-symbols-outlined text-outline">tune</span>
          </div>
        </div>
      </div>

      {/* Expense Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Date & Category</th>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Description</th>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Who Paid</th>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant text-right">Total Amount</th>
                <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant text-right">Your Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {displayExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-md py-xl text-center text-on-surface-variant font-body-md">
                    No expenses recorded yet. Start splitting expenses with your circles!
                  </td>
                </tr>
              ) : (
                displayExpenses.map((exp, idx) => {
                const iPaid = exp.paidBy === user.id;
                const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
                
                // If I paid, my share impact is positive (others owe me)
                // If someone else paid, my share impact is negative (I owe)
                let shareText = '';
                let shareClass = '';
                
                if (iPaid) {
                  const othersOwe = exp.amount - myShare;
                  shareText = `+$${othersOwe.toFixed(2)}`;
                  shareClass = "text-secondary";
                } else {
                  shareText = `-$${myShare.toFixed(2)}`;
                  shareClass = "text-error";
                }

                const dateStr = exp.date || new Date(exp.timestamp).toLocaleDateString();
                const categoryStr = exp.category || "General";
                const groupStr = exp.group || "No Group";

                return (
                  <tr key={exp.id || idx} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-md py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                          <span className="material-symbols-outlined">restaurant</span>
                        </div>
                        <div>
                          <div className="font-label-md text-label-md text-on-surface">{dateStr}</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">{categoryStr}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-md">
                      <div className="font-label-md text-label-md text-on-surface">{exp.title}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{groupStr}</div>
                    </td>
                    <td className="px-md py-md">
                      <div className="flex items-center gap-xs">
                        <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                          {iPaid ? 'Me' : 'O'}
                        </div>
                        <span className="font-body-md text-body-md text-on-surface">{iPaid ? 'You paid' : 'Someone paid'}</span>
                      </div>
                    </td>
                    <td className="px-md py-md text-right">
                      <span className="font-label-md text-label-md text-on-surface">${exp.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-md py-md text-right">
                      <span className={`font-label-md text-label-md ${shareClass}`}>{shareText}</span>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="bg-surface-container-low border-t border-outline-variant px-md py-sm flex items-center justify-between">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to {displayExpenses.length} expenses</span>
          <div className="flex items-center gap-xs">
            <button className="p-xs text-outline hover:text-primary transition-colors disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex items-center gap-xs px-sm">
              <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">1</span>
            </div>
            <button className="p-xs text-outline hover:text-primary transition-colors disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default History;
