function InventoryItemCard({ item, onClick }) {
  return (
    <button
      onClick={() => onClick(item)}
      className="group flex items-center gap-4 w-full rounded-xl bg-[#020617] border border-[#1e293b] p-3 hover:border-amber-400 transition"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-black">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>

      <div className="flex flex-col items-start">

        <h3 className="text-sm font-semibold text-white">
          {item.name}
        </h3>

        <p className="text-xs text-gray-400">
          {item.stoneType}
        </p>

        <span className="text-xs text-amber-400 mt-1">
          {item.carat} ct
        </span>

      </div>
    </button>
  );
}

export default InventoryItemCard;