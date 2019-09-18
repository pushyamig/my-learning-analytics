import React from 'react'

function Label (props) {
  const {
    left,
    color,
    labelUp,
    labelDown,
    labelText
  } = props

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        color,
        left,
        zIndex: 1,
        top: labelDown ? '50px' : labelUp ? '-20px' : 0
      }}
    >
      {labelText}
    </div>
  )
}

export default Label
