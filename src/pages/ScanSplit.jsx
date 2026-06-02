import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addExpense } from '../services/db';

function ScanSplit({ user }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await addExpense({
        title: "Grocery Run",
        amount: 248.50,
        paidBy: user.id,
        participants: [
          { id: user.id, amount: 24.80 },
          { id: "mock-friend-1", amount: 100.00 },
          { id: "mock-friend-2", amount: 123.70 }
        ]
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Error creating split:", err);
      setSaving(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
        {/* Left: Bill Scanning/Upload Column */}
        <section className="lg:col-span-5 space-y-md">
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant">
            <div className="flex items-center justify-between mb-md">
              <h1 className="font-headline-md text-headline-md text-on-surface">Scan Receipt</h1>
              <span className="text-primary material-symbols-outlined text-[32px]">camera_enhance</span>
            </div>
            <div className="relative group aspect-[3/4] bg-surface-container-low rounded-lg overflow-hidden border-2 border-dashed border-outline-variant hover:border-primary transition-colors flex flex-col items-center justify-center cursor-pointer">
              <div className="text-center p-lg">
                <span className="material-symbols-outlined text-outline text-[48px] mb-base">cloud_upload</span>
                <p className="font-label-md text-label-md text-on-surface-variant">Drag and drop or click to upload receipt</p>
                <p className="font-body-sm text-body-sm text-outline mt-xs">PNG, JPG or PDF up to 10MB</p>
              </div>
              {/* Simulated Scanned Image Overlay */}
              <div className="absolute inset-0 opacity-10 bg-cover bg-center grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3jqUjBxKghgwQu5XAyG-_QUwOG-CffEzRQPwsNjAPNC2QuVYNiOUGWYhEapUihtqJ7d4EirqPeyRLuwtMFYs00GPVzKMQaLvSANJXQSGKDr5ErZRB3ME3d84j924AakZ0AObTyJDymfZZyqwklK73aQ_4c63BHE0d5U4ST0I9cOrNSyB4SeEwKeM4BWQ08GJ89LcN9TSuP8sAUgGo2xPfUbfaKDebG4Xj-nwlhtSSKOnKqcgxrHjoyWnHMOzPq5WRPU0HPsFwo2k')" }}></div>
            </div>
            <div className="mt-md flex gap-base">
              <button className="flex-1 py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">Extract Items</button>
              <button className="px-md py-sm border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors">Retake</button>
            </div>
          </div>
          
          {/* Group Selector */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant">
            <h2 className="font-label-md text-label-md text-on-surface-variant mb-sm">Assign to Group</h2>
            <div className="flex items-center gap-sm p-sm border border-outline-variant rounded-lg hover:border-primary cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div className="flex-grow">
                <p className="font-label-md text-label-md text-on-surface">Weekend Cabin Trip</p>
                <p className="font-body-sm text-body-sm text-outline">6 members</p>
              </div>
              <span className="material-symbols-outlined text-outline">expand_more</span>
            </div>
          </div>
        </section>

        {/* Right: Itemized List and Split Logic */}
        <section className="lg:col-span-7 space-y-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant overflow-hidden">
            <div className="p-md border-b border-outline-variant flex justify-between items-end">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Analysis Result</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Itemized Bill Details</h2>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-outline">Total Amount</span>
                <p className="font-headline-md text-headline-md text-primary">$248.50</p>
              </div>
            </div>
            
            {/* Member Selection Quick-Chips */}
            <div className="p-sm bg-surface-container-low flex gap-xs overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-xs bg-primary-container text-on-primary-container px-sm py-xs rounded-full border border-primary/20 whitespace-nowrap">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">JD</div>
                <span className="font-label-sm text-label-sm">John D.</span>
              </div>
              <div className="flex items-center gap-xs bg-white text-on-surface-variant px-sm py-xs rounded-full border border-outline-variant whitespace-nowrap hover:bg-surface-container-high cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-secondary-fixed-dim flex items-center justify-center text-[10px] text-on-secondary-fixed">SR</div>
                <span className="font-label-sm text-label-sm">Sarah R.</span>
              </div>
            </div>
            
            {/* Item List */}
            <div className="divide-y divide-outline-variant">
              {/* Item Row 1 */}
              <div className="p-md flex items-start gap-md hover:bg-surface-container-low transition-colors">
                <div className="pt-xs">
                  <input defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" type="checkbox"/>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-label-md text-label-md text-on-surface">Whole Organic Chicken</h3>
                    <span className="font-label-md text-label-md text-on-surface">$18.40</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-outline mb-base">Grocery • Tax Incl.</p>
                  <div className="flex flex-wrap gap-xs">
                    <span className="px-xs py-[2px] bg-secondary-container/30 text-secondary text-[10px] font-bold rounded uppercase">Shared by 3</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Summary */}
            <div className="bg-surface-container-high p-md">
              <div className="flex justify-between items-center mb-sm">
                <span className="font-body-md text-body-md text-on-surface-variant">Your Share ({user.name})</span>
                <span className="font-headline-md text-headline-md text-on-surface">$24.80</span>
              </div>
              <button onClick={handleConfirm} disabled={saving} className="w-full py-md bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-base disabled:opacity-50">
                {saving ? 'Creating Split...' : 'Confirm and Create Split'}
                {!saving && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
          </div>
          
          {/* Insights Tip */}
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex items-start gap-md">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
              <span className="material-symbols-outlined">lightbulb</span>
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface">Pro-tip: Auto-Split</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">We've automatically detected tax and service charges. You can choose to split these proportionally or as a fixed amount in the settings.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ScanSplit;
