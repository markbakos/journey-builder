import {
    getDirectDependencies,
    getFieldsForNode,
    getTransitiveDependencies,
    resolveFormForNode,
} from '../lib/graph'
import type { NormalizedGraph } from '../types/graph'

interface FormDetailsProps {
    graph: NormalizedGraph
    nodeId: string | null
}

function TypeBadge({ value }: { value: string }) {
    return (
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {value}
    </span>
    )
}

export function FormDetails({ graph, nodeId }: FormDetailsProps) {
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
    const fields = getFieldsForNode(graph, nodeId)

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
                                <TypeBadge key={dependency.id} value={dependency.name} />
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
                                <TypeBadge key={dependency.id} value={dependency.name} />
                            ))
                        ) : (
                            <span className="text-sm text-slate-500">None</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200">
                <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">Fields</h3>
                    <p className="mt-1 text-sm text-slate-600">
                        TODO: ADD
                    </p>
                </div>

                <div className="divide-y divide-slate-200">
                    {fields.map((field) => (
                        <div key={field.key} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div>
                                <div className="font-medium text-slate-900">{field.label}</div>
                                <div className="mt-1 text-sm text-slate-500">
                                    key: {field.key}
                                    {field.isRequired ? ' • required' : ''}
                                    {!field.isPrefillTarget ? ' • excluded from prefill' : ''}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {field.format ? <TypeBadge value={field.format} /> : null}
                                <TypeBadge value={field.type} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}