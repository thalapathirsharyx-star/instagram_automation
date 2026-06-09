import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addTeamMember } from '../api/team.api';
import { UserPlus, ShieldAlert, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AddTeamMember: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isInviting, setIsInviting] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsInviting(true);
    try {
      const res = await addTeamMember(formData);
      if (res.Type === 'Success' || res.Type === 'S') {
        toast.success('Team member added', `${formData.first_name} has been added successfully.`);
        navigate('/team');
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

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/team" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Add Team Member</h1>
          </div>
          <p className="text-muted-foreground font-medium">Invite a new user to your workspace.</p>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="w3-card p-6 border border-border shadow-sm relative bg-card rounded-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
            <div className="p-2.5 bg-secondary text-muted-foreground rounded-xl border border-border">
              <UserPlus size={20} />
            </div>
            <h3 className="text-lg font-bold text-foreground">Member Details</h3>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold flex gap-2 items-start">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">First Name</label>
              <input 
                required
                type="text" 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-zinc-400 focus:bg-card outline-none transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Last Name</label>
              <input 
                type="text" 
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-zinc-400 focus:bg-card outline-none transition-colors"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Email Address</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-zinc-400 focus:bg-card outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Temporary Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-muted border border-border rounded-xl pl-4 pr-12 py-2.5 text-sm text-foreground focus:border-zinc-400 focus:bg-card outline-none transition-colors"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isInviting}
              className="w-full mt-6 py-3 btn-success font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {isInviting ? 'Adding...' : 'Add Team Member'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMember;
