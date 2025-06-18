/* eslint-disable jsx-a11y/alt-text */
import cx from 'classnames'
import { useState } from 'react'
import Image from 'next/image'

export default function FaviconsPlaygroundPage() {
  const [toggle, setToggle] = useState(false)
  return [
    'favicon',
    'favicon-mini',
    'favicon-frame',
    'favicon-white',
    'favicon-rounded',
  ].map((icon) => (
    <div
      key={icon}
      onClick={() => setToggle((toggle) => !toggle)}
      className={cx(
        'grid place-content-evenly items-center grid-flow-col p-32',
        { 'bg-gray-900': toggle }
      )}
    >
      <Image src={`/${icon}-64w.png`} height={16} width={16} alt={`${icon} favicon PNG 16px`} />
      <Image src={`/${icon}-64w.png`} height={32} width={32} alt={`${icon} favicon PNG 32px`} />
      <Image src={`/${icon}-64w.png`} height={64} width={64} alt={`${icon} favicon PNG 64px`} />
      <Image src={`/${icon}.svg`} height={16} width={16} alt={`${icon} favicon SVG 16px`} />
      <Image src={`/${icon}.svg`} height={32} width={32} alt={`${icon} favicon SVG 32px`} />
      <Image src={`/${icon}.svg`} height={64} width={64} alt={`${icon} favicon SVG 64px`} />
    </div>
  ))
}
