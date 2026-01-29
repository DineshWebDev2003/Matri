export const isFreeUser = (user?: any): boolean => {
  if (!user) return false;
  const id = String(user.package_id ?? user.packageId ?? '').trim();
  if (id === '4') return true;
  const name = String((user as any).packageName || '').toUpperCase();
  return name.includes('FREE');
};
