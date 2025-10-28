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
   * Filter items by semantic property
   */
  static filterItemsBySemanticProperty(
    items: Item[],
    property: string = PROPERTY_HUMIDITY
  ): Item[] {
    return items.filter((item) => this.hasSemanticProperty(item, property));
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
export const filterItemsBySemanticProperty =
  ItemService.filterItemsBySemanticProperty.bind(ItemService);
export const hasSemanticProperty =
  ItemService.hasSemanticProperty.bind(ItemService);

// Export constants for backward compatibility
export {
  PROPERTY_HUMIDITY,
  PROPERTY_TEMPERATURE,
  PROPERTY_CO2,
  PROPERTY_AIR_QUALITY,
} from "./config";
