export function Badge({ value }: { value: string }) {
    return (
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {value}
    </span>
    )
}
