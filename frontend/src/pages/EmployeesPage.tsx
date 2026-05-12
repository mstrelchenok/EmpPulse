import React, { useState } from 'react';
import type { ModalType, Employee, LeaveRequest } from '../types';
import trashIcon from '../assets/trash-icon.png.webp';
import { DEPARTMENT_EMPLOYEES, UNASSIGNED_EMPLOYEES } from '../utils/mockData';

interface Props {
  openModal: (modal: ModalType, emp?: Employee, requestObj?: LeaveRequest) => void;
  openEmployeeProfile: (emp: Employee) => void;
}

const EmployeesPage: React.FC<Props> = ({ openModal, openEmployeeProfile }) => {
  const [dept1Expanded, setDept1Expanded] = useState(true);
  const [unassignedExpanded, setUnassignedExpanded] = useState(true);

  return (
    <div className="screen-container">
      <header className="page-header">
        <h2>Employees</h2>
        <div className="header-actions">
          <div className="search-bar"><input type="text" placeholder="Search" /></div>
          <div className="filter-dropdown"><span>Filter by</span>...</div>
        </div>
      </header>

      <div className="accordion-section">
        <h3 className="department-title" onClick={() => setDept1Expanded(!dept1Expanded)}>
          Department 1
          <span className={`chevron ${dept1Expanded ? 'expanded' : ''}`}>►</span>
        </h3>

        {dept1Expanded && (
          <div className="card-box list-box">
            {DEPARTMENT_EMPLOYEES.map(emp => (
              <div
                key={emp.id}
                className="employee-row hover-slide-container"
                onClick={() => openEmployeeProfile(emp)}
              >
                <span className="emp-name">{emp.name}</span>
                <div className="emp-meta">
                  {emp.status && emp.status !== 'Working' && (
                    <span className={`badge badge-${emp.status.toLowerCase()}`}>{emp.status}</span>
                  )}
                  {emp.untilDate && <span className="until-text">untill {emp.untilDate}</span>}
                  <button
                    className="slide-bin-btn"
                    onClick={(e) => { e.stopPropagation(); openModal('DELETE_EMPLOYEE', emp); }}
                    title="Remove from department"
                  >
                    <img src={trashIcon} alt="Delete" width={30} height={30} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="accordion-section" style={{ marginTop: 32 }}>
        <h3 className="department-title" onClick={() => setUnassignedExpanded(!unassignedExpanded)}>
          Non-assigned department
          <span className={`chevron ${unassignedExpanded ? 'expanded' : ''}`}>►</span>
        </h3>

        {unassignedExpanded && (
          <div className="list-box">
            {UNASSIGNED_EMPLOYEES.map(emp => (
              <div key={emp.id} className="employee-row dashed-row">
                <span className="emp-name">{emp.name}</span>
                <button
                  className="icon-btn add-plus-btn"
                  onClick={() => openModal('ADD_UNASSIGNED', emp)}
                  title="Assign department"
                >
                  ➕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="center-action" style={{ marginTop: 40 }}>
        <button className="primary-btn" onClick={() => openModal('ADD_EMPLOYEE')}>+ add employee</button>
      </div>
    </div>
  );
};

export default EmployeesPage;
