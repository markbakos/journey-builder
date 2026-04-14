import { useEffect, useState } from 'react'

import { FormList } from './components/FormList'
import { useGraph } from './hooks/useGraph'

function App() {
    const graphParams =  {
            tenantId: 'VAR1',
            actionBlueprintId: 'VAR2',
            blueprintVersionId: 'VAR3',
        }

    const { graph, isLoading, error, refetch } = useGraph(graphParams)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    useEffect(() => {
        if (!graph) {
            return
        }

        if (!selectedNodeId && graph.formNodes.length > 0) {
            setSelectedNodeId(graph.formNodes[0].id)
            return
        }

        if (selectedNodeId && !graph.nodesById[selectedNodeId]) {
            setSelectedNodeId(graph.formNodes[0]?.id || null)
        }
    }, [graph, selectedNodeId])

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
                    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                        <FormList
                            graph={graph}
                            selectedNodeId={selectedNodeId}
                            onSelect={setSelectedNodeId}
                        />
                    </div>
                ) : null}
            </div>
        </main>
    )
}

export default App