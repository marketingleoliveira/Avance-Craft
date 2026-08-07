import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export interface PublicServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number;
  version: string;
  status: 'online' | 'unstable' | 'offline' | 'maintenance';
  lastUpdate: string;
}

export const getPublicServerStatus = createServerFn({ method: "GET" })
  .handler(async (): Promise<PublicServerStatus> => {
    const { data, error } = await supabase
      .from("server_status")
      .select("online, online_players, max_players, last_seen_at, tps, maintenance_mode, minecraft_version")
      .eq("server_id", "avance-survival-01")
      .single();

    if (error || !data) {
      return {
        online: false,
        players: 0,
        maxPlayers: 500,
        version: "1.20.x",
        status: 'offline',
        lastUpdate: new Date().toISOString()
      };
    }

    const lastSeen = data.last_seen_at ? new Date(data.last_seen_at) : new Date(0);
    const now = new Date();
    const secondsSinceLastSeen = (now.getTime() - lastSeen.getTime()) / 1000;
    
    let status: PublicServerStatus['status'] = 'online';
    
    if (data.maintenance_mode) {
      status = 'maintenance';
    } else if (secondsSinceLastSeen > 90) {
      status = 'offline';
    } else if (Number(data.tps) < 15) {
      status = 'unstable';
    }

    return {
      online: status === 'online' || status === 'unstable',
      players: data.online_players || 0,
      maxPlayers: data.max_players || 500,
      version: data.minecraft_version || "1.20.x",
      status,
      lastUpdate: data.last_seen_at || new Date().toISOString()
    };
  });
