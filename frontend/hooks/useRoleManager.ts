import { useState, useEffect } from 'react';

class RoleManager {
  private static instance: RoleManager;
  private roles: Record<string, string> = {
    ARCHITECT: '',
    ARBITER: '',
    JUDGE: ''
  };

  private constructor() {
    // Initialize with default values
    this.loadFromLocalStorage();
  }

  public static getInstance(): RoleManager {
    if (!RoleManager.instance) {
      RoleManager.instance = new RoleManager();
    }
    return RoleManager.instance;
  }

  public getAllAssignments(): Record<string, string> {
    return { ...this.roles };
  }

  public assignRole(role: string, modelId: string): boolean {
    if (this.roles.hasOwnProperty(role)) {
      this.roles[role] = modelId;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('jarvisRoles', JSON.stringify(this.roles));
  }

  private loadFromLocalStorage(): void {
    const savedRoles = localStorage.getItem('jarvisRoles');
    if (savedRoles) {
      this.roles = JSON.parse(savedRoles);
    }
  }
}

export function useRoleManager() {
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the backend
      // For now, we'll use the local mock
      const roleManager = RoleManager.getInstance();
      setRoles(roleManager.getAllAssignments());

      // But also try to fetch from backend if available
      try {
        const response = await fetch('/api/models/roles');
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
          // Update the local mock
          const roleManager = RoleManager.getInstance();
          Object.entries(data).forEach(([role, modelId]) => {
            roleManager.assignRole(role, modelId as string);
          });
        }
      } catch (err) {
        console.log('Backend not available, using local mock');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (role: string, modelId: string) => {
    try {
      setLoading(true);

      // Update local mock first for instant feedback
      const roleManager = RoleManager.getInstance();
      roleManager.assignRole(role, modelId);
      setRoles(roleManager.getAllAssignments());

      // Then try to update backend
      try {
        const response = await fetch('/api/models/assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role, modelId }),
        });

        if (!response.ok) {
          throw new Error('Failed to assign model to role');
        }

        // Refresh from backend to ensure consistency
        await fetchRoles();
      } catch (err) {
        console.log('Backend assignment failed, using local mock');
        // Even if backend fails, we keep the local change
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return { roles, assignRole, loading, error };
}

// Helper function to get role manager instance
export function getRoleManager(): RoleManager {
  return RoleManager.getInstance();
}
