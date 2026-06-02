import React, { useState, useEffect } from 'react';
import { getBalances } from '../services/db';

function SettleBalances({ user }) {
  const [selectedPayment, setSelectedPayment] = useState('bank');
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getBalances(user.id)
        .then(data => {
          setBalances(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching balances:", err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-[1280px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // We want to show people we owe. 
  // balances structure: { friendId: amount }
  // positive amount means they owe us. negative amount means we owe them.
  const debts = Object.entries(balances)
    .filter(([_, amount]) => amount < 0)
    .map(([friendId, amount]) => ({
      friendId,
      amount: Math.abs(amount)
    }));

  const totalOwed = debts.reduce((sum, d) => sum + d.amount, 0);

  const displayDebts = debts;
  const displayTotal = displayDebts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <main className="max-w-[1280px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Left Column: Balances */}
        <div className="flex-grow space-y-md">
          <div className="mb-lg">
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs">Settle Balances</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Review and pay your outstanding debts to keep the peace.</p>
          </div>
          
          {/* Debt List */}
          <div className="space-y-sm">
            {displayDebts.length === 0 ? (
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant text-center space-y-xs flex flex-col items-center justify-center min-h-[200px]">
                <span className="material-symbols-outlined text-[48px] text-secondary mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">You are all settled up!</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">No outstanding debts to settle. Excellent job managing your share!</p>
              </div>
            ) : (
              displayDebts.map((debt, i) => (
                <div key={i} className="bg-surface-container-lowest p-md rounded-xl card-shadow border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-lg">
                      {(debt.name || debt.friendId).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface">{debt.name || debt.friendId}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{debt.event || 'Owed Balance'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-lg">
                    <span className="font-headline-md text-headline-md text-error">${debt.amount.toFixed(2)}</span>
                    <button className="bg-surface-container-high text-primary px-md py-sm rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors">Settle</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Summary & Payment */}
        <div className="w-full lg:w-[400px] space-y-md mt-lg lg:mt-0">
          {/* Summary Section */}
          <div className="bg-surface-container-lowest p-lg rounded-xl card-shadow border border-outline-variant">
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Payment Summary</h2>
            <div className="space-y-sm mb-lg">
              {displayDebts.map((debt, i) => (
                <div key={i} className="flex justify-between font-body-md text-body-md text-on-surface">
                  <span>To {debt.name || debt.friendId}</span>
                  <span>${debt.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-sm border-t border-outline-variant flex justify-between">
                <span className="font-label-md text-label-md text-on-surface">Total Amount</span>
                <span className="font-headline-md text-headline-md text-primary">${displayTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm">Payment Method</h2>
            <div className="space-y-sm mb-lg">
              <label className={`flex items-center justify-between p-sm border rounded-lg cursor-pointer transition-colors ${selectedPayment === 'bank' ? 'border-primary bg-primary-fixed' : 'border-outline-variant hover:border-primary-fixed'}`}>
                <div className="flex items-center gap-sm">
                  <span className={`material-symbols-outlined ${selectedPayment === 'bank' ? 'text-primary' : 'text-on-surface-variant'}`}>account_balance</span>
                  <span className={`font-label-md text-label-md ${selectedPayment === 'bank' ? 'text-on-primary-fixed-variant' : 'text-on-surface'}`}>Bank Transfer</span>
                </div>
                <input checked={selectedPayment === 'bank'} onChange={() => setSelectedPayment('bank')} className="text-primary focus:ring-primary h-4 w-4" name="payment" type="radio"/>
              </label>

              <label className={`flex items-center justify-between p-sm border rounded-lg cursor-pointer transition-colors ${selectedPayment === 'venmo' ? 'border-primary bg-primary-fixed' : 'border-outline-variant hover:border-primary-fixed'}`}>
                <div className="flex items-center gap-sm">
                  <span className={`material-symbols-outlined ${selectedPayment === 'venmo' ? 'text-primary' : 'text-on-surface-variant'}`}>payments</span>
                  <span className={`font-label-md text-label-md ${selectedPayment === 'venmo' ? 'text-on-primary-fixed-variant' : 'text-on-surface'}`}>Venmo</span>
                </div>
                <input checked={selectedPayment === 'venmo'} onChange={() => setSelectedPayment('venmo')} className="text-primary focus:ring-primary h-4 w-4" name="payment" type="radio"/>
              </label>

              <label className={`flex items-center justify-between p-sm border rounded-lg cursor-pointer transition-colors ${selectedPayment === 'paypal' ? 'border-primary bg-primary-fixed' : 'border-outline-variant hover:border-primary-fixed'}`}>
                <div className="flex items-center gap-sm">
                  <span className={`material-symbols-outlined ${selectedPayment === 'paypal' ? 'text-primary' : 'text-on-surface-variant'}`}>credit_card</span>
                  <span className={`font-label-md text-label-md ${selectedPayment === 'paypal' ? 'text-on-primary-fixed-variant' : 'text-on-surface'}`}>PayPal</span>
                </div>
                <input checked={selectedPayment === 'paypal'} onChange={() => setSelectedPayment('paypal')} className="text-primary focus:ring-primary h-4 w-4" name="payment" type="radio"/>
              </label>
            </div>

            <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-xl hover:opacity-90 transition-all shadow-md">
              Confirm Settlement
            </button>
            <p className="mt-md text-center font-body-sm text-body-sm text-on-surface-variant">
              Payments are processed securely via Splitexp Financial services.
            </p>
          </div>

          {/* Bento Info Card */}
          <div className="bg-primary text-on-primary p-md rounded-xl flex items-center gap-md">
            <div className="p-sm bg-on-primary-container rounded-lg">
              <span className="material-symbols-outlined text-primary">verified_user</span>
            </div>
            <div>
              <h4 className="font-label-md text-label-md">Debt Protection Active</h4>
              <p className="font-body-sm text-body-sm opacity-80">Your payments are fully protected and documented.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SettleBalances;
