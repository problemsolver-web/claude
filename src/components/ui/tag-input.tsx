'use client'

import { useState, type KeyboardEvent } from 'react'

interface TagInputProps {
  label?: string
  name: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  helperText?: string
  error?: string
}

export function TagInput({
  label,
  name,
  value,
  onChange,
  placeholder = 'Type and press Enter',
  helperText,
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = inputValue.trim()
      if (tag && !value.includes(tag)) {
        onChange([...value, tag])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className={`flex flex-wrap gap-1.5 rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus-within:ring-2 focus-within:ring-offset-0 ${
          error
            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500'
            : 'border-gray-300 focus-within:border-primary-500 focus-within:ring-primary-500'
        }`}
      >
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-md bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-primary-600 hover:text-primary-800"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 p-0 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />
      </div>
      {/* Hidden input to submit comma-separated values */}
      <input type="hidden" name={name} value={value.join(',')} />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}
