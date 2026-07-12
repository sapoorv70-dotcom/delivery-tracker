import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete all of the user's delivery data
    await base44.entities.DeliveryLog.deleteMany({ created_by_id: user.id });
    await base44.entities.DeliveryTemplate.deleteMany({ created_by_id: user.id });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});