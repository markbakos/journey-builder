import { useReducer } from 'react'

import type { PrefillSourceOption } from '../types/graph'
import type { PrefillMappingsAction, PrefillMappingsState } from '../types/prefill'

function prefillMappingsReducer(
    state: PrefillMappingsState,
    action: PrefillMappingsAction,
): PrefillMappingsState {
    switch (action.type) {
        case 'hydrate':
            return action.state

        case 'set': {
            return {
                ...state,
                [action.nodeId]: {
                    ...(state[action.nodeId] || {}),
                    [action.fieldKey]: action.source,
                },
            }
        }

        case 'clear': {
            return {
                ...state,
                [action.nodeId]: {
                    ...(state[action.nodeId] || {}),
                    [action.fieldKey]: null,
                },
            }
        }

        default:
            return state
    }
}

export function usePrefillMappings(initialState: PrefillMappingsState = {}) {
    const [mappingsByNodeId, dispatch] = useReducer(prefillMappingsReducer, initialState)

    function setMapping(nodeId: string, fieldKey: string, source: PrefillSourceOption) {
        dispatch({
            type: 'set',
            nodeId,
            fieldKey,
            source,
        })
    }

    function clearMapping(nodeId: string, fieldKey: string) {
        dispatch({
            type: 'clear',
            nodeId,
            fieldKey,
        })
    }

    return {
        mappingsByNodeId,
        setMapping,
        clearMapping,
    }
}