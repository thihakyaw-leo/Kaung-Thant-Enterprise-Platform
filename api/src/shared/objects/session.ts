import { DurableObject } from "cloudflare:workers";
import { Env } from "../../index";

export class SessionCoordinator extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env as any);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") || "active_users";

    try {
      if (request.method === "POST") {
        const body: any = await request.json().catch(() => ({}));
        const value = body.value;

        if (value === undefined) {
          return Response.json({ success: false, error: "Value is required" }, { status: 400 });
        }

        await this.ctx.storage.put(key, value);
        return Response.json({ success: true, message: `Key '${key}' updated successfully.` });
      }

      if (request.method === "GET") {
        const value = await this.ctx.storage.get(key);
        return Response.json({ success: true, key, value: value ?? null });
      }

      return Response.json({ success: false, error: "Method not allowed" }, { status: 405 });
    } catch (error: any) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
  }
}
