import React, { useState, useEffect } from 'react';
import { useModelRegistry } from '../hooks/useModelRegistry';
import { useRoleManager } from '../hooks/useRoleManager';
import { usePresets } from '../hooks/usePresets';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Check, X, Cpu, Shield, Gavel, Zap, Activity, Rocket, ChevronDown, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import { GlassmorphicPanel } from './glassmorphic-panel';
import { ModelEntry } from '../types/models';
import { SkeletonCard, SkeletonDropdown, SkeletonLoader } from './SkeletonLoader';

interface ModelStatus {
  model_id: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'error' | 'unknown';
  latency?: number;
  last_checked?: string;
  is_local: boolean;
  last_checked_timestamp?: number;
}

interface HealthMetrics {
  [modelId: string]: {
    latency?: number;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'error' | 'unknown';
    last_checked?: string;
    last_checked_timestamp?: number;
  };
}

export function ControlPlane() {
  const { models, healthStatus, loading: modelsLoading, error: modelsError } = useModelRegistry();
  const { roles, assignRole, loading: rolesLoading } = useRoleManager();
  const { presets, applyPreset, loading: presetsLoading } = usePresets();
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    ARCHITECT: '',
    ARBITER: '',
    JUDGE: '',
  });
  const [isApplying, setIsApplying] = useState(false);

  const notifyConfigUpdated = () => {
    // Notify via WebSocket if available
    if (window.WebSocket) {
      try {
        const wsUrl = (import.meta.env.VITE_WS_URL as string) || `ws://${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: "config_updated",
            timestamp: new Date().toISOString()
          }));
          ws.close();
        };

        ws.onerror = () => {
          // Fallback: dispatch custom event
          window.dispatchEvent(new CustomEvent('configUpdated'));
        };
      } catch {
        // Fallback: dispatch custom event
        window.dispatchEvent(new CustomEvent('configUpdated'));
      }
    } else {
      // Fallback: dispatch custom event
      window.dispatchEvent(new CustomEvent('configUpdated'));
    }
  };

  // Test function for development (comment out in production)
  /*
  const testConfigUpdate = () => {
    window.dispatchEvent(new CustomEvent('configUpdated'));
    toast.info('Test config update triggered', {
      duration: 3000,
    });
  };
  */

  const [activePreset, setActivePreset] = useState<string>('');
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  // Initialize selected models from current roles
  useEffect(() => {
    if (roles) {
      setSelectedModels({
        ARCHITECT: roles.ARCHITECT || '',
        ARBITER: roles.ARBITER || '',
        JUDGE: roles.JUDGE || '',
      });
    }
  }, [roles]);

  // The healthStatus is now managed by the useModelRegistry hook

  const handleModelChange = (role: string, modelId: string) => {
    setSelectedModels(prev => ({
      ...prev,
      [role]: modelId,
    }));
  };

  const handleApplyConfig = async () => {
    if (!selectedModels.ARCHITECT || !selectedModels.ARBITER || !selectedModels.JUDGE) {
      toast.error('Please select a model for each role');
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch('/api/config/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          architect: selectedModels.ARCHITECT,
          arbiter: selectedModels.ARBITER,
          judge: selectedModels.JUDGE,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to apply configuration');
      }

      const result = await response.json();
      toast.success('Configuration Deployed Successfully!', {
        description: 'Model assignments have been updated',
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        duration: 5000,
      });
      setActivePreset('');

      // Update local state with new assignments
      setSelectedModels({
        ARCHITECT: result.config.ARCHITECT,
        ARBITER: result.config.ARBITER,
        JUDGE: result.config.JUDGE,
      });

      // Notify other components that configuration was updated
      notifyConfigUpdated();

    } catch (error) {
      toast.error('Deployment Failed', {
        description: error instanceof Error ? error.message : String(error),
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        duration: 5000,
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyPreset = async (presetName: string) => {
    try {
      setIsApplying(true);
      await applyPreset(presetName);

      // Update local state to reflect the preset
      const preset = presets[presetName];
      if (preset) {
        setSelectedModels(preset.assignments);
        setActivePreset(presetName);
      }

      toast.success(`Preset "${presetName}" applied successfully`);
    } catch (error) {
      toast.error(`Failed to apply preset: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsApplying(false);
    }
  };

  const getModelStatusInfo = (modelId: string): ModelStatus => {
    const healthInfo = healthStatus[modelId] || {};
    return {
      model_id: modelId,
      status: healthInfo.available ? 'healthy' : (healthInfo.status || 'unknown'),
      latency: healthInfo.latency,
      last_checked: healthInfo.last_checked,
      last_checked_timestamp: healthInfo.last_checked ? new Date(healthInfo.last_checked).getTime() : undefined,
      is_local: models[modelId]?.is_local || false
    };
  };

  const getStatusColor = (status: string, latency?: number) => {
    if (status === 'unhealthy' || status === 'error') return 'bg-red-500';
    if (status === 'unknown') return 'bg-gray-500';
    if (latency === undefined) return 'bg-gray-500';

    if (latency < 500) return 'bg-green-500';
    if (latency >= 500 && latency <= 1500) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: string, latency?: number) => {
    if (status === 'unhealthy' || status === 'error') return <X className="h-4 w-4 text-white" />;
    if (status === 'unknown') return <Zap className="h-4 w-4 text-white" />;

    if (latency === undefined) return <Zap className="h-4 w-4 text-white" />;

    if (latency < 500) return <Check className="h-4 w-4 text-white" />;
    if (latency >= 500 && latency <= 1500) return <Activity className="h-4 w-4 text-white" />;
    return <X className="h-4 w-4 text-white" />;
  };

  const getStatusText = (status: string, latency?: number) => {
    if (status === 'unhealthy' || status === 'error') return 'Unhealthy';
    if (status === 'unknown') return 'Unknown';

    if (latency === undefined) return 'Checking...';

    if (latency < 500) return 'Operational';
    if (latency >= 500 && latency <= 1500) return 'Degraded';
    return 'Slow Response';
  };

  const getTimeSinceLastCheck = (timestamp?: number) => {
    if (!timestamp) return 'Never checked';

    const now = new Date().getTime();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (modelsLoading || rolesLoading || presetsLoading) {
    return (
      <GlassmorphicPanel className="w-full p-6" glow="cyan">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <SkeletonLoader height="h-8" width="w-64" className="mb-2" />
              <SkeletonLoader height="h-4" width="w-48" />
            </div>
            <div className="flex items-center space-x-4">
              <SkeletonLoader height="h-8" width="w-32" />
              <SkeletonLoader height="h-8" width="w-32" />
            </div>
          </div>

          {/* Model configuration grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Deploy button skeleton */}
          <div className="flex justify-end">
            <SkeletonLoader height="h-12" width="w-48" />
          </div>

          {/* System health section skeleton */}
          <div className="mt-8">
            <SkeletonLoader height="h-6" width="w-48" className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </GlassmorphicPanel>
    );
  }

  if (modelsError) {
    return (
      <GlassmorphicPanel className="w-full p-6" glow="red">
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
          <AlertCircle className="h-16 w-16 text-red-400" />
          <h2 className="text-2xl font-bold text-red-300">MODEL DATA UNAVAILABLE</h2>
          <p className="text-center text-gray-300 max-w-md">
            Failed to load model registry data. The system cannot function without this information.
          </p>
          <div className="text-sm text-gray-400">
            <p>Error: {modelsError}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-red-500/50 transition-all duration-200"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            RETRY LOADING
          </Button>
        </div>
      </GlassmorphicPanel>
    );
  }

  return (
    <GlassmorphicPanel className="w-full p-6" glow="cyan" glowIntensity="shadow-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-300">DYNAMIC ORCHESTRATION ENGINE</h2>
            <p className="text-sm text-gray-400">Tri-Node Consensus Architecture Control Plane</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-green-400">SYSTEM ONLINE</span>
            </div>

            {/* Presets Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                className="bg-black/50 border-cyan-500/50 text-cyan-100 hover:bg-black/70 hover:text-cyan-200"
                onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
              >
                <Rocket className="h-4 w-4 mr-2" />
                {activePreset || 'Load Preset'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              {presetDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/80 border border-cyan-500/30 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {Object.entries(presets).map(([presetName, preset]) => (
                      <button
                        key={presetName}
                        className="w-full text-left px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-500/20 hover:text-cyan-50 transition-colors"
                        onClick={() => {
                          handleApplyPreset(presetName);
                          setPresetDropdownOpen(false);
                        }}
                      >
                        {preset.name}
                      </button>
                    ))}
                    {Object.keys(presets).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-400">No presets available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Model Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Architect Node */}
          <Card className="bg-black/30 border-cyan-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-cyan-300">
                <Cpu className="h-5 w-5 inline mr-2" />
                ARCHITECT NODE
              </CardTitle>
              <div className="flex items-center space-x-2">
                {selectedModels.ARCHITECT && (
                  <>
                    <Badge variant={models[selectedModels.ARCHITECT]?.is_local ? 'secondary' : 'default'}>
                      {models[selectedModels.ARCHITECT]?.is_local ? 'LOCAL' : 'CLOUD'}
                    </Badge>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(
                      getModelStatusInfo(selectedModels.ARCHITECT).status,
                      getModelStatusInfo(selectedModels.ARCHITECT).latency
                    )}`}>
                      {getStatusIcon(
                        getModelStatusInfo(selectedModels.ARCHITECT).status,
                        getModelStatusInfo(selectedModels.ARCHITECT).latency
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {modelsLoading || !healthStatus[selectedModels.ARCHITECT || ''] ? (
                <SkeletonDropdown />
              ) : (
                <Select
                  value={selectedModels.ARCHITECT}
                  onValueChange={(value) => handleModelChange('ARCHITECT', value)}
                  disabled={isFetchingHealth}
                >
                  <SelectTrigger className="w-full bg-black/50 border-cyan-500/50 text-cyan-100 hover:bg-black/70">
                    <SelectValue placeholder={isFetchingHealth ? "Loading models..." : "Select Architect model"} />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-cyan-500/30 text-cyan-100">
                    {Object.entries(models).map(([modelId, model]) => {
                      const statusInfo = getModelStatusInfo(modelId);
                      return (
                        <SelectItem key={modelId} value={modelId}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span>{modelId}</span>
                              {statusInfo.latency !== undefined && (
                                <span className="text-xs text-gray-400">
                                  {statusInfo.latency.toFixed(0)}ms
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={model.is_local ? 'secondary' : 'default'}>
                                {model.is_local ? 'LOCAL' : 'CLOUD'}
                              </Badge>
                              <div className={`w-4 h-4 rounded-full ${getStatusColor(statusInfo.status, statusInfo.latency)}`}>
                                {getStatusIcon(statusInfo.status, statusInfo.latency)}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {selectedModels.ARCHITECT && (
                <div className="mt-4 p-3 bg-black/50 rounded-lg">
                  <div className="text-xs text-cyan-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Provider:</span>
                      <span>{models[selectedModels.ARCHITECT]?.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Context Window:</span>
                      <span>{models[selectedModels.ARCHITECT]?.context_window} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Speed Rating:</span>
                      <span>{models[selectedModels.ARCHITECT]?.speed_rating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className="capitalize">
                        {getStatusText(
                          getModelStatusInfo(selectedModels.ARCHITECT).status,
                          getModelStatusInfo(selectedModels.ARCHITECT).latency
                        )}
                      </span>
                    </div>
                    {getModelStatusInfo(selectedModels.ARCHITECT).latency !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Latency:</span>
                        <span>{getModelStatusInfo(selectedModels.ARCHITECT).latency.toFixed(0)}ms</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Last Checked:</span>
                      <span>
                        {getTimeSinceLastCheck(getModelStatusInfo(selectedModels.ARCHITECT).last_checked_timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {modelsError && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-xs text-red-300">
                    <AlertCircle className="h-3 w-3" />
                    <span>{modelsError}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arbiter Node */}
          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-purple-300">
                <Shield className="h-5 w-5 inline mr-2" />
                ARBITER NODE
              </CardTitle>
              <div className="flex items-center space-x-2">
                {selectedModels.ARBITER && (
                  <>
                    <Badge variant={models[selectedModels.ARBITER]?.is_local ? 'secondary' : 'default'}>
                      {models[selectedModels.ARBITER]?.is_local ? 'LOCAL' : 'CLOUD'}
                    </Badge>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(
                      getModelStatusInfo(selectedModels.ARBITER).status,
                      getModelStatusInfo(selectedModels.ARBITER).latency
                    )}`}>
                      {getStatusIcon(
                        getModelStatusInfo(selectedModels.ARBITER).status,
                        getModelStatusInfo(selectedModels.ARBITER).latency
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {modelsLoading || !healthStatus[selectedModels.ARBITER || ''] ? (
                <SkeletonDropdown />
              ) : (
                <Select
                  value={selectedModels.ARBITER}
                  onValueChange={(value) => handleModelChange('ARBITER', value)}
                  disabled={isFetchingHealth}
                >
                  <SelectTrigger className="w-full bg-black/50 border-purple-500/50 text-purple-100 hover:bg-black/70">
                    <SelectValue placeholder={isFetchingHealth ? "Loading models..." : "Select Arbiter model"} />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-purple-500/30 text-purple-100">
                    {Object.entries(models).map(([modelId, model]) => {
                      const statusInfo = getModelStatusInfo(modelId);
                      return (
                        <SelectItem key={modelId} value={modelId}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span>{modelId}</span>
                              {statusInfo.latency !== undefined && (
                                <span className="text-xs text-gray-400">
                                  {statusInfo.latency.toFixed(0)}ms
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={model.is_local ? 'secondary' : 'default'}>
                                {model.is_local ? 'LOCAL' : 'CLOUD'}
                              </Badge>
                              <div className={`w-4 h-4 rounded-full ${getStatusColor(statusInfo.status, statusInfo.latency)}`}>
                                {getStatusIcon(statusInfo.status, statusInfo.latency)}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {selectedModels.ARBITER && (
                <div className="mt-4 p-3 bg-black/50 rounded-lg">
                  <div className="text-xs text-purple-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Provider:</span>
                      <span>{models[selectedModels.ARBITER]?.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Context Window:</span>
                      <span>{models[selectedModels.ARBITER]?.context_window} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Speed Rating:</span>
                      <span>{models[selectedModels.ARBITER]?.speed_rating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className="capitalize">
                        {getStatusText(
                          getModelStatusInfo(selectedModels.ARBITER).status,
                          getModelStatusInfo(selectedModels.ARBITER).latency
                        )}
                      </span>
                    </div>
                    {getModelStatusInfo(selectedModels.ARBITER).latency !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Latency:</span>
                        <span>{getModelStatusInfo(selectedModels.ARBITER).latency.toFixed(0)}ms</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Last Checked:</span>
                      <span>
                        {getTimeSinceLastCheck(getModelStatusInfo(selectedModels.ARBITER).last_checked_timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {modelsError && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-xs text-red-300">
                    <AlertCircle className="h-3 w-3" />
                    <span>{modelsError}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Judge Node */}
          <Card className="bg-black/30 border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-blue-300">
                <Gavel className="h-5 w-5 inline mr-2" />
                JUDGE NODE
              </CardTitle>
              <div className="flex items-center space-x-2">
                {selectedModels.JUDGE && (
                  <>
                    <Badge variant={models[selectedModels.JUDGE]?.is_local ? 'secondary' : 'default'}>
                      {models[selectedModels.JUDGE]?.is_local ? 'LOCAL' : 'CLOUD'}
                    </Badge>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(
                      getModelStatusInfo(selectedModels.JUDGE).status,
                      getModelStatusInfo(selectedModels.JUDGE).latency
                    )}`}>
                      {getStatusIcon(
                        getModelStatusInfo(selectedModels.JUDGE).status,
                        getModelStatusInfo(selectedModels.JUDGE).latency
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {modelsLoading || !healthStatus[selectedModels.JUDGE || ''] ? (
                <SkeletonDropdown />
              ) : (
                <Select
                  value={selectedModels.JUDGE}
                  onValueChange={(value) => handleModelChange('JUDGE', value)}
                  disabled={isFetchingHealth}
                >
                  <SelectTrigger className="w-full bg-black/50 border-blue-500/50 text-blue-100 hover:bg-black/70">
                    <SelectValue placeholder={isFetchingHealth ? "Loading models..." : "Select Judge model"} />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-blue-500/30 text-blue-100">
                    {Object.entries(models).map(([modelId, model]) => {
                      const statusInfo = getModelStatusInfo(modelId);
                      return (
                        <SelectItem key={modelId} value={modelId}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span>{modelId}</span>
                              {statusInfo.latency !== undefined && (
                                <span className="text-xs text-gray-400">
                                  {statusInfo.latency.toFixed(0)}ms
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={model.is_local ? 'secondary' : 'default'}>
                                {model.is_local ? 'LOCAL' : 'CLOUD'}
                              </Badge>
                              <div className={`w-4 h-4 rounded-full ${getStatusColor(statusInfo.status, statusInfo.latency)}`}>
                                {getStatusIcon(statusInfo.status, statusInfo.latency)}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
              {selectedModels.JUDGE && (
                <div className="mt-4 p-3 bg-black/50 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Provider:</span>
                      <span>{models[selectedModels.JUDGE]?.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Context Window:</span>
                      <span>{models[selectedModels.JUDGE]?.context_window} tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Speed Rating:</span>
                      <span>{models[selectedModels.JUDGE]?.speed_rating}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className="capitalize">
                        {getStatusText(
                          getModelStatusInfo(selectedModels.JUDGE).status,
                          getModelStatusInfo(selectedModels.JUDGE).latency
                        )}
                      </span>
                    </div>
                    {getModelStatusInfo(selectedModels.JUDGE).latency !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Latency:</span>
                        <span>{getModelStatusInfo(selectedModels.JUDGE).latency.toFixed(0)}ms</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Last Checked:</span>
                      <span>
                        {getTimeSinceLastCheck(getModelStatusInfo(selectedModels.JUDGE).last_checked_timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {modelsError && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-xs text-red-300">
                    <AlertCircle className="h-3 w-3" />
                    <span>{modelsError}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deploy Configuration Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleApplyConfig}
            disabled={isApplying || modelsLoading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 transform hover:scale-105 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                DEPLOYING...
              </>
            ) : modelsLoading ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                LOADING MODELS...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                DEPLOY CONFIGURATION
              </>
            )}
          </Button>
        </div>

        {/* System Health Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            SYSTEM HEALTH MONITOR
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(models).map(([modelId, model]) => {
              const statusInfo = getModelStatusInfo(modelId);
              return (
                <Card key={modelId} className="bg-black/30 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium">
                      <span className="text-cyan-200">{modelId}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={model.is_local ? 'secondary' : 'default'}>
                        {model.is_local ? 'LOCAL' : 'CLOUD'}
                      </Badge>
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(statusInfo.status, statusInfo.latency)}`}>
                        {getStatusIcon(statusInfo.status, statusInfo.latency)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-400 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Provider:</span>
                        <span>{model.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Context:</span>
                        <span>{model.context_window} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Speed:</span>
                        <span>{model.speed_rating}/10</span>
                      </div>
                      {statusInfo.latency !== undefined ? (
                        <div className="flex justify-between">
                          <span className="font-medium">Latency:</span>
                          <span>{statusInfo.latency.toFixed(0)}ms</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="font-medium">Latency:</span>
                          <span className="text-gray-500">Not available</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <span className="capitalize">
                          {getStatusText(statusInfo.status, statusInfo.latency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Last Checked:</span>
                        <span>
                          {getTimeSinceLastCheck(statusInfo.last_checked_timestamp)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </GlassmorphicPanel>
  );
