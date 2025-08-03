// TypeScript interfaces for OpenHAB REST API items

export interface ItemStateOption {
  value: string;
  label: string;
}

export interface ItemStateDescription {
  pattern?: string;
  readOnly: boolean;
  options: ItemStateOption[];
}

export interface ItemCommandOption {
  command: string;
  label: string;
}

export interface ItemCommandDescription {
  commandOptions: ItemCommandOption[];
}

export interface ItemMetadataNamespace {
  value: string;
  config?: Record<string, unknown>;
  editable?: boolean;
}

export interface Item {
  link: string;
  state: string;
  stateDescription?: ItemStateDescription;
  commandDescription?: ItemCommandDescription;
  lastStateUpdate?: number;
  metadata?: Record<string, ItemMetadataNamespace>;
  editable: boolean;
  type: string;
  name: string;
  label?: string;
  category?: string;
  tags: string[];
  groupNames: string[];
}

// TypeScript interface for OpenHAB persistence API response
export interface ItemHistoryDatapoint {
  time: number;
  state: string;
}

export interface ItemHistoryResponse {
  name: string;
  datapoints: string;
  data: ItemHistoryDatapoint[];
}
