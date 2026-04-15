import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../App'
import { graphFixture } from './fixtures/graph-fixture'

describe('App prefill flow', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => graphFixture,
            }),
        )
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('lets the user select and clear a mapping', async () => {
        render(<App />)

        const formDButton = await screen.findByRole('button', { name: /form d/i })
        fireEvent.click(formDButton)

        const selectButtons = screen.getAllByRole('button', { name: /select source/i })
        fireEvent.click(selectButtons[0])

        await waitFor(() => {
            expect(
                screen.getByRole('dialog', { name: /choose a prefill source for email/i }),
            ).toBeInTheDocument()
        })

        const currentUserEmailButton = await screen.findByRole('button', {
            name: /current user email from global data/i,
        })
        fireEvent.click(currentUserEmailButton)

        expect(await screen.findByText(/global data • current user email/i)).toBeInTheDocument()

        const clearButtons = screen.getAllByRole('button', { name: /clear/i })
        fireEvent.click(clearButtons[0])
    })
})