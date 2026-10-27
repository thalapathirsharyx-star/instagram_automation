import React, { useState, useEffect } from 'react';
import { getTeamMembers, removeTeamMember } from '../api/team.api';
import { Users, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamSeatsFor } from '../lib/planLimits';

const Team: React.FC = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const { user } = useAuth();
  const plan = user?.company?.plan || 'Free';
  const seats = teamSeatsFor(plan);
  // The server refuses a new member past this; say so before the form, not after it.
  const seatsFull = !isLoading && members.length >= seats;

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
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-sub">Manage access and permissions for your workspace.</p>
        </div>
        {seatsFull ? (
          <Link to="/billing" className="btn">
            Upgrade for more seats
          </Link>
        ) : (
          <Link to="/team/add" className="btn btn-primary">
            <UserPlus size={16} /> Add team member
          </Link>
        )}
      </div>

      <section className="surface overflow-hidden">
        <div className="surface-head flex-wrap">
          <h2>
            <span className="icon-tile is-sm is-neutral"><Users size={16} /></span>
            Current members
            {!isLoading && <span className="chip">{members.length}</span>}
          </h2>
          {!isLoading && (
            <div className="flex items-center gap-3 text-[13px] text-ink-soft">
              <span className="tabular whitespace-nowrap">
                <span className="font-semibold text-ink">{Math.min(members.length, seats)}</span> of {seats} {seats === 1 ? 'seat' : 'seats'} on {plan}
              </span>
              <span
                className="meter hidden w-24 sm:block"
                role="progressbar"
                aria-label="Seats used"
                aria-valuenow={members.length}
                aria-valuemin={0}
                aria-valuemax={seats}
              >
                <span style={{ width: `${Math.min((members.length / seats) * 100, 100)}%` }} />
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="empty py-12">
            <Loader2 size={20} className="animate-spin text-ink-faint" />
            <p className="empty-body">Loading members…</p>
          </div>
        ) : members.length === 0 ? (
          <div className="empty py-12">
            <span className="empty-mark"><Users /></span>
            <p className="empty-title">No team members yet</p>
            <p className="empty-body">Add a teammate so they can reply from the inbox with you.</p>
            <Link to="/team/add" className="btn btn-sm">Add team member</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table is-stacked">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="avatar-initial" style={{ width: 32, height: 32, fontSize: 13 }}>
                          {member.first_name?.[0] || 'U'}
                        </span>
                        <span className="font-medium text-ink">{member.first_name} {member.last_name}</span>
                      </div>
                    </td>
                    <td data-label="Email" className="text-ink-soft">{member.email}</td>
                    <td data-label="Role">
                      <span className={member.role === 'Client Admin' ? 'chip chip-accent' : 'chip'}>
                        {member.role || 'Agent'}
                      </span>
                    </td>
                    <td className="text-right is-stacked-action">
                      {member.role !== 'Client Admin' && (
                        <button
                          onClick={() => setConfirmRemoveId(member.id)}
                          className="btn btn-ghost btn-icon btn-sm is-danger"
                          aria-label={`Remove ${member.first_name || 'member'}`}
                          title="Remove member"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
