import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdClose, MdSwapHoriz } from 'react-icons/md';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import useRoles from '@hooks/useRoles';
import roleService from '@/api/services/roleService';
import useToast from '@hooks/useToast';

const ROLE_VARIANT_MAP = {
  ROLE_ADMIN:              'primary',
  ROLE_WAREHOUSE_MANAGER:  'info',
  ROLE_INVENTORY_STAFF:    'success',
};

/**
 * RoleManager — admin UI for managing a user's assigned roles.
 *
 * Props:
 *  - userId       : number — the target user's ID
 *  - currentRoles : RoleResponse[] — user's current assigned roles
 *  - onUpdated    : () => void — callback after successful role change (triggers refetch)
 */
const RoleManager = ({ userId, currentRoles = [], onUpdated }) => {
  const { roles: allRoles, loading: rolesLoading } = useRoles();
  const toast = useToast();
  const [saving, setSaving]     = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Roles not yet assigned to the user
  const availableRoles = allRoles.filter(
    (r) => !currentRoles.some((cr) => cr.id === r.id)
  );

  const currentRoleIds = currentRoles.map((r) => r.id);

  // ─── Add a single role ──────────────────────────────────
  const handleAddRole = useCallback(async (roleId) => {
    setSaving(true);
    try {
      await roleService.addRole(userId, roleId);
      toast.success('Role added successfully');
      onUpdated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add role');
    } finally {
      setSaving(false);
    }
  }, [userId, onUpdated, toast]);

  // ─── Remove a single role ───────────────────────────────
  const handleRemoveRole = useCallback(async (roleId) => {
    if (currentRoles.length <= 1) {
      toast.error('A user must have at least one role');
      return;
    }
    setSaving(true);
    try {
      await roleService.removeRole(userId, roleId);
      toast.success('Role removed successfully');
      onUpdated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove role');
    } finally {
      setSaving(false);
    }
  }, [userId, currentRoles.length, onUpdated, toast]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-200 flex items-center gap-2">
          <MdSwapHoriz size={16} />
          Assigned Roles
        </h4>
        {availableRoles.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<MdAdd size={14} />}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Cancel' : 'Add Role'}
          </Button>
        )}
      </div>

      {/* Current roles with remove button */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {currentRoles.map((role) => (
            <motion.div
              key={role.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant={ROLE_VARIANT_MAP[role.name] || 'surface'}
                size="lg"
                className="pr-1"
              >
                {role.name?.replace('ROLE_', '')}
                <button
                  onClick={() => handleRemoveRole(role.id)}
                  disabled={saving || currentRoles.length <= 1}
                  className="ml-1 p-0.5 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={`Remove ${role.name}`}
                >
                  <MdClose size={12} />
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Available roles to add */}
      <AnimatePresence>
        {expanded && availableRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-surface-400 dark:text-surface-500 mb-2">
              Click a role to assign it:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddRole(role.id)}
                  disabled={saving}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    border border-dashed border-surface-300 dark:border-surface-600
                    text-surface-600 dark:text-surface-300
                    hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <MdAdd size={14} />
                  {role.name?.replace('ROLE_', '')}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleManager;
