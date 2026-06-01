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

import type { ScreenType, ModalType, Employee, LeaveRequest, Department, MeUser, UserRole } from './types';
import { deriveRole } from './types';
import { canAccessRoute } from './utils/guards';
import { authService, departmentService } from './services/api';
import './styles/global.css';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [currentUser, setCurrentUser] = useState<MeUser | null>(null);

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

  // Active department-detail fetch, so a newer selection can cancel an older one
  // outright (rather than letting a stale request resolve and discarding it).
  const selectAbortRef = useRef<AbortController | null>(null);

  const userRole: UserRole | null = currentUser ? deriveRole(currentUser) : null;

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
    // Cancel any in-flight selection so a slower request can't land on a stale
    // department's data — the obsolete fetch is aborted, not merely ignored.
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
      // A superseded request was aborted on purpose — ignore its rejection.
      if (controller.signal.aborted) return;
      setDepartmentError(e instanceof Error ? e.message : 'Failed to load department');
    } finally {
      // Only the still-current request owns the loading flag.
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
        currentUser={currentUser}
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
            userRole={userRole}
            currentUser={currentUser}
            openModal={handleOpenModal}
            onSelectDepartment={handleSelectDepartment}
          />
        )}
        {currentScreen === 'department-detail' && userRole && ['OWNER', 'ADMIN'].includes(userRole) && (
          <DepartmentDetailScreen
            department={selectedDepartment}
            loading={departmentDetailLoading}
            userRole={userRole}
            openModal={handleOpenModal}
            onBack={() => handleSetScreen('departments')}
          />
        )}
        {currentScreen === 'my-profile' && (
          <ProfileScreen isMyProfile={true} currentUser={currentUser} openModal={handleOpenModal} />
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
            // Clear the local session even if the network logout call fails,
            // so the user is never stranded in a signed-in state.
            try {
              await authService.logout();
            } finally {
              setCurrentUser(null);
              setCurrentScreen('login');
              setActiveModal(null);
            }
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
        userRole={userRole}
        onDepartmentsChanged={refreshDepartments}
        confirmError={deleteDepartmentError}
        onConfirmErrorClear={() => setDeleteDepartmentError(null)}
      />
    </div>
  );
};

export default App;
