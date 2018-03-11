export default function merge(a, b) {
  var merged = {};
  for (var k in a) {
    merged[k] = a[k];
  }
  for (var k in b) {
    if (typeof merged[k] === 'object' && typeof b[k] === 'object') {
      merged[k] = merge(merged[k], b[k]);
    } else {
      merged[k] = b[k];
    }
  }
  return merged;
};
