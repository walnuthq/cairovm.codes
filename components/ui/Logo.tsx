import Image from 'next/image'
import cairoLogo from 'public/cairo_logo.png'

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
      <span className="pr-2">cairovm</span>
      <Image src={cairoLogo} width={20} height={20} />
      <span className="pl-2">codes</span>
    </div>
  )
}
