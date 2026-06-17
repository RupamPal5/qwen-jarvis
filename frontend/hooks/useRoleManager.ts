import { useState, useEffect } from 'react';

export function useRoleManager() {
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models/roles');
      if (!response.ok) {
        throw new Error('Failed to fetch role assignments');
      }
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (role: string, modelId: string) => {
    try {
      setLoading(true);
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

      await fetchRoles(); // Refresh roles after assignment
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
