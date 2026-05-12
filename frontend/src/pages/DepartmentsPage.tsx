// src/components/screens/DepartmentsScreen.tsx
import React, { useState } from 'react';
import type { ModalType, Department } from '../types';
import trashIcon from '../assets/trash-icon.png.webp';

interface Props { 
  openModal: (modal: ModalType, dept?: Department) => void; 
  onSelectDepartment: (dept: Department) => void;
}

const mockDepartmentsData: Department[] = [
  { 
    id: 'dept-1', 
    name: 'Department 1', 
    administrators: ['Mikita Sirosh', 'Milana Ronchyk'],
    schedule: [
      { day: 'Monday', shifts: [{ start: '9:00', end: '17:00' }] },
      { day: 'Tuesday', shifts: [{ start: '9:00', end: '17:00' }] },
      { day: 'Wednesday', shifts: [{ start: '9:00', end: '17:00' }] },
      { day: 'Thursday', shifts: [{ start: '9:00', end: '17:00' }] },
      { day: 'Friday', shifts: [{ start: '9:00', end: '17:00' }] }
    ]
  },
  { 
    id: 'dept-2', 
    name: 'Department 2', 
    administrators: ['Mikita Sirosh', 'Milana Ronchyk', 'Ihar Khamichenka', 'Nazar Bezmenov', 'Ilya Paliashchuk', 'Maryia Stralchonak'],
    schedule: [
      { day: 'Monday', shifts: [{ start: '9:00', end: '17:00' }, { start: '17:00', end: '20:00' }] },
      { day: 'Tuesday', shifts: [{ start: '9:00', end: '17:00' }] },
      { day: 'Wednesday', shifts: [{ start: '9:00', end: '17:00' }] },
      { day: 'Thursday', shifts: [{ start: '9:00', end: '17:00' }] },
      { day: 'Friday', shifts: [{ start: '9:00', end: '17:00' }] }
    ]
  },
  { 
    id: 'dept-3', 
    name: 'Department 3', 
    administrators: ['Oleksandr Lypiatskyi'],
    schedule: [{ day: 'Monday', shifts: [{ start: '9:00', end: '17:00' }] }] 
  },
  { 
    id: 'dept-4', 
    name: 'Department 4', 
    administrators: ['Maryia Stralchonak'],
    schedule: [{ day: 'Monday', shifts: [{ start: '9:00', end: '17:00' }] }] 
  },
  { 
    id: 'dept-5', 
    name: 'Department 5', 
    administrators: ['Nazar Bezmenov'],
    schedule: [{ day: 'Monday', shifts: [{ start: '9:00', end: '17:00' }] }] 
  },
  { 
    id: 'dept-6', 
    name: 'Department 6', 
    administrators: ['Mikita Sirosh'],
    schedule: [{ day: 'Monday', shifts: [{ start: '9:00', end: '17:00' }] }] 
  }
];

const DepartmentsScreen: React.FC<Props> = ({ openModal, onSelectDepartment }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = mockDepartmentsData.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="screen-container">
      <header className="page-header">
        <h2>Departments</h2>
        <div className="header-actions">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown"><span>Filter by</span>...</div>
        </div>
      </header>

      <div className="card-box list-box">
        {filteredDepartments.map((dept) => (
          <div 
            key={dept.id} 
            className="employee-row hover-slide-container clickable"
            onClick={() => onSelectDepartment(dept)}
          >
            <div className="dept-info-stack">
              <span className="emp-name">{dept.name}</span>
              
            </div>

            <button 
              className="slide-bin-btn" 
              onClick={(e) => {
                e.stopPropagation(); 
                openModal('DELETE_DEPARTMENT', dept);
              }}
              title="Delete Department"
            >
              <img src={trashIcon} alt="Delete" width={30} height={30} />
            </button>
          </div>
        ))}
      </div>

      <div className="center-action" style={{ marginTop: 40 }}>
        <button className="primary-btn" onClick={() => openModal('ADD_DEPARTMENT')}>
          + add department
        </button>
      </div>
    </div>
  );
};

export default DepartmentsScreen;