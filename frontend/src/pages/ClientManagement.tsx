import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';


interface CompanyAdminData {
  id: string;
  name: string;
  email: string;
  status: boolean;
  created_on: string;
  userCount: number;
  leadCount: number;
  country?: { name: string };
  currency?: { code: string };
  plan: string;
  plan_expires_at: string | null;
  monthly_ai_usage: number;
}

const StatusBadge: React.FC<{ status: boolean }> = ({ status }) => (
  <span className={status ? 'chip chip-go' : 'chip chip-stop'}>
    {status ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
    {status ? 'Active' : 'Suspended'}
  </span>
);

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<CompanyAdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmSuspend, setConfirmSuspend] = useState<CompanyAdminData | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImpersonate = async (companyId: string) => {
    try {
      const originalToken = localStorage.getItem('token');
      const originalUser = localStorage.getItem('user');

      const response = await api.post(`/Company/Admin/Impersonate/${companyId}`);
      if (response.data.Type === 'S') {
        const { api_token, user: impersonatedUser } = response.data.result;

        // Backup original Super Admin credentials
        if (originalToken && originalUser) {
          localStorage.setItem('admin_token', originalToken);
          localStorage.setItem('admin_user', originalUser);
        }

        // Log in with impersonated client token
        login(api_token, impersonatedUser);
        toast.success('Impersonation session started successfully');

        // Redirect to client dashboard
        navigate('/dashboard');
      } else {
        toast.error('Impersonation failed', response.data.Message || 'Unknown error');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error initiating impersonation session.');
    }
  };

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/Company/Admin/All');
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/Company/Admin/ToggleStatus/${id}`);
      // Optimistic update or refetch
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: !c.status } : c));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Suspending locks a paying tenant out of their workspace, so it asks first;
  // reactivating restores access and goes straight through.
  const requestToggleStatus = (client: CompanyAdminData) => {
    if (client.status) setConfirmSuspend(client);
    else handleToggleStatus(client.id);
  };

  const pageStart = filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const pageEnd = Math.min(currentPage * itemsPerPage, filteredClients.length);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-sub">Monitor and manage all company tenants on the platform.</p>
        </div>
        <div className="field-icon w-full sm:w-72">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search name or email"
            aria-label="Search clients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field"
          />
        </div>
        {/* <button onClick={() => window.open('/signup', '_blank')} className="btn btn-primary">
          Register New Client
        </button> */}
      </div>

      <section className="surface overflow-hidden">
        <div className="surface-head">
          <h2>
            All clients
            {!isLoading && <span className="chip">{filteredClients.length}</span>}
          </h2>
        </div>

        <div className="table-wrap">
          <table className="data-table min-w-[960px]">
            <thead>
              <tr>
                <th>Company</th>
                <th>Details</th>
                <th>Plan and usage</th>
                <th>Activity</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex items-center justify-center gap-2.5 py-14 text-ink-soft">
                      <Loader2 size={16} className="animate-spin" /> Loading clients…
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty py-12">
                      <p className="empty-title">{clients.length === 0 ? 'No clients yet' : 'No clients match'}</p>
                      <p className="empty-body">
                        {clients.length === 0 ? 'Workspaces appear here when businesses sign up.' : 'Try a different name or email.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="icon-tile is-neutral"><Building2 size={18} /></span>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink">{client.name}</div>
                        <div className="truncate text-[13px] text-ink-soft">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1 text-[13px]">
                      <div className="flex items-center gap-1.5 text-ink">
                        <MapPin size={13} className="text-ink-faint" /> {client.country?.name || 'Global'}
                      </div>
                      <div className="flex items-center gap-1.5 text-ink-soft">
                        <Calendar size={13} className="text-ink-faint" /> Joined {new Date(client.created_on).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={client.plan && client.plan !== 'Free' ? 'chip chip-accent' : 'chip'}>
                          {client.plan || 'Free'}
                        </span>
                        {client.plan_expires_at && (
                          <span className="text-[13px] text-ink-soft">
                            until {new Date(client.plan_expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-ink-soft">
                        <span className="font-medium tabular-nums text-ink">{(client.monthly_ai_usage || 0).toLocaleString()}</span> AI messages
                      </div>
                    </div>
                  </td>
                  <td>
                    <dl className="flex gap-5 tabular-nums">
                      <div>
                        <dd className="text-[15px] font-semibold text-ink">{client.userCount}</dd>
                        <dt className="text-[12px] text-ink-soft">users</dt>
                      </div>
                      <div>
                        <dd className="text-[15px] font-semibold text-ink">{client.leadCount}</dd>
                        <dt className="text-[12px] text-ink-soft">leads</dt>
                      </div>
                    </dl>
                  </td>
                  <td>
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => requestToggleStatus(client)}
                        className={`btn btn-sm ${client.status ? 'btn-danger-soft' : ''}`}
                      >
                        {client.status ? 'Suspend' : 'Activate'}
                      </button>
                      {/*
                      <button onClick={() => handleImpersonate(client.id)} className="btn btn-sm">
                        Impersonate <ArrowRight size={14} />
                      </button>
                      */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <nav className="surface-foot" aria-label="Pagination">
          <p className="text-[13px] text-ink-soft">
            Showing <span className="font-medium text-ink">{pageStart}</span>–<span className="font-medium text-ink">{pageEnd}</span> of{' '}
            <span className="font-medium text-ink">{filteredClients.length}</span> clients
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages <= 1}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                aria-current={currentPage === pageNum ? 'page' : undefined}
                className={`btn btn-icon btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      </section>

      <ConfirmModal
        isOpen={confirmSuspend !== null}
        title={`Suspend ${confirmSuspend?.name ?? 'this client'}?`}
        message="Everyone in this workspace loses access and its automations stop replying until you activate it again."
        confirmText="Suspend"
        cancelText="Cancel"
        type="danger"
        onConfirm={async () => {
          if (confirmSuspend) await handleToggleStatus(confirmSuspend.id);
          setConfirmSuspend(null);
        }}
        onCancel={() => setConfirmSuspend(null)}
      />
    </div>
  );
};

export default ClientManagement;
