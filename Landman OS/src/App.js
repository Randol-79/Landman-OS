import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, MapPin, FileText, CalendarDays, ChevronRight, AlertTriangle, CheckCircle, Clock, List, Map as MapIcon, Building, User, Users, Briefcase, Mail, Phone, ExternalLink, HelpCircle, X, PlusCircle } from 'lucide-react';

// --- MOCK API & DATA ---
// This simulates a production-ready backend and database based on your prisma schema.
const mockApi = {
  // --- Seed Data based on prisma/seed.ts ---
  data: {
    users: [
      { id: 'user-admin', email: 'admin@landman.com', name: 'Admin User', role: 'ADMIN' }
    ],
    parties: [
      { id: 'party-1', type: 'INDIVIDUAL', name: 'John Smith', entityType: 'Individual', address: '456 Main St, Baton Rouge, LA 70801', email: 'john.smith@example.com', phone: '225-555-0100', kycStatus: 'VERIFIED', conflictFlag: false },
      { id: 'party-2', type: 'CORPORATION', name: 'Louisiana Energy Corp', entityType: 'Corporation', laSOSNumber: '35298461D', registeredAgent: 'Corporate Services LLC', address: '789 Energy Blvd, Lafayette, LA 70501', kycStatus: 'VERIFIED', conflictFlag: false },
      { id: 'party-3', type: 'INDIVIDUAL', name: 'Mary Robichaux', entityType: 'Individual', address: '111 Oak Alley, Vacherie, LA 70090', email: 'mary.r@example.com', phone: '985-555-0123', kycStatus: 'VERIFIED', conflictFlag: false },
      { id: 'party-4', type: 'TRUST', name: 'The Boudreaux Family Trust', entityType: 'Trust', address: '222 Bayou Lane, Houma, LA 70360', kycStatus: 'VERIFIED', conflictFlag: false },
    ],
    properties: [
      { id: 'prop-1', parish: 'Orleans', municipality: 'New Orleans', sectionTownRange: 'S24-T11S-R10E', legalDescription: 'Lot 5, Square 12, Second District, City of New Orleans, Parish of Orleans, State of Louisiana', civicAddress: '123 Canal Street, New Orleans, LA 70112', acreage: 0.25, gisCoordinates: { lat: 29.9547, lng: -90.0715 } },
      { id: 'prop-2', parish: 'Livingston', sectionTownRange: 'S15-T6S-R3E', legalDescription: 'A certain tract of land, situated in Section 15, Township 6 South, Range 3 East, Greensburg Land District, containing 40.0 acres, more or less, Livingston Parish, Louisiana.', acreage: 40, gisCoordinates: { lat: 30.5063, lng: -90.8468 } },
      { id: 'prop-3', parish: 'Lafayette', sectionTownRange: 'S30-T9S-R4E', legalDescription: 'The Northwest Quarter of the Southeast Quarter (NW/4 of SE/4) of Section 30, Township 9 South, Range 4 East, Lafayette Parish, Louisiana.', civicAddress: '100 Energy Parkway, Lafayette, LA 70506', acreage: 40, gisCoordinates: { lat: 30.2241, lng: -92.0198 } },
      { id: 'prop-4', parish: 'Lafayette', municipality: 'Lafayette', sectionTownRange: 'S29-T9S-R4E', legalDescription: 'Lot 22, Bambi Estates Subdivision, City of Lafayette, Parish of Lafayette, State of Louisiana', civicAddress: '200 Bambi Drive, Lafayette, LA 70508', acreage: 0.5, gisCoordinates: { lat: 30.2210, lng: -92.0015 } }
    ],
    instruments: [
       { id: 'inst-101', propertyId: 'prop-1', instrumentNumber: '2005-12345', bookPage: 'COB 1010/234', type: 'DEED', grantor: 'Old Timer Properties LLC', grantee: 'Mary Robichaux', recordedDate: new Date('2005-08-15T09:00:00Z'), description: 'Cash Sale Deed' },
       { id: 'inst-102', propertyId: 'prop-1', instrumentNumber: '2022-54321', bookPage: 'COB 1523/112', type: 'DEED', grantor: 'Mary Robichaux', grantee: 'John Smith', recordedDate: new Date('2022-03-20T14:30:00Z'), description: 'Act of Sale' },
       { id: 'inst-201', propertyId: 'prop-2', instrumentNumber: '1998-A-500', bookPage: 'BK 550/PG 100', type: 'DEED', grantor: 'The Boudreaux Family Trust', grantee: 'Louisiana Timber Co.', recordedDate: new Date('1998-11-10T10:00:00Z'), description: 'Sale of land with mineral reservation.' },
       { id: 'inst-202', propertyId: 'prop-2', instrumentNumber: '2018-C-999', bookPage: 'BK 890/PG 450', type: 'MINERAL_DEED', grantor: 'The Boudreaux Family Trust', grantee: 'Louisiana Energy Corp', recordedDate: new Date('2018-07-22T11:00:00Z'), description: 'Sale of 50% of mineral rights.' },
       { id: 'inst-203', propertyId: 'prop-2', instrumentNumber: '2023-B-123', bookPage: 'BK 950/PG 180', type: 'DEED', grantor: 'Louisiana Lumber Co.', grantee: 'John Smith', recordedDate: new Date('2023-02-01T16:00:00Z'), description: 'Cash sale of surface estate.' },
    ],
    interests: [
      { id: 'int-1', propertyId: 'prop-2', partyId: 'party-2', interestType: 'MINERAL', percentage: 50, mineral: true, servitudeDate: new Date('2018-07-22T11:00:00Z'), prescriptionDate: new Date(new Date('2018-07-22T11:00:00Z').setFullYear(new Date('2018-07-22T11:00:00Z').getFullYear() + 10)) },
      { id: 'int-2', propertyId: 'prop-2', partyId: 'party-4', interestType: 'MINERAL', percentage: 50, mineral: true, servitudeDate: new Date('1998-11-10T10:00:00Z'), prescriptionDate: new Date(new Date('1998-11-10T10:00:00Z').setFullYear(new Date('1998-11-10T10:00:00Z').getFullYear() + 10)) },
      { id: 'int-3', propertyId: 'prop-1', partyId: 'party-1', interestType: 'FEE_SIMPLE', percentage: 100, mineral: true, surface: true },
    ],
    leases: [
      { id: 'lease-1', propertyId: 'prop-2', leaseNumber: 'LL-2024-001', type: 'OIL_GAS', effectiveDate: new Date('2024-01-01T00:00:00Z'), primaryTerm: 36, expirationDate: new Date('2027-01-01T00:00:00Z'), bonus: 500, royalty: 0.25, rentalRate: 10, rentalDueDate: new Date('2025-01-01T00:00:00Z'), status: 'ACTIVE', parties: [{partyId: 'party-1', role: 'Lessor'}, {partyId: 'party-2', role: 'Lessee'}] },
      { id: 'lease-2', propertyId: 'prop-3', leaseNumber: 'LL-2022-050', type: 'OIL_GAS', effectiveDate: new Date('2022-09-15T00:00:00Z'), primaryTerm: 36, expirationDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), bonus: 1000, royalty: 0.20, status: 'ACTIVE', parties: [{partyId: 'party-4', role: 'Lessor'}, {partyId: 'party-2', role: 'Lessee'}] },
    ],
    tasks: [
      { id: 'task-1', type: 'TITLE_SEARCH', title: 'Complete title search for Orleans property', description: 'Run full title search back to sovereign for acquisition.', propertyId: 'prop-1', assigneeId: 'user-admin', priority: 'MEDIUM', status: 'PENDING', dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) },
      { id: 'task-2', type: 'CURATIVE', title: 'Address title gap on Livingston property', description: 'Gap found between Louisiana Timber Co. and Louisiana Lumber Co. Need Affidavit of Identity.', propertyId: 'prop-2', assigneeId: 'user-admin', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) },
      { id: 'task-3', type: 'LEASE_REVIEW', title: 'Review expiring lease LL-2022-050', description: 'Lease on prop-3 is expiring soon. Evaluate for extension.', propertyId: 'prop-3', assigneeId: 'user-admin', priority: 'URGENT', status: 'PENDING', dueDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000) },
      { id: 'task-4', type: 'PAYMENT', title: 'Process rental payment for LL-2024-001', description: 'Annual rental payment due.', propertyId: 'prop-2', assigneeId: 'user-admin', priority: 'MEDIUM', status: 'COMPLETED', completedAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), dueDate: new Date('2025-01-01T00:00:00Z') },
    ],
  },
  _delay: (ms) => new Promise(res => setTimeout(res, ms)),
  async getDashboardData() {
    await this._delay(500);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringLeases = this.data.leases.filter(l => new Date(l.expirationDate) <= thirtyDaysFromNow && new Date(l.expirationDate) > new Date() && l.status === 'ACTIVE');
    const tasks = this.data.tasks;
    const taskCounts = tasks.reduce((acc, task) => { acc[task.priority] = (acc[task.priority] || 0) + 1; return acc; }, {});
    const defects = (await this.getTitleChain('prop-2')).defects;
    return {
      activeLeases: this.data.leases.filter(l => l.status === 'ACTIVE').length,
      upcomingExpirations: expiringLeases.length,
      pendingTasks: this.data.tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
      titleDefects: defects.length,
      tasksByPriority: [
        { name: 'Urgent', count: taskCounts.URGENT || 0, fill: '#be123c' },
        { name: 'High', count: taskCounts.HIGH || 0, fill: '#f59e0b' },
        { name: 'Medium', count: taskCounts.MEDIUM || 0, fill: '#2563eb' },
        { name: 'Low', count: taskCounts.LOW || 0, fill: '#4b5563' },
      ],
      recentActivity: this.data.tasks.slice(0,3).map(t => ({ id: t.id, description: `${t.type} task updated: "${t.title}"`, status: t.status, date: t.dueDate }))
    };
  },
  async searchProperties(params) {
    await this._delay(800);
    if (!params || Object.values(params).every(v => !v)) return this.data.properties;
    return this.data.properties.filter(p => Object.entries(params).every(([key, value]) => {
      if (!value) return true;
      const pValue = p[key];
      if (typeof pValue === 'string' && typeof value === 'string') {
        return pValue.toLowerCase().includes(value.toLowerCase());
      }
      return pValue == value;
    }));
  },
  async getPropertyById(id) {
    await this._delay(300);
    const property = this.data.properties.find(p => p.id === id);
    if (!property) return null;
    return {
      ...property,
      interests: this.data.interests.filter(i => i.propertyId === id).map(i => ({...i, party: this.data.parties.find(p => p.id === i.partyId)})),
      leases: this.data.leases.filter(l => l.propertyId === id).map(l => ({...l, parties: l.parties.map(lp => ({...lp, party: this.data.parties.find(p => p.id === lp.partyId)}))})),
      tasks: this.data.tasks.filter(t => t.propertyId === id).map(t => ({...t, assignee: this.data.users.find(u => u.id === t.assigneeId), property: this.data.properties.find(p => p.id === t.propertyId)})),
    };
  },
  async getTitleChain(propertyId) {
    await this._delay(600);
    const instruments = this.data.instruments.filter(inst => inst.propertyId === propertyId).sort((a, b) => new Date(b.recordedDate) - new Date(a.recordedDate));
    const chain = [];
    instruments.forEach(inst => {
      if (inst.type === 'DEED' || inst.type === 'MINERAL_DEED') {
        chain.push({ date: inst.recordedDate, from: inst.grantor, to: inst.grantee, type: inst.type, document: `${inst.instrumentNumber}`, bookPage: inst.bookPage });
      }
    });
    const defects = [];
    for (let i = 0; i < chain.length - 1; i++) {
      if (chain[i].from !== chain[i+1].to) {
        defects.push({ type: 'GAP', description: `Gap in title between ${chain[i+1].to} (grantee) and ${chain[i].from} (grantor).`, severity: 'HIGH', documents: [chain[i+1].document, chain[i].document] });
      }
    }
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    this.data.interests.filter(i => i.propertyId === propertyId && i.prescriptionDate).forEach(interest => {
      const presDate = new Date(interest.prescriptionDate);
      if (presDate <= oneYearFromNow && presDate > now) {
        defects.push({ type: 'PRESCRIPTION', description: `Mineral servitude held by ${this.data.parties.find(p=>p.id === interest.partyId)?.name} is approaching its 10-year prescription date.`, severity: 'URGENT', prescriptionDate: presDate });
      }
    });
    return { instruments, chain: chain.reverse(), defects };
  },
  async getParties() {
      await this._delay(400);
      return this.data.parties;
  },
  async getPartyById(id) {
    await this._delay(300);
    return this.data.parties.find(p => p.id === id) || null;
  },
  async addParty(partyData) {
    await this._delay(500);
    const newParty = {
        id: `party-${Date.now()}`,
        ...partyData,
        kycStatus: 'PENDING', // Default status for new parties
        conflictFlag: false,
    };
    this.data.parties.push(newParty);
    return newParty;
  },
  async getLeases() {
      await this._delay(400);
      return this.data.leases.map(l => ({...l, property: this.data.properties.find(p => p.id === l.propertyId), parties: l.parties.map(lp => ({...lp, party: this.data.parties.find(p => p.id === lp.partyId)}))}));
  },
  async getLeaseById(id) {
    await this._delay(300);
    const lease = this.data.leases.find(l => l.id === id);
    if (!lease) return null;
    return {
        ...lease,
        property: this.data.properties.find(p => p.id === lease.propertyId),
        parties: lease.parties.map(lp => ({...lp, party: this.data.parties.find(p => p.id === lp.partyId)}))
    };
  },
  async getTasks() {
      await this._delay(400);
      return this.data.tasks.map(t => ({...t, assignee: this.data.users.find(u => u.id === t.assigneeId), property: this.data.properties.find(p => p.id === t.propertyId)}));
  },
  async getTaskById(id) {
    await this._delay(300);
    const task = this.data.tasks.find(t => t.id === id);
    if (!task) return null;
    return {
        ...task,
        assignee: this.data.users.find(u => u.id === task.assigneeId),
        property: this.data.properties.find(p => p.id === task.propertyId)
    };
  }
};

const AppContext = createContext();

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [pageArg, setPageArg] = useState(null);
  const [isDocVisible, setDocVisible] = useState(false);

  const navigate = (targetPage, arg = null) => { 
    if (targetPage === 'documentation') {
        setDocVisible(true);
        return;
    }
    setPage(targetPage); 
    setPageArg(arg); 
    window.scrollTo(0, 0); 
  };
  const contextValue = { navigate, page, pageArg };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'properties': return <PropertiesPage />;
      case 'propertyDetail': return <PropertyDetailPage propertyId={pageArg} />;
      case 'parties': return <PartiesPage />;
      case 'partyDetail': return <PartyDetailPage partyId={pageArg} />;
      case 'newParty': return <NewPartyPage />;
      case 'leases': return <LeasesPage />;
      case 'leaseDetail': return <LeaseDetailPage leaseId={pageArg} />;
      case 'tasks': return <TasksPage />;
      case 'taskDetail': return <TaskDetailPage taskId={pageArg} />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-slate-900 font-sans text-slate-300">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
            {renderPage()}
            <DocumentationPanel isVisible={isDocVisible} onClose={() => setDocVisible(false)} />
        </main>
      </div>
    </AppContext.Provider>
  );
}

function Sidebar() {
  const { navigate, page } = useContext(AppContext);
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'parties', label: 'Parties', icon: Users },
    { id: 'leases', label: 'Leases', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CalendarDays },
  ];
  return (
    <nav className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex-shrink-0 lg:flex flex-col hidden">
      <div className="h-20 flex items-center px-6">
        <FileText className="text-blue-500 h-8 w-8" />
        <h1 className="text-xl font-bold text-slate-100 ml-3">Landman OS</h1>
      </div>
      <div className="flex-1 py-6">
        <p className="px-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
        <ul>
          {navItems.map(item => (
            <li key={item.id} className="px-4 mb-2">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate(item.id); }}
                className={`flex items-center px-4 py-3 text-slate-300 rounded-lg transition-colors duration-200 ${
                  page.startsWith(item.id) ? 'bg-blue-600/80 text-white font-semibold shadow-lg' : 'hover:bg-slate-700/50'
                }`}>
                <item.icon className="h-5 w-5 mr-4" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="px-8 mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Support</p>
        <ul>
            <li className="px-4 mb-2">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('documentation'); }}
                    className="flex items-center px-4 py-3 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                    <HelpCircle className="h-5 w-5 mr-4" />
                    <span>Documentation</span>
                </a>
            </li>
        </ul>
      </div>
      <div className="p-6 border-t border-slate-700/50">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold ring-2 ring-slate-600">A</div>
          <div className="ml-3">
            <p className="font-semibold text-sm text-slate-100">Admin User</p>
            <p className="text-xs text-slate-400">admin@landman.com</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { navigate } = useContext(AppContext);

  useEffect(() => { 
    const fetchData = async () => { 
      setLoading(true); 
      const result = await mockApi.getDashboardData(); 
      setData(result); 
      setLoading(false); 
    }; 
    fetchData(); 
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Lafayette, LA &bull; {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Leases" value={data.activeLeases} icon={FileText} color="blue" onClick={() => navigate('leases')} />
        <StatCard title="Upcoming Expirations (30d)" value={data.upcomingExpirations} icon={CalendarDays} color="amber" onClick={() => navigate('leases')} />
        <StatCard title="Pending Tasks" value={data.pendingTasks} icon={Clock} color="violet" onClick={() => navigate('tasks')} />
        <StatCard title="Title Defects Found" value={data.titleDefects} icon={AlertTriangle} color="rose" onClick={() => navigate('properties')} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Tasks by Priority</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.tasksByPriority} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{fill: 'rgba(30, 41, 59, 0.5)'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#cbd5e1'}}/>
                <Bar dataKey="count" name="Tasks" barSize={40} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            {data.recentActivity.map(activity => (
              <li key={activity.id} className="flex items-start space-x-3">
                <div>{activity.status === 'COMPLETED' ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : <Clock className="h-5 w-5 text-amber-500 mt-0.5" />}</div>
                <div>
                  <p className="text-sm text-slate-200">{activity.description}</p>
                  <p className="text-xs text-slate-400">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, onClick }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-900/50 border-blue-500/50',
    amber: 'text-amber-400 bg-amber-900/50 border-amber-500/50',
    violet: 'text-violet-400 bg-violet-900/50 border-violet-500/50',
    rose: 'text-rose-400 bg-rose-900/50 border-rose-500/50',
  };
  return (
    <div onClick={onClick} className={`bg-slate-800/50 p-5 rounded-lg border ${colors[color]} shadow-lg flex items-center transition-transform hover:scale-105 cursor-pointer`}>
      <div className={`p-3 rounded-full ${colors[color].split(' ')[1]}`}><Icon className="h-6 w-6" /></div>
      <div className="ml-4">
        <p className="text-sm text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function PropertiesPage() {
  const { navigate } = useContext(AppContext);
  const [searchParams, setSearchParams] = useState({});
  const [view, setView] = useState('list');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const fetchProperties = async () => { setLoading(true); const result = await mockApi.searchProperties(searchParams); setProperties(result); setLoading(false); }; fetchProperties(); }, [searchParams]);
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Property & Title Research</h1>
        <p className="text-slate-400 mt-1">Search Louisiana properties by parish, section-township-range, or address.</p>
      </div>
      <PropertySearch onSearch={setSearchParams} />
      <div className="flex justify-end space-x-2">
        <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${view === 'list' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}><List className="h-4 w-4 mr-2" /> List View</button>
        <button onClick={() => setView('map')} className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${view === 'map' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}><MapIcon className="h-4 w-4 mr-2" /> Map View</button>
      </div>
      {loading ? <LoadingSpinner /> : view === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {properties.length > 0 ? properties.map(p => <PropertyCard key={p.id} property={p} onClick={() => navigate('propertyDetail', p.id)} />) : <EmptyState icon={Building} message="No properties found." details="Try adjusting your search filters to find what you're looking for." />}
        </div>
      ) : (
        <div className="h-[600px] rounded-lg overflow-hidden border border-slate-700 shadow-lg"><PropertyMap properties={properties} /></div>
      )}
    </div>
  );
}

const LOUISIANA_PARISHES = [ 'Acadia', 'Allen', 'Ascension', 'Assumption', 'Avoyelles', 'Beauregard', 'Bienville', 'Bossier', 'Caddo', 'Calcasieu', 'Caldwell', 'Cameron', 'Catahoula', 'Claiborne', 'Concordia', 'De Soto', 'East Baton Rouge', 'East Carroll', 'East Feliciana', 'Evangeline', 'Franklin', 'Grant', 'Iberia', 'Iberville', 'Jackson', 'Jefferson', 'Jefferson Davis', 'Lafayette', 'Lafourche', 'La Salle', 'Lincoln', 'Livingston', 'Madison', 'Morehouse', 'Natchitoches', 'Orleans', 'Ouachita', 'Plaquemines', 'Pointe Coupee', 'Rapides', 'Red River', 'Richland', 'Sabine', 'St. Bernard', 'St. Charles', 'St. Helena', 'St. James', 'St. John the Baptist', 'St. Landry', 'St. Martin', 'St. Mary', 'St. Tammany', 'Tangipahoa', 'Tensas', 'Terrebonne', 'Union', 'Vermilion', 'Vernon', 'Washington', 'Webster', 'West Baton Rouge', 'West Carroll', 'West Feliciana', 'Winn' ];

function PropertySearch({ onSearch }) {
  const [searchType, setSearchType] = useState('location');
  const formRef = useRef();
  const handleSubmit = (e) => { e.preventDefault(); const formData = new FormData(formRef.current); const params = Object.fromEntries(formData.entries()); onSearch(params); };
  const handleClear = () => { formRef.current.reset(); onSearch({}); };
  const searchInputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-200";
  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 shadow-lg">
      <div className="border-b border-slate-700 mb-4"><nav className="-mb-px flex space-x-6" aria-label="Tabs">
        <button onClick={() => setSearchType('location')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${searchType === 'location' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}`}>Parish/Municipality</button>
        <button onClick={() => setSearchType('str')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${searchType === 'str' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}`}>Section-Township-Range</button>
        <button onClick={() => setSearchType('address')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${searchType === 'address' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}`}>Address</button>
      </nav></div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {searchType === 'location' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1">Parish</label><select name="parish" className={searchInputClass}><option value="">Select Parish</option>{LOUISIANA_PARISHES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1">Municipality</label><input name="municipality" type="text" placeholder="e.g., New Orleans" className={searchInputClass} /></div>
        </div>)}
        {searchType === 'str' && (<div><label className="block text-sm font-medium text-slate-300 mb-1">Section-Township-Range</label><input name="sectionTownRange" type="text" placeholder="e.g., S15-T6S-R3E" className={searchInputClass} /></div>)}
        {searchType === 'address' && (<div><label className="block text-sm font-medium text-slate-300 mb-1">Civic Address</label><input name="civicAddress" type="text" placeholder="e.g., 200 Bambi Drive" className={searchInputClass} /></div>)}
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={handleClear} className="px-4 py-2 text-sm font-medium rounded-md bg-slate-600 text-slate-200 hover:bg-slate-500">Clear</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700 flex items-center"><Search className="h-4 w-4 mr-2" /> Search</button>
        </div>
      </form>
    </div>
  );
}

function PropertyCard({ property, onClick }) {
    return (
        <div onClick={onClick} className="bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-blue-500/80 shadow-lg hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer p-6 space-y-3 group">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors">{property.parish} Parish</h3>
                    <p className="text-sm text-slate-400">{property.sectionTownRange}</p>
                </div>
                <div className="text-right"><p className="text-sm font-medium text-slate-300">{property.acreage} Acres</p></div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{property.legalDescription}</p>
            {property.civicAddress && <div className="flex items-center text-sm text-slate-400 pt-2"><MapPin className="h-4 w-4 mr-2 flex-shrink-0" /><span>{property.civicAddress}</span></div>}
        </div>
    );
}

function PropertyMap({ properties }) {
    let bbox = [-94.0, 29.0, -89.0, 33.0]; 
    if (properties && properties.length > 0) {
        const coords = properties.map(p => p.gisCoordinates).filter(Boolean);
        if (coords.length === 1) {
            const { lat, lng } = coords[0];
            const padding = 0.01;
            bbox = [lng - padding, lat - padding, lng + padding, lat + padding];
        } else if (coords.length > 1) {
            const lats = coords.map(c => c.lat);
            const lngs = coords.map(c => c.lng);
            const padding = 0.1;
            bbox = [ Math.min(...lngs) - padding, Math.min(...lats) - padding, Math.max(...lngs) + padding, Math.max(...lats) + padding ];
        }
    }
    const propertyMarkers = properties.map(p => p.gisCoordinates ? `marker=${p.gisCoordinates.lat},${p.gisCoordinates.lng}` : null).filter(Boolean).join('&');
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.join(',')}&layer=mapnik&${propertyMarkers}`;
    return <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={osmUrl} title="Property Map" className="bg-slate-700"></iframe>;
}

function PropertyDetailPage({ propertyId }) {
    const { navigate } = useContext(AppContext);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    useEffect(() => { const fetchData = async () => { setLoading(true); const result = await mockApi.getPropertyById(propertyId); setProperty(result); setLoading(false); }; fetchData(); }, [propertyId]);
    if (loading) return <LoadingSpinner />;
    if (!property) return <div className="text-center py-16"><h2 className="text-xl font-semibold">Property Not Found</h2><button onClick={() => navigate('properties')} className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700">Back to Properties</button></div>;
    const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'titleChain', label: 'Title Chain' }, { id: 'interests', label: 'Interests' }, { id: 'leases', label: 'Leases' }, { id: 'tasks', label: 'Tasks' }];
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <button onClick={() => navigate('properties')} className="text-sm text-blue-400 hover:underline mb-2">&larr; Back to Properties</button>
                <h1 className="text-3xl font-bold text-slate-100">{property.parish} Parish</h1>
                <p className="text-slate-400 mt-1">{property.sectionTownRange} &bull; {property.acreage} Acres</p>
            </div>
            <div className="border-b border-slate-700"><nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'}`}>{tab.label}</button>))}
            </nav></div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
                {activeTab === 'overview' && <PropertyOverview property={property} />}
                {activeTab === 'titleChain' && <TitleChain propertyId={property.id} />}
                {activeTab === 'interests' && <InterestsTable interests={property.interests} />}
                {activeTab === 'leases' && <LeasesTable leases={property.leases} />}
                {activeTab === 'tasks' && <TasksTable tasks={property.tasks} />}
            </div>
        </div>
    );
}

function PropertyOverview({ property }) {
    return (
        <div className="space-y-6">
            <div><h3 className="font-semibold text-lg text-slate-200 mb-2">Legal Description</h3><p className="text-slate-300 leading-relaxed">{property.legalDescription}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div><h4 className="font-medium text-slate-400 text-sm">Parish</h4><p className="text-slate-100 font-semibold">{property.parish}</p></div>
                <div><h4 className="font-medium text-slate-400 text-sm">Municipality</h4><p className="text-slate-100 font-semibold">{property.municipality || 'N/A'}</p></div>
                <div><h4 className="font-medium text-slate-400 text-sm">Civic Address</h4><p className="text-slate-100 font-semibold">{property.civicAddress || 'N/A'}</p></div>
                <div><h4 className="font-medium text-slate-400 text-sm">GIS Coordinates</h4><p className="text-slate-100 font-semibold">{property.gisCoordinates ? `${property.gisCoordinates.lat.toFixed(4)}, ${property.gisCoordinates.lng.toFixed(4)}` : 'N/A'}</p></div>
            </div>
        </div>
    );
}

function TitleChain({ propertyId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => { const fetchData = async () => { setLoading(true); const result = await mockApi.getTitleChain(propertyId); setData(result); setLoading(false); }; fetchData(); }, [propertyId]);
    if (loading) return <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>;
    const { chain, defects } = data;
    const getIconForType = (type) => type === 'MINERAL_DEED' ? <Briefcase className="h-5 w-5 text-amber-300" /> : <FileText className="h-5 w-5 text-white" />;
    return (
        <div className="space-y-8">
            <div><h3 className="font-semibold text-lg text-slate-200 mb-4">Chain of Title Analysis</h3>
                {defects.length > 0 && (<div className="mb-6 space-y-4">
                    {defects.map((defect, index) => (
                        <div key={index} className="bg-rose-900/50 border-l-4 border-rose-500 p-4 rounded-r-lg shadow-lg">
                            <div className="flex"><div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse" /></div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-bold text-rose-300">{defect.type === 'GAP' ? 'Title Gap Detected' : 'Prescription Warning'} ({defect.severity})</h3>
                                    <div className="mt-2 text-sm text-rose-300/90"><p>{defect.description}</p>{defect.prescriptionDate && <p className="font-semibold">Prescription Date: {new Date(defect.prescriptionDate).toLocaleDateString()}</p>}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>)}
                <div className="flow-root"><ul className="-mb-8">
                    {chain.map((item, itemIdx) => (
                        <li key={item.document}>
                            <div className="relative pb-8">
                                {itemIdx !== chain.length - 1 ? (<span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-700" aria-hidden="true" />) : null}
                                <div className="relative flex space-x-4 items-start">
                                    <div><span className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-slate-800/50 ${item.type === 'MINERAL_DEED' ? 'bg-amber-500/80' : 'bg-blue-500/80'}`}>{getIconForType(item.type)}</span></div>
                                    <div className="min-w-0 flex-1 pt-1.5">
                                        <div className="flex justify-between items-center"><p className="text-sm text-slate-400">{new Date(item.date).toLocaleDateString()}</p><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'MINERAL_DEED' ? 'bg-amber-200/20 text-amber-300' : 'bg-blue-200/20 text-blue-300'}`}>{item.type.replace('_', ' ')}</span></div>
                                        <p className="font-semibold text-slate-200 mt-1">{item.from} &rarr; {item.to}</p>
                                        <p className="text-sm text-slate-500">Doc: {item.document} ({item.bookPage})</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul></div>
            </div>
        </div>
    );
}

function GenericTable({ headers, data, renderRow, emptyState }) {
    if (!data || data.length === 0) return emptyState;
    return (
        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800"><tr >{headers.map(h => <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="bg-slate-800/50 divide-y divide-slate-700">{data.map(item => renderRow(item))}</tbody>
        </table></div>
    );
}

function InterestsTable({ interests }) {
    return <GenericTable
        headers={['Party', 'Type', 'Percentage', 'Prescription Date']}
        data={interests}
        renderRow={interest => (
            <tr key={interest.id} className="hover:bg-slate-700/50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">{interest.party.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{interest.interestType.replace('_', ' ')}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{interest.percentage}%</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{interest.prescriptionDate ? new Date(interest.prescriptionDate).toLocaleDateString() : 'N/A'}</td></tr>
        )}
        emptyState={<EmptyState icon={Users} message="No interests found for this property." />}
    />;
}

function LeasesPage() {
    const [leases, setLeases] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { const fetchLeases = async () => { setLoading(true); const result = await mockApi.getLeases(); setLeases(result); setLoading(false); }; fetchLeases(); }, []);
    return (
        <div className="space-y-8 animate-fade-in">
             <div><h1 className="text-3xl font-bold text-slate-100">Leases</h1><p className="text-slate-400 mt-1">Manage all active and inactive leases.</p></div>
             <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
                {loading ? <LoadingSpinner/> : <LeasesTable leases={leases} />}
             </div>
        </div>
    );
}

function LeasesTable({ leases }) {
    const { navigate } = useContext(AppContext);
    return <GenericTable
        headers={['Lease #', 'Status', 'Property', 'Expiration Date', 'Royalty', '']}
        data={leases}
        renderRow={lease => (
            <tr key={lease.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400 hover:underline cursor-pointer" onClick={() => navigate('leaseDetail', lease.id)}>{lease.leaseNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lease.status === 'ACTIVE' ? 'bg-green-900/70 text-green-300' : 'bg-slate-700 text-slate-300'}`}>{lease.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:underline cursor-pointer" onClick={() => lease.property && navigate('propertyDetail', lease.property.id)}>
                    {lease.property ? `${lease.property.parish} - ${lease.property.sectionTownRange}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(lease.expirationDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{(lease.royalty * 100).toFixed(2)}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => navigate('leaseDetail', lease.id)} className="text-blue-400 hover:text-blue-300"><ChevronRight className="h-5 w-5" /></button>
                </td>
            </tr>
        )}
        emptyState={<EmptyState icon={FileText} message="No leases found." />}
    />;
}

function LeaseDetailPage({ leaseId }) {
    const { navigate } = useContext(AppContext);
    const [lease, setLease] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLease = async () => {
            setLoading(true);
            const result = await mockApi.getLeaseById(leaseId);
            setLease(result);
            setLoading(false);
        };
        fetchLease();
    }, [leaseId]);

    if (loading) return <LoadingSpinner />;
    if (!lease) return <div className="text-center py-16"><h2 className="text-xl font-semibold">Lease Not Found</h2><button onClick={() => navigate('leases')} className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700">Back to Leases</button></div>;
    
    const DetailItem = ({ label, value }) => (
        <div>
            <h4 className="font-medium text-slate-400 text-sm">{label}</h4>
            <p className="text-slate-100 font-semibold">{value}</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <button onClick={() => navigate('leases')} className="text-sm text-blue-400 hover:underline mb-2">&larr; Back to Leases</button>
                <h1 className="text-3xl font-bold text-slate-100">Lease Details: {lease.leaseNumber}</h1>
                <p className="text-slate-400 mt-1">Property: {lease.property ? `${lease.property.parish} - ${lease.property.sectionTownRange}`: 'N/A'}</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem label="Status" value={lease.status} />
                    <DetailItem label="Lease Type" value={lease.type.replace('_', ' ')} />
                    <DetailItem label="Effective Date" value={new Date(lease.effectiveDate).toLocaleDateString()} />
                    <DetailItem label="Expiration Date" value={new Date(lease.expirationDate).toLocaleDateString()} />
                    <DetailItem label="Primary Term" value={`${lease.primaryTerm} months`} />
                    <DetailItem label="Bonus" value={`$${lease.bonus.toLocaleString()}`} />
                    <DetailItem label="Royalty" value={`${(lease.royalty * 100).toFixed(2)}%`} />
                    {lease.rentalRate && <DetailItem label="Rental Rate" value={`$${lease.rentalRate}/acre`} />}
                    {lease.rentalDueDate && <DetailItem label="Next Rental Due" value={new Date(lease.rentalDueDate).toLocaleDateString()} />}
                </div>
            </div>
             <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
                <h3 className="font-semibold text-lg text-slate-200 mb-4">Parties to Lease</h3>
                <ul className="divide-y divide-slate-700">
                    {lease.parties.map(({ party, role }) => (
                        <li key={party.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-slate-100">{party.name}</p>
                                <p className="text-sm text-slate-400">{party.type}</p>
                            </div>
                            <span className="text-sm font-semibold text-blue-300">{role}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}


function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { const fetchTasks = async () => { setLoading(true); const result = await mockApi.getTasks(); setTasks(result); setLoading(false); }; fetchTasks(); }, []);
    return (
        <div className="space-y-8 animate-fade-in">
             <div><h1 className="text-3xl font-bold text-slate-100">Tasks</h1><p className="text-slate-400 mt-1">Manage all tasks across all properties.</p></div>
             <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
                {loading ? <LoadingSpinner/> : <TasksTable tasks={tasks} />}
             </div>
        </div>
    );
}

function TasksTable({ tasks }) {
    const { navigate } = useContext(AppContext);
    const priorityColors = { URGENT: 'bg-rose-900/70 text-rose-300', HIGH: 'bg-amber-900/70 text-amber-300', MEDIUM: 'bg-blue-900/70 text-blue-300', LOW: 'bg-slate-700 text-slate-300' };
    const statusColors = { PENDING: 'bg-amber-900/70 text-amber-300', IN_PROGRESS: 'bg-blue-900/70 text-blue-300', COMPLETED: 'bg-green-900/70 text-green-300' };
    return <GenericTable
        headers={['Title', 'Status', 'Priority', 'Property', 'Due Date', 'Assignee', '']}
        data={tasks}
        renderRow={task => (
            <tr key={task.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400 hover:underline cursor-pointer" onClick={() => navigate('taskDetail', task.id)}>{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]}`}>{task.status.replace('_', ' ')}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:underline cursor-pointer" onClick={() => task.property && navigate('propertyDetail', task.property.id)}>
                    {task.property ? `${task.property.parish} - ${task.property.sectionTownRange}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{task.assignee ? task.assignee.name : 'Unassigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => navigate('taskDetail', task.id)} className="text-blue-400 hover:text-blue-300"><ChevronRight className="h-5 w-5" /></button>
                </td>
            </tr>
        )}
        emptyState={<EmptyState icon={CalendarDays} message="No tasks found." />}
    />;
}

function TaskDetailPage({ taskId }) {
    const { navigate } = useContext(AppContext);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTask = async () => {
            setLoading(true);
            const result = await mockApi.getTaskById(taskId);
            setTask(result);
            setLoading(false);
        };
        fetchTask();
    }, [taskId]);

    if (loading) return <LoadingSpinner />;
    if (!task) return <div className="text-center py-16"><h2 className="text-xl font-semibold">Task Not Found</h2><button onClick={() => navigate('tasks')} className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700">Back to Tasks</button></div>;

    const DetailItem = ({ label, value, isHtml = false }) => (
        <div>
            <h4 className="font-medium text-slate-400 text-sm">{label}</h4>
            {isHtml ? <div className="text-slate-100 font-semibold" dangerouslySetInnerHTML={{ __html: value }} /> : <p className="text-slate-100 font-semibold">{value}</p>}
        </div>
    );
    
    const priorityColors = { URGENT: 'text-rose-300', HIGH: 'text-amber-300', MEDIUM: 'text-blue-300', LOW: 'text-slate-300' };
    const statusColors = { PENDING: 'text-amber-300', IN_PROGRESS: 'text-blue-300', COMPLETED: 'text-green-300' };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <button onClick={() => navigate('tasks')} className="text-sm text-blue-400 hover:underline mb-2">&larr; Back to Tasks</button>
                <h1 className="text-3xl font-bold text-slate-100">{task.title}</h1>
                <p className="text-slate-400 mt-1">Task Type: {task.type.replace('_', ' ')}</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem label="Status" value={`<span class="${statusColors[task.status]}">${task.status.replace('_', ' ')}</span>`} isHtml={true} />
                    <DetailItem label="Priority" value={`<span class="${priorityColors[task.priority]}">${task.priority}</span>`} isHtml={true} />
                    <DetailItem label="Due Date" value={new Date(task.dueDate).toLocaleDateString()} />
                    <DetailItem label="Assignee" value={task.assignee ? task.assignee.name : 'Unassigned'} />
                    <DetailItem label="Related Property" value={task.property ? `${task.property.parish} - ${task.property.sectionTownRange}` : 'N/A'} />
                </div>
                <div className="mt-6 pt-6 border-t border-slate-700">
                    <DetailItem label="Description" value={task.description} />
                </div>
            </div>
        </div>
    );
}


function PartiesPage() {
    const { navigate } = useContext(AppContext);
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { const fetchParties = async () => { setLoading(true); const result = await mockApi.getParties(); setParties(result); setLoading(false); }; fetchParties(); }, []);
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Parties</h1>
                    <p className="text-slate-400 mt-1">Manage all individuals, corporations, and trusts in the system.</p>
                </div>
                <button onClick={() => navigate('newParty')} className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                    <PlusCircle className="h-5 w-5 mr-2" /> Add New Party
                </button>
            </div>
            {loading ? <LoadingSpinner /> :
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parties.map(party => <PartyCard key={party.id} party={party} onClick={() => navigate('partyDetail', party.id)} />)}
                </div>
            }
        </div>
    );
}

function PartyCard({ party, onClick }) {
    const typeIcons = { INDIVIDUAL: <User />, CORPORATION: <Building />, TRUST: <Users /> };
    const kycColors = { VERIFIED: 'text-green-400', PENDING: 'text-amber-400', FLAGGED: 'text-rose-400' };
    return (
        <div onClick={onClick} className="bg-slate-800/50 rounded-lg border border-slate-700/50 shadow-lg p-6 space-y-4 hover:border-blue-500/80 hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer group">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="text-slate-400">{typeIcons[party.type] || <Briefcase />}</div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400">{party.name}</h3>
                        <p className="text-sm text-slate-400">{party.type.replace('_', ' ')}</p>
                    </div>
                </div>
                <span className={`flex items-center text-xs font-bold ${kycColors[party.kycStatus]}`}><CheckCircle className="h-4 w-4 mr-1.5" />{party.kycStatus}</span>
            </div>
            <div className="text-sm text-slate-300 space-y-2 pt-2 border-t border-slate-700">
                <div className="flex items-center"><MapPin className="h-4 w-4 mr-3 text-slate-500" /><span>{party.address}</span></div>
                {party.email && <div className="flex items-center"><Mail className="h-4 w-4 mr-3 text-slate-500" /><span>{party.email}</span></div>}
                {party.phone && <div className="flex items-center"><Phone className="h-4 w-4 mr-3 text-slate-500" /><span>{party.phone}</span></div>}
                {party.laSOSNumber && <div className="flex items-center"><ExternalLink className="h-4 w-4 mr-3 text-slate-500" /><span>LA SOS: {party.laSOSNumber}</span></div>}
            </div>
        </div>
    );
}

function PartyDetailPage({ partyId }) {
    const { navigate } = useContext(AppContext);
    const [party, setParty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParty = async () => {
            setLoading(true);
            const result = await mockApi.getPartyById(partyId);
            setParty(result);
            setLoading(false);
        };
        fetchParty();
    }, [partyId]);

    if (loading) return <LoadingSpinner />;
    if (!party) return <div className="text-center py-16"><h2 className="text-xl font-semibold">Party Not Found</h2><button onClick={() => navigate('parties')} className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700">Back to Parties</button></div>;

    const DetailItem = ({ label, value }) => (
        <div>
            <h4 className="font-medium text-slate-400 text-sm">{label}</h4>
            <p className="text-slate-100 font-semibold">{value}</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <button onClick={() => navigate('parties')} className="text-sm text-blue-400 hover:underline mb-2">&larr; Back to Parties</button>
                <h1 className="text-3xl font-bold text-slate-100">{party.name}</h1>
                <p className="text-slate-400 mt-1">{party.type.replace('_', ' ')}</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Full Name / Entity Name" value={party.name} />
                    <DetailItem label="Entity Type" value={party.entityType || 'N/A'} />
                    <DetailItem label="Address" value={party.address} />
                    <DetailItem label="Email" value={party.email || 'N/A'} />
                    <DetailItem label="Phone" value={party.phone || 'N/A'} />
                    <DetailItem label="KYC Status" value={party.kycStatus} />
                    {party.laSOSNumber && <DetailItem label="LA SOS Number" value={party.laSOSNumber} />}
                    {party.registeredAgent && <DetailItem label="Registered Agent" value={party.registeredAgent} />}
                </div>
            </div>
        </div>
    );
}

function NewPartyPage() {
    const { navigate } = useContext(AppContext);
    const formRef = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(formRef.current);
        const partyData = Object.fromEntries(formData.entries());
        await mockApi.addParty(partyData);
        setIsSubmitting(false);
        navigate('parties');
    };
    
    const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-200";

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <button onClick={() => navigate('parties')} className="text-sm text-blue-400 hover:underline mb-2">&larr; Back to Parties</button>
                <h1 className="text-3xl font-bold text-slate-100">Add New Party</h1>
                <p className="text-slate-400 mt-1">Enter the details for the new individual, corporation, or trust.</p>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 shadow-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-1">Full Name / Entity Name</label><input name="name" type="text" required className={inputClass} /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-1">Type</label><select name="type" className={inputClass}><option value="INDIVIDUAL">Individual</option><option value="CORPORATION">Corporation</option><option value="TRUST">Trust</option></select></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1">Address</label><input name="address" type="text" className={inputClass} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-1">Email</label><input name="email" type="email" className={inputClass} /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-1">Phone</label><input name="phone" type="tel" className={inputClass} /></div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-1">LA SOS Number (if applicable)</label><input name="laSOSNumber" type="text" className={inputClass} /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-1">Registered Agent (if applicable)</label><input name="registeredAgent" type="text" className={inputClass} /></div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => navigate('parties')} className="px-4 py-2 text-sm font-medium rounded-md bg-slate-600 text-slate-200 hover:bg-slate-500">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Saving...' : 'Save Party'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function DocumentationPanel({ isVisible, onClose }) {
    return (
        <div className={`fixed top-0 right-0 h-full w-full md:w-1/3 lg:w-1/4 bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'} z-50 border-l border-slate-700`}>
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-slate-100">Documentation</h2>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
                    <X className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6 space-y-4 text-slate-300">
                <h3 className="font-bold text-blue-400">Welcome to Landman OS!</h3>
                <p className="text-sm">This system is designed to automate and streamline your land management workflows, with a special focus on Louisiana's unique legal landscape.</p>
                <h4 className="font-semibold pt-2">Key Features:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Automated Title Chain Analysis</li>
                    <li>Mineral Servitude & Prescription Tracking</li>
                    <li>Lease and Task Management</li>
                    <li>Centralized Party & Property Database</li>
                </ul>
                <p className="text-sm pt-2">Use the sidebar to navigate between modules. For critical issues, contact support.</p>
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return <div className="flex justify-center items-center h-full py-20"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
}

function EmptyState({ icon: Icon, message, details }) {
    return (
        <div className="text-center py-16 lg:col-span-2 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
            <Icon className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-2 text-lg font-medium text-slate-200">{message}</h3>
            {details && <p className="mt-1 text-sm text-slate-400">{details}</p>}
        </div>
    );
}
