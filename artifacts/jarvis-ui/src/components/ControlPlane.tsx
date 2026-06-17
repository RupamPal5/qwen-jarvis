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
import { Loader2, Check, X, Cpu, Shield, Gavel, Zap, Activity, Rocket, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { GlassmorphicPanel } from './glassmorphic-panel';
import { ModelEntry } from '../types/models';

interface ModelStatus {
  model_id: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'error' | 'unknown';
  latency?: number;
  last_checked?: number;
  is_local: boolean;
}

export function ControlPlane() {
  const { models, loading: modelsLoading, error: modelsError } = useModelRegistry();
  const { roles, assignRole, loading: rolesLoading } = useRoleManager();
  const { presets, applyPreset, loading: presetsLoading } = usePresets();
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    ARCHITECT: '',
    ARBITER: '',
    JUDGE: '',
  });
  const [isApplying, setIsApplying] = useState(false);
  const [modelStatuses, setModelStatuses] = useState<Record<string, ModelStatus>>({});
  const [ws, setWs] = useState<WebSocket | null>(null);
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

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws/control-plane`);

    socket.onopen = () => {
      console.log('Control Plane WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'model_status_update') {
        setModelStatuses(prev => ({
          ...prev,
          [data.model_id]: data.status
        }));
      }
    };

    socket.onclose = () => {
      console.log('Control Plane WebSocket disconnected');
    };

    setWs(socket);

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Subscribe to model status updates
  useEffect(() => {
    if (ws && !modelsLoading && ws.readyState === WebSocket.OPEN) {
      Object.keys(models).forEach(modelId => {
        ws.send(JSON.stringify({
          type: 'subscribe_model_status',
          model_id: modelId
        }));
      });
    }
  }, [ws, models, modelsLoading]);

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
      toast.success('Model configuration deployed successfully');
      setActivePreset('');

      // Update local state with new assignments
      setSelectedModels({
        ARCHITECT: result.config.ARCHITECT,
        ARBITER: result.config.ARBITER,
        JUDGE: result.config.JUDGE,
      });

    } catch (error) {
      toast.error(`Failed to deploy configuration: ${error instanceof Error ? error.message : String(error)}`);
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
    return modelStatuses[modelId] || {
      model_id: modelId,
      status: 'unknown',
      is_local: models[modelId]?.is_local || false
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Check className="h-4 w-4 text-white" />;
      case 'degraded': return <Activity className="h-4 w-4 text-white" />;
      case 'unhealthy': return <X className="h-4 w-4 text-white" />;
      case 'error': return <X className="h-4 w-4 text-white" />;
      default: return <Zap className="h-4 w-4 text-white" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'unhealthy': return 'Unhealthy';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (modelsLoading || rolesLoading || presetsLoading) {
    return (
      <GlassmorphicPanel className="w-full p-6" glow="cyan">
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </GlassmorphicPanel>
    );
  }

  if (modelsError) {
    return (
      <GlassmorphicPanel className="w-full p-6" glow="cyan">
        <div className="flex flex-col items-center justify-center h-32">
          <X className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-500">Failed to load model data</p>
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
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(getModelStatusInfo(selectedModels.ARCHITECT).status)}`}>
                      {getStatusIcon(getModelStatusInfo(selectedModels.ARCHITECT).status)}
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedModels.ARCHITECT}
                onValueChange={(value) => handleModelChange('ARCHITECT', value)}
              >
                <SelectTrigger className="w-full bg-black/50 border-cyan-500/50 text-cyan-100 hover:bg-black/70">
                  <SelectValue placeholder="Select Architect model" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-cyan-500/30 text-cyan-100">
                  {Object.entries(models).map(([modelId, model]) => (
                    <SelectItem key={modelId} value={modelId}>
                      <div className="flex items-center justify-between w-full">
                        <span>{modelId}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={model.is_local ? 'secondary' : 'default'}>
                            {model.is_local ? 'LOCAL' : 'CLOUD'}
                          </Badge>
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(getModelStatusInfo(modelId).status)}`}>
                            {getStatusIcon(getModelStatusInfo(modelId).status)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        {getStatusText(getModelStatusInfo(selectedModels.ARCHITECT).status)}
                      </span>
                    </div>
                    {getModelStatusInfo(selectedModels.ARCHITECT).latency !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Latency:</span>
                        <span>{getModelStatusInfo(selectedModels.ARCHITECT).latency?.toFixed(2)}s</span>
                      </div>
                    )}
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
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(getModelStatusInfo(selectedModels.ARBITER).status)}`}>
                      {getStatusIcon(getModelStatusInfo(selectedModels.ARBITER).status)}
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedModels.ARBITER}
                onValueChange={(value) => handleModelChange('ARBITER', value)}
              >
                <SelectTrigger className="w-full bg-black/50 border-purple-500/50 text-purple-100 hover:bg-black/70">
                  <SelectValue placeholder="Select Arbiter model" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-purple-500/30 text-purple-100">
                  {Object.entries(models).map(([modelId, model]) => (
                    <SelectItem key={modelId} value={modelId}>
                      <div className="flex items-center justify-between w-full">
                        <span>{modelId}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={model.is_local ? 'secondary' : 'default'}>
                            {model.is_local ? 'LOCAL' : 'CLOUD'}
                          </Badge>
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(getModelStatusInfo(modelId).status)}`}>
                            {getStatusIcon(getModelStatusInfo(modelId).status)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        {getStatusText(getModelStatusInfo(selectedModels.ARBITER).status)}
                      </span>
                    </div>
                    {getModelStatusInfo(selectedModels.ARBITER).latency !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Latency:</span>
                        <span>{getModelStatusInfo(selectedModels.ARBITER).latency?.toFixed(2)}s</span>
                      </div>
                    )}
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
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(getModelStatusInfo(selectedModels.JUDGE).status)}`}>
                      {getStatusIcon(getModelStatusInfo(selectedModels.JUDGE).status)}
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedModels.JUDGE}
                onValueChange={(value) => handleModelChange('JUDGE', value)}
              >
                <SelectTrigger className="w-full bg-black/50 border-blue-500/50 text-blue-100 hover:bg-black/70">
                  <SelectValue placeholder="Select Judge model" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-blue-500/30 text-blue-100">
                  {Object.entries(models).map(([modelId, model]) => (
                    <SelectItem key={modelId} value={modelId}>
                      <div className="flex items-center justify-between w-full">
                        <span>{modelId}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={model.is_local ? 'secondary' : 'default'}>
                            {model.is_local ? 'LOCAL' : 'CLOUD'}
                          </Badge>
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(getModelStatusInfo(modelId).status)}`}>
                            {getStatusIcon(getModelStatusInfo(modelId).status)}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        {getStatusText(getModelStatusInfo(selectedModels.JUDGE).status)}
                      </span>
                    </div>
                    {getModelStatusInfo(selectedModels.JUDGE).latency !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium">Latency:</span>
                        <span>{getModelStatusInfo(selectedModels.JUDGE).latency?.toFixed(2)}s</span>
                      </div>
                    )}
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
            disabled={isApplying}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 transform hover:scale-105 text-lg"
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                DEPLOYING...
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
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(statusInfo.status)}`}>
                        {getStatusIcon(statusInfo.status)}
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
                      {statusInfo.latency !== undefined && (
                        <div className="flex justify-between">
                          <span className="font-medium">Latency:</span>
                          <span>{statusInfo.latency.toFixed(2)}s</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <span className="capitalize">{getStatusText(statusInfo.status)}</span>
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
}
