export const hasPremiumAccess = (user: any): boolean => {
  if (!user) return false;
  const pkg = (user.package_name || user.packageName || '').toString().toUpperCase();
  return pkg !== '' && !pkg.includes('FREE');
};
