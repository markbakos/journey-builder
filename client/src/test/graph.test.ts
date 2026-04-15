import { describe, expect, it } from 'vitest'

import { graphFixture } from '../test/fixtures/graph-fixture'
import {
    extractFields,
    getDirectDependencies,
    getFieldsForNode,
    getTransitiveDependencies,
    normalizeGraph,
    resolveFormForNode,
} from '../lib/graph'

describe('graph normalization', () => {
    const graph = normalizeGraph(graphFixture)

    it('indexes form nodes by id', () => {
        expect(graph.nodesById['form-a']?.name).toBe('Form A')
        expect(graph.nodesById['form-d']?.name).toBe('Form D')
    })

    it('resolves a reusable form for a node from componentId', () => {
        const form = resolveFormForNode(graph, 'form-d')

        expect(form?.id).toBe('shared-form')
        expect(form?.name).toBe('Shared Form')
    })

    it('extracts fields in ui order and excludes button from prefill targets', () => {
        const form = graph.formsById['shared-form']
        const fields = extractFields(form)

        expect(fields.map((field) => field.key)).toEqual(['email', 'button', 'id', 'notes'])
        expect(fields.find((field) => field.key === 'button')?.isPrefillTarget).toBe(false)
        expect(fields.find((field) => field.key === 'email')?.isRequired).toBe(true)
    })

    it('returns the fields for a selected node', () => {
        const fields = getFieldsForNode(graph, 'form-d')

        expect(fields.map((field) => field.key)).toContain('email')
        expect(fields.map((field) => field.key)).toContain('id')
    })

    it('returns direct dependencies', () => {
        const directDependencies = getDirectDependencies(graph, 'form-d')

        expect(directDependencies.map((node) => node.name)).toEqual(['Form B'])
    })

    it('returns transitive dependencies excluding direct parents', () => {
        const transitiveDependencies = getTransitiveDependencies(graph, 'form-d')

        expect(transitiveDependencies.map((node) => node.name)).toEqual(['Form A'])
    })
})