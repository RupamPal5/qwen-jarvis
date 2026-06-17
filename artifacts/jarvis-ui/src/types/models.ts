export interface ModelEntry {
  model_id: string;
  provider: string;
  model_name: string;
  api_key?: string;
  endpoint?: string;
  context_window: number;
  speed_rating: number;
  is_local: boolean;
  is_active: boolean;
}

export interface RoleAssignment {
  role: string;
  model_id: string;
  is_active: boolean;
}
