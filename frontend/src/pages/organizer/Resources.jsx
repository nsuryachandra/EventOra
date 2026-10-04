import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Badge';
import { Spinner } from '../../components/Spinner';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import {
  Layers,
  Plus,
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  RefreshCw,
  Cpu,
  Tv,
  Zap,
  Tag,
  Boxes,
  Users,
  Eye,
  Check,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Badging & Supplies',
  'Audio/Visual',
  'Computing',
  'Hardware',
  'Furniture',
  'General'
];

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Badging & Supplies':
      return <Tag size={16} style={{ color: '#4f46e5' }} />;
    case 'Audio/Visual':
      return <Tv size={16} style={{ color: '#0284c7' }} />;
    case 'Computing':
      return <Cpu size={16} style={{ color: '#7c3aed' }} />;
    case 'Hardware':
      return <Zap size={16} style={{ color: '#d97706' }} />;
    case 'Furniture':
      return <Layers size={16} style={{ color: '#059669' }} />;
    default:
      return <Package size={16} style={{ color: '#64748b' }} />;
  }
};

export const Resources = () => {
  const { events, activeEventId, activeEvent } = useOutletContext();
  const { showToast } = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Badging & Supplies',
    total: 50,
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.getResources(!activeEventId || activeEventId === 'all' || activeEventId === 0 ? null : activeEventId);
      if (res && res.success && Array.isArray(res.data)) {
        setResources(res.data);
        // Refresh selectedResource if modal is open
        if (selectedResource) {
          const updated = res.data.find((r) => r.id === selectedResource.id);
          if (updated) setSelectedResource(updated);
        }
      } else if (Array.isArray(res)) {
        setResources(res);
      } else {
        setResources([]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load resources', 'error');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [activeEventId]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Badging & Supplies',
      total: 50,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (res, e) => {
    if (e) e.stopPropagation();
    setSelectedResource(res);
    setFormData({
      name: res.name,
      category: res.category || 'General',
      total: res.total,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = (res) => {
    setSelectedResource(res);
    setIsDetailModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Resource name is required', 'error');
      return;
    }
    const tot = parseInt(formData.total, 10);
    if (isNaN(tot) || tot < 0) {
      showToast('Total quantity must be at least 0', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      const targetEventId = (!activeEventId || activeEventId === 'all' || activeEventId === 0) 
        ? (events[0]?.id || 1) 
        : activeEventId;

      const res = await api.createResource({
        eventId: targetEventId,
        name: formData.name.trim(),
        category: formData.category,
        total: tot,
      });

      if (res.success) {
        showToast(res.message || `Resource '${formData.name}' created with ${tot} units.`, 'success');
        setIsAddModalOpen(false);
        fetchResources();
      } else {
        showToast(res.message || 'Failed to add resource', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add resource', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Resource name is required', 'error');
      return;
    }
    const tot = parseInt(formData.total, 10);
    if (isNaN(tot) || tot < 0) {
      showToast('Total quantity must be at least 0', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await api.updateResource(selectedResource.id, {
        name: formData.name.trim(),
        category: formData.category,
        total: tot,
      });

      if (res.success) {
        showToast(res.message || `Updated '${formData.name}'.`, 'success');
        setIsEditModalOpen(false);
        if (res.data) setSelectedResource(res.data);
        fetchResources();
      } else {
        showToast(res.message || 'Failed to update resource', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update resource', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleQuickRestock = async (resItem, delta, e) => {
    if (e) e.stopPropagation();
    setActionLoadingId(resItem.id);
    const newTotal = (resItem.total || 0) + delta;
    try {
      const res = await api.updateResource(resItem.id, {
        name: resItem.name,
        category: resItem.category || 'General',
        total: newTotal,
      });
      if (res.success) {
        showToast(res.message || `Added +${delta} units to ${resItem.name}. New total: ${newTotal}.`, 'success');
        if (selectedResource && selectedResource.id === resItem.id && res.data) {
          setSelectedResource(res.data);
        }
        fetchResources();
      } else {
        showToast(res.message || 'Failed to restock resource', 'error');
      }
    } catch {
      showToast('Error updating stock', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.deleteResource(deleteTarget.id);
      if (res.success) {
        showToast(res.message || `Deleted ${deleteTarget.name}.`, 'success');
        setDeleteTarget(null);
        if (selectedResource && selectedResource.id === deleteTarget.id) {
          setIsDetailModalOpen(false);
          setSelectedResource(null);
        }
        fetchResources();
      } else {
        showToast(res.message || 'Failed to delete resource', 'error');
      }
    } catch {
      showToast('Failed to delete resource', 'error');
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesQuery = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (r.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // KPI Metrics (3 Cards Total as requested: Total, Allocated, Needed More)
  const totalPoolUnits = resources.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalAllocated = resources.reduce((acc, r) => acc + (r.allocated || 0), 0);
  const totalNeededMore = resources.reduce((acc, r) => acc + (r.neededMore || 0), 0);
  const utilizationPct = totalPoolUnits > 0 ? Math.round((totalAllocated / totalPoolUnits) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap', 
          gap: 16,
          padding: '24px 28px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
              }}
            >
              {activeEvent ? activeEvent.title : 'All Events'}
            </span>
          </div>

          <h1 
            style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: '#0f172a', 
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              margin: '0 0 6px 0',
            }}
          >
            Resources & Kit Inventory
          </h1>

          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Manage badges, delegate kits, and equipment. Auto-assigns to confirmed attendees whenever stock increases.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={fetchResources}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> Add Resource
          </button>
        </div>
      </div>

      {/* 3 Summary Cards: Total, Allocated, Needed More (Deficit) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <StatCard
          title="Total Resources"
          value={totalPoolUnits}
          subtitle="Total stock units across all inventory pools"
          icon={<Package size={18} />}
          color="primary"
          trend="Inventory Capacity"
        />
        <StatCard
          title="Allocated Resources"
          value={totalAllocated}
          subtitle={`Assigned to confirmed attendees (${utilizationPct}% utilization)`}
          icon={<CheckCircle2 size={18} />}
          color="emerald"
          trend={`${totalAllocated} Units In Use`}
        />
        <StatCard
          title="Needed More (Shortage)"
          value={totalNeededMore}
          subtitle={totalNeededMore > 0 ? "Confirmed guests lacking stock" : "All confirmed guests fully allocated"}
          icon={<AlertTriangle size={18} />}
          color={totalNeededMore > 0 ? "danger" : "secondary"}
          trend={totalNeededMore > 0 ? `⚠️ ${totalNeededMore} Deficit` : "✓ Healthy Stock"}
        />
      </div>

      {/* Resources in ONE Card */}
      <div 
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Card Header & Controls */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Resource Inventory Items
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                }}
              >
                {filteredResources.length} items
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Click on any resource name to view allocated guests, shortage breakdown, and manage units.
            </p>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resource name..."
              style={{
                paddingLeft: '32px',
                paddingTop: '6px',
                paddingBottom: '6px',
                fontSize: '0.8125rem',
                borderRadius: '6px',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Category Filter Pills inside the single card */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78125rem',
                fontWeight: selectedCategory === cat ? 600 : 500,
                backgroundColor: selectedCategory === cat ? '#4f46e5' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                border: selectedCategory === cat ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resources List Body */}
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
            <Spinner size={32} label="Loading resources..." />
          </div>
        ) : filteredResources.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', marginBottom: 4 }}>
              No resources found
            </div>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {searchQuery ? 'No items match your search.' : 'Click "Add Resource" to create an inventory item for this event.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Resource Name (Click for Details)</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Category</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Allocation Status</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Needed More / Shortage</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((res) => {
                  const util = res.total > 0 ? Math.round((res.allocated / res.total) * 100) : 0;
                  const isBusy = actionLoadingId === res.id;
                  const hasShortage = (res.neededMore || 0) > 0;

                  return (
                    <tr 
                      key={res.id} 
                      onClick={() => handleOpenDetail(res)}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      title="Click to view allocation and shortage breakdown"
                    >
                      {/* Clickable Resource Name */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              backgroundColor: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {getCategoryIcon(res.category)}
                          </div>
                          <div>
                            <div 
                              style={{ 
                                fontWeight: 700, 
                                color: '#1e293b',
                                fontSize: '0.9375rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <span style={{ textDecoration: 'underline', textDecorationColor: '#cbd5e1' }}>
                                {res.name}
                              </span>
                              <Eye size={13} style={{ color: '#6366f1', opacity: 0.8 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 2, alignItems: 'center' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#64748b' }}>
                                RES-#{res.id}
                              </span>
                              {res.eventTitle && (
                                <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                                  • {res.eventTitle}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.8125rem' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#334155',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {res.category || 'General'}
                        </span>
                      </td>

                      {/* Allocation Progress */}
                      <td style={{ padding: '14px 20px', width: '220px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>
                            {res.allocated} / {res.total} allocated
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: util >= 100 ? '#e11d48' : '#4f46e5' }}>
                            {util}%
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(util, 100)}%`,
                              height: '100%',
                              backgroundColor: util >= 100 ? '#e11d48' : util >= 75 ? '#f59e0b' : '#10b981',
                              borderRadius: '999px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 3 }}>
                          {res.available} available buffer
                        </div>
                      </td>

                      {/* Needed More / Shortage Column */}
                      <td style={{ padding: '14px 20px' }}>
                        {hasShortage ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <AlertTriangle size={12} /> {res.neededMore} Needed More
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Check size={12} /> All Guests Covered
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div 
                          style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleQuickRestock(res, 5, e)}
                            disabled={isBusy}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                            title="Add +5 units to stock pool"
                          >
                            +5
                          </button>
                          <button
                            onClick={(e) => handleQuickRestock(res, 10, e)}
                            disabled={isBusy}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                            title="Add +10 units to stock pool"
                          >
                            +10
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(res, e)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 7px', fontSize: '0.75rem' }}
                            title="Edit Resource"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(res);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 7px', fontSize: '0.75rem', color: '#dc2626' }}
                            title="Delete Resource"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL: Showing allocated to whom, not enough shortage breakdown, edit, and delete options */}
      {isDetailModalOpen && selectedResource && (
        <Modal
          isOpen={true}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedResource.name}
          subtitle={`Resource Details & Attendee Breakdown (${selectedResource.category || 'General'})`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header Badge Row & Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    border: '1px solid #c7d2fe',
                  }}
                >
                  RES-#{selectedResource.id}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                  }}
                >
                  {selectedResource.eventTitle || 'Current Event'}
                </span>
              </div>

              {/* Edit and Delete action buttons inside detail view */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEdit(selectedResource);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}
                >
                  <Edit2 size={13} /> Edit Resource
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedResource)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#dc2626' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Stock</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{selectedResource.total}</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Allocated</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d', marginTop: 2 }}>{selectedResource.allocated}</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Available Buffer</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{selectedResource.available}</div>
              </div>
              <div 
                style={{ 
                  padding: '12px', 
                  borderRadius: '10px', 
                  backgroundColor: (selectedResource.neededMore || 0) > 0 ? '#fef2f2' : '#f0fdf4', 
                  border: (selectedResource.neededMore || 0) > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0', 
                  textAlign: 'center' 
                }}
              >
                <div style={{ fontSize: '0.72rem', color: (selectedResource.neededMore || 0) > 0 ? '#991b1b' : '#166534', fontWeight: 600, textTransform: 'uppercase' }}>
                  Needed More
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: (selectedResource.neededMore || 0) > 0 ? '#dc2626' : '#15803d', marginTop: 2 }}>
                  {selectedResource.neededMore || 0}
                </div>
              </div>
            </div>

            {/* If Shortage exists: Prompt and 1-Click Auto-Assign Button */}
            {(selectedResource.neededMore || 0) > 0 && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#9f1239', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={15} /> Resource Shortage Detected: {selectedResource.neededMore} confirmed guest(s) waiting!
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#be123c', marginTop: 2 }}>
                    These attendees are confirmed for this event but have not received this kit due to insufficient stock.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={actionLoadingId === selectedResource.id}
                  onClick={(e) => handleQuickRestock(selectedResource, selectedResource.neededMore, e)}
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: '#e11d48',
                    borderColor: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600,
                  }}
                >
                  <Plus size={14} /> Add +{selectedResource.neededMore} Units & Auto-Assign
                </button>
              </div>
            )}

            {/* Section 1: "To Whom" - Allocated Attendees List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                  Allocated Guests ({selectedResource.allocated} units assigned)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Assigned in FIFO registration order
                </span>
              </div>

              {(selectedResource.allocatedAttendees || []).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8125rem' }}>
                  No attendees have been allocated this resource yet.
                </div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '8px 12px' }}>Attendee</th>
                        <th style={{ padding: '8px 12px' }}>Email / Phone</th>
                        <th style={{ padding: '8px 12px' }}>Section / Venue</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Allocation Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedResource.allocatedAttendees || []).map((att) => (
                        <tr key={att.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                            {att.name}
                            <span style={{ display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: '#64748b', fontWeight: 400 }}>
                              {att.registrationId || `ID-#${att.id}`}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>
                            <div>{att.email}</div>
                            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{att.phone}</div>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>
                            {att.section}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#ecfdf5',
                                color: '#047857',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                              }}
                            >
                              <Check size={11} /> Allocated
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: "Who had not enough resource" - Deficit / Shortage Attendees List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={15} style={{ color: (selectedResource.neededMore || 0) > 0 ? '#e11d48' : '#64748b' }} />
                  Not Enough Resource / Shortage List ({selectedResource.neededMore || 0} missing)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Confirmed guests waiting for stock
                </span>
              </div>

              {(selectedResource.unallocatedAttendees || []).length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.8125rem', fontWeight: 500 }}>
                  ✓ All confirmed attendees are allocated! No attendee is currently lacking this resource.
                </div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #fecdd3', borderRadius: '8px', backgroundColor: '#fffafb' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
                        <th style={{ padding: '8px 12px' }}>Attendee</th>
                        <th style={{ padding: '8px 12px' }}>Email / Phone</th>
                        <th style={{ padding: '8px 12px' }}>Section / Venue</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Deficit Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedResource.unallocatedAttendees || []).map((att) => (
                        <tr key={att.id} style={{ borderBottom: '1px solid #fee2e2' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#991b1b' }}>
                            {att.name}
                            <span style={{ display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: '#b91c1c', fontWeight: 400 }}>
                              {att.registrationId || `ID-#${att.id}`}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>
                            <div>{att.email}</div>
                            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{att.phone}</div>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>
                            {att.section}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              <AlertTriangle size={11} /> Shortage (+1 Needed)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  disabled={actionLoadingId === selectedResource.id}
                  onClick={(e) => handleQuickRestock(selectedResource, 5, e)}
                  className="btn btn-secondary btn-sm"
                >
                  +5 Stock
                </button>
                <button
                  type="button"
                  disabled={actionLoadingId === selectedResource.id}
                  onClick={(e) => handleQuickRestock(selectedResource, 10, e)}
                  className="btn btn-secondary btn-sm"
                >
                  +10 Stock
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Resource Item"
          subtitle="Configure equipment, kit bundles, or badge assets."
        >
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Resource Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. VIP NFC Delegate Badge Pack"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Initial Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="btn btn-primary"
              >
                {formSubmitting ? 'Adding...' : 'Add Resource'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Resource Modal */}
      {isEditModalOpen && selectedResource && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit: ${selectedResource.name}`}
          subtitle={`Currently allocated: ${selectedResource.allocated} units. Increasing total will auto-assign to waiting confirmed guests.`}
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                Resource Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 5, color: '#334155' }}>
                  Total Pool Units *
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="btn btn-primary"
              >
                {formSubmitting ? 'Saving...' : 'Save & Auto-Assign'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          title="Delete Resource"
          subtitle={`Are you sure you want to delete '${deleteTarget.name}'?`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>
              Deleting this resource will remove the stock pool from this event ({deleteTarget.allocated} allocations will be released). This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteResource}
                className="btn btn-danger"
              >
                Delete Resource
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Resources;
