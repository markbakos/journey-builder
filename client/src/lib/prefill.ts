import {
    getDirectDependencies,
    getFieldsForNode,
    getTransitiveDependencies,
} from './graph'
import type {
    FieldDefinition,
    PrefillSourceOption,
    PrefillSourceType,
} from '../types/graph'
import type {
    FieldCompatibility,
    PrefillProviderContext,
    PrefillSourceProvider,
    PrefillSourceSection,
} from '../types/prefill'

function createFieldSourceOption(params: {
    sourceType: PrefillSourceType
    nodeId: string
    nodeName: string
    field: FieldDefinition
}): PrefillSourceOption {
    const { sourceType, nodeId, nodeName, field } = params

    return {
        id: `${sourceType}:${nodeId}:${field.key}`,
        label: field.label,
        sourceType,
        group: nodeName,
        valueType: field.type,
        valueFormat: field.format,
        sourcePath: `nodes.${nodeId}.fields.${field.key}`,
        nodeId,
        nodeName,
        fieldKey: field.key,
        fieldLabel: field.label,
    }
}

function getPrefillableFieldsForNode(
    context: PrefillProviderContext,
    nodeId: string,
): FieldDefinition[] {
    return getFieldsForNode(context.graph, nodeId).filter((field) => field.isPrefillTarget)
}

export function createDirectDependencyFieldProvider(): PrefillSourceProvider {
    return {
        id: 'direct-dependency-fields',
        label: 'Direct dependency fields',
        getSection: (context) => {
            const options = getDirectDependencies(context.graph, context.targetNodeId).flatMap((node) =>
                getPrefillableFieldsForNode(context, node.id).map((field) =>
                    createFieldSourceOption({
                        sourceType: 'direct-dependency',
                        nodeId: node.id,
                        nodeName: node.name,
                        field,
                    }),
                ),
            )

            if (options.length === 0) {
                return null
            }

            return {
                id: 'direct-dependency-fields',
                label: 'Direct dependency fields',
                options,
            }
        },
    }
}

export function createTransitiveDependencyFieldProvider(): PrefillSourceProvider {
    return {
        id: 'transitive-dependency-fields',
        label: 'Transitive dependency fields',
        getSection: (context) => {
            const options = getTransitiveDependencies(context.graph, context.targetNodeId).flatMap(
                (node) =>
                    getPrefillableFieldsForNode(context, node.id).map((field) =>
                        createFieldSourceOption({
                            sourceType: 'transitive-dependency',
                            nodeId: node.id,
                            nodeName: node.name,
                            field,
                        }),
                    ),
            )

            if (options.length === 0) {
                return null
            }

            return {
                id: 'transitive-dependency-fields',
                label: 'Transitive dependency fields',
                options,
            }
        },
    }
}

export function createGlobalSourceProvider(): PrefillSourceProvider {
    const options: PrefillSourceOption[] = [
        {
            id: 'global:current-user-email',
            label: 'Current user email',
            sourceType: 'global',
            group: 'Global data',
            valueType: 'string',
            valueFormat: 'email',
            sourcePath: 'global.currentUser.email',
        },
        {
            id: 'global:current-user-name',
            label: 'Current user name',
            sourceType: 'global',
            group: 'Global data',
            valueType: 'string',
            sourcePath: 'global.currentUser.name',
        },
        {
            id: 'global:client-organization-name',
            label: 'Client organization name',
            sourceType: 'global',
            group: 'Global data',
            valueType: 'string',
            sourcePath: 'global.client.organizationName',
        },
        {
            id: 'global:today-iso-date',
            label: 'Today (ISO date)',
            sourceType: 'global',
            group: 'Global data',
            valueType: 'string',
            sourcePath: 'global.runtime.todayIsoDate',
        },
    ]

    return {
        id: 'global-data',
        label: 'Global data',
        getSection: () => ({
            id: 'global-data',
            label: 'Global data',
            options,
        }),
    }
}

export const DEFAULT_PREFILL_SOURCE_PROVIDERS: PrefillSourceProvider[] = [
    createDirectDependencyFieldProvider(),
    createTransitiveDependencyFieldProvider(),
    createGlobalSourceProvider(),
]

export function getPrefillSourceSections(params: {
    graph: PrefillProviderContext['graph']
    targetNodeId: string
    providers?: PrefillSourceProvider[]
}): PrefillSourceSection[] {
    const providers = params.providers ?? DEFAULT_PREFILL_SOURCE_PROVIDERS
    const context: PrefillProviderContext = {
        graph: params.graph,
        targetNodeId: params.targetNodeId,
    }

    return providers
        .map((provider) => provider.getSection(context))
        .filter((section): section is PrefillSourceSection => Boolean(section))
}

export function getFieldCompatibility(
    targetField: FieldDefinition,
    sourceOption: PrefillSourceOption,
): FieldCompatibility {
    if (!targetField.isPrefillTarget) {
        return {
            isCompatible: false,
            reason: 'This field cannot be prefilled.',
        }
    }

    if (targetField.format === 'email') {
        const isEmailCompatible =
            sourceOption.valueType === 'string' && sourceOption.valueFormat === 'email'

        return isEmailCompatible
            ? { isCompatible: true }
            : {
                isCompatible: false,
                reason: 'Email fields should use email-formatted string values.',
            }
    }

    if (targetField.type === 'unknown' || sourceOption.valueType === 'unknown') {
        return { isCompatible: true }
    }

    if (targetField.type !== sourceOption.valueType) {
        return {
            isCompatible: false,
            reason: `Expected ${targetField.type}, got ${sourceOption.valueType}.`,
        }
    }

    return { isCompatible: true }
}

export function formatSourceTypeLabel(sourceType: PrefillSourceOption['sourceType']): string {
    switch (sourceType) {
        case 'direct-dependency':
            return 'Direct dependency'
        case 'transitive-dependency':
            return 'Transitive dependency'
        case 'global':
            return 'Global'
        default:
            return 'Source'
    }
}