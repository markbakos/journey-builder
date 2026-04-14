import type { RawGraphResponse } from '../types/graph'

export interface GraphRequestParams {
    tenantId: string
    actionBlueprintId: string
    blueprintVersionId: string
}

export function buildGraphUrl({
                                  tenantId,
                                  actionBlueprintId,
                                  blueprintVersionId,
                              }: GraphRequestParams): string {

    return `http://localhost:3000/api/v1/${tenantId}/actions/blueprints/${actionBlueprintId}/${blueprintVersionId}/graph`
}

export async function fetchGraph(
    params: GraphRequestParams,
    signal?: AbortSignal,
): Promise<RawGraphResponse> {
    const response = await fetch(buildGraphUrl(params), {
        method: 'GET',
        signal,
        headers: {
            Accept: 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch graph: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as RawGraphResponse
}