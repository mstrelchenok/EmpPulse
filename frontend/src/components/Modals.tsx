
import React, { useState } from 'react';
import type { ModalType, Employee, LeaveRequest, Department, UserRole } from '../types';
import type { DepartmentAdmin } from '../types';
import { userService, departmentService, adminService } from '../services/api';

interface Props {
  activeModal: ModalType;
  openModal: (modal: ModalType, deptOrEmp?: any, requestObj?: LeaveRequest) => void;
  closeModal: () => void;
  confirmModal: () => void;
  selectedEmployee: Employee | null;
  selectedRequest: LeaveRequest | null;
  selectedDepartment: Department | null;
  departments: Department[];
  userRole: UserRole | null;
  onDepartmentsChanged: () => void | Promise<void>;
  confirmError?: string | null;
  onConfirmErrorClear?: () => void;
}

const Modals: React.FC<Props> = ({ activeModal, closeModal, confirmModal, selectedEmployee, selectedRequest, selectedDepartment, departments, userRole, onDepartmentsChanged, confirmError, onConfirmErrorClear }) => {
  // An admin can only ever create plain employees (no admin accounts, no role choice).
  const isAdminCreator = userRole === 'ADMIN';

  const [isEmployeeChecked, setIsEmployeeChecked] = useState(true);
  const [isAdminChecked, setIsAdminChecked] = useState(true);

  // When an admin opens the create form, force employee-only (no admin role).
  React.useEffect(() => {
    if (activeModal === 'ADD_EMPLOYEE' && isAdminCreator) {
      setIsEmployeeChecked(true);
      setIsAdminChecked(false);
    }
  }, [activeModal, isAdminCreator]);

  const [newName, setNewName] = useState('');
  const [newSurname, setNewSurname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  // Department selections (null = none chosen yet)
  const [employeeDeptId, setEmployeeDeptId] = useState<number | null>(null);
  const [adminDeptId, setAdminDeptId] = useState<number | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const resetCreateUserForm = () => {
    setNewName(''); setNewSurname(''); setNewEmail(''); setNewPassword('');
    setEmployeeDeptId(null); setAdminDeptId(null);
    setCreateError(null);
  };

  const handleCreateUser = async () => {
    setCreateError(null);
    if (!newName.trim() || !newSurname.trim() || !newEmail.trim() || !newPassword) {
      setCreateError('Name, surname, email and password are required.');
      return;
    }
    // A user with no role is meaningless — must be employee and/or admin.
    if (!isEmployeeChecked && !isAdminChecked) {
      setCreateError('User must be assigned at least one role: Employee or Administrator.');
      return;
    }
    // A department must be chosen for every selected role — creating without one is not allowed.
    if (isEmployeeChecked && employeeDeptId === null) {
      setCreateError('Please select a department for the employee role before creating the user.');
      return;
    }
    if (isAdminChecked && adminDeptId === null) {
      setCreateError('Please select a department for the administrator role before creating the user.');
      return;
    }

    setCreating(true);
    try {
      await userService.create({
        name: newName.trim(),
        surname: newSurname.trim(),
        email: newEmail.trim(),
        password: newPassword,
        ...(isEmployeeChecked ? { employeeDepartmentId: employeeDeptId, yearlyVacationBalance: 0 } : {}),
        // undefined = no admin role; array = admin assigned to the chosen department
        adminDepartmentIds: isAdminChecked && adminDeptId !== null ? [adminDeptId] : undefined,
      });
      resetCreateUserForm();
      closeModal();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  // --- Add Department form ---
  const [deptName, setDeptName] = useState('');
  const [deptError, setDeptError] = useState<string | null>(null);
  const [deptCreating, setDeptCreating] = useState(false);

  const handleCreateDepartment = async () => {
    setDeptError(null);
    if (!deptName.trim()) {
      setDeptError('Department name is required.');
      return;
    }
    setDeptCreating(true);
    try {
      await departmentService.create({ name: deptName.trim() });
      setDeptName('');
      await onDepartmentsChanged();
      closeModal();
    } catch (e) {
      setDeptError(e instanceof Error ? e.message : 'Failed to create department');
    } finally {
      setDeptCreating(false);
    }
  };

  // --- Edit Administrators form ---
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

  if (!activeModal) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>✕</button>

        {['DELETE_EMPLOYEE', 'DELETE_LEAVE', 'CANCEL_LEAVE', 'DELETE_DEPARTMENT', 'LOGOUT', 'CHANGE_PASSWORD'].includes(activeModal) && (
          <div className="modal-confirm">
            <h3>
              {activeModal === 'DELETE_EMPLOYEE' && 'Do you really want to delete employee from department?'}
              {activeModal === 'DELETE_LEAVE' && 'Do you really want to delete a leave?'}
              {activeModal === 'CANCEL_LEAVE' && 'Do you really want to cancel a leave?'}
              {activeModal === 'DELETE_DEPARTMENT' && 'Do you really want to delete a department?'}
              {activeModal === 'LOGOUT' && 'Do you really want to log out?'}
              {activeModal === 'CHANGE_PASSWORD' && 'Do you really want to change password?'}
            </h3>
            {confirmError && <p className="form-error">{confirmError}</p>}
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => { onConfirmErrorClear?.(); confirmModal(); }}>YES</button>
              <button className="btn-outline-primary" onClick={closeModal}>NO</button>
            </div>
          </div>
        )}

        {activeModal === 'ADD_EMPLOYEE' && (
          <div className="modal-form">
            <h2>Add employee</h2>

            <label>First name<input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
            <label>Surname<input type="text" value={newSurname} onChange={(e) => setNewSurname(e.target.value)} /></label>
            <label>Email<input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></label>
            <label>Password<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>

            {/* Employee Checkbox Section — owners choose roles; admins always create employees. */}
            {!isAdminCreator && (
              <div className="checkbox-header" onClick={() => setIsEmployeeChecked(!isEmployeeChecked)}>
                <h3>Employee</h3>
                <div className={`custom-checkbox ${isEmployeeChecked ? 'checked' : ''}`} />
              </div>
            )}

            {/* Department options come from the API; nothing is shown when none exist yet. */}
            {isEmployeeChecked && (
              <label style={{ marginBottom: 8 }}>Department
                <select
                  value={employeeDeptId ?? ''}
                  onChange={(e) => setEmployeeDeptId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="" disabled>select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>
            )}

            {/* Administrator role is owner-only (admins cannot create other admins). */}
            {!isAdminCreator && (
              <>
                <div className="checkbox-header" onClick={() => setIsAdminChecked(!isAdminChecked)}>
                  <h3>Administrator</h3>
                  <div className={`custom-checkbox ${isAdminChecked ? 'checked' : ''}`} />
                </div>

                {isAdminChecked && (
                  <label>Administrator of
                    <select
                      value={adminDeptId ?? ''}
                      onChange={(e) => setAdminDeptId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="" disabled>select department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}

            {departments.length === 0 && (
              <p className="form-error">No departments exist yet. Create a department before adding users.</p>
            )}

            {createError && <p className="form-error">{createError}</p>}

            {/* Default working hours are hidden for now, so a single create action remains. */}
            <button className="primary-btn full-width" onClick={handleCreateUser} disabled={creating || departments.length === 0}>
              + add employee
            </button>
          </div>
        )}

        {/* Edit Administrators Popup */}
        {activeModal === 'EDIT_ADMINS' && (
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
        )}

        {activeModal === 'ADD_UNASSIGNED' && (
          <div className="modal-form">
            <h2>Add employee from non-assigned department</h2>
            <div className="unassigned-card">
              <h4>{selectedEmployee?.name || 'Milana Ronchyk'}</h4>
              <label>Department
                <select><option>Department 1</option></select>
              </label>
            </div>
            <button className="primary-btn full-width" onClick={closeModal}>+ add employee</button>
          </div>
        )}

        {activeModal === 'LOG_HOURS' && (
          <div className="modal-form">
            <h2>Log hours</h2>
            <h4 style={{ textAlign: 'center', marginBottom: 16 }}>{selectedEmployee?.name || 'Employee'}</h4>
            <label>Type<select><option>Regular</option><option>Overtime</option></select></label>
            <label>From<input type="time" defaultValue="09:00" /></label>
            <label>Till<input type="time" defaultValue="17:00" /></label>
            <button className="primary-btn full-width" onClick={closeModal}>+ add hours</button>
          </div>
        )}

        {(activeModal === 'ADD_LEAVE' || activeModal === 'EDIT_LEAVE' || activeModal === 'CREATE_REQUEST') && (
          <div className="modal-form">
            <h2>{activeModal === 'EDIT_LEAVE' ? 'Edit leave' : activeModal === 'CREATE_REQUEST' ? 'Create request' : 'Add request'}</h2>
            {activeModal === 'CREATE_REQUEST' && (
              <>
                <label>First name<input type="text" /></label>
                <label>Surname<input type="text" /></label>
              </>
            )}
            <label>Type of leave (by payment)<select><option>Paid</option><option>Unpaid</option></select></label>
            <label>Type of leave<select><option>Vacation</option><option>Sick</option><option>Personal</option></select></label>
            <div className="balance-hint">If vacation: you have 15 days left</div>
            <label>From<input type="date" /></label>
            <label>Till<input type="date" /></label>
            <label>Reason<textarea rows={2}></textarea></label>
            <button className="primary-btn full-width" onClick={closeModal}>
              {activeModal === 'EDIT_LEAVE' ? 'edit leave' : '+ create request'}
            </button>
          </div>
        )}

        {activeModal === 'ACCEPT_REQUEST' && (
          <div className="modal-form">
            <h2>Vacation leave</h2>
            <div className="request-summary-box">
              <h3>{selectedRequest?.employeeName || 'Maryia Stralchonak'}</h3>
              <p>From: 10.05.2026</p>
              <p>Till: 18.05.2026</p>
              <label>Reason<div className="reason-box">Taking designated annual family leave.</div></label>
            </div>
            <button className="primary-btn full-width" onClick={closeModal}>accept request</button>
          </div>
        )}

        {activeModal === 'ADD_DEPARTMENT' && (
          <div className="modal-form">
            <h2>Add department</h2>
            <label>Name of department
              <input
                type="text"
                placeholder="e.g. Department 7"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
            </label>
            {deptError && <p className="form-error">{deptError}</p>}
            <button className="primary-btn full-width" onClick={handleCreateDepartment} disabled={deptCreating}>
              + add department
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modals;
