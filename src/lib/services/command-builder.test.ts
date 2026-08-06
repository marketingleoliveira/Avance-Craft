import { describe, it, expect, vi } from "vitest";
import { buildDeliveryCommands } from "./command-builder.server";

describe("Command Builder Security", () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  } as any;

  const mockOrderItem = {
    id: "item-1",
    order_id: "order-1",
    product_id: "prod-1",
    quantity: 1,
    player_name: "LeonardoMine"
  };

  it("should reject invalid player names", async () => {
    const invalidItem = { ...mockOrderItem, player_name: "Bad Name!" };
    await expect(buildDeliveryCommands({ order_item: invalidItem }, mockSupabase))
      .rejects.toThrow(/Segurança/);
  });

  it("should sanitize and validate commands against allowlist", async () => {
    // Mock templates
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "product_commands") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => Promise.resolve({
                  data: [
                    { command_template: "give {player} diamond {quantity}", server_id: "s1", enabled: true },
                    { command_template: "op {player}", server_id: "s1", enabled: true } // Should be blocked
                  ],
                  error: null
                })
              })
            })
          })
        };
      }
      if (table === "command_allowlist") {
        return {
          select: () => Promise.resolve({
            data: [{ prefix: "give" }],
            error: null
          })
        };
      }
      return mockSupabase;
    });

    const result = await buildDeliveryCommands({ order_item: mockOrderItem }, mockSupabase);
    
    expect(result).toHaveLength(1);
    expect(result[0]!.command).toBe("give LeonardoMine diamond 1");
  });

  it("should block multi-commands with semicolons", async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "product_commands") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ order: () => Promise.resolve({
            data: [{ command_template: "give {player} stone; op {player}", server_id: "s1", enabled: true }],
            error: null
          }) }) }) })
        };
      }
      return { select: () => Promise.resolve({ data: [{ prefix: "give" }], error: null }) };
    });

    const result = await buildDeliveryCommands({ order_item: mockOrderItem }, mockSupabase);
    expect(result).toHaveLength(0);
  });
});
