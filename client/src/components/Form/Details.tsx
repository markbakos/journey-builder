import {
    getDirectDependencies,
    getFieldsForNode,
    getTransitiveDependencies,
    resolveFormForNode,
} from '../../lib/graph.ts'
import { formatSourceTypeLabel } from '../../lib/prefill.ts'
import type { NormalizedGraph, PrefillMapping } from '../../types/graph.ts'
import { Badge } from '../UI/Badge.tsx'

interface FormDetailsProps {
    graph: NormalizedGraph
    nodeId: string | null
    mappings?: PrefillMapping
    onOpenMapping: (fieldKey: string) => void
    onClearMapping: (fieldKey: string) => void
}


export function Details({
                                graph,
                                nodeId,
                                mappings = {},
                                onOpenMapping,
                                onClearMapping,
                            }: FormDetailsProps) {
    if (!nodeId) {
        return (
            <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                Select a form from the list to inspect it.
            </section>
        )
    }

    const node = graph.nodesById[nodeId]
    const form = resolveFormForNode(graph, nodeId)
    const directDependencies = getDirectDependencies(graph, nodeId)
    const transitiveDependencies = getTransitiveDependencies(graph, nodeId)
    const fields = getFieldsForNode(graph, nodeId).filter((field) => field.isPrefillTarget)

    if (!node || !form) {
        return (
            <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                The selected node could not be resolved to a form definition.
            </section>
        )
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">{node.name}</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Reusable form schema: <span className="font-medium text-slate-800">{form.name}</span>
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Direct dependencies</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {directDependencies.length > 0 ? (
                            directDependencies.map((dependency) => (
                                <Badge key={dependency.id} value={dependency.name} />
                            ))
                        ) : (
                            <span className="text-sm text-slate-500">None</span>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Transitive dependencies</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {transitiveDependencies.length > 0 ? (
                            transitiveDependencies.map((dependency) => (
                                <Badge key={dependency.id} value={dependency.name} />
                            ))
                        ) : (
                            <span className="text-sm text-slate-500">None</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">Prefill fields</h3>
                    <p className="mt-1 text-sm text-slate-600">
                        View, add, replace, or clear field mappings.
                    </p>
                </div>

                {fields.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-slate-500">No prefillable fields were found.</div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {fields.map((field) => {
                            const mapping = mappings[field.key] ?? null

                            return (
                                <div key={field.key} className="flex items-center justify-between gap-4 px-4 py-4">
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-900">{field.label}</div>

                                        <div className="mt-1 text-sm text-slate-500">
                                            {mapping ? (
                                                <span>
                          {mapping.group} • {mapping.label}
                        </span>
                                            ) : (
                                                <span>No prefill configured</span>
                                            )}
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <Badge value={field.type} />
                                            {field.format ? <Badge value={field.format} /> : null}
                                            {mapping ? <Badge value={formatSourceTypeLabel(mapping.sourceType)} /> : null}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onOpenMapping(field.key)}
                                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                        >
                                            {mapping ? 'Change source' : 'Select source'}
                                        </button>

                                        {mapping ? (
                                            <button
                                                type="button"
                                                onClick={() => onClearMapping(field.key)}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                Clear
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}