import React from 'react';
import type { Employee } from '../../types';

interface Props {
  closeModal: () => void;
  selectedEmployee: Employee | null;
}

const AddUnassignedModal: React.FC<Props> = ({ closeModal, selectedEmployee }) => (
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
);

export default AddUnassignedModal;
