import { describe, expect, it } from 'vitest'

import { graphFixture } from './fixtures/graph-fixture'
import { getFieldsForNode, normalizeGraph } from '../lib/graph'
import {
    DEFAULT_PREFILL_SOURCE_PROVIDERS,
    getFieldCompatibility,
    getPrefillSourceSections,
} from '../lib/prefill'

describe('prefill providers', () => {
    const graph = normalizeGraph(graphFixture)

    it('returns direct, transitive, and global sections for a target node', () => {
        const sections = getPrefillSourceSections({
            graph,
            targetNodeId: 'form-d',
            providers: DEFAULT_PREFILL_SOURCE_PROVIDERS,
        })

        expect(sections.map((section) => section.label)).toEqual([
            'Direct dependency fields',
            'Transitive dependency fields',
            'Global data',
        ])
    })

    it('includes direct dependency options grouped by parent form', () => {
        const sections = getPrefillSourceSections({
            graph,
            targetNodeId: 'form-d',
        })

        const directSection = sections.find((section) => section.id === 'direct-dependency-fields')
        expect(directSection?.options.some((option) => option.group === 'Form B' && option.label === 'Name')).toBe(true)
    })

    it('includes transitive dependency options grouped by ancestor form', () => {
        const sections = getPrefillSourceSections({
            graph,
            targetNodeId: 'form-d',
        })

        const transitiveSection = sections.find(
            (section) => section.id === 'transitive-dependency-fields',
        )

        expect(
            transitiveSection?.options.some((option) => option.group === 'Form A' && option.label === 'Email'),
        ).toBe(true)
    })

    it('enforces compatibility rules for email fields', () => {
        const emailField = getFieldsForNode(graph, 'form-d').find((field) => field.key === 'email')
        const sections = getPrefillSourceSections({
            graph,
            targetNodeId: 'form-d',
        })

        const globalSection = sections.find((section) => section.id === 'global-data')
        const directSection = sections.find((section) => section.id === 'direct-dependency-fields')

        const globalEmail = globalSection?.options.find(
            (option) => option.id === 'global:current-user-email',
        )
        const directName = directSection?.options.find((option) => option.label === 'Name')

        expect(emailField).toBeDefined()
        expect(globalEmail).toBeDefined()
        expect(directName).toBeDefined()

        expect(getFieldCompatibility(emailField!, globalEmail!).isCompatible).toBe(true)
        expect(getFieldCompatibility(emailField!, directName!).isCompatible).toBe(false)
    })
})