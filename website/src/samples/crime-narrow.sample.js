// The same function, wrapped for phone widths.
// #region sample
function getOrder(raw) {
  try {
    const data2 = JSON.parse(raw)
    if (!data2) return null
    return data2.lines
      .filter(l => l.qty > 0)
  } catch (e) {
    return null
  }
}
// #endregion
export { getOrder }
