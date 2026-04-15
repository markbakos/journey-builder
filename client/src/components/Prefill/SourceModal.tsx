import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'

import { getFieldCompatibility } from '../../lib/prefill.ts'
import type { FieldDefinition, PrefillSourceOption } from '../../types/graph.ts'
import type { PrefillSourceSection } from '../../types/prefill.ts'

interface PrefillSourceModalProps {
    isOpen: boolean
    targetField: FieldDefinition | null
    sections: PrefillSourceSection[]
    onSelect: (option: PrefillSourceOption) => void
    onClose: () => void
}

function groupOptionsByGroup(options: PrefillSourceOption[]): Array<[string, PrefillSourceOption[]]> {
    const groups = new Map<string, PrefillSourceOption[]>()

    for (const option of options) {
        const existingOptions = groups.get(option.group) ?? []
        groups.set(option.group, [...existingOptions, option])
    }

    return Array.from(groups.entries())
}

export function SourceModal({
                                       isOpen,
                                       targetField,
                                       sections,
                                       onSelect,
                                       onClose,
                                   }: PrefillSourceModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        if (!isOpen) {
            return
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        closeButtonRef.current?.focus()
    }, [isOpen])

    const hasSelectableOptions = useMemo(() => {
        if (!targetField) {
            return false
        }

        return sections.some((section) =>
            section.options.some((option) => getFieldCompatibility(targetField, option).isCompatible),
        )
    }, [sections, targetField])

    if (!isOpen || !targetField) {
        return null
    }

    const modal = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="prefill-modal-title"
                className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 id="prefill-modal-title" className="text-lg font-semibold text-slate-900">
                            Choose a prefill source for {targetField.label}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Pick from direct dependencies, transitive dependencies, or global data.
                        </p>
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>

                <div className="space-y-6 px-6 py-5">
                    {!hasSelectableOptions ? (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            No compatible sources are available for this field.
                        </div>
                    ) : null}

                    {sections.map((section) => (
                        <section key={section.id}>
                            <h3 className="text-sm font-semibold text-slate-900">{section.label}</h3>

                            <div className="mt-3 space-y-4">
                                {groupOptionsByGroup(section.options).map(([groupName, options]) => (
                                    <div key={`${section.id}:${groupName}`} className="rounded-xl border border-slate-200">
                                        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-800">
                                            {groupName}
                                        </div>

                                        <div className="divide-y divide-slate-200">
                                            {options.map((option) => {
                                                const compatibility = getFieldCompatibility(targetField, option)

                                                if (!compatibility.isCompatible) return;

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className="flex items-center justify-between gap-4 px-4 py-3"
                                                    >
                                                        <div>
                                                            <div className="font-medium text-slate-900">{option.label}</div>
                                                            <div className="mt-1 text-sm text-slate-500">
                                                                {option.sourcePath}
                                                            </div>
                                                            {/*{!compatibility.isCompatible && compatibility.reason ? (*/}
                                                            {/*    <div className="mt-1 text-xs text-amber-700">*/}
                                                            {/*        {compatibility.reason}*/}
                                                            {/*    </div>*/}
                                                            {/*) : null}*/}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={!compatibility.isCompatible}
                                                            aria-label={`${option.label} from ${option.group}`}
                                                            onClick={() => onSelect(option)}
                                                            className={[
                                                                'rounded-lg px-3 py-2 text-sm font-medium transition',
                                                                compatibility.isCompatible
                                                                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                                    : 'cursor-not-allowed bg-slate-100 text-slate-400',
                                                            ].join(' ')}
                                                        >
                                                            Select
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}