import React, { useState, ForwardedRef, forwardRef } from 'react'

import cn from 'classnames'

type Props = {
  searchable?: boolean
  ref?: ForwardedRef<HTMLInputElement>
  className?: string
  inputClassName?: string
  readOnly?: boolean
} & React.ComponentPropsWithoutRef<'input'>

export const Input: React.FC<Props> = forwardRef(
  (
    {
      searchable = false,
      onFocus,
      onBlur,
      className,
      inputClassName,
      readOnly = false,
      ...rest
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isInputEmpty, setIsInputEmpty] = useState(true)

    const handleFocus = (e: any) => {
      setIsFocused(true)
      if (onFocus) {
        onFocus(e)
      }
    }

    const handleBlur = (e: any) => {
      setIsFocused(false)
      if (onBlur && e) {
        onBlur(e)
      }
    }

    const handleInput = (e: any) => {
      if (e.target.value === '') {
        setIsInputEmpty(true)
      } else {
        setIsInputEmpty(false)
      }
    }

    return (
      <div
        className={cn(
          'flex items-center rounded px-3 py-2 text-sm relative',
          {
            shadow: isFocused,
          },
          className,
        )}
      >
        <input
          ref={ref}
          readOnly={readOnly}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          className={`${inputClassName} w-full outline-none bg-transparent dark:placeholder-black-100`}
          {...rest}
        />
        {searchable && (
          <>
            {isInputEmpty && (
              <span className="text-black-400 absolute right-8">Alt+K</span>
            )}
          </>
        )}
      </div>
    )
  },
)
