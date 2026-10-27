import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addTeamMember } from '../api/team.api';
import { UserPlus, ShieldAlert, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
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
    <div className="page">
      <Link to="/team" className="page-back">
        <ArrowLeft size={16} /> Back to Team
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">Add a teammate</h1>
          <p className="page-sub">Invite a new user to your workspace.</p>
        </div>
      </div>

      <form onSubmit={handleInvite} className="surface page-narrow overflow-hidden">
        <div className="surface-head">
          <h2><span className="icon-tile is-sm"><UserPlus size={16} /></span>Member details</h2>
        </div>

        <div className="surface-body space-y-5">
          {error && (
            <div className="notice notice-stop" role="alert">
              <p className="notice-body flex items-start gap-2">
                <ShieldAlert size={15} className="mt-0.5 shrink-0" />
                {error}
              </p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="member-first" className="field-label">First name</label>
              <input
                id="member-first"
                required
                type="text"
                autoComplete="off"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="field"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="member-last" className="field-label">Last name</label>
              <input
                id="member-last"
                type="text"
                autoComplete="off"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="field"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label htmlFor="member-email" className="field-label">Email address</label>
            <input
              id="member-email"
              required
              type="email"
              autoComplete="off"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="field"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label htmlFor="member-password" className="field-label">Temporary password</label>
            <div className="relative">
              <input
                id="member-password"
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="field pr-11"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-ghost btn-icon btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="field-hint">Share it with them privately; they can change it in Settings after signing in.</p>
          </div>
        </div>

        <div className="surface-foot justify-end">
          <Link to="/team" className="btn">Cancel</Link>
          <button type="submit" disabled={isInviting} aria-busy={isInviting || undefined} className="btn btn-primary">
            {isInviting && <Loader2 size={15} className="animate-spin" />}
            Add team member
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeamMember;
