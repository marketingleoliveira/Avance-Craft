export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_feedback: {
        Row: {
          actual_result: string | null
          assigned_to: string | null
          attachments: string[] | null
          contact_consent: boolean | null
          created_at: string | null
          description: string
          device_info: string | null
          edition: Database["public"]["Enums"]["minecraft_edition"] | null
          expected_result: string | null
          id: string
          internal_notes: string | null
          minecraft_nickname: string | null
          profile_id: string
          release_tag: string | null
          server_id: string | null
          severity: Database["public"]["Enums"]["feedback_severity"]
          status: Database["public"]["Enums"]["feedback_status"]
          steps_to_reproduce: string | null
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["feedback_type"]
          updated_at: string | null
          version: string | null
        }
        Insert: {
          actual_result?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          contact_consent?: boolean | null
          created_at?: string | null
          description: string
          device_info?: string | null
          edition?: Database["public"]["Enums"]["minecraft_edition"] | null
          expected_result?: string | null
          id?: string
          internal_notes?: string | null
          minecraft_nickname?: string | null
          profile_id: string
          release_tag?: string | null
          server_id?: string | null
          severity?: Database["public"]["Enums"]["feedback_severity"]
          status?: Database["public"]["Enums"]["feedback_status"]
          steps_to_reproduce?: string | null
          tags?: string[] | null
          title: string
          type: Database["public"]["Enums"]["feedback_type"]
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          actual_result?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          contact_consent?: boolean | null
          created_at?: string | null
          description?: string
          device_info?: string | null
          edition?: Database["public"]["Enums"]["minecraft_edition"] | null
          expected_result?: string | null
          id?: string
          internal_notes?: string | null
          minecraft_nickname?: string | null
          profile_id?: string
          release_tag?: string | null
          server_id?: string | null
          severity?: Database["public"]["Enums"]["feedback_severity"]
          status?: Database["public"]["Enums"]["feedback_status"]
          steps_to_reproduce?: string | null
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["feedback_type"]
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_feedback_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_feedback_comments: {
        Row: {
          content: string
          created_at: string | null
          feedback_id: string
          id: string
          is_internal: boolean | null
          profile_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          feedback_id: string
          id?: string
          is_internal?: boolean | null
          profile_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          feedback_id?: string
          id?: string
          is_internal?: boolean | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_feedback_comments_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "beta_feedback"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_feedback_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_invites: {
        Row: {
          active: boolean | null
          campaign: string | null
          code: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          max_uses: number
          uses_count: number
        }
        Insert: {
          active?: boolean | null
          campaign?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number
          uses_count?: number
        }
        Update: {
          active?: boolean | null
          campaign?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number
          uses_count?: number
        }
        Relationships: []
      }
      beta_participants: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          invite_id: string | null
          metadata: Json | null
          profile_id: string
          status: Database["public"]["Enums"]["beta_status"]
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          invite_id?: string | null
          metadata?: Json | null
          profile_id: string
          status?: Database["public"]["Enums"]["beta_status"]
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          invite_id?: string | null
          metadata?: Json | null
          profile_id?: string
          status?: Database["public"]["Enums"]["beta_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beta_participants_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "beta_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      command_allowlist: {
        Row: {
          created_at: string | null
          description: string | null
          prefix: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          prefix: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          prefix?: string
        }
        Relationships: []
      }
      coupon_uses: {
        Row: {
          coupon_id: string
          id: string
          order_id: string | null
          profile_id: string | null
          used_at: string
        }
        Insert: {
          coupon_id: string
          id?: string
          order_id?: string | null
          profile_id?: string | null
          used_at?: string
        }
        Update: {
          coupon_id?: string
          id?: string
          order_id?: string | null
          profile_id?: string | null
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_uses_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_uses_order_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_uses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          starts_at: string | null
          updated_at: string
          uses_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          starts_at?: string | null
          updated_at?: string
          uses_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          starts_at?: string | null
          updated_at?: string
          uses_count?: number
        }
        Relationships: []
      }
      delivery_attempts: {
        Row: {
          attempt_number: number
          created_at: string
          delivery_queue_id: string
          id: string
          response: string | null
          success: boolean
        }
        Insert: {
          attempt_number: number
          created_at?: string
          delivery_queue_id: string
          id?: string
          response?: string | null
          success?: boolean
        }
        Update: {
          attempt_number?: number
          created_at?: string
          delivery_queue_id?: string
          id?: string
          response?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "delivery_attempts_delivery_queue_id_fkey"
            columns: ["delivery_queue_id"]
            isOneToOne: false
            referencedRelation: "delivery_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_queue: {
        Row: {
          attempts: number
          available_at: string
          claimed_at: string | null
          command: string
          created_at: string
          delivered_at: string | null
          failed_at: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          last_error_code: string | null
          last_error_message: string | null
          maximum_attempts: number | null
          order_item_id: string
          priority: number | null
          reservation_expires_at: string | null
          reserved_at: string | null
          reserved_by: string | null
          server_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          available_at?: string
          claimed_at?: string | null
          command: string
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          id?: string
          idempotency_key: string
          last_error?: string | null
          last_error_code?: string | null
          last_error_message?: string | null
          maximum_attempts?: number | null
          order_item_id: string
          priority?: number | null
          reservation_expires_at?: string | null
          reserved_at?: string | null
          reserved_by?: string | null
          server_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          available_at?: string
          claimed_at?: string | null
          command?: string
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          id?: string
          idempotency_key?: string
          last_error?: string | null
          last_error_code?: string | null
          last_error_message?: string | null
          maximum_attempts?: number | null
          order_item_id?: string
          priority?: number | null
          reservation_expires_at?: string | null
          reserved_at?: string | null
          reserved_by?: string | null
          server_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_queue_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          action: string | null
          context: Json | null
          created_at: string
          environment: string
          id: string
          message: string
          module: string | null
          order_id: string | null
          payment_id: string | null
          plugin_id: string | null
          request_id: string | null
          service: string
          severity: Database["public"]["Enums"]["log_severity"]
          stack: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          context?: Json | null
          created_at?: string
          environment: string
          id?: string
          message: string
          module?: string | null
          order_id?: string | null
          payment_id?: string | null
          plugin_id?: string | null
          request_id?: string | null
          service: string
          severity?: Database["public"]["Enums"]["log_severity"]
          stack?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          context?: Json | null
          created_at?: string
          environment?: string
          id?: string
          message?: string
          module?: string | null
          order_id?: string | null
          payment_id?: string | null
          plugin_id?: string | null
          request_id?: string | null
          service?: string
          severity?: Database["public"]["Enums"]["log_severity"]
          stack?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          environment: string
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: boolean
        }
        Insert: {
          description?: string | null
          environment?: string
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: boolean
        }
        Update: {
          description?: string | null
          environment?: string
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: boolean
        }
        Relationships: []
      }
      minecraft_servers: {
        Row: {
          allowed_ip_ranges: Json | null
          created_at: string | null
          display_name: string
          enabled: boolean | null
          environment: Database["public"]["Enums"]["server_environment"]
          id: string
          last_seen_at: string | null
          minecraft_version: string | null
          paper_version: string | null
          plugin_version: string | null
          previous_secret_expires_at: string | null
          previous_secret_hash: string | null
          secret_hash: string
          server_id: string
          updated_at: string | null
        }
        Insert: {
          allowed_ip_ranges?: Json | null
          created_at?: string | null
          display_name: string
          enabled?: boolean | null
          environment?: Database["public"]["Enums"]["server_environment"]
          id?: string
          last_seen_at?: string | null
          minecraft_version?: string | null
          paper_version?: string | null
          plugin_version?: string | null
          previous_secret_expires_at?: string | null
          previous_secret_hash?: string | null
          secret_hash: string
          server_id: string
          updated_at?: string | null
        }
        Update: {
          allowed_ip_ranges?: Json | null
          created_at?: string | null
          display_name?: string
          enabled?: boolean | null
          environment?: Database["public"]["Enums"]["server_environment"]
          id?: string
          last_seen_at?: string | null
          minecraft_version?: string | null
          paper_version?: string | null
          plugin_version?: string | null
          previous_secret_expires_at?: string | null
          previous_secret_hash?: string | null
          secret_hash?: string
          server_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_profile_id: string | null
          category_id: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_profile_id?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_profile_id?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_id: string | null
          created_at: string
          delivered_at: string | null
          discount: number
          edition: Database["public"]["Enums"]["minecraft_edition"]
          external_reference: string | null
          id: string
          idempotency_key: string
          minecraft_nickname: string
          paid_at: string | null
          payment_provider: string | null
          profile_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          delivered_at?: string | null
          discount?: number
          edition: Database["public"]["Enums"]["minecraft_edition"]
          external_reference?: string | null
          id?: string
          idempotency_key: string
          minecraft_nickname: string
          paid_at?: string | null
          payment_provider?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          delivered_at?: string | null
          discount?: number
          edition?: Database["public"]["Enums"]["minecraft_edition"]
          external_reference?: string | null
          id?: string
          idempotency_key?: string
          minecraft_nickname?: string
          paid_at?: string | null
          payment_provider?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string
          created_at: string
          id: string
          last_modified_by: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          last_modified_by?: string | null
          published?: boolean
          slug: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          last_modified_by?: string | null
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          created_at: string
          event_type: string
          external_event_id: string | null
          id: string
          payload: Json
          payment_id: string | null
          provider: string
          signature_valid: boolean
        }
        Insert: {
          created_at?: string
          event_type: string
          external_event_id?: string | null
          id?: string
          payload?: Json
          payment_id?: string | null
          provider?: string
          signature_valid?: boolean
        }
        Update: {
          created_at?: string
          event_type?: string
          external_event_id?: string | null
          id?: string
          payload?: Json
          payment_id?: string | null
          provider?: string
          signature_valid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          method: string | null
          order_id: string
          provider: string
          provider_payment_id: string | null
          raw_payload: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          order_id: string
          provider?: string
          provider_payment_id?: string | null
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          order_id?: string
          provider?: string
          provider_payment_id?: string | null
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      player_accounts: {
        Row: {
          created_at: string
          edition: Database["public"]["Enums"]["minecraft_edition"]
          id: string
          minecraft_nickname: string
          profile_id: string
          updated_at: string
          uuid: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          edition: Database["public"]["Enums"]["minecraft_edition"]
          id?: string
          minecraft_nickname: string
          profile_id: string
          updated_at?: string
          uuid?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          edition?: Database["public"]["Enums"]["minecraft_edition"]
          id?: string
          minecraft_nickname?: string
          profile_id?: string
          updated_at?: string
          uuid?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_nonces: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          nonce: string
          request_timestamp: string
          server_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          nonce: string
          request_timestamp: string
          server_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          nonce?: string
          request_timestamp?: string
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_nonces_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "minecraft_servers"
            referencedColumns: ["server_id"]
          },
        ]
      }
      product_benefits: {
        Row: {
          created_at: string
          id: string
          label: string
          position: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          position?: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_benefits_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_commands: {
        Row: {
          command_template: string
          created_at: string | null
          delivery_delay_seconds: number | null
          enabled: boolean | null
          event_type: string
          execution_order: number | null
          id: string
          maximum_attempts: number | null
          product_id: string
          requires_online_player: boolean | null
          server_id: string
          updated_at: string | null
        }
        Insert: {
          command_template: string
          created_at?: string | null
          delivery_delay_seconds?: number | null
          enabled?: boolean | null
          event_type?: string
          execution_order?: number | null
          id?: string
          maximum_attempts?: number | null
          product_id: string
          requires_online_player?: boolean | null
          server_id: string
          updated_at?: string | null
        }
        Update: {
          command_template?: string
          created_at?: string | null
          delivery_delay_seconds?: number | null
          enabled?: boolean | null
          event_type?: string
          execution_order?: number | null
          id?: string
          maximum_attempts?: number | null
          product_id?: string
          requires_online_player?: boolean | null
          server_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_commands_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          duration_days: number | null
          featured: boolean
          full_description: string | null
          id: string
          image_url: string | null
          name: string
          position: number
          price: number
          promotional_price: number | null
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          duration_days?: number | null
          featured?: boolean
          full_description?: string | null
          id?: string
          image_url?: string | null
          name: string
          position?: number
          price: number
          promotional_price?: number | null
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          duration_days?: number | null
          featured?: boolean
          full_description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          position?: number
          price?: number
          promotional_price?: number | null
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      rankings: {
        Row: {
          category: string
          created_at: string
          display_value: string | null
          id: string
          minecraft_nickname: string
          period: string
          position: number
          updated_at: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          display_value?: string | null
          id?: string
          minecraft_nickname: string
          period?: string
          position: number
          updated_at?: string
          value?: number
        }
        Update: {
          category?: string
          created_at?: string
          display_value?: string | null
          id?: string
          minecraft_nickname?: string
          period?: string
          position?: number
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      server_modes: {
        Row: {
          available: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      server_status: {
        Row: {
          id: string
          ip: string
          max_players: number
          online: boolean
          players_online: number
          server_id: string
          updated_at: string
          version: string
        }
        Insert: {
          id?: string
          ip?: string
          max_players?: number
          online?: boolean
          players_online?: number
          server_id?: string
          updated_at?: string
          version?: string
        }
        Update: {
          id?: string
          ip?: string
          max_players?: number
          online?: boolean
          players_online?: number
          server_id?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          author_profile_id: string | null
          body: string
          created_at: string
          from_staff: boolean
          id: string
          ticket_id: string
        }
        Insert: {
          author_profile_id?: string | null
          body: string
          created_at?: string
          from_staff?: boolean
          id?: string
          ticket_id: string
        }
        Update: {
          author_profile_id?: string | null
          body?: string
          created_at?: string
          from_staff?: boolean
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          order_id: string | null
          profile_id: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          order_id?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          order_id?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_ticket: { Args: { _ticket_id: string }; Returns: boolean }
      cancel_delivery: {
        Args: { _delivery_id: string; _reason?: string }
        Returns: boolean
      }
      cleanup_expired_nonces: { Args: never; Returns: undefined }
      confirm_delivery: {
        Args: { _delivery_id: string; _response_payload?: Json }
        Returns: boolean
      }
      current_profile_id: { Args: never; Returns: string }
      fail_delivery: {
        Args: {
          _delivery_id: string
          _error_code: string
          _error_message: string
          _response_payload?: Json
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      owns_order: { Args: { _order_id: string }; Returns: boolean }
      process_approved_payment: {
        Args: {
          _external_reference: string
          _metadata?: Json
          _payment_id: string
        }
        Returns: Json
      }
      process_checkout: {
        Args: {
          p_coupon_code?: string
          p_edition: string
          p_items: Json
          p_nickname: string
        }
        Returns: Json
      }
      prune_old_logs: { Args: { retention_days?: number }; Returns: undefined }
      release_expired_deliveries: { Args: never; Returns: number }
      reserve_delivery_batch: {
        Args: {
          _limit?: number
          _plugin_instance_id: string
          _server_id: string
        }
        Returns: {
          attempts: number
          available_at: string
          claimed_at: string | null
          command: string
          created_at: string
          delivered_at: string | null
          failed_at: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          last_error_code: string | null
          last_error_message: string | null
          maximum_attempts: number | null
          order_item_id: string
          priority: number | null
          reservation_expires_at: string | null
          reserved_at: string | null
          reserved_by: string | null
          server_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "delivery_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      use_beta_invite: {
        Args: { _code: string; _profile_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      beta_status: "invited" | "registered" | "approved" | "active" | "blocked"
      delivery_status:
        | "queued"
        | "claimed"
        | "delivered"
        | "failed"
        | "cancelled"
        | "pending"
        | "reserved"
        | "retry"
      feedback_severity: "low" | "medium" | "high" | "critical"
      feedback_status:
        | "new"
        | "triaged"
        | "confirmed"
        | "in_progress"
        | "resolved"
        | "rejected"
        | "duplicate"
      feedback_type:
        | "bug"
        | "suggestion"
        | "economy"
        | "performance"
        | "bedrock"
        | "java"
        | "interface"
        | "shop"
        | "delivery"
        | "other"
      log_severity: "info" | "warn" | "error" | "critical" | "audit"
      minecraft_edition: "java" | "bedrock"
      order_status:
        | "pending"
        | "paid"
        | "delivering"
        | "delivered"
        | "cancelled"
        | "refunded"
        | "failed"
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "refunded"
        | "chargeback"
        | "cancelled"
      server_environment: "production" | "staging" | "development"
      ticket_status: "open" | "pending" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      beta_status: ["invited", "registered", "approved", "active", "blocked"],
      delivery_status: [
        "queued",
        "claimed",
        "delivered",
        "failed",
        "cancelled",
        "pending",
        "reserved",
        "retry",
      ],
      feedback_severity: ["low", "medium", "high", "critical"],
      feedback_status: [
        "new",
        "triaged",
        "confirmed",
        "in_progress",
        "resolved",
        "rejected",
        "duplicate",
      ],
      feedback_type: [
        "bug",
        "suggestion",
        "economy",
        "performance",
        "bedrock",
        "java",
        "interface",
        "shop",
        "delivery",
        "other",
      ],
      log_severity: ["info", "warn", "error", "critical", "audit"],
      minecraft_edition: ["java", "bedrock"],
      order_status: [
        "pending",
        "paid",
        "delivering",
        "delivered",
        "cancelled",
        "refunded",
        "failed",
      ],
      payment_status: [
        "pending",
        "approved",
        "rejected",
        "refunded",
        "chargeback",
        "cancelled",
      ],
      server_environment: ["production", "staging", "development"],
      ticket_status: ["open", "pending", "closed"],
    },
  },
} as const
