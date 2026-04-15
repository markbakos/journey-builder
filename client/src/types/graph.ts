export type JsonSchemaType =
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'array'
    | 'object'
    | 'null'

export interface RawGraphResponse {
    $schema?: string
    id: string
    tenant_id: string
    name: string
    description?: string
    category?: string
    nodes: RawGraphNode[]
    edges: RawGraphEdge[]
    forms: RawFormDefinition[]
    branches?: unknown[]
    triggers?: unknown[]
}

export interface RawGraphNode {
    id: string
    type: string
    position?: {
        x: number
        y: number
    }
    data: RawFormNodeData
}

export interface RawFormNodeData {
    id: string
    component_key: string
    component_type: string
    component_id: string
    name: string
    prerequisites?: string[]
    input_mapping?: Record<string, unknown>
    permitted_roles?: string[]
    approval_required?: boolean
}

export interface RawGraphEdge {
    source: string
    target: string
}

export interface RawFormDefinition {
    id: string
    name: string
    description: string
    is_reusable: boolean
    field_schema: RawFieldSchema
    ui_schema?: RawUiSchema
    dynamic_field_config?: Record<string, unknown>
}

export interface RawFieldSchema {
    type: 'object'
    properties: Record<string, RawFieldProperty>
    required?: string[]
}

export interface RawFieldProperty {
    type?: JsonSchemaType
    title?: string
    format?: string
    enum?: unknown[] | null
    items?: {
        type?: JsonSchemaType
        enum?: unknown[]
    }
    avantos_type?: string
}

export interface RawUiSchema {
    type?: string
    elements?: RawUiSchemaElement[]
}

export interface RawUiSchemaElement {
    type?: string
    scope?: string
    label?: string
    options?: Record<string, unknown>
}

export type PrefillSourceType = 'direct-dependency' | 'transitive-dependency' | 'global'

export interface PrefillSourceOption {
    id: string
    label: string
    sourceType: PrefillSourceType
    group: string
    valueType: JsonSchemaType | 'unknown'
    valueFormat?: string
    sourcePath: string
    nodeId?: string
    nodeName?: string
    fieldKey?: string
    fieldLabel?: string
}

export type PrefillMapping = Record<string, PrefillSourceOption | null>

export interface FormNode {
    id: string
    name: string
    componentId: string
    prerequisites: string[]
    inputMapping: Record<string, unknown>
}

export interface FieldDefinition {
    key: string
    label: string
    type: JsonSchemaType | 'unknown'
    format?: string
    avantosType?: string
    isRequired: boolean
    isPrefillTarget: boolean
    path: string
}

export interface NormalizedGraph {
    raw: RawGraphResponse
    nodeOrder: string[]
    formNodes: FormNode[]
    nodesById: Record<string, FormNode>
    formsById: Record<string, RawFormDefinition>
    parentsByNodeId: Record<string, string[]>
    childrenByNodeId: Record<string, string[]>
    fieldsByFormId: Record<string, FieldDefinition[]>
}