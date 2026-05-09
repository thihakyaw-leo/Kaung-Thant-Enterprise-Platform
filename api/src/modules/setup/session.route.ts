import { Hono } from 'hono';
import { Env } from '../../index';

const sessionAPI = new Hono<{ Bindings: Env; Variables: { user: any } }>();

interface ActiveUser {
  userId: string;
  email: string;
  role: string;
  lastActive: number;
}

/**
 * POST /ping -> Register or refresh current user's active status
 */
sessionAPI.post('/ping', async (c) => {
  const user = c.get('user') as { id: string; email: string; role: string } | undefined;
  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const doId = c.env.SESSION_COORDINATOR.idFromName('global_sessions');
    const doObj = c.env.SESSION_COORDINATOR.get(doId);

    // 1. Fetch current active users list from DO
    const getRes = await doObj.fetch(new Request('https://durable/session?key=active_users'));
    const getData: any = await getRes.json();
    let activeUsers: ActiveUser[] = Array.isArray(getData.value) ? getData.value : [];

    const now = Date.now();

    // 2. Filter out sessions older than 5 minutes (inactivity cleanup)
    activeUsers = activeUsers.filter(u => now - u.lastActive < 5 * 60 * 1000);

    // 3. Update or add current user's session
    const existingIndex = activeUsers.findIndex(u => u.userId === user.id);
    const updatedUser: ActiveUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
      lastActive: now,
    };

    if (existingIndex > -1) {
      activeUsers[existingIndex] = updatedUser;
    } else {
      activeUsers.push(updatedUser);
    }

    // 4. Save updated list back to DO
    const postRes = await doObj.fetch(new Request('https://durable/session?key=active_users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: activeUsers }),
    }));

    const postData: any = await postRes.json();

    return c.json({
      success: true,
      message: 'Ping successful. Session registered.',
      data: updatedUser,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /active -> Fetch all currently active users on the platform
 */
sessionAPI.get('/active', async (c) => {
  try {
    const doId = c.env.SESSION_COORDINATOR.idFromName('global_sessions');
    const doObj = c.env.SESSION_COORDINATOR.get(doId);

    // 1. Fetch active users list from DO
    const getRes = await doObj.fetch(new Request('https://durable/session?key=active_users'));
    const getData: any = await getRes.json();
    let activeUsers: ActiveUser[] = Array.isArray(getData.value) ? getData.value : [];

    const now = Date.now();

    // 2. Filter out inactive sessions on the fly
    activeUsers = activeUsers.filter(u => now - u.lastActive < 5 * 60 * 1000);

    return c.json({
      success: true,
      data: activeUsers,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default sessionAPI;
