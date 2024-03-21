import React, { useState, ForwardedRef, forwardRef } from 'react'

import cn from 'classnames'

type Props = {
  searchable?: boolean
  rightIcon?: JSX.Element
  className?: string
  inputClassName?: string
  readOnly?: boolean
} & React.ComponentProps<'input'>

export const Input: React.FC<Props> = forwardRef(
  (
    {
      searchable = false,
      rightIcon = null,
      onFocus,
      onBlur,
      className,
      inputClassName,
      readOnly = false,
      ...rest
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const [isInputEmpty, setIsInputEmpty] = useState(true)

    const handleFocus = (e: any) => {
      if (onFocus) {
        onFocus(e)
      }
    }

    const handleBlur = (e: any) => {
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
        {rightIcon && rightIcon}
      </div>
    )
  },
)
