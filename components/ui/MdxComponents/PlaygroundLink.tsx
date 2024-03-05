import React from 'react'

type Props = {
  href: string
}

export const PlaygroundLink: React.FC<Props> = ({ href }: Props) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 py-2 hover:underline"
  >
    Reproduce in playground.
  </a>
)
