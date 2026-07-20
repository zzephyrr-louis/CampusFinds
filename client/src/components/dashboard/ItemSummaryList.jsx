import ItemSummaryRow from './ItemSummaryRow'

function ItemSummaryList({ items, emptyMessage }) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <div className="item-summary-list">
      {items.map((item) => <ItemSummaryRow item={item} key={item.id} />)}
    </div>
  )
}

export default ItemSummaryList
