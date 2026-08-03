import { useState, useEffect, useCallback } from 'react';
import { MdContactPhone, MdAdd, MdEdit, MdDelete, MdStar, MdStarOutline, MdClose, MdEmail, MdPhone } from 'react-icons/md';
import toast from 'react-hot-toast';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import supplierService from '@api/services/supplierService';

const ContactModal = ({ open, onClose, onSave, contact }) => {
  const [name, setName] = useState(contact?.name || '');
  const [designation, setDesignation] = useState(contact?.designation || '');
  const [department, setDepartment] = useState(contact?.department || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState(contact?.alternatePhone || '');
  const [isPrimary, setIsPrimary] = useState(contact?.primary || false);
  const [notes, setNotes] = useState(contact?.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setDesignation(contact.designation || '');
      setDepartment(contact.department || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setAlternatePhone(contact.alternatePhone || '');
      setIsPrimary(contact.primary);
      setNotes(contact.notes || '');
    } else {
      setName('');
      setDesignation('');
      setDepartment('');
      setEmail('');
      setPhone('');
      setAlternatePhone('');
      setIsPrimary(false);
      setNotes('');
    }
  }, [contact, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Contact name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        designation: designation.trim() || null,
        department: department.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        alternatePhone: alternatePhone.trim() || null,
        primary: isPrimary,
        notes: notes.trim() || null,
      });
      onClose();
    } catch {
      toast.error('Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-700 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">{contact ? 'Edit Contact' : 'Add Contact'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <MdClose size={20} className="text-surface-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Contact person name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Manager"
              />
            </div>
            <div>
              <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Procurement"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="email@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+91-9876543210"
              />
            </div>
            <div>
              <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Alt Phone</label>
              <input
                type="text"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+91-9876543211"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded border-surface-300 text-primary-500 focus:ring-primary-500"
              id="primary"
            />
            <label htmlFor="primary" className="text-sm text-surface-600 dark:text-surface-300">Primary contact</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              {contact ? 'Update' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContactItem = ({ contact, onEdit, onDelete, onSetPrimary }) => (
  <div className={`p-3 rounded-xl transition-colors ${contact.primary ? 'bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800' : 'bg-surface-50 dark:bg-surface-800/50'}`}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{contact.name}</p>
          {contact.primary && (
            <Badge variant="primary" size="sm"><MdStar size={10} className="mr-0.5" />Primary</Badge>
          )}
        </div>
        {contact.designation && (
          <p className="text-xs text-surface-500">{contact.designation}{contact.department ? ` · ${contact.department}` : ''}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-surface-500 hover:text-primary-500 transition-colors">
              <MdEmail size={12} /> {contact.email}
            </a>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1 text-xs text-surface-500">
              <MdPhone size={12} /> {contact.phone}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!contact.primary && (
          <button onClick={() => onSetPrimary(contact)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors" title="Set as primary">
            <MdStarOutline size={14} className="text-surface-400" />
          </button>
        )}
        <button onClick={() => onEdit(contact)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
          <MdEdit size={14} className="text-surface-400" />
        </button>
        <button onClick={() => onDelete(contact)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
          <MdDelete size={14} className="text-danger-500" />
        </button>
      </div>
    </div>
  </div>
);

const SupplierContacts = ({ supplierId }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getContacts(supplierId);
      setContacts(res?.data ?? []);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleSave = async (data) => {
    if (editingContact) {
      await supplierService.updateContact(supplierId, editingContact.id, data);
      toast.success('Contact updated');
    } else {
      await supplierService.createContact(supplierId, data);
      toast.success('Contact added');
    }
    fetchContacts();
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleDelete = async (contact) => {
    if (!window.confirm(`Delete contact "${contact.name}"?`)) return;
    try {
      await supplierService.deleteContact(supplierId, contact.id);
      toast.success('Contact deleted');
      fetchContacts();
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const handleSetPrimary = async (contact) => {
    try {
      await supplierService.setPrimaryContact(supplierId, contact.id);
      toast.success('Primary contact updated');
      fetchContacts();
    } catch {
      toast.error('Failed to set primary contact');
    }
  };

  const openCreateModal = () => {
    setEditingContact(null);
    setShowModal(true);
  };

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <MdContactPhone size={16} className="text-primary-500" />
          </div>
          <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Contacts ({contacts.length})</h3>
        </div>
        <Button variant="primary" size="sm" leftIcon={<MdAdd />} onClick={openCreateModal}>
          Add Contact
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-4">No contacts added yet.</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetPrimary={handleSetPrimary}
            />
          ))}
        </div>
      )}

      <ContactModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingContact(null); }}
        onSave={handleSave}
        contact={editingContact}
      />
    </Card>
  );
};

export default SupplierContacts;
