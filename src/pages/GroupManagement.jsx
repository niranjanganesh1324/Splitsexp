import React, { useState, useEffect } from 'react';
import { getGroups, createGroup, addMemberToGroup } from '../services/db';

function GroupManagement({ user }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Form Inputs
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    if (user) {
      setLoading(true);
      getGroups(user.id)
        .then(data => {
          setGroups(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading groups:", err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !user) return;
    
    const names = newGroupMembers
      .split(',')
      .map(n => n.trim())
      .filter(n => n);
      
    try {
      const g = await createGroup(newGroupName.trim(), user, names);
      setGroups(prev => [g, ...prev]);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupMembers('');
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !selectedGroup) return;
    
    try {
      const newMember = await addMemberToGroup(selectedGroup.id, newMemberName.trim());
      setGroups(prev => prev.map(g => {
        if (g.id === selectedGroup.id) {
          return {
            ...g,
            members: [...g.members, newMember]
          };
        }
        return g;
      }));
      setShowAddMemberModal(false);
      setNewMemberName('');
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="flex-grow max-w-[1280px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      {/* Header & Action Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Group Circles</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your shared expenses across different circles.</p>
        </div>
        <div className="flex gap-sm">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-xs px-md py-sm rounded-xl bg-primary text-on-primary font-label-md hover:opacity-90 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined">group_add</span>
            Create New Group
          </button>
        </div>
      </div>

      {/* Bento Grid for Groups */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-md mb-xl">
        {groups.map((group, index) => {
          // Alternating sizes for Bento layout
          const isLarge = index % 3 === 0;
          const colSpan = isLarge ? "md:col-span-8" : "md:col-span-4";
          
          return (
            <div key={group.id} className={`${colSpan} bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-md rounded-xl border border-outline-variant/30 flex flex-col justify-between`}>
              <div>
                <div className="flex justify-between items-start mb-md">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{group.name}</h3>
                    <span className="text-outline font-body-sm">{group.members.length} Members</span>
                  </div>
                  <button 
                    onClick={() => { setSelectedGroup(group); setShowAddMemberModal(true); }}
                    className="p-xs text-primary hover:bg-surface-container rounded-full transition-colors flex items-center"
                    title="Add Member"
                  >
                    <span className="material-symbols-outlined">person_add</span>
                  </button>
                </div>
                
                {/* Members list */}
                <div className="space-y-sm">
                  {group.members.map((member, mIdx) => (
                    <div key={member.id || mIdx} className="flex items-center justify-between p-sm bg-surface-container rounded-lg">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-body-md text-on-surface">{member.name}</span>
                      </div>
                      <span className="text-body-xs text-outline">{member.email ? 'Creator' : 'Friend'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Group Request Card */}
        <div onClick={() => setShowCreateModal(true)} className="md:col-span-4 rounded-xl border-2 border-dashed border-outline-variant p-md flex flex-col items-center justify-center text-center gap-sm bg-transparent hover:bg-surface-container/30 transition-colors cursor-pointer group min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-outline">add</span>
          </div>
          <div>
            <h4 className="font-label-md text-on-surface">Start a new circle</h4>
            <p className="font-body-sm text-on-surface-variant">Dining, travel, or bills</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Section */}
      <section className="mt-xl">
        <h2 className="font-headline-md text-headline-md mb-md">Active Settlement: {groups[0]?.name || "Roommates"}</h2>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_32px_rgba(0,0,0,0.08)] overflow-hidden border border-outline-variant/20">
          <div className="p-md bg-primary-container text-on-primary-container flex justify-between items-center">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined">account_tree</span>
              <span className="font-headline-md">Optimization Map</span>
            </div>
            <span className="font-label-md bg-white/20 px-sm py-xs rounded-full">Settling Active balances</span>
          </div>
          
          <div className="p-md grid md:grid-cols-2 gap-lg">
            {/* Visual Mapping */}
            <div className="space-y-md">
              <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider">Group Balance Sheet</h4>
              {groups[0] ? (
                <div className="space-y-sm">
                  {groups[0].members.map((member, idx) => (
                    <div key={idx} className="flex justify-between items-center py-xs border-b border-outline-variant/25 last:border-0">
                      <span className="font-body-md">{member.name}</span>
                      <span className="font-label-md text-primary">Active Member</span>
                    </div>
                  ))}
                </div>
              ) : (
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
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-container-low p-md rounded-xl">
              <h4 className="font-label-md text-on-surface-variant mb-md">GROUP INTEGRITY CONTROL</h4>
              <div className="space-y-md text-body-sm text-on-surface-variant leading-relaxed">
                <p>Data isolation is active. All groups and members are private to your credentials. Other registered users cannot access this list or view your member configurations.</p>
                <div className="flex gap-xs mt-md">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                  <span className="font-semibold text-on-surface text-[12px]">Encrypted Group Records</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg max-w-[500px] w-full ambient-shadow space-y-md">
            <div className="flex justify-between items-center pb-xs border-b border-outline-variant/30">
              <h3 className="font-headline-md text-headline-md text-on-surface">Create New Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-outline hover:text-on-surface material-symbols-outlined">close</button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="space-y-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Group Name</label>
                <input 
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  type="text" 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                  placeholder="e.g. Roommates, Japan Trip"
                  required
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Friends to Add (comma-separated names)</label>
                <input 
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  type="text" 
                  value={newGroupMembers} 
                  onChange={e => setNewGroupMembers(e.target.value)} 
                  placeholder="e.g. Sarah, Mike, Elena"
                />
                <p className="text-body-sm text-outline">You will be automatically added as the group creator.</p>
              </div>
              <div className="flex gap-sm pt-sm border-t border-outline-variant/30">
                <button type="submit" className="flex-1 py-sm bg-primary text-on-primary rounded-lg font-label-md shadow-sm hover:opacity-90 transition-all">Save Group</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-sm border border-outline-variant text-on-surface rounded-lg font-label-md hover:bg-surface-container transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg max-w-[400px] w-full ambient-shadow space-y-md">
            <div className="flex justify-between items-center pb-xs border-b border-outline-variant/30">
              <h3 className="font-headline-md text-headline-md text-on-surface">Add Group Member</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-outline hover:text-on-surface material-symbols-outlined">close</button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-md">
              <p className="font-body-sm text-outline">Add a new friend to <span className="font-semibold text-on-surface">{selectedGroup?.name}</span></p>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Member Name</label>
                <input 
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  type="text" 
                  value={newMemberName} 
                  onChange={e => setNewMemberName(e.target.value)} 
                  placeholder="e.g. Bruce Wayne"
                  required
                />
              </div>
              <div className="flex gap-sm pt-sm border-t border-outline-variant/30">
                <button type="submit" className="flex-1 py-sm bg-primary text-on-primary rounded-lg font-label-md shadow-sm hover:opacity-90 transition-all">Add Member</button>
                <button type="button" onClick={() => setShowAddMemberModal(false)} className="flex-1 py-sm border border-outline-variant text-on-surface rounded-lg font-label-md hover:bg-surface-container transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default GroupManagement;
