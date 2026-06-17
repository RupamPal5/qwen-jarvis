import { useState, useEffect } from 'react';

interface Preset {
  name: string;
  description: string;
  assignments: Record<string, string>;
}

export function usePresets() {
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/models/presets');
        if (!response.ok) {
          throw new Error('Failed to fetch presets');
        }
        const data = await response.json();
        setPresets(data.presets || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, []);

  const applyPreset = async (presetName: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/models/apply-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preset_name: presetName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to apply preset');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { presets, applyPreset, loading, error };
}
import { useState, useEffect } from 'react';

interface Preset {
  name: string;
  description: string;
  assignments: Record<string, string>;
}

export function usePresets() {
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/models/presets');
        if (!response.ok) {
          throw new Error('Failed to fetch presets');
        }
        const data = await response.json();
        setPresets(data.presets || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, []);

  const applyPreset = async (presetName: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/models/apply-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preset_name: presetName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to apply preset');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { presets, applyPreset, loading, error };
}
