import type {
    FieldDefinition,
    FormNode,
    NormalizedGraph,
    RawFormDefinition,
    RawGraphResponse,
} from '../types/graph'

const NON_PREFILLABLE_TYPES = new Set(['button'])

const dedupe = <T>(values: T[]): T[] => Array.from(new Set(values))

export function extractFields(form: RawFormDefinition): FieldDefinition[] {
    const requiredFields = new Set(form.field_schema.required ?? [])
    const properties = form.field_schema.properties ?? {}

    const uiLabels = new Map<string, string>()
    const uiOrder: string[] = []

    for (const element of form.ui_schema?.elements || []) {
        const fieldKey = element.scope?.match(/^#\/properties\/(.+)$/)?.[1] || null

        if (!fieldKey) {
            continue
        }

        uiOrder.push(fieldKey)

        if (element.label?.trim()) {
            uiLabels.set(fieldKey, element.label)
        }
    }

    return dedupe([...uiOrder, ...Object.keys(properties)])
        .flatMap((fieldKey) => {
            const property = properties[fieldKey]

            if (!property) {
                return []
            }

            return [
                {
                    key: fieldKey,
                    label:
                        uiLabels.get(fieldKey) ||
                        property.title ||
                        fieldKey
                            .replace(/[_-]+/g, ' ')
                            .replace(/\b\w/g, (char) => char.toUpperCase()),
                    type: property.type || 'unknown',
                    format: property.format,
                    avantosType: property.avantos_type,
                    isRequired: requiredFields.has(fieldKey),
                    isPrefillTarget: !NON_PREFILLABLE_TYPES.has(property.avantos_type || ''),
                    path: `#/properties/${fieldKey}`,
                },
            ]
        })
}

export function normalizeGraph(raw: RawGraphResponse): NormalizedGraph {
    const formNodes: FormNode[] = raw.nodes
        .filter((node) => node.type === 'form' && node.data.component_type === 'form')
        .map((node) => ({
            id: node.id,
            name: node.data.name,
            componentId: node.data.component_id,
            prerequisites: node.data.prerequisites || [],
            inputMapping: node.data.input_mapping || {},
        }))

    const nodesById = Object.fromEntries(formNodes.map((node) => [node.id, node]))
    const formsById = Object.fromEntries(raw.forms.map((form) => [form.id, form]))

    const parentSets: Record<string, Set<string>> = Object.fromEntries(
        formNodes.map((node) => [node.id, new Set<string>()]),
    )

    const childSets: Record<string, Set<string>> = Object.fromEntries(
        formNodes.map((node) => [node.id, new Set<string>()]),
    )

    for (const edge of raw.edges) {
        if (!nodesById[edge.source] || !nodesById[edge.target]) {
            continue
        }

        parentSets[edge.target].add(edge.source)
        childSets[edge.source].add(edge.target)
    }

    for (const node of formNodes) {
        for (const prerequisiteId of node.prerequisites) {
            if (!nodesById[prerequisiteId]) {
                continue
            }

            parentSets[node.id].add(prerequisiteId)
            childSets[prerequisiteId].add(node.id)
        }
    }

    const parentsByNodeId = Object.fromEntries(
        Object.entries(parentSets).map(([nodeId, parents]) => [nodeId, Array.from(parents)]),
    )

    const childrenByNodeId = Object.fromEntries(
        Object.entries(childSets).map(([nodeId, children]) => [nodeId, Array.from(children)]),
    )

    const fieldsByFormId = Object.fromEntries(
        raw.forms.map((form) => [form.id, extractFields(form)]),
    )

    return {
        raw,
        nodeOrder: formNodes.map((node) => node.id),
        formNodes,
        nodesById,
        formsById,
        parentsByNodeId,
        childrenByNodeId,
        fieldsByFormId,
    }
}

export function resolveFormForNode(
    graph: NormalizedGraph,
    nodeId: string,
): RawFormDefinition | null {
    const node = graph.nodesById[nodeId]

    return node ? graph.formsById[node.componentId] || null : null
}

export function getFieldsForNode(graph: NormalizedGraph, nodeId: string): FieldDefinition[] {
    const form = resolveFormForNode(graph, nodeId)
    return form ? graph.fieldsByFormId[form.id] || [] : []
}

export function getDirectDependencyIds(graph: NormalizedGraph, nodeId: string): string[] {
    return graph.parentsByNodeId[nodeId] || []
}

export function getDirectDependencies(graph: NormalizedGraph, nodeId: string): FormNode[] {
    return getDirectDependencyIds(graph, nodeId)
        .map((dependencyId) => graph.nodesById[dependencyId])
        .filter((node): node is FormNode => Boolean(node))
}

export function getTransitiveDependencyIds(graph: NormalizedGraph, nodeId: string): string[] {
    const directDependencyIds = new Set(getDirectDependencyIds(graph, nodeId))
    const visited = new Set<string>()
    const stack = [...directDependencyIds]

    while (stack.length > 0) {
        const currentId = stack.pop()

        if (!currentId) {
            continue
        }

        for (const parentId of getDirectDependencyIds(graph, currentId)) {
            if (directDependencyIds.has(parentId) || visited.has(parentId)) {
                continue
            }

            visited.add(parentId)
            stack.push(parentId)
        }
    }

    return Array.from(visited)
}

export function getTransitiveDependencies(graph: NormalizedGraph, nodeId: string): FormNode[] {
    return getTransitiveDependencyIds(graph, nodeId)
        .map((dependencyId) => graph.nodesById[dependencyId])
        .filter((node): node is FormNode => Boolean(node))
}

export function isAncestor(
    graph: NormalizedGraph,
    ancestorNodeId: string,
    targetNodeId: string,
): boolean {
    return (
        getDirectDependencyIds(graph, targetNodeId).includes(ancestorNodeId) ||
        getTransitiveDependencyIds(graph, targetNodeId).includes(ancestorNodeId)
    )
}