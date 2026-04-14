import { useEffect, useMemo, useState } from 'react'

import { fetchGraph, type GraphRequestParams } from '../lib/api'
import { normalizeGraph } from '../lib/graph'
import type { NormalizedGraph, RawGraphResponse } from '../types/graph'

interface UseGraphResult {
    graph: NormalizedGraph | null
    rawGraph: RawGraphResponse | null
    isLoading: boolean
    error: string | null
    refetch: () => void
}

export function useGraph(params: GraphRequestParams): UseGraphResult {
    const [rawGraph, setRawGraph] = useState<RawGraphResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [requestVersion, setRequestVersion] = useState(0)

    useEffect(() => {
        const abortController = new AbortController()

        async function loadGraph() {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetchGraph(params, abortController.signal)
                setRawGraph(response)
            } catch (unknownError) {
                if (abortController.signal.aborted) {
                    return
                }

                const message =
                    unknownError instanceof Error ? unknownError.message : 'Unknown graph fetch error'

                setError(message)
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false)
                }
            }
        }

        void loadGraph()

        return () => {
            abortController.abort()
        }
    }, [
        params.tenantId,
        params.actionBlueprintId,
        params.blueprintVersionId,
        requestVersion,
    ])

    const graph = useMemo(() => {
        if (!rawGraph) {
            return null
        }

        return normalizeGraph(rawGraph)
    }, [rawGraph])

    return {
        graph,
        rawGraph,
        isLoading,
        error,
        refetch: () => setRequestVersion((current) => current + 1),
    }
}