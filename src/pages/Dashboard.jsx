import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getExpenses, getBalances } from '../services/db';

function Dashboard({ user }) {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (user) {
      setExpenses(getExpenses(user.id));
    }
  }, [user]);

  // Calculate simple mock balances based on expenses
  let totalOwed = 0;
  let totalOwe = 0;
  expenses.forEach(exp => {
    if (exp.paidBy === user.id) {
      // User paid, others owe them
      const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
      totalOwed += (exp.amount - myShare);
    } else {
      // Someone else paid, user might owe them
      const myShare = exp.participants.find(p => p.id === user.id)?.amount || 0;
      totalOwe += myShare;
    }
  });

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-md">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Good Morning, {user.name.split(' ')[0]}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Here's what's happening with your expenses today.</p>
        </div>
        <div className="flex gap-sm">
          <Link to="/scan" className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-primary text-on-primary px-md py-sm rounded-xl font-label-md ambient-shadow hover:opacity-90 transition-all">
            <span className="material-symbols-outlined">add</span>
            Add Expense
          </Link>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-surface-container-lowest text-primary border border-outline-variant px-md py-sm rounded-xl font-label-md ambient-shadow hover:bg-primary-fixed transition-all">
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
            <span className="font-headline-md text-headline-md text-on-surface">$3,420</span>
            <span className="font-body-sm text-body-sm text-secondary mb-1 flex items-center">
              <span className="material-symbols-outlined text-[16px]">trending_down</span> 12%
            </span>
          </div>
          <div className="flex-grow flex items-end gap-xs h-32">
            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[40%]"></div>
            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[60%]"></div>
            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[45%]"></div>
            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[80%]"></div>
            <div className="flex-1 bg-primary-container rounded-t-sm h-[95%]"></div>
            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[55%]"></div>
            <div className="flex-1 bg-primary-container/20 rounded-t-sm h-[30%]"></div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">You've spent 8% less than last month. Keep it up!</p>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-7 bg-surface-container-lowest rounded-xl p-md ambient-shadow border border-outline-variant/30">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
            <Link to="/history" className="font-label-md text-label-md text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-base">
            {expenses.length === 0 ? (
              <p className="text-on-surface-variant font-body-sm py-4">No recent activity found.</p>
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
                          {exp.title.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">{exp.title}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Added by {iPaid ? 'You' : 'Someone'} in <span className="font-medium text-on-surface">General</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      {iPaid ? (
                        <div className="flex gap-sm">
                        <Link to="/settle" className="flex-1 bg-primary text-on-primary py-sm rounded-lg font-label-md hover:opacity-90 transition-opacity text-center">Settle Up</Link>
                        <button className="flex-1 border border-outline-variant text-on-surface py-sm rounded-lg font-label-md hover:bg-surface-container-high transition-colors">Remind</button>
                      </div>
                      ) : (
                        <>
                          <p className="font-label-md text-label-md text-primary">You owe</p>
                          <p className="font-headline-md text-headline-md text-primary">${impactAmount.toFixed(2)}</p>
                        </>
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
            <div className="flex justify-between gap-sm overflow-x-auto pb-xs">
              <div className="flex flex-col items-center gap-xs min-w-[64px]">
                <img className="w-12 h-12 rounded-full border-2 border-secondary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqKfRxiOyLzFXz69ffucVHNqtO2d9nLCE9QTdokUwnN5bqgLbE4TwntUm_19ow8CqIPiVc5b7UwxLwEcrOmxEnXSsb5AlS3eTMJ-9ETpGOTKrX-sJf7exHWmp02JDN7ct947V-Hk_NpLjH6Aoe3xZSCkOFmZvlK_PVJsfk-NfIuNzwk89cmWRCAN0k-2s-yhjVeBjb9J_Xw-WVdwYZUchxnI5okkCpia9PrI9BipqILXBCZKK_usmm1_50iFp8gX5BwQ-boKrnrCo" alt="Sarah" />
                <span className="font-label-sm text-label-sm">Sarah</span>
              </div>
              <div className="flex flex-col items-center gap-xs min-w-[64px]">
                <img className="w-12 h-12 rounded-full border-2 border-primary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi-WDMkS5SaeqABL4IyLNuYWhWtYQG5xEdRlyh3L286HiQ5YQEot0p6UFBP8Bw-pVTU9Mbc27CB77SsoiSpG-yrg-OZEHaPSe5vYGOjIK6D3PisHEFu8PS6eVGV3LcsU5UNodJfmWnvBY09nx3Sjo-C-3cBP_3M7K6QtAbNmFxeDbQwukduqIyeBOPWSyPuLz6IPsOSixS7qYapzq_27ikJqqQjjwq47Np0BKKb6VvuGinDFatuQLX4uC_8f_NmBhvyvOqvnrCTl0" alt="Mike" />
                <span className="font-label-sm text-label-sm">Mike</span>
              </div>
              <button className="flex flex-col items-center gap-xs min-w-[64px]">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined">add</span>
                </div>
                <span className="font-label-sm text-label-sm">Invite</span>
              </button>
            </div>
          </div>

          {/* Active Groups Card */}
          <div className="bg-surface-container-lowest rounded-xl p-md ambient-shadow border border-outline-variant/30 flex-grow">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Active Groups</h3>
            <div className="space-y-sm">
              <div className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low hover:bg-surface-container hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md">The Apartment</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">3 members</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-label-sm text-label-sm text-primary">You owe</p>
                  <p className="font-label-md text-label-md text-primary">$120.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
