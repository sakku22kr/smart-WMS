import { useState, useEffect, useCallback } from 'react';
import { MdNoteAdd, MdEdit, MdDelete, MdPushPin, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import supplierService from '@api/services/supplierService';

const NOTE_TYPE_LABELS = {
  GENERAL: 'General',
  MEETING: 'Meeting',
  FOLLOW_UP: 'Follow Up',
  ISSUE: 'Issue',
  COMPLIANCE: 'Compliance',
  CONTRACT: 'Contract',
  PAYMENT: 'Payment',
};

const NOTE_TYPE_VARIANT = {
  GENERAL: 'surface',
  MEETING: 'info',
  FOLLOW_UP: 'warning',
  ISSUE: 'danger',
  COMPLIANCE: 'success',
  CONTRACT: 'primary',
  PAYMENT: 'success',
};

const NoteModal = ({ open, onClose, onSave, note }) => {
  const [noteType, setNoteType] = useState(note?.noteType || 'GENERAL');
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setNoteType(note.noteType);
      setTitle(note.title);
      setContent(note.content);
      setPinned(note.pinned);
    } else {
      setNoteType('GENERAL');
      setTitle('');
      setContent('');
      setPinned(false);
    }
  }, [note, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await onSave({ noteType, title: title.trim(), content: content.trim(), pinned });
      onClose();
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-700 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">{note ? 'Edit Note' : 'Add Note'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <MdClose size={20} className="text-surface-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Note Type</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(NOTE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Note title"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 uppercase tracking-wide mb-1">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Note content..."
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded border-surface-300 text-primary-500 focus:ring-primary-500"
              id="pinned"
            />
            <label htmlFor="pinned" className="text-sm text-surface-600 dark:text-surface-300">Pin this note</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              {note ? 'Update' : 'Add Note'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NoteItem = ({ note, onEdit, onDelete, onTogglePin }) => (
  <div className={`p-3 rounded-xl transition-colors ${note.pinned ? 'bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800' : 'bg-surface-50 dark:bg-surface-800/50'}`}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={NOTE_TYPE_VARIANT[note.noteType] || 'surface'} size="sm">{NOTE_TYPE_LABELS[note.noteType] || note.noteType}</Badge>
          {note.pinned && <MdPushPin size={12} className="text-primary-500" />}
        </div>
        <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{note.title}</p>
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">{note.content}</p>
        <p className="text-xs text-surface-400 mt-2">
          {note.createdAt ? new Date(note.createdAt).toLocaleString() : '—'}
          {note.createdBy && ` by ${note.createdBy}`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onTogglePin(note)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors" title={note.pinned ? 'Unpin' : 'Pin'}>
          {note.pinned ? <MdPushPin size={14} className="text-primary-500" /> : <MdPushPin size={14} className="text-surface-400" />}
        </button>
        <button onClick={() => onEdit(note)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
          <MdEdit size={14} className="text-surface-400" />
        </button>
        <button onClick={() => onDelete(note)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
          <MdDelete size={14} className="text-danger-500" />
        </button>
      </div>
    </div>
  </div>
);

const SupplierNotes = ({ supplierId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierService.getNotes(supplierId);
      setNotes(res?.data ?? []);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSave = async (data) => {
    if (editingNote) {
      await supplierService.updateNote(supplierId, editingNote.id, data);
      toast.success('Note updated');
    } else {
      await supplierService.createNote(supplierId, data);
      toast.success('Note added');
    }
    fetchNotes();
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleDelete = async (note) => {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    try {
      await supplierService.deleteNote(supplierId, note.id);
      toast.success('Note deleted');
      fetchNotes();
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await supplierService.togglePinNote(supplierId, note.id);
      fetchNotes();
    } catch {
      toast.error('Failed to update pin status');
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setShowModal(true);
  };

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <MdNoteAdd size={16} className="text-primary-500" />
          </div>
          <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100">Notes ({notes.length})</h3>
        </div>
        <Button variant="primary" size="sm" leftIcon={<MdNoteAdd />} onClick={openCreateModal}>
          Add Note
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-200 dark:bg-surface-700 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-4">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}

      <NoteModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingNote(null); }}
        onSave={handleSave}
        note={editingNote}
      />
    </Card>
  );
};

export default SupplierNotes;
