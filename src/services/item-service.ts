import type { Item, ItemHistoryResponse } from "../types/item";
import { OPENHAB_BASE_URL, PROPERTY_HUMIDITY } from "./config";

/**
 * Service for handling OpenHAB item operations via REST API
 */
export class ItemService {
  private static itemsCache: Item[] | null = null;

  /**
   * Fetch all items from OpenHAB
   */
  static async fetchItems(): Promise<Item[]> {
    const response = await fetch(`${OPENHAB_BASE_URL}/items`);
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
    this.itemsCache = await this.fetchItems();
    return this.itemsCache!;
  }

  /**
   * Fetch a specific item by name
   */
  static async fetchItem(name: string): Promise<Item> {
    const response = await fetch(
      `${OPENHAB_BASE_URL}/items/${encodeURIComponent(name)}`
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

    const response = await fetch(url);
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

    console.log(
      `[Location] Checking ${item.type} item "${item.name}" for location "${targetLocation}"`
    );

    if (typeof directLocation !== "string") {
      console.log(
        `[Location] Item "${item.name}" has no valid location property (${
          item.type === "Group" ? "isPartOf" : "hasLocation"
        })`
      );
      return false;
    }

    console.log(
      `[Location] Item "${item.name}" has direct location: "${directLocation}"`
    );

    // If direct location matches, return true
    if (directLocation === targetLocation) {
      console.log(
        `[Location] ✓ Direct location match for "${item.name}": "${directLocation}"`
      );
      return true;
    }

    // If no allItems provided, we can't traverse hierarchy
    if (!allItems) {
      console.log(`[Location] No items array provided for hierarchy traversal`);
      return false;
    }

    // Traverse up the location hierarchy
    const result = this.isLocationAncestor(
      directLocation,
      targetLocation,
      allItems
    );
    console.log(
      `[Location] Hierarchy traversal result for "${item.name}": ${result}`
    );
    return result;
  }

  /**
   * Check if a location is an ancestor of another location in the hierarchy
   */
  static isLocationAncestor(
    locationName: string,
    targetLocation: string,
    allItems: Item[]
  ): boolean {
    console.log(
      `[Location] Checking if "${locationName}" is ancestor of "${targetLocation}"`
    );

    // Find the location item
    const locationItem = allItems.find((item) => item.name === locationName);
    if (!locationItem) {
      console.log(
        `[Location] Location item "${locationName}" not found in items array`
      );
      return false;
    }

    console.log(
      `[Location] Found location item "${locationName}" (${locationItem.type}), checking its parent location`
    );

    // For location Group items, check isPartOf; for regular items, check hasLocation
    const parentLocation =
      locationItem.type === "Group"
        ? locationItem.metadata?.semantics?.config?.isPartOf
        : locationItem.metadata?.semantics?.config?.hasLocation;

    if (typeof parentLocation !== "string") {
      console.log(
        `[Location] Location "${locationName}" has no valid parent location property`
      );
      return false;
    }

    console.log(
      `[Location] Location "${locationName}" has parent: "${parentLocation}"`
    );

    // If parent matches target, return true
    if (parentLocation === targetLocation) {
      console.log(
        `[Location] ✓ Found ancestor match: "${locationName}" -> "${parentLocation}"`
      );
      return true;
    }

    // Recursively check parent hierarchy
    console.log(`[Location] Continuing traversal up from "${parentLocation}"`);
    return this.isLocationAncestor(parentLocation, targetLocation, allItems);
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

    console.log(`[Filter] Filtering ${items.length} items with options:`, {
      property,
      location,
    });

    const filtered = items.filter((item) => {
      // Check semantic property if specified
      if (property && !this.hasSemanticProperty(item, property)) {
        return false;
      }

      // Check location if specified - use semantic location hierarchy
      if (location && !this.hasLocation(item, location, items)) {
        return false;
      }

      console.log(`[Filter] Including "${item.name}" - matches criteria`);
      return true;
    });

    console.log(
      `[Filter] Filtered ${items.length} items down to ${filtered.length} items`
    );
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
  }
}

// Export convenience functions for backward compatibility
export const fetchItems = ItemService.fetchItems.bind(ItemService);
export const fetchItemsMetadata =
  ItemService.fetchItemsMetadata.bind(ItemService);
export const fetchItem = ItemService.fetchItem.bind(ItemService);
export const sendCommand = ItemService.sendCommand.bind(ItemService);
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
