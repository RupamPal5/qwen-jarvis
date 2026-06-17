import { useState, useEffect } from 'react';
import { ModelEntry } from '../types/models';

export interface ModelStatus {
  model_id: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'error' | 'unknown';
  latency?: number;
  last_checked?: string;
  is_local: boolean;
  last_checked_timestamp?: number;
}

export function useModelRegistry() {
  const [models, setModels] = useState<Record<string, ModelEntry>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<Record<string, ModelStatus>>({});

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const [modelsResponse, healthResponse] = await Promise.all([
          fetch('/api/models'),
          fetch('/api/models/status/all')
        ]);

        if (!modelsResponse.ok) {
          throw new Error('Failed to fetch models');
        }
        const modelsData = await modelsResponse.json();
        setModels(modelsData);

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          setHealthStatus(healthData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();

    // Set up periodic health status updates
    const interval = setInterval(fetchModels, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { models, healthStatus, loading, error };
}
