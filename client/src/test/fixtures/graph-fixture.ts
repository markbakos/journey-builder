import type { RawGraphResponse } from '../../types/graph'

export const graphFixture: RawGraphResponse = {
    id: 'bp_fixture',
    tenant_id: 'tenant_1',
    name: 'Fixture Blueprint',
    description: 'Fixture blueprint for graph tests',
    nodes: [
        {
            id: 'form-a',
            type: 'form',
            data: {
                id: 'bp_c_a',
                component_key: 'form-a',
                component_type: 'form',
                component_id: 'shared-form',
                name: 'Form A',
                prerequisites: [],
                input_mapping: {},
            },
        },
        {
            id: 'form-b',
            type: 'form',
            data: {
                id: 'bp_c_b',
                component_key: 'form-b',
                component_type: 'form',
                component_id: 'alternate-form',
                name: 'Form B',
                prerequisites: ['form-a'],
                input_mapping: {},
            },
        },
        {
            id: 'form-d',
            type: 'form',
            data: {
                id: 'bp_c_d',
                component_key: 'form-d',
                component_type: 'form',
                component_id: 'shared-form',
                name: 'Form D',
                prerequisites: ['form-b'],
                input_mapping: {},
            },
        },
    ],
    edges: [
        {
            source: 'form-a',
            target: 'form-b',
        },
        {
            source: 'form-b',
            target: 'form-d',
        },
    ],
    forms: [
        {
            id: 'shared-form',
            name: 'Shared Form',
            description: 'Shared schema',
            is_reusable: false,
            field_schema: {
                type: 'object',
                properties: {
                    button: {
                        type: 'object',
                        title: 'Button',
                        avantos_type: 'button',
                    },
                    email: {
                        type: 'string',
                        title: 'Email',
                        format: 'email',
                        avantos_type: 'short-text',
                    },
                    id: {
                        type: 'string',
                        title: 'ID',
                        avantos_type: 'short-text',
                    },
                    notes: {
                        type: 'string',
                        title: 'Notes',
                        avantos_type: 'multi-line-text',
                    },
                },
                required: ['id', 'email'],
            },
            ui_schema: {
                type: 'VerticalLayout',
                elements: [
                    {
                        type: 'Control',
                        scope: '#/properties/email',
                        label: 'Email',
                    },
                    {
                        type: 'Button',
                        scope: '#/properties/button',
                        label: 'Button',
                    },
                    {
                        type: 'Control',
                        scope: '#/properties/id',
                        label: 'ID',
                    },
                    {
                        type: 'Control',
                        scope: '#/properties/notes',
                        label: 'Notes',
                    },
                ],
            },
        },
        {
            id: 'alternate-form',
            name: 'Alternate Form',
            description: 'Alternate schema',
            is_reusable: false,
            field_schema: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        title: 'Name',
                        avantos_type: 'short-text',
                    },
                },
            },
            ui_schema: {
                type: 'VerticalLayout',
                elements: [
                    {
                        type: 'Control',
                        scope: '#/properties/name',
                        label: 'Name',
                    },
                ],
            },
        },
    ],
    branches: [],
    triggers: [],
}