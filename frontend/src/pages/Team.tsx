import React, { useState, useEffect } from 'react';
import { getTeamMembers, removeTeamMember } from '../api/team.api';
import { Users, Mail, Shield, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Link } from 'react-router-dom';

const Team: React.FC = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    <div className="mx-auto w-full flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Team Members</h1>
          <p className="text-muted-foreground font-medium">Manage access and permissions for your workspace.</p>
        </div>
        <Link
          to="/team/add"
          className="px-5 py-2.5 btn-primary font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          Add Team Member
        </Link>
      </div>

      <div className="w3-card p-0 border border-border overflow-hidden bg-card shadow-sm rounded-2xl">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="p-2.5 bg-secondary text-muted-foreground rounded-xl border border-border">
            <Users size={20} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Current Members ({members.length})</h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground font-medium">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
              <Shield className="text-muted-foreground" size={24} />
            </div>
            <p className="text-foreground font-bold text-lg">No team members found.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first team member to collaborate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/80 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16 text-center">S.No</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {members.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-muted transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-muted-foreground text-center">
                      {(idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200 text-sm">
                          {member.first_name?.[0] || 'U'}
                        </div>
                        <span className="font-bold text-foreground">{member.first_name} {member.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${member.role === 'Client Admin' ? 'bg-sky-100 text-sky-700' : 'bg-secondary text-muted-foreground'
                        }`}>
                        {member.role || 'Agent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'Client Admin' && (
                        <button
                          onClick={() => setConfirmRemoveId(member.id)}
                          className="p-2 text-muted-foreground hover:bg-red-600 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex"
                          title="Remove member"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
