import React, { useState, useEffect } from 'react';
import { getTeamMembers, addTeamMember, removeTeamMember } from '../api/team.api';
import { Users, UserPlus, Mail, Shield, Trash2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

const Team: React.FC = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await getTeamMembers();
      if (res?.Data) {
        setMembers(res.Data);
      } else if (Array.isArray(res)) {
        setMembers(res);
      }
    } catch (err) {
      console.error('Failed to fetch team members', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsInviting(true);
    try {
      const res = await addTeamMember(formData);
      if (res.Type === 'Success' || res.Type === 'S') {
        setFormData({ first_name: '', last_name: '', email: '', password: '' });
        toast.success('Team member added', `${formData.first_name} has been added successfully.`);
        fetchMembers();
      } else {
        setError(res.Message || 'Failed to add member');
        toast.error('Add failed', res.Message || 'Could not add team member.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.Message || 'An error occurred while adding the member';
      setError(errMsg);
      toast.error('Add failed', errMsg);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmRemoveId) return;
    try {
      setIsRemoving(true);
      const res = await removeTeamMember(confirmRemoveId);
      if (res.Success || res.Type === 'Success' || res.Type === 'S') {
        toast.success('Member removed', 'The team member has been successfully removed.');
        fetchMembers();
      } else {
        toast.error('Removal failed', res.Message || 'Could not remove team member.');
      }
    } catch (err: any) {
      console.error('Failed to remove member', err);
      toast.error('Removal failed', err?.response?.data?.Message || 'An unexpected error occurred.');
    } finally {
      setIsRemoving(false);
      setConfirmRemoveId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Team Members</h1>
          <p className="text-zinc-400 font-medium">Manage access and permissions for your workspace.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Add Member Form */}
        <div className="md:col-span-1">
          <div className="w3-card p-6 border border-white/5 relative">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <UserPlus size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">Add Member</h3>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-bold flex gap-2 items-start">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">First Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500/50 outline-none transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Last Name</label>
                <input 
                  type="text" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500/50 outline-none transition-colors"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500/50 outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Temporary Password</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-4 pr-12 py-2.5 text-sm text-zinc-100 focus:border-emerald-500/50 outline-none transition-colors"
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isInviting}
                className="w-full mt-6 py-3 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {isInviting ? 'Adding...' : 'Add Team Member'}
              </button>
            </form>
          </div>
        </div>

        {/* Member List */}
        <div className="md:col-span-2">
          <div className="w3-card p-0 border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">Current Members ({members.length})</h3>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center text-zinc-500">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <Shield className="text-zinc-500 opacity-50" size={24} />
                </div>
                <p className="text-zinc-400 font-medium">No team members found.</p>
                <p className="text-sm text-zinc-500 mt-1">Add your first team member using the form.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {members.map((member) => (
                  <div key={member.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                        {member.first_name?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-zinc-100">{member.first_name} {member.last_name}</h4>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                            member.role === 'Client Admin' ? 'bg-sky-500/10 text-sky-400' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {member.role || 'Agent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                          <Mail size={12} />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    {member.role !== 'Client Admin' && (
                      <button 
                        onClick={() => setConfirmRemoveId(member.id)}
                        className="p-2.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Remove member"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
      <ConfirmModal
        isOpen={confirmRemoveId !== null}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member? They will lose all access to this workspace immediately."
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
        isLoading={isRemoving}
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemoveId(null)}
      />
    </div>
  );
};

export default Team;
