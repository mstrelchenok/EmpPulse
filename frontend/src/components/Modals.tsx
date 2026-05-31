
import React, { useState } from 'react';
import type { ModalType, Employee, LeaveRequest, Department } from '../types';
import { userService } from '../services/api';

interface Props {
  activeModal: ModalType;
  openModal: (modal: ModalType, deptOrEmp?: any, requestObj?: LeaveRequest) => void;
  closeModal: () => void;
  confirmModal: () => void;
  selectedEmployee: Employee | null;
  selectedRequest: LeaveRequest | null;
  selectedDepartment: Department | null;
}

const Modals: React.FC<Props> = ({ activeModal, closeModal, confirmModal, selectedEmployee, selectedRequest, selectedDepartment }) => {
  // Local state for the Add Employee form toggles
  const [isEmployeeChecked, setIsEmployeeChecked] = useState(true);
  const [isAdminChecked, setIsAdminChecked] = useState(true);

  // Controlled fields for the Add Employee form
  const [newName, setNewName] = useState('');
  const [newSurname, setNewSurname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
    setCreating(true);
    try {
      // Department selection and default working hours are not wired up yet,
      // so an employee is created with no department and a zero vacation balance.
      await userService.create({
        name: newName.trim(),
        surname: newSurname.trim(),
        email: newEmail.trim(),
        password: newPassword,
        ...(isEmployeeChecked ? { employeeDepartmentId: null, yearlyVacationBalance: 0 } : {}),
        // null means no admin role; empty array means admin with no department yet
        adminDepartmentIds: isAdminChecked ? [] : undefined,
      });
      closeModal();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  // Local state for live-editing administrators in the popup
  // Fallback array guarantees safe rendering even if selectedDepartment is null
  const [editableAdmins, setEditableAdmins] = useState<string[]>(
    selectedDepartment?.administrators || ['Mikita Sirosh', 'Milana Ronchyk', 'Ihar Khamichenka', 'Nazar Bezmenov', 'Ilya Paliashchuk', 'Maryia Stralchonak']
  );

  // Sync state if selectedDepartment opens
  React.useEffect(() => {
    if (selectedDepartment?.administrators) {
      setEditableAdmins(selectedDepartment.administrators);
    }
  }, [selectedDepartment]);

  const handleRemoveAdmin = (indexToRemove: number) => {
    setEditableAdmins(prev => prev.filter((_, idx) => idx !== indexToRemove));
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
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={confirmModal}>YES</button>
              <button className="btn-outline-primary" onClick={closeModal}>NO</button>
            </div>
          </div>
        )}

        {activeModal === 'ADD_EMPLOYEE' && (
          <div className="modal-form">
            <h2>Add employee</h2>

            {/* Fields stacked vertically */}
            <label>First name<input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
            <label>Surname<input type="text" value={newSurname} onChange={(e) => setNewSurname(e.target.value)} /></label>
            <label>Email<input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></label>
            <label>Password<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>

            {/* Employee Checkbox Section */}
            <div className="checkbox-header" onClick={() => setIsEmployeeChecked(!isEmployeeChecked)}>
              <h3>Employee</h3>
              <div className={`custom-checkbox ${isEmployeeChecked ? 'checked' : ''}`} />
            </div>

            {/* Department selection is not wired up yet: employees are created
                without a department until department management UI is ready. */}
            {isEmployeeChecked && (
              <label style={{ marginBottom: 8 }}>Department
                <select disabled title="Department assignment is not available yet">
                  <option>No department</option>
                </select>
              </label>
            )}

            {/* Administrator Checkbox Section */}
            <div className="checkbox-header" onClick={() => setIsAdminChecked(!isAdminChecked)}>
              <h3>Administrator</h3>
              <div className={`custom-checkbox ${isAdminChecked ? 'checked' : ''}`} />
            </div>
            
            {isAdminChecked && (
              <label>Administrator of
                <select disabled title="Department assignment is not available yet">
                  <option>No department</option>
                </select>
              </label>
            )}

            {createError && <p className="form-error">{createError}</p>}

            {/* Side-by-Side Submission Buttons */}
            <div className="modal-footer-split">
              <button className="btn-split-action" onClick={handleCreateUser} disabled={creating}>
                + add without default working hours
              </button>
              {/* Default working hours are not supported yet. */}
              <button className="btn-split-action" disabled title="Default working hours are not available yet">
                + add default working hours
              </button>
            </div>
          </div>
        )}

        {/* NEW: Edit Administrators Popup */}
        {activeModal === 'EDIT_ADMINS' && (
          <div className="modal-form">
            <h2>Edit administrators</h2>
            <h3 style={{ textAlign: 'left', fontSize: 16, marginTop: 16 }}>
              {selectedDepartment?.name || 'Department2'}
            </h3>
            
            <div className="edit-admins-list">
              {editableAdmins.map((adminName, idx) => (
                <div key={idx} className="edit-admin-item">
                  <span className="index">1)</span>
                  <div className="edit-admin-pill">{adminName}</div>
                  <button 
                    className="btn-remove" 
                    onClick={() => handleRemoveAdmin(idx)}
                    title="Remove administrator"
                  >
                    —
                  </button>
                </div>
              ))}
            </div>

            <label>
              <select defaultValue="">
                <option value="" disabled>select</option>
                <option value="new1">Oleksandr Lypiatskyi</option>
                <option value="new2">Andrei Didenko</option>
              </select>
            </label>

            <button className="primary-btn full-width" onClick={closeModal} style={{ marginTop: 24 }}>
              + add department
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
            <label>Name of department<input type="text" placeholder="e.g. Department 7" /></label>
            <label>Administrators of department
              <div className="admin-row"><span>1) Mikita Sirosh</span><button className="btn-remove">-</button></div>
              <select><option>select administrator</option></select>
            </label>
            <button className="primary-btn full-width" onClick={closeModal}>+ add department</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modals;
