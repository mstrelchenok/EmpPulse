// src/App.tsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Modals from './components/Modals';
import LoginScreen from './pages/LoginPage';
import EmployeesScreen from './pages/EmployeesPage';
import RequestManagerScreen from './pages/RequestManagerPage';
import MyRequestsScreen from './pages/MyRequestsPage';
import DepartmentsScreen from './pages/DepartmentsPage';
import DepartmentDetailScreen from './pages/DepartmentDetailPage';
import ProfileScreen from './pages/ProfilePage';

import type { ScreenType, ModalType, Employee, LeaveRequest, Department, MeUser } from './types';
import { deriveRole } from './types';
import './styles/global.css';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [currentUser, setCurrentUser] = useState<MeUser | null>(null);

  // App context pointers
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const handleLoginSuccess = (user: MeUser) => {
    setCurrentUser(user);
    const role = deriveRole(user);
    setCurrentScreen(role === 'WORKER' ? 'my-requests' : 'employees');
  };

  const handleOpenModal = (modal: ModalType, deptOrEmp?: any, requestObj?: LeaveRequest) => {
    if (deptOrEmp) {
      if (deptOrEmp.schedule !== undefined) {
        setSelectedDepartment(deptOrEmp);
      } else {
        setSelectedEmployee(deptOrEmp);
      }
    }
    if (requestObj) setSelectedRequest(requestObj);
    setActiveModal(modal);
  };

  const handleSelectDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setCurrentScreen('department-detail');
  };

  const handleOpenEmployeeProfile = (emp: Employee) => {
    setSelectedEmployee(emp);
    setCurrentScreen('employee-profile');
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
        currentUser={currentUser}
      />

      <main className="main-content-area">
        {currentScreen === 'employees' && (
          <EmployeesScreen openEmployeeProfile={handleOpenEmployeeProfile} openModal={handleOpenModal} />
        )}
        {currentScreen === 'request-manager' && (
          <RequestManagerScreen openModal={handleOpenModal} />
        )}
        {currentScreen === 'my-requests' && (
          <MyRequestsScreen openModal={handleOpenModal} />
        )}
        {currentScreen === 'departments' && (
          <DepartmentsScreen
            openModal={handleOpenModal}
            onSelectDepartment={handleSelectDepartment}
          />
        )}
        {currentScreen === 'department-detail' && (
          <DepartmentDetailScreen
            department={selectedDepartment}
            openModal={handleOpenModal}
            onBack={() => setCurrentScreen('departments')}
          />
        )}
        {currentScreen === 'my-profile' && (
          <ProfileScreen isMyProfile={true} openModal={handleOpenModal} />
        )}
        {currentScreen === 'employee-profile' && (
          <ProfileScreen isMyProfile={false} employee={selectedEmployee} openModal={handleOpenModal} />
        )}
      </main>

      <Modals
        activeModal={activeModal}
        openModal={handleOpenModal}
        closeModal={() => {
          if (activeModal === 'LOGOUT') {
            setCurrentUser(null);
            setCurrentScreen('login');
          }
          setActiveModal(null);
        }}
        selectedEmployee={selectedEmployee}
        selectedRequest={selectedRequest}
        selectedDepartment={selectedDepartment}
      />
    </div>
  );
};

export default App;
