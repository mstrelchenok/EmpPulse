import React, { useState } from 'react';
import { departmentService } from '../../services/api';

interface Props {
  closeModal: () => void;
  onDepartmentsChanged: () => void | Promise<void>;
}

const AddDepartmentModal: React.FC<Props> = ({ closeModal, onDepartmentsChanged }) => {
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

  return (
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
  );
};

export default AddDepartmentModal;
