"use client"

import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

export type ApiFieldMap = Record<string, string | string[] | undefined>

export type ApiFormError = {
  message?: string
  fields?: ApiFieldMap
}

export function applyApiFormError<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: ApiFormError,
) {
  if (error.message) {
    form.setError("root", { message: error.message })
  }
  for (const [name, value] of Object.entries(error.fields ?? {})) {
    const message = Array.isArray(value) ? value.filter(Boolean).join(" ") : value
    if (!message) continue
    form.setError(name as FieldPath<T>, { message })
  }
}
