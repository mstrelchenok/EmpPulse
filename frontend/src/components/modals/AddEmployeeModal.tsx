import React, { useState } from 'react';
import type { ModalType, Department } from '../../types';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Props {
  activeModal: ModalType;
  closeModal: () => void;
  departments: Department[];
}

const AddEmployeeModal: React.FC<Props> = ({ activeModal, closeModal, departments }) => {
  const { userRole } = useAuth();
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

  return (
    <div className="modal-form">
      <h2>Add employee</h2>

      <label>First name<input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
      <label>Surname<input type="text" value={newSurname} onChange={(e) => setNewSurname(e.target.value)} /></label>
      <label>Email<input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></label>
      <label>Password<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>

      {!isAdminCreator && (
        <div className="checkbox-header" onClick={() => setIsEmployeeChecked(!isEmployeeChecked)}>
          <h3>Employee</h3>
          <div className={`custom-checkbox ${isEmployeeChecked ? 'checked' : ''}`} />
        </div>
      )}

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

      <button className="primary-btn full-width" onClick={handleCreateUser} disabled={creating || departments.length === 0}>
        + add employee
      </button>
    </div>
  );
};

export default AddEmployeeModal;
