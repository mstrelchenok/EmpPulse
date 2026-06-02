import React, { useState, useEffect, useCallback, useRef } from 'react';
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

import type { ScreenType, ModalType, Employee, LeaveRequest, Department, MeUser } from './types';
import { canAccessRoute } from './utils/guards';
import { departmentService } from './services/api';
import { useAuth } from './context/AuthContext';
import './styles/global.css';

const App: React.FC = () => {
  const { userRole, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Shared department data (used by the departments screens and the user-creation modal)
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsLoadError, setDepartmentsLoadError] = useState<string | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [departmentDetailLoading, setDepartmentDetailLoading] = useState(false);
  const [deleteDepartmentError, setDeleteDepartmentError] = useState<string | null>(null);

  // When user selects a new department while a previous fetch is in flight, abort the stale request.
  // This prevents a slower response from overwriting data from a faster selection.
  const selectAbortRef = useRef<AbortController | null>(null);

  const reloadDepartments = useCallback(async () => {
    setDepartmentsLoading(true);
    setDepartmentsLoadError(null);
    try {
      setDepartments(await departmentService.getAll());
    } catch (e) {
      setDepartments([]);
      setDepartmentsLoadError(e instanceof Error ? e.message : 'Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  }, []);

  // Load departments once an OWNER/ADMIN is signed in.
  useEffect(() => {
    if (userRole === 'OWNER' || userRole === 'ADMIN') {
      reloadDepartments();
    } else {
      setDepartments([]);
    }
  }, [userRole, reloadDepartments]);

  const handleLoginSuccess = (user: MeUser) => {
    setCurrentScreen(user.adminProfile === null && !user.owner ? 'my-requests' : 'employees');
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
      if (deptOrEmp.admins !== undefined) {
        setSelectedDepartment(deptOrEmp);
      } else {
        setSelectedEmployee(deptOrEmp);
      }
    }
    if (requestObj) setSelectedRequest(requestObj);
    setActiveModal(modal);
  };

  // Open a department's detail view by fetching its full record from the API.
  const handleSelectDepartment = async (dept: Department) => {
    if (!canAccessRoute('department-detail', userRole)) {
      setCurrentScreen('forbidden');
      return;
    }
    selectAbortRef.current?.abort();
    const controller = new AbortController();
    selectAbortRef.current = controller;
    setDepartmentError(null);
    setDepartmentDetailLoading(true);
    try {
      const fresh = await departmentService.getById(dept.id, controller.signal);
      setSelectedDepartment(fresh);
      setCurrentScreen('department-detail');
    } catch (e) {
      if (controller.signal.aborted) return;
      setDepartmentError(e instanceof Error ? e.message : 'Failed to load department');
    } finally {
      if (selectAbortRef.current === controller) {
        setDepartmentDetailLoading(false);
        selectAbortRef.current = null;
      }
    }
  };

  // After an edit (e.g. reassigning admins), refresh the open department and the list.
  const refreshDepartments = async () => {
    await reloadDepartments();
    if (selectedDepartment) {
      try {
        setSelectedDepartment(await departmentService.getById(selectedDepartment.id));
      } catch {
        // Department may have been deleted/detached; leave the stale view in place.
      }
    }
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
      />

      <main className="main-content-area">
        {departmentError && (
          <p className="form-error" style={{ margin: '0 0 16px' }}>{departmentError}</p>
        )}
        {departmentsLoadError && (
          <p className="form-error" style={{ margin: '0 0 16px' }}>{departmentsLoadError}</p>
        )}
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
            departments={departments}
            loading={departmentsLoading}
            openModal={handleOpenModal}
            onSelectDepartment={handleSelectDepartment}
          />
        )}
        {currentScreen === 'department-detail' && userRole && ['OWNER', 'ADMIN'].includes(userRole) && (
          <DepartmentDetailScreen
            department={selectedDepartment}
            loading={departmentDetailLoading}
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
            // AuthContext.logout clears the local session even if the network
            // call fails, so the user is never stranded in a signed-in state.
            await logout();
            setCurrentScreen('login');
            setActiveModal(null);
            return;
          }
          if (activeModal === 'DELETE_DEPARTMENT' && selectedDepartment) {
            try {
              await departmentService.delete(selectedDepartment.id);
              await reloadDepartments();
              setActiveModal(null);
              if (currentScreen === 'department-detail') {
                setCurrentScreen('departments');
              }
            } catch {
              setDeleteDepartmentError(
                selectedDepartment.admins.length > 0
                  ? 'This department still has administrators attached to it. Unassign all administrators before deleting.'
                  : 'This department still has employees assigned to it. Unassign all employees before deleting.'
              );
            }
            return;
          }
          setActiveModal(null);
        }}
        closeModal={() => { setDeleteDepartmentError(null); setActiveModal(null); }}
        selectedEmployee={selectedEmployee}
        selectedRequest={selectedRequest}
        selectedDepartment={selectedDepartment}
        departments={departments}
        onDepartmentsChanged={refreshDepartments}
        confirmError={deleteDepartmentError}
        onConfirmErrorClear={() => setDeleteDepartmentError(null)}
      />
    </div>
  );
};

export default App;
