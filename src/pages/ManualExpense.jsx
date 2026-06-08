import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addExpense, getGroups } from '../services/db';

function ManualExpense({ user }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  // Custom Split States
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'exact' | 'percentage'
  const [exactAmounts, setExactAmounts] = useState({}); // { [memberId]: string }
  const [percentages, setPercentages] = useState({}); // { [memberId]: string }

  useEffect(() => {
    if (user) {
      getGroups(user.id)
        .then(data => {
          setGroups(data);
          if (data.length > 0) {
            setSelectedGroup(data[0]); // default to first group
          }
        })
        .catch(err => {
          console.error("Error loading groups in ManualExpense:", err);
          setError("Failed to load your group circles.");
        });
    }
  }, [user]);

  // Reset custom splits when group changes
  useEffect(() => {
    setSplitMode('equal');
    setExactAmounts({});
    setPercentages({});
  }, [selectedGroup]);

  // Calculate dynamic split values
  const totalAmount = parseFloat(amount) || 0;
  const numMembers = selectedGroup ? selectedGroup.members.length : 0;
  const splitAmount = numMembers > 0 ? totalAmount / numMembers : 0;

  // Validation logic
  const sumExact = Object.values(exactAmounts).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  const diffExact = Math.abs(sumExact - totalAmount);
  const isExactValid = diffExact < 0.01;

  const sumPercent = Object.values(percentages).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  const diffPercent = Math.abs(sumPercent - 100);
  const isPercentValid = diffPercent < 0.2; // tolerance for 33.3% * 3 = 99.9%

  const handleSwitchSplitMode = (mode) => {
    setSplitMode(mode);
    if (!selectedGroup) return;

    if (mode === 'exact') {
      const baseShare = totalAmount / selectedGroup.members.length;
      const initialAmounts = {};
      selectedGroup.members.forEach(m => {
        initialAmounts[m.id] = baseShare.toFixed(2);
      });
      setExactAmounts(initialAmounts);
    } else if (mode === 'percentage') {
      const basePercent = 100 / selectedGroup.members.length;
      const initialPercents = {};
      selectedGroup.members.forEach(m => {
        initialPercents[m.id] = basePercent.toFixed(1);
      });
      setPercentages(initialPercents);
    }
  };

  const getUserShare = () => {
    if (!selectedGroup) return 0;
    if (splitMode === 'equal') {
      return splitAmount;
    }
    if (splitMode === 'exact') {
      return parseFloat(exactAmounts[user.id]) || 0;
    }
    if (splitMode === 'percentage') {
      const pct = parseFloat(percentages[user.id]) || 0;
      return totalAmount * (pct / 100);
    }
    return 0;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!title.trim()) {
      setError("Please enter a title for the expense.");
      return;
    }
    if (totalAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!selectedGroup) {
      setError("Please select a group circle to split with.");
      return;
    }

    if (splitMode === 'exact' && !isExactValid) {
      setError("The sum of individual amounts does not match the total amount.");
      return;
    }
    if (splitMode === 'percentage' && !isPercentValid) {
      setError("The percentages must sum up to 100%.");
      return;
    }

    setSaving(true);
    setError(null);

    let participants = [];
    if (splitMode === 'equal') {
      participants = selectedGroup.members.map(m => ({
        id: m.id,
        name: m.name,
        amount: splitAmount
      }));
    } else if (splitMode === 'exact') {
      participants = selectedGroup.members.map(m => ({
        id: m.id,
        name: m.name,
        amount: parseFloat(exactAmounts[m.id]) || 0
      }));
    } else if (splitMode === 'percentage') {
      participants = selectedGroup.members.map(m => ({
        id: m.id,
        name: m.name,
        amount: totalAmount * ((parseFloat(percentages[m.id]) || 0) / 100)
      }));
    }

    try {
      await addExpense({
        title: title.trim(),
        amount: totalAmount,
        paidBy: user.id,
        group: selectedGroup.name,
        participants
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Error creating manual split:", err);
      setError(err.message || "Failed to save the expense. Please try again.");
      setSaving(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      <div className="mb-md flex flex-col md:flex-row md:items-center justify-between gap-sm">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">New Manual Expense</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Enter details and instantly split the cost with your group.</p>
        </div>
        <Link 
          to="/scan" 
          className="flex items-center gap-xs text-primary font-label-md hover:underline"
        >
          <span className="material-symbols-outlined text-[20px]">camera_enhance</span>
          Or scan a receipt
        </Link>
      </div>

      {error && (
        <div className="mb-md p-md bg-error-container text-on-error-container rounded-xl flex items-center justify-between border border-error/20 animate-fade-in">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-error">error</span>
            <span className="font-body-md">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-outline hover:text-on-error-container material-symbols-outlined text-[20px]">close</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
        {/* Left Column: Input Form */}
        <section className="lg:col-span-5 space-y-md">
          <form onSubmit={handleConfirm} className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant space-y-md">
            <div className="flex items-center justify-between pb-sm border-b border-outline-variant/30">
              <h2 className="font-headline-md text-headline-md text-on-surface">Expense Info</h2>
              <span className="text-primary material-symbols-outlined text-[32px]">edit_note</span>
            </div>

            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">Expense Title</label>
              <div className="relative">
                <input 
                  className="w-full pl-10 pr-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Sushi Dinner, Uber ride"
                  required
                />
                <span className="material-symbols-outlined text-outline absolute left-3 top-1/2 -translate-y-1/2 select-none">shopping_cart</span>
              </div>
            </div>

            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">Total Amount ($)</label>
              <div className="relative">
                <input 
                  className="w-full pl-10 pr-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="0.00"
                  required
                />
                <span className="material-symbols-outlined text-outline absolute left-3 top-1/2 -translate-y-1/2 select-none">payments</span>
              </div>
            </div>

            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">Select Group Circle</label>
              {groups.length > 0 ? (
                <div className="relative">
                  <select 
                    className="w-full pl-10 pr-10 py-sm border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none font-body-md"
                    value={selectedGroup ? selectedGroup.id : ""}
                    onChange={e => {
                      const g = groups.find(x => x.id === e.target.value);
                      setSelectedGroup(g || null);
                    }}
                    required
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.members.length} members)</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">group</span>
                  <span className="material-symbols-outlined text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
              ) : (
                <div className="p-md border-2 border-dashed border-outline-variant rounded-lg text-center bg-surface-container-low">
                  <p className="font-body-sm text-outline mb-sm">You haven't created any group circles yet.</p>
                  <Link 
                    to="/groups" 
                    state={{ openCreateModal: true }}
                    className="inline-flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-lg font-label-sm hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px]">group_add</span>
                    Create a Group
                  </Link>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Right Column: Split Breakdown & Submit */}
        <section className="lg:col-span-7 space-y-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-end bg-surface-container-low">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Breakdown</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Split Breakdown</h2>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-outline">Total Share Split</span>
                <p className="font-headline-md text-headline-md text-primary">${totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {selectedGroup && (
              <div className="p-sm bg-surface-container border-b border-outline-variant flex flex-col sm:flex-row gap-sm items-center justify-between">
                <span className="font-label-md text-on-surface-variant">Split Mode</span>
                <div className="flex bg-surface-container-lowest rounded-lg p-xs border border-outline-variant w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSwitchSplitMode('equal')}
                    className={`flex-1 sm:flex-none px-md py-[6px] rounded-md font-label-sm text-label-sm transition-all ${splitMode === 'equal' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                  >
                    Equally
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchSplitMode('exact')}
                    className={`flex-1 sm:flex-none px-md py-[6px] rounded-md font-label-sm text-label-sm transition-all ${splitMode === 'exact' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                  >
                    Exact
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchSplitMode('percentage')}
                    className={`flex-1 sm:flex-none px-md py-[6px] rounded-md font-label-sm text-label-sm transition-all ${splitMode === 'percentage' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                  >
                    Percent
                  </button>
                </div>
              </div>
            )}

            {selectedGroup ? (
              <>
                <div className="p-sm bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between">
                  <span className="font-body-sm text-outline">
                    {splitMode === 'equal' && "Splitting equally"}
                    {splitMode === 'exact' && "Splitting by exact amounts"}
                    {splitMode === 'percentage' && "Splitting by percentage share"}
                    {" in "}
                    <span className="font-semibold text-on-surface">{selectedGroup.name}</span>
                  </span>
                  <span className="font-label-sm bg-primary-container text-on-primary-container px-xs py-[2px] rounded-full border border-primary/10">
                    {numMembers} members
                  </span>
                </div>

                <div className="divide-y divide-outline-variant max-h-[300px] overflow-y-auto">
                  {selectedGroup.members.map((member, index) => {
                    const isUser = member.id === user.id;
                    const computedShare = splitMode === 'percentage' 
                      ? totalAmount * ((parseFloat(percentages[member.id]) || 0) / 100)
                      : splitMode === 'exact'
                        ? parseFloat(exactAmounts[member.id]) || 0
                        : splitAmount;

                    return (
                      <div key={member.id || index} className="p-md flex items-center justify-between hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-body-md text-on-surface font-semibold">{member.name}</span>
                            {isUser && <span className="text-body-xs text-outline ml-xs">(You Paid)</span>}
                            {splitMode === 'percentage' && (
                              <p className="text-body-sm text-outline">
                                Share: ${computedShare.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        {splitMode === 'equal' && (
                          <span className="font-label-md text-label-md text-on-surface">
                            ${splitAmount.toFixed(2)}
                          </span>
                        )}

                        {splitMode === 'exact' && (
                          <div className="flex items-center gap-xs">
                            <span className="text-on-surface-variant font-label-sm font-semibold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-24 px-xs py-xs text-right border border-outline-variant rounded-md bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary outline-none font-body-md"
                              value={exactAmounts[member.id] || ''}
                              onChange={(e) => {
                                setExactAmounts(prev => ({
                                  ...prev,
                                  [member.id]: e.target.value
                                }));
                              }}
                            />
                          </div>
                        )}

                        {splitMode === 'percentage' && (
                          <div className="flex items-center gap-xs">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              className="w-20 px-xs py-xs text-right border border-outline-variant rounded-md bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary outline-none font-body-md"
                              value={percentages[member.id] || ''}
                              onChange={(e) => {
                                setPercentages(prev => ({
                                  ...prev,
                                  [member.id]: e.target.value
                                }));
                              }}
                            />
                            <span className="text-on-surface-variant font-label-sm font-semibold">%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {splitMode !== 'equal' && (
                  <div className="p-md bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
                    {splitMode === 'exact' ? (
                      isExactValid ? (
                        <div className="flex items-center gap-xs text-secondary font-label-sm">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Total matches: ${sumExact.toFixed(2)} / ${totalAmount.toFixed(2)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-xs text-error font-label-sm">
                          <span className="material-symbols-outlined text-[18px]">warning</span>
                          Total mismatch: Sum is ${sumExact.toFixed(2)} (should be ${totalAmount.toFixed(2)})
                        </div>
                      )
                    ) : (
                      isPercentValid ? (
                        <div className="flex items-center gap-xs text-secondary font-label-sm">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Total matches: {sumPercent.toFixed(1)}% / 100% (${(totalAmount * (sumPercent / 100)).toFixed(2)} split)
                        </div>
                      ) : (
                        <div className="flex items-center gap-xs text-error font-label-sm">
                          <span className="material-symbols-outlined text-[18px]">warning</span>
                          Total mismatch: Sum is {sumPercent.toFixed(1)}% (must sum to 100%)
                        </div>
                      )
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-xl text-center text-outline font-body-md">
                Please select or create a group to view the split.
              </div>
            )}

            <div className="bg-surface-container-high p-md">
              <div className="flex justify-between items-center mb-sm">
                <span className="font-body-md text-body-md text-on-surface-variant">Your Share ({user.name.split(' ')[0]})</span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  ${getUserShare().toFixed(2)}
                </span>
              </div>
              <button 
                onClick={handleConfirm} 
                disabled={
                  saving || 
                  !selectedGroup || 
                  !title.trim() || 
                  totalAmount <= 0 ||
                  (splitMode === 'exact' && !isExactValid) ||
                  (splitMode === 'percentage' && !isPercentValid)
                } 
                className="w-full py-md bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-base disabled:opacity-50"
              >
                {saving ? 'Creating Split...' : 'Confirm and Create Split'}
                {!saving && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ManualExpense;
