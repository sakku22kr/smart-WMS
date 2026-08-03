import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdLocalShipping, MdStar, MdSearch,
  MdFilterList, MdSort, MdFirstPage, MdLastPage, MdChevronLeft, MdChevronRight,
  MdAttachMoney, MdPeople, MdDownload, MdTableChart
} from 'react-icons/md';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import Button from '@components/ui/Button';
import BarChart from '@components/charts/BarChart';
import DoughnutChart from '@components/charts/DoughnutChart';
import MetricCard from '@components/common/MetricCard';
import reportService from '@api/services/reportService';
import '@/components/charts/chartConfig';

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN');
const fmtCurrency = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const TABS = [
  { id: 'overview', label: 'Overview', icon: MdLocalShipping },
  { id: 'suppliers', label: 'All Suppliers', icon: MdPeople },
  { id: 'topByValue', label: 'Top by Value', icon: MdAttachMoney },
  { id: 'topByRating', label: 'Top by Rating', icon: MdStar },
];

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'BLACKLISTED'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'code', label: 'Code' },
  { value: 'companyName', label: 'Company' },
  { value: 'rating', label: 'Rating' },
  { value: 'createdAt', label: 'Date Added' },
];

const STATUS_BADGE = { ACTIVE: 'success', INACTIVE: 'warning', BLACKLISTED: 'danger' };

const SupplierReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const params = { page, size, sortBy, sortDir };
      if (search) params.search = search;
      if (status) params.status = status;
      if (region) params.region = region;
      await reportService.exportSupplierPdf(params);
      toast.success('Supplier report PDF downloaded');
    } catch {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const params = { page, size, sortBy, sortDir };
      if (search) params.search = search;
      if (status) params.status = status;
      if (region) params.region = region;
      await reportService.exportSupplierExcel(params);
      toast.success('Supplier report Excel downloaded');
    } catch {
      toast.error('Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, sortDir, page, size };
      if (search) params.search = search;
      if (status) params.status = status;
      if (region) params.region = region;
      const res = await reportService.getSupplierReport(params);
      setData(res?.data);
    } catch {
      toast.error('Failed to load supplier report');
    } finally {
      setLoading(false);
    }
  }, [search, status, region, sortBy, sortDir, page, size]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterReset = () => {
    setSearch('');
    setStatus('');
    setRegion('');
    setSortBy('name');
    setSortDir('asc');
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading && !data) {
    return (
      <PageWrapper>
        <div className="page-container max-w-6xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-surface-200 dark:bg-surface-700 rounded-xl" />)}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!data) return null;

  const statusLabels = data.statusBreakdown?.map(s => s.status) ?? [];
  const statusCounts = data.statusBreakdown?.map(s => s.count) ?? [];
  const regionLabels = data.regionBreakdown?.map(r => r.region) ?? [];
  const regionCounts = data.regionBreakdown?.map(r => r.count) ?? [];
  const topSupLabels = data.topSuppliersByValue?.slice(0, 8).map(s => s.name) ?? [];
  const topSupValues = data.topSuppliersByValue?.slice(0, 8).map(s => Number(s.totalOrderValue) || 0) ?? [];
  const topRatingLabels = data.topSuppliersByRating?.slice(0, 8).map(s => s.name) ?? [];
  const topRatingValues = data.topSuppliersByRating?.slice(0, 8).map(s => s.rating || 0) ?? [];

  // Unique regions from breakdown for filter
  const regions = data.regionBreakdown?.map(r => r.region) ?? [];

  return (
    <PageWrapper>
      <div className="page-container max-w-6xl">
        <div className="page-header">
          <div>
            <button onClick={() => navigate('/reports')} className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-500 transition-colors mb-1">
              <MdArrowBack size={14} /> Back to Reports
            </button>
            <h1 className="page-title">Supplier Report</h1>
            <p className="page-subtitle">Supplier performance and procurement analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <MdDownload size={14} />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-success-500 text-white hover:bg-success-600 transition-colors disabled:opacity-50"
            >
              <MdTableChart size={14} />
              {exportingExcel ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
          <MdFilterList size={16} className="text-surface-400" />
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <MdSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search name, code, company..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-8 w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="h-8 text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => { setRegion(e.target.value); setPage(0); }}
            className="h-8 text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <MdSort size={14} className="text-surface-400" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              className="h-8 text-xs px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="h-8 px-2 text-xs rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleFilterReset}>Reset</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ───────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdLocalShipping} label="Total Suppliers" value={fmt(data.statistics?.totalSuppliers)} color="primary" />
              <MetricCard icon={MdLocalShipping} label="Active" value={fmt(data.statistics?.activeSuppliers)} color="success" />
              <MetricCard icon={MdStar} label="Avg Rating" value={data.statistics?.averageRating?.toFixed(1) ?? '—'} color="warning" />
              <MetricCard icon={MdAttachMoney} label="Procurement Value" value={fmtCurrency(data.statistics?.totalProcurementValue)} color="info" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard icon={MdLocalShipping} label="Inactive" value={fmt(data.statistics?.inactiveSuppliers)} color="surface" />
              <MetricCard icon={MdLocalShipping} label="Blacklisted" value={fmt(data.statistics?.blacklistedSuppliers)} color="danger" />
              <MetricCard icon={MdLocalShipping} label="With Products" value={fmt(data.statistics?.suppliersWithProducts)} color="success" />
              <MetricCard icon={MdAttachMoney} label="Avg Order Value" value={fmtCurrency(data.statistics?.averageOrderValue)} color="primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Status Distribution" subtitle="By supplier status">
                {statusLabels.length > 0 ? (
                  <DoughnutChart labels={statusLabels} data={statusCounts} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Region Distribution" subtitle="By state/region">
                {regionLabels.length > 0 ? (
                  <BarChart labels={regionLabels} datasets={[{ label: 'Suppliers', data: regionCounts }]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card title="Top Suppliers by Value" subtitle="Highest procurement spend">
                {topSupLabels.length > 0 ? (
                  <BarChart labels={topSupLabels} datasets={[{ label: 'Value (₹)', data: topSupValues }]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
              <Card title="Top Suppliers by Rating" subtitle="Highest rated">
                {topRatingLabels.length > 0 ? (
                  <BarChart labels={topRatingLabels} datasets={[{ label: 'Rating', data: topRatingValues }]} height={260} />
                ) : <p className="text-sm text-surface-400 text-center py-8">No data</p>}
              </Card>
            </div>

            {/* Region Breakdown Table */}
            <Card title="Region Breakdown" subtitle="Suppliers by region" className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                      <th className="pb-2 font-medium">Region</th>
                      <th className="pb-2 font-medium text-right">Suppliers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.regionBreakdown?.map((r, i) => (
                      <tr key={i} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <td className="py-2 font-medium text-surface-800 dark:text-surface-100">{r.region}</td>
                        <td className="py-2 text-right text-surface-600 dark:text-surface-300">{fmt(r.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* ─── ALL SUPPLIERS TAB ──────────────────────────────── */}
        {activeTab === 'suppliers' && data.suppliers && (
          <Card title="All Suppliers" subtitle={`Showing ${data.suppliers.items?.length || 0} of ${data.suppliers.totalElements} suppliers`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-2 font-medium cursor-pointer hover:text-primary-500" onClick={() => handleSort('name')}>
                      Supplier{renderSortIcon('name')}
                    </th>
                    <th className="pb-2 font-medium cursor-pointer hover:text-primary-500" onClick={() => handleSort('code')}>
                      Code{renderSortIcon('code')}
                    </th>
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 font-medium">Contact</th>
                    <th className="pb-2 font-medium">Region</th>
                    <th className="pb-2 font-medium text-right cursor-pointer hover:text-primary-500" onClick={() => handleSort('rating')}>
                      Rating{renderSortIcon('rating')}
                    </th>
                    <th className="pb-2 font-medium text-right">Products</th>
                    <th className="pb-2 font-medium text-right">Orders</th>
                    <th className="pb-2 font-medium text-right">Value</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.suppliers.items?.map((s) => (
                    <tr key={s.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2">
                        <p className="font-medium text-surface-800 dark:text-surface-100">{s.name}</p>
                      </td>
                      <td className="py-2 font-mono text-surface-500">{s.code}</td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{s.companyName || '—'}</td>
                      <td className="py-2">
                        <p className="text-surface-600 dark:text-surface-300">{s.contactPerson || '—'}</p>
                        <p className="text-[10px] text-surface-400">{s.email || ''}</p>
                      </td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{s.state || '—'}</td>
                      <td className="py-2 text-right">
                        {s.rating != null ? (
                          <span className="inline-flex items-center gap-0.5 text-warning-500">
                            <MdStar size={10} /> {s.rating.toFixed(1)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{s.productCount}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{s.orderCount}</td>
                      <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(s.totalOrderValue)}</td>
                      <td className="py-2 text-right">
                        <Badge variant={STATUS_BADGE[s.status] || 'surface'} size="sm">{s.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.suppliers.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-200 dark:border-surface-700">
                <p className="text-xs text-surface-400">
                  Page {data.suppliers.page + 1} of {data.suppliers.totalPages} ({fmt(data.suppliers.totalElements)} items)
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(0)} disabled={page === 0} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
                    <MdFirstPage size={16} />
                  </button>
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
                    <MdChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-surface-600 dark:text-surface-400 px-2">{page + 1} / {data.suppliers.totalPages}</span>
                  <button onClick={() => setPage(Math.min(data.suppliers.totalPages - 1, page + 1))} disabled={page >= data.suppliers.totalPages - 1} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
                    <MdChevronRight size={16} />
                  </button>
                  <button onClick={() => setPage(data.suppliers.totalPages - 1)} disabled={page >= data.suppliers.totalPages - 1} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30">
                    <MdLastPage size={16} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ─── TOP BY VALUE TAB ───────────────────────────────── */}
        {activeTab === 'topByValue' && (
          <Card title="Top Suppliers by Value" subtitle="Highest procurement spend">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Supplier</th>
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 font-medium text-right">Orders</th>
                    <th className="pb-2 font-medium text-right">Products</th>
                    <th className="pb-2 font-medium text-right">Value</th>
                    <th className="pb-2 font-medium text-right">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSuppliersByValue?.map((s, i) => (
                    <tr key={s.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2 text-surface-400">{i + 1}</td>
                      <td className="py-2">
                        <p className="font-medium text-surface-800 dark:text-surface-100">{s.name}</p>
                        <p className="text-[10px] text-surface-400 font-mono">{s.code}</p>
                      </td>
                      <td className="py-2 text-surface-600 dark:text-surface-300">{s.companyName || '—'}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{s.orderCount}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{s.productCount}</td>
                      <td className="py-2 text-right font-medium text-surface-800 dark:text-surface-100">{fmtCurrency(s.totalOrderValue)}</td>
                      <td className="py-2 text-right">
                        {s.rating != null ? (
                          <span className="inline-flex items-center gap-0.5 text-warning-500">
                            <MdStar size={10} /> {s.rating.toFixed(1)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ─── TOP BY RATING TAB ──────────────────────────────── */}
        {activeTab === 'topByRating' && (
          <Card title="Top Suppliers by Rating" subtitle="Highest rated suppliers">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-surface-400 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Supplier</th>
                    <th className="pb-2 font-medium text-right">Rating</th>
                    <th className="pb-2 font-medium text-right">Products</th>
                    <th className="pb-2 font-medium text-right">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSuppliersByRating?.map((s, i) => (
                    <tr key={s.id} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-2 text-surface-400">{i + 1}</td>
                      <td className="py-2">
                        <p className="font-medium text-surface-800 dark:text-surface-100">{s.name}</p>
                        <p className="text-[10px] text-surface-400 font-mono">{s.code}</p>
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center gap-0.5 text-warning-500 font-medium">
                          <MdStar size={10} /> {s.rating?.toFixed(1) ?? '—'}
                        </span>
                      </td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{s.productCount}</td>
                      <td className="py-2 text-right text-surface-600 dark:text-surface-300">{s.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default SupplierReport;
