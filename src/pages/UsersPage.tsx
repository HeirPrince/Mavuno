import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  UserX, 
  Search, 
  Download,
  ChevronDown, 
  Trash2, 
  UserPlus,
  Eye,
  CheckCircle,
  Ban,
  X,
  MapPin
} from 'lucide-react';
import { User } from '@/lib/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/feedback/Toast';

export default function UsersPage() {
  const { state, addUser, updateUserStatus, deleteUser } = useAppContext();
  const { users } = state;
  const { showToast } = useToast();
  const [activeRoleFilter, setActiveRoleFilter] = useState<'All' | 'Farmer' | 'Buyer' | 'Transporter'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Custom Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Farmer' | 'Buyer' | 'Transporter'>('Farmer');
  const [newUserDistrict, setNewUserDistrict] = useState('Musanze');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = activeRoleFilter === 'All' || user.role === activeRoleFilter;
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict = districtFilter === 'All' || user.district === districtFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      
      return matchesRole && matchesSearch && matchesDistrict && matchesStatus;
    });
  }, [users, activeRoleFilter, searchQuery, districtFilter, statusFilter]);

  // Unique list of districts for filters
  const districtsList = useMemo(() => {
    return ['All', ...Array.from(new Set(users.map(u => u.district)))];
  }, [users]);

  // Unique list of statuses for filters
  const statusesList = ['All', 'Verified', 'Pending', 'Flagged', 'Suspended'];

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      alert("Please check your input values.");
      return;
    }

    const nameInitials = newUserName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const created: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      district: newUserDistrict,
      status: "Pending", // Default initial verification
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      initials: nameInitials || "MK"
    };

    addUser(created);
    setShowAddModal(false);
    
    // Clear inputs
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Farmer');
    setNewUserDistrict('Musanze');

    showToast(`User "${created.name}" created. Status: Pending Verification.`, 'success');
  };

  const handleExportCSV = () => {
    let headers = "User ID,Name,Email,Role,District,Status,Join Date\n";
    let rows = filteredUsers.map(u => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.district}","${u.status}","${u.joinDate}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `AgriTrans_Users_Export.csv`);
    a.click();
  };

  // Helper values
  const countFarmer = users.filter(u => u.role === 'Farmer').length;
  const countBuyer = users.filter(u => u.role === 'Buyer').length;
  const countTransporter = users.filter(u => u.role === 'Transporter').length;
  const countPending = users.filter(u => u.status === 'Pending').length;

  return (
    <div className="space-y-8 relative">
      {/* Search Header layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-primary tracking-tight">User Management</h2>
          <div className="flex items-center gap-2 mt-2 px-3.5 py-1.5 bg-secondary-container/15 text-secondary rounded-full w-fit">
            <UserCheck className="w-4 h-4 text-secondary" />
            <span className="text-xs font-sans font-bold">{countPending} Pending Verifications Outstanding</span>
          </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white py-3 px-6 rounded-xl font-sans text-xs font-bold leading-none flex items-center gap-2 hover:bg-primary-container shadow-lg shadow-primary/10 transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>New User Profile</span>
        </button>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#ece7e4] shadow-sm">
          <p className="text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider">Total Active Users</p>
          <h3 className="text-3xl font-serif font-bold text-primary mt-1">{users.length + 1280}</h3>
          <p className="text-primary-container font-sans text-[11px] font-bold mt-2">+12% growth this month</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#ece7e4] shadow-sm">
          <p className="text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider">Active Farmers Registered</p>
          <h3 className="text-3xl font-serif font-bold text-secondary mt-1">{countFarmer * 14 + 800}</h3>
          <div className="w-full bg-surface-container h-1 mt-3 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#ece7e4] shadow-sm">
          <p className="text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider">Verified Corporate Buyers</p>
          <h3 className="text-3xl font-serif font-bold text-tertiary mt-1">{countBuyer * 8 + 300}</h3>
          <p className="text-on-surface-variant text-[11px] mt-2 font-medium">98% customer retention index</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#ece7e4] shadow-sm text-on-surface">
          <p className="text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider">Active Transporters Registered</p>
          <h3 className="text-3xl font-serif font-bold text-primary mt-1">{countTransporter * 6 + 120}</h3>
          <p className="text-[#ba1a1a] text-[11px] font-bold mt-2">5 accounts flagged / suspended</p>
        </div>
      </div>

      {/* Main Table view block */}
      <div className="bg-white rounded-3xl border border-[#ece7e4] shadow-xl overflow-hidden">
        
        {/* Table toolbar */}
        <div className="px-6 sm:px-8 py-4 border-b border-[#ece7e4]/60 bg-white space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-surface-low rounded-2xl">
            {(['All', 'Farmer', 'Buyer', 'Transporter'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRoleFilter(role)}
                className={`h-9 sm:h-10 rounded-xl text-xs font-sans font-bold transition-all ${
                  activeRoleFilter === role
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/50'
                }`}
              >
                {role === 'All' ? 'All Roles' : role + 's'}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 pointer-events-none" />
              <input
                id="users-search"
                type="search"
                aria-label="Search users"
                placeholder="Search by name, email, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-sm bg-white rounded-xl border border-[#ece7e4] font-sans placeholder:text-on-surface-variant/50 hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none text-on-surface"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative min-w-0">
                  <select
                    aria-label="Filter by district"
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full h-10 appearance-none pl-3.5 pr-9 text-sm font-sans font-semibold rounded-xl bg-white border border-[#ece7e4] text-on-surface cursor-pointer hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  >
                    <option value="All">All Districts</option>
                    {districtsList.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
                </div>

                <div className="relative min-w-0">
                  <select
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 appearance-none pl-3.5 pr-9 text-sm font-sans font-semibold rounded-xl bg-white border border-[#ece7e4] text-on-surface cursor-pointer hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    {statusesList.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="h-10 w-full sm:w-auto flex items-center justify-center gap-2 px-5 rounded-xl border border-[#ece7e4] bg-surface-low/50 text-sm font-bold font-sans text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {(searchQuery || districtFilter !== 'All' || statusFilter !== 'All' || activeRoleFilter !== 'All') && (
            <p className="text-xs font-sans text-on-surface-variant">
              Showing <span className="font-bold text-primary">{filteredUsers.length}</span> of {users.length} users
            </p>
          )}
        </div>

        {/* The big list of verified operators */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-surface-low/30 border-b border-[#ece7e4]/60">
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">User Name</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">District</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">Joined Date</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7e4]/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-on-surface-variant opacity-60 text-sm">
                    No matching agricultural handlers found. Refine your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                    {/* Name block */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary font-bold text-xs font-sans tracking-tight">
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-sans font-bold text-sm text-on-surface">{user.name}</p>
                          <p className="text-xs text-on-surface-variant font-medium opacity-80">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-sans ${
                        user.role === 'Farmer' ? 'bg-[#ffddb1] text-[#624000]' : 
                        user.role === 'Buyer' ? 'bg-[#bcf0ae] text-primary' : 'bg-[#ffdbcd] text-secondary'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* District */}
                    <td className="px-8 py-5 font-bold text-sm text-on-surface flex items-center gap-1.5 mt-2.5">
                      <MapPin className="w-3.5 h-3.5 text-primary opacity-60" />
                      <span>{user.district}</span>
                    </td>

                    {/* Status label color indicators */}
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        user.status === 'Verified' ? 'bg-primary-container/20 text-primary border-primary-container/15' : 
                        user.status === 'Pending' ? 'bg-secondary-container/15 text-secondary border-secondary-container/10' :
                        user.status === 'Flagged' ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]/20' : 
                        'bg-[#e6e2de]/80 text-[#32302e] border-[#ece7e4]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'Verified' ? 'bg-primary animate-pulse' : 
                          user.status === 'Pending' ? 'bg-secondary animate-bounce' :
                          user.status === 'Flagged' ? 'bg-[#ba1a1a]' : 'bg-[#42493e]'
                        }`}></span>
                        <span>{user.status}</span>
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="px-8 py-5 text-xs font-sans font-semibold text-on-surface-variant opacity-85">
                      {user.joinDate}
                    </td>

                    {/* Custom admin operators actions */}
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* Verify / Approve Pending user */}
                        {user.status === 'Pending' && (
                          <button
                            onClick={() => {
                              updateUserStatus(user.id, 'Verified');
                              alert(`User status for ${user.name} successfully updated to "Verified"! Access keys sent.`);
                            }}
                            className="p-2 text-primary hover:bg-primary/15 rounded-lg transition-colors cursor-pointer"
                            title="Verify and Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Suspend User details */}
                        {user.status !== 'Suspended' ? (
                          <button
                            onClick={() => {
                              updateUserStatus(user.id, 'Suspended');
                              alert(`Operator accounts for ${user.name} has been suspended. Dispatches halted.`);
                            }}
                            className="p-2 text-[#ba1a1a] hover:bg-[#ba1a1a]/15 rounded-lg transition-colors cursor-pointer"
                            title="Suspend/Block"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              updateUserStatus(user.id, 'Verified');
                              alert(`Operator accounts for ${user.name} re-activated.`);
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="Re-activate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* View detailed profile specs */}
                        <button
                          onClick={() => alert(`Reviewing documents for ${user.name}:\nEmail: ${user.email}\nJoined: ${user.joinDate}\nAssociated logs: Certified by Eastern Prov Cooperatives.`)}
                          className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete records entirely */}
                        <button
                          onClick={() => {
                            if (confirm(`Do you wish to completely remove ${user.name} from AgriTrans?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar template layout block */}
        <div className="px-8 py-6 bg-surface-low border-t border-[#ece7e4]/60 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs">
          <p className="text-on-surface-variant font-sans font-semibold">
            Showing <span className="font-bold text-on-surface">{Math.min(1, filteredUsers.length)}-{filteredUsers.length}</span> of {filteredUsers.length} users filtered
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-[#ece7e4] bg-white rounded-lg opacity-50" disabled>
              Previous
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white font-bold">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-on-surface-variant transition-colors" onClick={() => alert("Showing page 2")}>2</button>
            <span className="flex items-center px-1 text-on-surface-variant/60">...</span>
            <button className="px-3 py-1.5 border border-[#ece7e4] bg-white rounded-lg hover:bg-surface-container transition-all" onClick={() => alert("End of pagination index reach")}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOM ADD USER MODAL (Afro-Modern themed Glassmorphism) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-primary/20 shadow-2xl relative overflow-hidden">
            {/* Imigongo Accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 imigongo-border"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl font-bold text-primary">New Handlers Onboarding</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Full Legal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Makuza Kevin"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#fcfaf7] border-b-2 border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-all text-on-surface"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Primary Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@marketplace.rw"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#fcfaf7] border-b-2 border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-all text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant">Platform Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-[#fcfaf7] border-b-2 border-primary/40 border-t-0 border-l-0 border-r-0 rounded-t-lg px-3 py-2 text-xs focus:ring-0 focus:border-secondary font-bold text-on-surface"
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Transporter">Transporter</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant">Rwandan District</label>
                  <select
                    value={newUserDistrict}
                    onChange={(e) => setNewUserDistrict(e.target.value)}
                    className="w-full bg-[#fcfaf7] border-b-2 border-primary/40 border-t-0 border-l-0 border-r-0 rounded-t-lg px-3 py-2 text-xs focus:ring-0 focus:border-secondary font-bold text-on-surface"
                  >
                    <option value="Musanze">Musanze</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Rubavu">Rubavu</option>
                    <option value="Huye">Huye</option>
                    <option value="Nyagatare">Nyagatare</option>
                    <option value="Kayonza">Kayonza</option>
                  </select>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mt-4 text-[11px] leading-relaxed text-primary font-medium">
                Once submitted, standard verification checks will run. Admins must re-verify credentials, RURA status, or cooperative ID cards on the list page.
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#ece7e4] text-on-surface-variant font-bold font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold font-sans hover:bg-primary-container shadow-sm active:scale-95 cursor-pointer"
                >
                  Register Handler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
