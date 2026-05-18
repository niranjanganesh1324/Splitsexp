import React from 'react';

function GroupManagement({ user }) {
  return (
    <main className="flex-grow max-w-[1280px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      {/* Header & Action Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Group Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your shared expenses across different circles.</p>
        </div>
        <div className="flex gap-sm">
          <button className="flex items-center gap-xs px-md py-sm rounded-xl border border-outline text-primary font-label-md hover:bg-primary-fixed transition-colors">
            <span className="material-symbols-outlined">person_add</span>
            Add Members
          </button>
          <button className="flex items-center gap-xs px-md py-sm rounded-xl bg-primary text-on-primary font-label-md hover:opacity-90 shadow-sm transition-all">
            <span className="material-symbols-outlined">group_add</span>
            Create New Group
          </button>
        </div>
      </div>

      {/* Bento Grid for Groups */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-md mb-xl">
        {/* Featured Group: Roommates */}
        <div className="md:col-span-8 group relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-md flex flex-col md:flex-row gap-md border border-outline-variant/30">
          <div className="w-full md:w-1/3 aspect-square rounded-lg overflow-hidden relative bg-surface-container-high">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6oyDnAopNUbKWAuY_VQhcyXnNeoG_vm23icBgl2r8af0bapj05T42dDNGhLFJvQ6ei3Ylrfx5nEQPh_8evm2IAFxEV8RGx7AwjlmTzzV4G_LLAUiyc5xTR2e3WkyC8AuykDuNoAdDA8zEvW5mzHNBVleC5YmCNtU5jhzDDmA74SAJL6gsmdixrsJfS0D8ExHUfduYcLnFBwYfHDApT4j2sZ_ff5ZESRjGne1cBsjkmah1DhTjrP8OF52vFNsXkL5db8urR8yXM30" alt="Group cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-sm">
              <span className="text-white font-headline-md">Roommates</span>
              <span className="text-white/80 font-body-sm">4 Active Members</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-sm">
                <h3 className="font-headline-md text-headline-md text-primary">Relationship Mapping</h3>
                <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full font-label-sm">In Balance</span>
              </div>
              <div className="space-y-sm">
                <div className="flex items-center justify-between p-sm bg-surface-container rounded-lg">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">JD</div>
                    <span className="font-body-md">John Doe owes you</span>
                  </div>
                  <span className="font-label-md text-secondary">$42.50</span>
                </div>
                <div className="flex items-center justify-between p-sm bg-surface-container rounded-lg">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold">MS</div>
                    <span className="font-body-md">You owe Maria S.</span>
                  </div>
                  <span className="font-label-md text-error">$15.00</span>
                </div>
              </div>
            </div>
            <button className="mt-md text-primary font-label-md flex items-center gap-xs self-end group-hover:gap-sm transition-all">
              View Detailed Breakdown <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Small Group: Trip to Japan */}
        <div className="md:col-span-4 rounded-xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-md border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="w-full h-32 rounded-lg overflow-hidden mb-md bg-surface-container-high">
               <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmk3Kc9OjejAheh6s6cRZCxvAiiFWkNj3eukt9UWLmszPUV_4Gncrpon0S_HnCWJdcO2brOUxhV0j5cOWlWIsidROTJKH7z-HFSfyUNWWyI22uKZtIpZKTG1rGFfMc6lXaNVqwac3-QMJIQGPKkkXSoBgRFiuUAZm8mKtpeMrnB9jlPX_1kZYvtosrs74UH9CoT2aLsmmqwmeXc4dsD0n3Pjej9vy5MVJ-LxV-Nq3L2V2OqICeEKuicSZ18WrPH5hlFDBg-_wGI6Q" alt="Japan trip" />
            </div>
            <div className="flex justify-between items-center mb-base">
              <h3 className="font-headline-md text-headline-md text-on-surface">Trip to Japan</h3>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">more_vert</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Shared expenses for flights, sushi, and rail passes.</p>
          </div>
          <div className="space-y-sm">
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[65%]"></div>
            </div>
            <div className="flex justify-between font-label-sm">
              <span className="text-on-surface-variant">Total Spent</span>
              <span className="text-primary">$2,450.00</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="md:col-span-4 rounded-xl bg-primary-container text-on-primary-container p-md shadow-lg flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-[32px] mb-sm">account_balance_wallet</span>
            <h4 className="font-headline-md">Total Balance</h4>
            <p className="font-body-sm opacity-80">Across 5 groups</p>
          </div>
          <div className="mt-xl">
            <span className="font-headline-xl block">$342.10</span>
            <span className="font-label-md flex items-center gap-xs"><span className="material-symbols-outlined text-secondary-container">trending_up</span> 12% from last month</span>
          </div>
        </div>

        {/* Secondary Group: Friday Soccer */}
        <div className="md:col-span-4 rounded-xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-md border border-outline-variant/30">
          <div className="flex items-center gap-md mb-md">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined">sports_soccer</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md">Friday Soccer</h3>
              <span className="font-body-sm text-on-surface-variant">8 Members</span>
            </div>
          </div>
          <div className="flex -space-x-3 mb-md">
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary text-white flex justify-center items-center text-xs">M1</div>
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-secondary text-white flex justify-center items-center text-xs">M2</div>
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container flex items-center justify-center text-label-sm">+6</div>
          </div>
          <div className="bg-surface-container-low p-sm rounded-lg flex justify-between items-center">
            <span className="font-body-sm">Next Payment</span>
            <span className="font-label-md">Oct 24</span>
          </div>
        </div>

        {/* Group Request Card */}
        <div className="md:col-span-4 rounded-xl border-2 border-dashed border-outline-variant p-md flex flex-col items-center justify-center text-center gap-sm bg-transparent hover:bg-surface-container/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-outline">add</span>
          </div>
          <div>
            <h4 className="font-label-md text-on-surface">Start a new circle</h4>
            <p className="font-body-sm text-on-surface-variant">Dining, travel, or bills</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Section (Mocked 'Inside View') */}
      <section className="mt-xl">
        <h2 className="font-headline-md text-headline-md mb-md">Active Settlement: Roommates</h2>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_32px_rgba(0,0,0,0.08)] overflow-hidden border border-outline-variant/20">
          <div className="p-md bg-primary-container text-on-primary-container flex justify-between items-center">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined">account_tree</span>
              <span className="font-headline-md">Optimization Map</span>
            </div>
            <span className="font-label-md bg-white/20 px-sm py-xs rounded-full">3 Transfers Needed</span>
          </div>
          
          <div className="p-md grid md:grid-cols-2 gap-lg">
            {/* Visual Mapping */}
            <div className="space-y-md">
              <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider">The Flow</h4>
              <div className="relative space-y-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold">JD</div>
                    <span className="font-body-md">John Doe</span>
                  </div>
                  <div className="flex-1 border-t border-dashed border-outline mx-md relative">
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 text-secondary font-label-sm">$22.00</span>
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-secondary text-[16px]">chevron_right</span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="font-body-md">You</span>
                    <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">ME</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold">MS</div>
                    <span className="font-body-md">Maria S.</span>
                  </div>
                  <div className="flex-1 border-t border-dashed border-outline mx-md relative">
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 text-secondary font-label-sm">$15.50</span>
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-secondary text-[16px]">chevron_right</span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="font-body-md">John Doe</span>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold">JD</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-container-low p-md rounded-xl">
              <h4 className="font-label-md text-on-surface-variant mb-md">RECENT ACTIVITY</h4>
              <div className="space-y-md">
                <div className="flex justify-between items-center pb-sm border-b border-outline-variant">
                  <div>
                    <p className="font-label-md">Internet Bill</p>
                    <p className="font-body-sm text-on-surface-variant">Paid by You</p>
                  </div>
                  <span className="font-label-md text-secondary">+$85.00</span>
                </div>
                <div className="flex justify-between items-center pb-sm border-b border-outline-variant">
                  <div>
                    <p className="font-label-md">Grocery Run</p>
                    <p className="font-body-sm text-on-surface-variant">Paid by Maria S.</p>
                  </div>
                  <span className="font-label-md text-error">-$42.00</span>
                </div>
                <button className="w-full text-center py-base font-label-sm text-primary hover:underline">View All Expenses</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default GroupManagement;
