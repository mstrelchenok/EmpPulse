import React, { useState } from 'react';
import type { ModalType, Department } from '../../types';
import type { DepartmentAdmin } from '../../types';
import { departmentService, adminService } from '../../services/api';

interface Props {
  activeModal: ModalType;
  closeModal: () => void;
  selectedDepartment: Department | null;
  onDepartmentsChanged: () => void | Promise<void>;
}

const EditAdminsModal: React.FC<Props> = ({ activeModal, closeModal, selectedDepartment, onDepartmentsChanged }) => {
  // Working set of admin ids (Admin.id) assigned to the selected department.
  const [editAdminIds, setEditAdminIds] = useState<number[]>([]);
  const [allAdmins, setAllAdmins] = useState<DepartmentAdmin[]>([]);
  const [adminsError, setAdminsError] = useState<string | null>(null);
  const [savingAdmins, setSavingAdmins] = useState(false);

  // When the Edit Administrators modal opens, seed the working set and load all admins.
  React.useEffect(() => {
    if (activeModal === 'EDIT_ADMINS' && selectedDepartment) {
      setEditAdminIds(selectedDepartment.admins.map(a => a.id));
      setAdminsError(null);
      // Guard against a late response landing after the modal closed or switched
      // to a different department, which would show the wrong candidate list.
      let cancelled = false;
      adminService.getAll()
        .then(admins => { if (!cancelled) setAllAdmins(admins); })
        .catch(() => { if (!cancelled) setAllAdmins([]); });
      return () => { cancelled = true; };
    }
  }, [activeModal, selectedDepartment]);

  const adminName = (id: number) => {
    const fromAll = allAdmins.find(a => a.id === id);
    const fromDept = selectedDepartment?.admins.find(a => a.id === id);
    const a = fromAll ?? fromDept;
    return a ? `${a.user.name} ${a.user.surname}` : `Admin #${id}`;
  };

  const availableAdmins = allAdmins.filter(a => !editAdminIds.includes(a.id));

  // An admin can't be detached from their only department (they'd be left with none).
  const isLastDepartment = (adminId: number): boolean => {
    const admin = allAdmins.find(a => a.id === adminId) ?? selectedDepartment?.admins.find(a => a.id === adminId);
    return !!admin && admin.departmentIds.length <= 1;
  };

  const handleSaveAdmins = async () => {
    if (!selectedDepartment) return;

    // Run all checks on submit: collect every removed admin who'd be left with no department.
    const originalIds = selectedDepartment.admins.map(a => a.id);
    const blocked = originalIds
      .filter(id => !editAdminIds.includes(id) && isLastDepartment(id))
      .map(adminName);
    if (blocked.length > 0) {
      setAdminsError(
        `${blocked.join(', ')} cannot be removed — this is their only department. ` +
        `Assign them to another department first.`
      );
      return;
    }

    setAdminsError(null);
    setSavingAdmins(true);
    try {
      await departmentService.update(selectedDepartment.id, { adminIds: editAdminIds });
      await onDepartmentsChanged();
      closeModal();
    } catch (e) {
      setAdminsError(e instanceof Error ? e.message : 'Failed to update administrators');
    } finally {
      setSavingAdmins(false);
    }
  };

  return (
    <div className="modal-form">
      <h2>Edit administrators</h2>
      <h3 style={{ textAlign: 'left', fontSize: 16, marginTop: 16 }}>
        {selectedDepartment?.name}
      </h3>

      <div className="edit-admins-list">
        {editAdminIds.length === 0 && (
          <div className="edit-admin-item"><div className="edit-admin-pill">No administrators assigned.</div></div>
        )}
        {editAdminIds.map((id, idx) => (
          <div key={id} className="edit-admin-item">
            <span className="index">{idx + 1})</span>
            <div className="edit-admin-pill">{adminName(id)}</div>
            <button
              className="btn-remove"
              onClick={() => setEditAdminIds(prev => prev.filter(x => x !== id))}
              title="Remove administrator"
            >
              —
            </button>
          </div>
        ))}
      </div>

      <label>
        <select
          value=""
          onChange={(e) => {
            const id = Number(e.target.value);
            if (id) setEditAdminIds(prev => prev.includes(id) ? prev : [...prev, id]);
          }}
        >
          <option value="" disabled>add administrator</option>
          {availableAdmins.map(a => (
            <option key={a.id} value={a.id}>{a.user.name} {a.user.surname}</option>
          ))}
        </select>
      </label>

      {adminsError && <p className="form-error">{adminsError}</p>}

      <button className="primary-btn full-width" onClick={handleSaveAdmins} disabled={savingAdmins} style={{ marginTop: 24 }}>
        save administrators
      </button>
    </div>
  );
};

export default EditAdminsModal;
