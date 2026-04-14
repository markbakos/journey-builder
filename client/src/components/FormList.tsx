import { getDirectDependencyIds } from '../lib/graph'
import type { NormalizedGraph } from '../types/graph'

interface FormListProps {
    graph: NormalizedGraph
    selectedNodeId: string | null
    onSelect: (nodeId: string) => void
}

export function FormList({ graph, selectedNodeId, onSelect }: FormListProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
                {graph.formNodes.map((node) => {
                    const form = graph.formsById[node.componentId]
                    const dependencyCount = getDirectDependencyIds(graph, node.id).length
                    const isSelected = selectedNodeId === node.id

                    return (
                        <button
                            key={node.id}
                            type="button"
                            onClick={() => onSelect(node.id)}
                            className={[
                                'w-full rounded-lg border p-4 text-left transition cursor-pointer',
                                isSelected
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                            ].join(' ')}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-medium text-slate-900">{node.name}</h3>
                                    <p className="mt-1 text-xs text-slate-500">{node.id}</p>
                                </div>

                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {dependencyCount} direct {dependencyCount === 1 ? 'dependency' : 'dependencies'}
                </span>
                            </div>

                            <div className="mt-3 text-sm text-slate-600">
                                <span className="font-medium text-slate-700">Schema:</span>{' '}
                                {form?.name || 'Unknown form'}
                            </div>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}