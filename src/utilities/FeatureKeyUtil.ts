export function GetFeatureKey(targetId: string, prefix = 'feature_'): string {
  let hash = 0;
  for (let i = 0; i < targetId.length; i++) {
    const char = targetId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return prefix + hash;
}
