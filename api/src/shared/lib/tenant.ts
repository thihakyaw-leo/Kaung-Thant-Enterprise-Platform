const LOCALHOST_NAMES = new Set(['localhost', '127.0.0.1', '::1']);

const stripPort = (host: string): string => {
  return host.replace(/:\d+$/, '').toLowerCase();
};

export const resolveTenantFromHost = (hostHeader?: string): string | null => {
  if (!hostHeader) {
    return null;
  }

  const host = stripPort(hostHeader.trim());
  if (!host || LOCALHOST_NAMES.has(host)) {
    return null;
  }

  const parts = host.split('.');
  if (parts.length < 3) {
    // apex domains like example.com are treated as non-tenant hosts
    return null;
  }

  return parts[0] || null;
};
