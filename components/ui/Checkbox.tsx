import React, { ChangeEvent } from 'react'

type Props = {
  text: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  isChecked: boolean
  isDisabled?: boolean
}

export const Checkbox: React.FC<Props> = ({
  text,
  value,
  onChange,
  isChecked,
  isDisabled,
}) => {
  return (
    <label className="mr-3 text-sm flex items-center text-gray-600 whitespace-nowrap dark:text-white cursor-pointer">
      <input
        type="checkbox"
        value={value}
        checked={isChecked}
        disabled={isDisabled || false}
        onChange={onChange}
        className="peer hidden"
      />
      <div
        className={`w-4 h-4 mr-2 rounded border-2 border-[#E85733] flex items-center justify-center 
          peer-checked:bg-[#E85733] peer-disabled:opacity-50`}
      >
        {isChecked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {text}
    </label>
  )
}
