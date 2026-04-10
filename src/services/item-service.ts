import type { Item, ItemHistoryResponse, ItemMetadataNamespace } from "../types/item";
import {
  OPENHAB_BASE_URL,
  PROPERTY_HUMIDITY,
  getOpenHABAuthHeaders,
} from "./config";

const extractNamespaceFromMetadataPayload = (
  payload: unknown,
  namespace: string
): ItemMetadataNamespace | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (Array.isArray(payload)) {
    const matchingEntry = payload.find((entry) => {
      if (!entry || typeof entry !== "object") {
        return false;
      }
      const maybeNamespace = (entry as { namespace?: unknown }).namespace;
      return maybeNamespace === namespace;
    }) as { value?: unknown; config?: unknown; editable?: unknown } | undefined;

    if (!matchingEntry || typeof matchingEntry.value !== "string") {
      return null;
    }

    return {
      value: matchingEntry.value,
      config:
        matchingEntry.config && typeof matchingEntry.config === "object"
          ? (matchingEntry.config as Record<string, unknown>)
          : undefined,
      editable:
        typeof matchingEntry.editable === "boolean"
          ? matchingEntry.editable
          : undefined,
    };
  }

  const byNamespace = payload as Record<string, unknown>;
  const rawNamespaceValue = byNamespace[namespace];
  if (!rawNamespaceValue || typeof rawNamespaceValue !== "object") {
    return null;
  }

  const namespaceEntry = rawNamespaceValue as {
    value?: unknown;
    config?: unknown;
    editable?: unknown;
  };
  if (typeof namespaceEntry.value !== "string") {
    return null;
  }

  return {
    value: namespaceEntry.value,
    config:
      namespaceEntry.config && typeof namespaceEntry.config === "object"
        ? (namespaceEntry.config as Record<string, unknown>)
        : undefined,
    editable:
      typeof namespaceEntry.editable === "boolean"
        ? namespaceEntry.editable
        : undefined,
  };
};

/**
 * Service for handling OpenHAB item operations via REST API
 */
export class ItemService {
  private static itemsCache: Item[] | null = null;
  private static itemsCachePromise: Promise<Item[]> | null = null;

  /**
   * Fetch all items from OpenHAB
   */
  static async fetchItems(): Promise<Item[]> {
    const response = await fetch(`${OPENHAB_BASE_URL}/items`, {
      headers: getOpenHABAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch items");
    }
    return response.json();
  }

  /**
   * Fetch items metadata with caching
   */
  static async fetchItemsMetadata(): Promise<Item[]> {
    if (this.itemsCache) return this.itemsCache;
    if (this.itemsCachePromise) return this.itemsCachePromise;

    this.itemsCachePromise = this.fetchItems()
      .then((items) => {
        this.itemsCache = items;
        return items;
      })
      .finally(() => {
        this.itemsCachePromise = null;
      });

    return this.itemsCachePromise;
  }

  /**
   * Fetch a specific item by name
   */
  static async fetchItem(name: string): Promise<Item> {
    const response = await fetch(
      `${OPENHAB_BASE_URL}/items/${encodeURIComponent(name)}`,
      {
        headers: getOpenHABAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch item");
    }
    return response.json();
  }

  /**
   * Send a command to an item
   */
  static async sendCommand(itemName: string, command: string): Promise<void> {
    const response = await fetch(
      `${OPENHAB_BASE_URL}/items/${encodeURIComponent(itemName)}`,
      {
        method: "POST",
        headers: {
          ...getOpenHABAuthHeaders(),
          "Content-Type": "text/plain",
        },
        body: command,
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to send command to ${itemName}`);
    }
  }

  /**
   * Fetch metadata of an item namespace.
   * Returns null when namespace does not exist.
   */
  static async fetchItemMetadata(
    itemName: string,
    namespace: string
  ): Promise<ItemMetadataNamespace | null> {
    const singleNamespaceUrl = `${OPENHAB_BASE_URL}/items/${encodeURIComponent(
      itemName
    )}/metadata/${encodeURIComponent(namespace)}`;

    const singleResponse = await fetch(singleNamespaceUrl, {
      headers: getOpenHABAuthHeaders(),
    });

    if (singleResponse.ok) {
      return singleResponse.json();
    }
    if (singleResponse.status === 404) {
      return null;
    }
    if (singleResponse.status !== 405) {
      throw new Error(`Failed to fetch metadata ${namespace} for ${itemName}`);
    }

    // openHAB variants may not support GET on /metadata/{namespace}; fetch item with metadata query.
    const itemWithMetadataUrl = `${OPENHAB_BASE_URL}/items/${encodeURIComponent(
      itemName
    )}?metadata=${encodeURIComponent(namespace)}`;
    const itemWithMetadataResponse = await fetch(itemWithMetadataUrl, {
      headers: getOpenHABAuthHeaders(),
    });

    if (itemWithMetadataResponse.ok) {
      const itemPayload = (await itemWithMetadataResponse.json()) as {
        metadata?: Record<string, ItemMetadataNamespace>;
      };
      return itemPayload.metadata?.[namespace] ?? null;
    }

    if (itemWithMetadataResponse.status !== 405) {
      if (itemWithMetadataResponse.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch item metadata ${namespace} for ${itemName}`);
    }

    // Last fallback for servers exposing only /metadata list route.
    const allNamespacesUrl = `${OPENHAB_BASE_URL}/items/${encodeURIComponent(itemName)}/metadata`;
    const allResponse = await fetch(allNamespacesUrl, {
      headers: getOpenHABAuthHeaders(),
    });
    if (!allResponse.ok) {
      if (allResponse.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch metadata list for ${itemName}`);
    }
    const payload: unknown = await allResponse.json();
    return extractNamespaceFromMetadataPayload(payload, namespace);
  }

  /**
   * Create or update metadata for an item namespace.
   */
  static async upsertItemMetadata(
    itemName: string,
    namespace: string,
    metadata: { value: string; config?: Record<string, string> }
  ): Promise<void> {
    const namespaceUrl = `${OPENHAB_BASE_URL}/items/${encodeURIComponent(
      itemName
    )}/metadata/${encodeURIComponent(namespace)}`;
    const requestBody = JSON.stringify(metadata);
    const requestHeaders = {
      ...getOpenHABAuthHeaders(),
      "Content-Type": "application/json",
    };

    const putResponse = await fetch(namespaceUrl, {
      method: "PUT",
      headers: requestHeaders,
      body: requestBody,
    });

    if (putResponse.ok) {
      return;
    }

    // Some openHAB variants only allow POST for create.
    if (putResponse.status === 404 || putResponse.status === 405) {
      const postResponse = await fetch(namespaceUrl, {
        method: "POST",
        headers: requestHeaders,
        body: requestBody,
      });
      if (postResponse.ok) {
        return;
      }
    }

    throw new Error(`Failed to upsert metadata ${namespace} for ${itemName}`);
  }

  /**
   * Fetch historic state data for an item using the persistence API
   */
  static async getItemHistory(
    itemName: string,
    params?: {
      serviceId?: string;
      starttime?: string; // ISO string
      endtime?: string; // ISO string
      pageLength?: number;
      page?: number;
    }
  ): Promise<ItemHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.serviceId) searchParams.append("serviceId", params.serviceId);
    if (params?.starttime) searchParams.append("starttime", params.starttime);
    if (params?.endtime) searchParams.append("endtime", params.endtime);
    if (params?.pageLength)
      searchParams.append("pageLength", params.pageLength.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const url = `${OPENHAB_BASE_URL}/persistence/items/${encodeURIComponent(
      itemName
    )}${searchParams.toString() ? "?" + searchParams.toString() : ""}`;

    const response = await fetch(url, {
      headers: getOpenHABAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch item history");
    }
    return response.json();
  }

  /**
   * Filter items by semantic type
   */
  static filterItemsBySemanticType(
    items: Item[],
    type: string = "Measurement"
  ): Item[] {
    return items.filter((item) => item.metadata?.semantics?.value === type);
  }

  /**
   * Check if an item belongs to a specific location (including sub-locations)
   */
  static hasLocation(
    item: Item,
    targetLocation: string,
    allItems?: Item[]
  ): boolean {
    // Get the direct location of the item
    // For regular items: check hasLocation
    // For Group items (locations): check isPartOf
    const directLocation =
      item.type === "Group"
        ? item.metadata?.semantics?.config?.isPartOf
        : item.metadata?.semantics?.config?.hasLocation;

    if (typeof directLocation !== "string") {
      return false;
    }

    // If direct location matches, return true
    if (directLocation === targetLocation) {
      return true;
    }

    // If no allItems provided, we can't traverse hierarchy
    if (!allItems) {
      return false;
    }

    // Traverse up the location hierarchy
    const result = this.isLocationAncestor(
      directLocation,
      targetLocation,
      allItems
    );
    return result;
  }

  /**
   * Check if a location is an ancestor of another location in the hierarchy
   */
  static isLocationAncestor(
    locationName: string,
    targetLocation: string,
    allItems: Item[],
    visited: Set<string> = new Set()
  ): boolean {
    if (visited.has(locationName)) {
      return false;
    }
    visited.add(locationName);

    // Find the location item
    const locationItem = allItems.find((item) => item.name === locationName);
    if (!locationItem) {
      return false;
    }

    // For location Group items, check isPartOf; for regular items, check hasLocation
    const parentLocation =
      locationItem.type === "Group"
        ? locationItem.metadata?.semantics?.config?.isPartOf
        : locationItem.metadata?.semantics?.config?.hasLocation;

    if (typeof parentLocation !== "string") {
      return false;
    }

    // If parent matches target, return true
    if (parentLocation === targetLocation) {
      return true;
    }

    // Recursively check parent hierarchy
    return this.isLocationAncestor(
      parentLocation,
      targetLocation,
      allItems,
      visited
    );
  }

  /**
   * Filter items by semantic property and/or location
   *
   * @param items Array of items to filter
   * @param options Configuration object with optional filters
   * @param options.property Optional semantic property to filter by (e.g., PROPERTY_HUMIDITY)
   * @param options.location Optional location/group name to filter by - checks location hierarchy using semantic model
   * @returns Filtered array of items
   *
   * @example
   * // Filter by semantic property only
   * filterItems(items, { property: PROPERTY_HUMIDITY })
   *
   * @example
   * // Filter by location only (checks semantic location hierarchy)
   * filterItems(items, { location: "LivingRoom" })
   *
   * @example
   * // Filter by both property and location
   * filterItems(items, { property: PROPERTY_TEMPERATURE, location: "EG" })
   */
  static filterItems(
    items: Item[],
    options: {
      property?: string;
      location?: string;
    } = {}
  ): Item[] {
    const { property, location } = options;

    const filtered = items.filter((item) => {
      // Check semantic property if specified
      if (property && !this.hasSemanticProperty(item, property)) {
        return false;
      }

      // Check location if specified - use semantic location hierarchy
      if (location && !this.hasLocation(item, location, items)) {
        return false;
      }

      return true;
    });

    return filtered;
  }
  /**
   * Filter items by semantic property (legacy function for backward compatibility)
   */
  static filterItemsBySemanticProperty(
    items: Item[],
    property: string = PROPERTY_HUMIDITY
  ): Item[] {
    return this.filterItems(items, { property });
  }

  /**
   * Check if an item has a specific semantic property
   */
  static hasSemanticProperty(item: Item, relatesTo: string): boolean {
    return (
      typeof item.metadata?.semantics?.config === "object" &&
      item.metadata?.semantics?.config !== null &&
      "relatesTo" in item.metadata.semantics.config &&
      item.metadata.semantics.config.relatesTo === relatesTo
    );
  }

  /**
   * Clear the items cache (useful for testing or forced refresh)
   */
  static clearCache(): void {
    this.itemsCache = null;
    this.itemsCachePromise = null;
  }
}

// Export convenience functions for backward compatibility
export const fetchItems = ItemService.fetchItems.bind(ItemService);
export const fetchItemsMetadata =
  ItemService.fetchItemsMetadata.bind(ItemService);
export const fetchItem = ItemService.fetchItem.bind(ItemService);
export const sendCommand = ItemService.sendCommand.bind(ItemService);
export const fetchItemMetadata = ItemService.fetchItemMetadata.bind(ItemService);
export const upsertItemMetadata = ItemService.upsertItemMetadata.bind(ItemService);
export const getItemHistory = ItemService.getItemHistory.bind(ItemService);
export const filterItemsBySemanticType =
  ItemService.filterItemsBySemanticType.bind(ItemService);
export const filterItems = ItemService.filterItems.bind(ItemService);
export const filterItemsBySemanticProperty =
  ItemService.filterItemsBySemanticProperty.bind(ItemService);
export const hasSemanticProperty =
  ItemService.hasSemanticProperty.bind(ItemService);
export const hasLocation = ItemService.hasLocation.bind(ItemService);
export const isLocationAncestor =
  ItemService.isLocationAncestor.bind(ItemService);

// Export constants for backward compatibility
export {
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
  PROPERTY_CO2,
  PROPERTY_AIR_QUALITY,
} from "./config";
