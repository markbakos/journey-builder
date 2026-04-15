import { useEffect, useMemo, useState } from 'react'

import { FormDetails } from './components/FormDetails'
import { FormList } from './components/FormList'
import { PrefillSourceModal } from './components/PrefillSourceModal'
import { useGraph } from './hooks/useGraph'
import { usePrefillMappings } from './hooks/usePrefillMappings'
import { getFieldsForNode } from './lib/graph'
import {
    DEFAULT_PREFILL_SOURCE_PROVIDERS,
    getPrefillSourceSections,
} from './lib/prefill'
import type { PrefillModalTarget } from './types/prefill'

function App() {
    const graphParams =  {
            tenantId: 'VAR1',
            actionBlueprintId: 'VAR2',
            blueprintVersionId: 'VAR3',
        }

    const { graph, isLoading, error, refetch } = useGraph(graphParams)
    const { mappingsByNodeId, setMapping, clearMapping } = usePrefillMappings()
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [modalTarget, setModalTarget] = useState<PrefillModalTarget | null>(null)

    useEffect(() => {
        if (!graph) {
            return
        }

        if (!selectedNodeId && graph.formNodes.length > 0) {
            setSelectedNodeId(graph.formNodes[0].id)
            return
        }

        if (selectedNodeId && !graph.nodesById[selectedNodeId]) {
            setSelectedNodeId(graph.formNodes[0]?.id ?? null)
        }
    }, [graph, selectedNodeId])

    useEffect(() => {
        if (!graph || !modalTarget) {
            return
        }

        if (!graph.nodesById[modalTarget.nodeId]) {
            setModalTarget(null)
        }
    }, [graph, modalTarget])

    const activeTargetField = useMemo(() => {
        if (!graph || !modalTarget) {
            return null
        }

        return (
            getFieldsForNode(graph, modalTarget.nodeId).find(
                (field) => field.key === modalTarget.fieldKey && field.isPrefillTarget,
            ) || null
        )
    }, [graph, modalTarget])

    const activeSourceSections = useMemo(() => {
        if (!graph || !modalTarget) {
            return []
        }

        return getPrefillSourceSections({
            graph,
            targetNodeId: modalTarget.nodeId,
            providers: DEFAULT_PREFILL_SOURCE_PROVIDERS,
        })
    }, [graph, modalTarget])

    const selectedNodeMappings = selectedNodeId ? mappingsByNodeId[selectedNodeId] ?? {} : {}

    function HandleOpenMapping(fieldKey: string) {
        if (!selectedNodeId) {
            return
        }

        setModalTarget({
            nodeId: selectedNodeId,
            fieldKey,
        })
    }

    function HandleCloseModal() {
        setModalTarget(null)
    }

    function HandleSelectSource(sourceId: Parameters<typeof setMapping>[2]) {
        if (!modalTarget) {
            return
        }

        setMapping(modalTarget.nodeId, modalTarget.fieldKey, sourceId)
        setModalTarget(null)
    }

    function HandleClearMapping(fieldKey: string) {
        if (!selectedNodeId) {
            return
        }

        clearMapping(selectedNodeId, fieldKey)
    }

    return (
        <main className="min-h-screen px-4 py-8 text-slate-900">
            <div className="mx-auto max-w-7xl">

                {isLoading ? (
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        Loading graph…
                    </section>
                ) : null}

                {!isLoading && error ? (
                    <section className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
                        <div className="font-medium text-red-800">Failed to load the graph.</div>
                        <div className="mt-1 text-sm text-red-700">{error}</div>
                        <button
                            type="button"
                            onClick={refetch}
                            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                        >
                            Retry
                        </button>
                    </section>
                ) : null}

                {!isLoading && !error && graph ? (
                    <>
                        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                            <FormList
                                graph={graph}
                                selectedNodeId={selectedNodeId}
                                onSelect={setSelectedNodeId}
                            />

                            <FormDetails
                                graph={graph}
                                nodeId={selectedNodeId}
                                mappings={selectedNodeMappings}
                                onOpenMapping={HandleOpenMapping}
                                onClearMapping={HandleClearMapping}
                            />
                        </div>

                        <PrefillSourceModal
                            isOpen={Boolean(modalTarget && activeTargetField)}
                            targetField={activeTargetField}
                            sections={activeSourceSections}
                            onSelect={HandleSelectSource}
                            onClose={HandleCloseModal}
                        />
                    </>
                ) : null}
            </div>
        </main>
    )
}

export default App