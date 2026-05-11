
import React, { useState } from 'react';
import type { ModalType, Employee, LeaveRequest, Department } from '../types';

interface Props {
  activeModal: ModalType;
  openModal: (modal: ModalType, deptOrEmp?: any, requestObj?: LeaveRequest) => void;
  closeModal: () => void;
  selectedEmployee: Employee | null;
  selectedRequest: LeaveRequest | null;
  selectedDepartment: Department | null;
}

const Modals: React.FC<Props> = ({ activeModal, closeModal, selectedEmployee, selectedRequest, selectedDepartment }) => {
  // Local state for the Add Employee form toggles
  const [isEmployeeChecked, setIsEmployeeChecked] = useState(true);
  const [isAdminChecked, setIsAdminChecked] = useState(true);

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
              <button className="btn-secondary" onClick={closeModal}>YES</button>
              <button className="btn-outline-primary" onClick={closeModal}>NO</button>
            </div>
          </div>
        )}

        {activeModal === 'ADD_EMPLOYEE' && (
          <div className="modal-form">
            <h2>Add employee</h2>
            
            {/* Fields stacked vertically */}
            <label>First name<input type="text" /></label>
            <label>Surname<input type="text" /></label>
            <label>Email<input type="email" /></label>
            <label>Password<input type="password" /></label>

            {/* Employee Checkbox Section */}
            <div className="checkbox-header" onClick={() => setIsEmployeeChecked(!isEmployeeChecked)}>
              <h3>Employee</h3>
              <div className={`custom-checkbox ${isEmployeeChecked ? 'checked' : ''}`} />
            </div>
            
            {/* Conditionally rendered Department dropdown */}
            {isEmployeeChecked && (
              <label style={{ marginBottom: 8 }}>Department
                <select>
                  <option>Department 1</option>
                  <option>Department 2</option>
                </select>
              </label>
            )}

            {/* Administrator Checkbox Section */}
            <div className="checkbox-header" onClick={() => setIsAdminChecked(!isAdminChecked)}>
              <h3>Administrator</h3>
              <div className={`custom-checkbox ${isAdminChecked ? 'checked' : ''}`} />
            </div>
            
            {/* Conditionally rendered Administrator dropdown */}
            {isAdminChecked && (
              <label>Administrator of
                <select>
                  <option>Department 2</option>
                  <option>Department 1</option>
                </select>
              </label>
            )}

            {/* Side-by-Side Submission Buttons */}
            <div className="modal-footer-split">
              <button className="btn-split-action" onClick={closeModal}>
                + add without default working hours
              </button>
              <button className="btn-split-action" onClick={closeModal}>
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
