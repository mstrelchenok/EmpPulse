import React from 'react';
import type { ModalType, Employee, LeaveRequest, Department } from '../types';
import ConfirmModal from './modals/ConfirmModal';
import AddEmployeeModal from './modals/AddEmployeeModal';
import EditAdminsModal from './modals/EditAdminsModal';
import AddUnassignedModal from './modals/AddUnassignedModal';
import LogHoursModal from './modals/LogHoursModal';
import LeaveModal from './modals/LeaveModal';
import AcceptRequestModal from './modals/AcceptRequestModal';
import AddDepartmentModal from './modals/AddDepartmentModal';

interface Props {
  activeModal: ModalType;
  openModal: (modal: ModalType, deptOrEmp?: any, requestObj?: LeaveRequest) => void;
  closeModal: () => void;
  confirmModal: () => void;
  selectedEmployee: Employee | null;
  selectedRequest: LeaveRequest | null;
  selectedDepartment: Department | null;
  departments: Department[];
  onDepartmentsChanged: () => void | Promise<void>;
  confirmError?: string | null;
  onConfirmErrorClear?: () => void;
}

const CONFIRM_MODALS: ModalType[] = ['DELETE_EMPLOYEE', 'DELETE_LEAVE', 'CANCEL_LEAVE', 'DELETE_DEPARTMENT', 'LOGOUT', 'CHANGE_PASSWORD'];

const Modals: React.FC<Props> = ({ activeModal, closeModal, confirmModal, selectedEmployee, selectedRequest, selectedDepartment, departments, onDepartmentsChanged, confirmError, onConfirmErrorClear }) => {
  if (!activeModal) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>✕</button>

        {CONFIRM_MODALS.includes(activeModal) && (
          <ConfirmModal
            activeModal={activeModal}
            closeModal={closeModal}
            confirmModal={confirmModal}
            confirmError={confirmError}
            onConfirmErrorClear={onConfirmErrorClear}
          />
        )}

        {activeModal === 'ADD_EMPLOYEE' && (
          <AddEmployeeModal
            activeModal={activeModal}
            closeModal={closeModal}
            departments={departments}
          />
        )}

        {activeModal === 'EDIT_ADMINS' && (
          <EditAdminsModal
            activeModal={activeModal}
            closeModal={closeModal}
            selectedDepartment={selectedDepartment}
            onDepartmentsChanged={onDepartmentsChanged}
          />
        )}

        {activeModal === 'ADD_UNASSIGNED' && (
          <AddUnassignedModal closeModal={closeModal} selectedEmployee={selectedEmployee} />
        )}

        {activeModal === 'LOG_HOURS' && (
          <LogHoursModal closeModal={closeModal} selectedEmployee={selectedEmployee} />
        )}

        {(activeModal === 'ADD_LEAVE' || activeModal === 'EDIT_LEAVE' || activeModal === 'CREATE_REQUEST') && (
          <LeaveModal activeModal={activeModal} closeModal={closeModal} />
        )}

        {activeModal === 'ACCEPT_REQUEST' && (
          <AcceptRequestModal closeModal={closeModal} selectedRequest={selectedRequest} />
        )}

        {activeModal === 'ADD_DEPARTMENT' && (
          <AddDepartmentModal closeModal={closeModal} onDepartmentsChanged={onDepartmentsChanged} />
        )}
      </div>
    </div>
  );
};

export default Modals;
