// src/App.tsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Modals from './components/Modals';
import LoginScreen from './pages/LoginPage';
import ForbiddenScreen from './pages/ForbiddenPage';
import EmployeesScreen from './pages/EmployeesPage';
import RequestManagerScreen from './pages/RequestManagerPage';
import MyRequestsScreen from './pages/MyRequestsPage';
import DepartmentsScreen from './pages/DepartmentsPage';
import DepartmentDetailScreen from './pages/DepartmentDetailPage';
import ProfileScreen from './pages/ProfilePage';

import type { ScreenType, ModalType, Employee, LeaveRequest, Department, MeUser, UserRole } from './types';
import { deriveRole } from './types';
import { canAccessRoute } from './utils/guards';
import { authService } from './services/api';
import './styles/global.css';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [currentUser, setCurrentUser] = useState<MeUser | null>(null);

  // App context pointers
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const userRole: UserRole | null = currentUser ? deriveRole(currentUser) : null;

  const handleLoginSuccess = (user: MeUser) => {
    setCurrentUser(user);
    const role = deriveRole(user);
    setCurrentScreen(role === 'WORKER' ? 'my-requests' : 'employees');
  };

  const handleSetScreen = (screen: ScreenType) => {
    if (!canAccessRoute(screen, userRole)) {
      setCurrentScreen('forbidden');
      return;
    }
    setCurrentScreen(screen);
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
    handleSetScreen('department-detail');
  };

  const handleOpenEmployeeProfile = (emp: Employee) => {
    setSelectedEmployee(emp);
    handleSetScreen('employee-profile');
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentScreen === 'forbidden') {
    return <ForbiddenScreen onHome={() => handleSetScreen(userRole === 'WORKER' ? 'my-requests' : 'employees')} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        currentScreen={currentScreen}
        setScreen={handleSetScreen}
        currentUser={currentUser}
      />

      <main className="main-content-area">
        {currentScreen === 'employees' && userRole && ['OWNER', 'ADMIN'].includes(userRole) && (
          <EmployeesScreen openEmployeeProfile={handleOpenEmployeeProfile} openModal={handleOpenModal} />
        )}
        {currentScreen === 'request-manager' && userRole && ['OWNER', 'ADMIN'].includes(userRole) && (
          <RequestManagerScreen openModal={handleOpenModal} />
        )}
        {currentScreen === 'my-requests' && userRole && ['ADMIN', 'WORKER'].includes(userRole) && (
          <MyRequestsScreen openModal={handleOpenModal} />
        )}
        {currentScreen === 'departments' && userRole && ['OWNER', 'ADMIN'].includes(userRole) && (
          <DepartmentsScreen
            openModal={handleOpenModal}
            onSelectDepartment={handleSelectDepartment}
          />
        )}
        {currentScreen === 'department-detail' && userRole && ['OWNER', 'ADMIN'].includes(userRole) && (
          <DepartmentDetailScreen
            department={selectedDepartment}
            openModal={handleOpenModal}
            onBack={() => handleSetScreen('departments')}
          />
        )}
        {currentScreen === 'my-profile' && (
          <ProfileScreen isMyProfile={true} openModal={handleOpenModal} />
        )}
        {currentScreen === 'employee-profile' && userRole && ['OWNER', 'ADMIN'].includes(userRole) && (
          <ProfileScreen isMyProfile={false} employee={selectedEmployee} openModal={handleOpenModal} />
        )}
      </main>

      <Modals
        activeModal={activeModal}
        openModal={handleOpenModal}
        confirmModal={async () => {
          if (activeModal === 'LOGOUT') {
            await authService.logout();
            setCurrentUser(null);
            setCurrentScreen('login');
          }
          setActiveModal(null);
        }}
        closeModal={() => setActiveModal(null)}
        selectedEmployee={selectedEmployee}
        selectedRequest={selectedRequest}
        selectedDepartment={selectedDepartment}
      />
    </div>
  );
};

export default App;
