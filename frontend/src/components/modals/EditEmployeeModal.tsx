import React, { useState } from 'react';
import type { Department, Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  closeModal: () => void;
  departments: Department[];
  selectedEmployee: Employee | null;
}

const EditEmployeeModal: React.FC<Props> = ({ closeModal, departments, selectedEmployee }) => {
  const { userRole } = useAuth();
  // Check if the current user is the owner
  const isOwner = userRole === 'OWNER';

  // Pre-fill the states with the selected employee's data
  const [newName, setNewName] = useState(selectedEmployee?.name || '');
  const [newSurname, setNewSurname] = useState(selectedEmployee?.surname || '');
  const [newEmail, setNewEmail] = useState(selectedEmployee?.email || '');
  const [newPassword, setNewPassword] = useState(''); // Left blank by default on edit
  
  const [isEmployeeChecked, setIsEmployeeChecked] = useState(true);
  const [isAdminChecked, setIsAdminChecked] = useState(false);

  const [employeeDeptId, setEmployeeDeptId] = useState<number | null>(null);
  const [adminDeptId, setAdminDeptId] = useState<number | null>(null);

  const [editError, setEditError] = useState<string | null>(null);

  const handleEditUser = () => {
    setEditError(null);
    if (!newName.trim() || !newSurname.trim()) {
      setEditError('First name and surname are required.');
      return;
    }
    
    // TODO: Connect to your update mutation hook here
    // e.g., updateUser.mutate({ id: selectedEmployee.id, ...data })
    
    closeModal();
  };

  return (
    <div className="modal-form">
      <h2 style={{ marginBottom: '24px' }}>Edit employee’s profile</h2>

      <label>First name<input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
      <label>Surname<input type="text" value={newSurname} onChange={(e) => setNewSurname(e.target.value)} /></label>

      {/* ONLY RENDER EMAIL & PASSWORD FOR OWNERS */}
      {isOwner && (
        <>
          <label>Email<input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></label>
          <label>Password<input type="password" placeholder="Leave blank to keep current password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>
        </>
      )}

      {/* EMPLOYEE CHECKBOX */}
      <div 
        onClick={() => setIsEmployeeChecked(!isEmployeeChecked)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', marginBottom: '8px', cursor: 'pointer', userSelect: 'none' }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#000' }}>Employee</h3>
        <div style={{
          width: '24px', height: '24px', border: '2px solid #5932EA', borderRadius: '4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#5932EA', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.1s ease'
        }}>
          {isEmployeeChecked ? '✕' : ''}
        </div>
      </div>

      {isEmployeeChecked && (
        <label className="field-tight">Department
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

      {/* ADMINISTRATOR CHECKBOX - ONLY RENDER FOR OWNERS */}
      {isOwner && (
        <>
          <div 
            onClick={() => setIsAdminChecked(!isAdminChecked)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', marginBottom: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#000' }}>Administrator</h3>
            <div style={{
              width: '24px', height: '24px', border: '2px solid #5932EA', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#5932EA', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.1s ease'
            }}>
              {isAdminChecked ? '✕' : ''}
            </div>
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

      {editError && <p className="form-error">{editError}</p>}

      {/* SINGLE SUBMIT BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
        <button 
          onClick={handleEditUser} 
          style={{
            width: '220px', backgroundColor: '#5932EA', color: 'white', border: 'none',
            padding: '14px 12px', borderRadius: '8px', fontSize: '15px', fontWeight: 500,
            cursor: 'pointer', textAlign: 'center'
          }}
        >
          edit employee
        </button>
      </div>
    </div>
  );
};

export default EditEmployeeModal;