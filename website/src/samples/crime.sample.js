// The "before" on the page. Plain JavaScript on purpose: it is the code Receta replaces.
// #region sample
function getOrder(raw) {
  try {
    const data2 = JSON.parse(raw)
    if (!data2) return null
    return data2.lines.filter(l => l.qty > 0)
  } catch (e) {
    return null
  }
}
// #endregion
export { getOrder }
