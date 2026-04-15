import type {
    FieldDefinition,
    NormalizedGraph,
    PrefillMapping,
    PrefillSourceOption,
} from './graph'

export interface PrefillSourceSection {
    id: string
    label: string
    options: PrefillSourceOption[]
}

export interface PrefillProviderContext {
    graph: NormalizedGraph
    targetNodeId: string
}

export interface PrefillSourceProvider {
    id: string
    label: string
    getSection: (context: PrefillProviderContext) => PrefillSourceSection | null
}

export interface FieldCompatibility {
    isCompatible: boolean
    reason?: string
}

export type PrefillMappingsState = Record<string, PrefillMapping>

export type PrefillMappingsAction =
    | {
    type: 'set'
    nodeId: string
    fieldKey: string
    source: PrefillSourceOption
}
    | {
    type: 'clear'
    nodeId: string
    fieldKey: string
}
    | {
    type: 'hydrate'
    state: PrefillMappingsState
}

export interface PrefillModalTarget {
    nodeId: string
    fieldKey: string
}

export interface PrefillFieldSelection {
    field: FieldDefinition
    mapping: PrefillSourceOption | null
}