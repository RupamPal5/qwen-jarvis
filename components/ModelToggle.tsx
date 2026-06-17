import React, { useState, useEffect } from 'react';
import { useModelRegistry } from '../hooks/useModelRegistry';
import { useRoleManager } from '../hooks/useRoleManager';
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
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ModelToggleProps {
  onConfigApplied?: (config: Record<string, string>) => void;
}

export function ModelToggle({ onConfigApplied }: ModelToggleProps) {
  const { models, loading: modelsLoading, error: modelsError } = useModelRegistry();
  const { roles, assignRole, loading: rolesLoading, error: rolesError } = useRoleManager();
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    ARCHITECT: '',
    ARBITER: '',
    JUDGE: '',
  });
  const [isApplying, setIsApplying] = useState(false);

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

  const handleModelChange = (role: string, modelId: string) => {
    setSelectedModels(prev => ({
      ...prev,
      [role]: modelId,
    }));
  };

  const handleApplyConfig = async () => {
    setIsApplying(true);
    try {
      // Assign each role
      const assignments = Object.entries(selectedModels).map(([role, modelId]) =>
        assignRole(role, modelId)
      );

      await Promise.all(assignments);

      toast.success('Model configuration applied successfully');
      if (onConfigApplied) {
        onConfigApplied(selectedModels);
      }
    } catch (error) {
      toast.error(`Failed to apply configuration: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsApplying(false);
    }
  };

  const getModelStatus = (modelId: string) => {
    // In a real implementation, this would come from the network manager
    // For now, we'll simulate with random statuses
    const statuses = ['healthy', 'degraded', 'unhealthy'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  if (modelsLoading || rolesLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Model Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (modelsError || rolesError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Model Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-32">
          <X className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-500">Failed to load model data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Model Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['ARCHITECT', 'ARBITER', 'JUDGE'].map((role) => (
            <div key={role} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {role}
              </label>
              <Select
                value={selectedModels[role]}
                onValueChange={(value) => handleModelChange(role, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select ${role} model`} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(models).map(([modelId, model]) => (
                    <SelectItem key={modelId} value={modelId}>
                      <div className="flex items-center justify-between">
                        <span>{modelId}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={model.is_local ? 'secondary' : 'default'}>
                            {model.is_local ? 'Local' : 'Cloud'}
                          </Badge>
                          <Badge
                            variant={
                              getModelStatus(modelId) === 'healthy'
                                ? 'success'
                                : getModelStatus(modelId) === 'degraded'
                                ? 'warning'
                                : 'destructive'
                            }
                          >
                            {getModelStatus(modelId)}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleApplyConfig}
            disabled={isApplying}
            className="w-full md:w-auto"
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Apply Configuration
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {Object.entries(selectedModels).map(([role, modelId]) => (
              <div key={role} className="flex items-center space-x-2">
                <span className="text-sm font-medium">{role}:</span>
                <span className="text-sm">{modelId || 'Not assigned'}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
