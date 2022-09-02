/** @jsx jsx */
import {jsx} from '@emotion/core'

import VisuallyHidden from '@reach/visually-hidden';
import React from 'react'
import {CircleButton, Dialog} from './lib'

const callAll = (...fns) => (...args) => fns.forEach(fn => fn?.(...args))

const ModalContext = React.createContext()

function Modal(props) {
  const [isOpen, setOpen] = React.useState(false)
  const modalContextData = {isOpen, setOpen}

  return <ModalContext.Provider value={modalContextData} {...props}/>
}

function ModalDismissButton({children: child}) {
  const {setOpen} = useModalContext()

  return React.cloneElement(child, {
    onClick: callAll(child.props.onClick, () => setOpen(false))
  })
}

function ModalOpenButton({children: child}) {
  const {setOpen} = useModalContext()

  return React.cloneElement(child, {
    onClick: callAll(child.props.onClick, () => setOpen(true))
  })
}

function ModalContentsBase(props) {
  const {isOpen, setOpen} = useModalContext()
  return <Dialog isOpen={isOpen} onDismiss={() => setOpen(false)} {...props}/>
}

function ModalContents({children, modalTitle, ...props}) {
  return <ModalContentsBase {...props}>
    <ModalDismissButton>
      <div css={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CircleButton>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </CircleButton>
      </div>
    </ModalDismissButton>
    <h3 css={{ textAlign: 'center', fontSize: '2em' }}>{modalTitle}</h3>
    {children}
  </ModalContentsBase>;
}

function useModalContext() {
  const context = React.useContext(ModalContext)

  if (!context) {
    throw new Error('You are trying to get a value context without Modal Context. Please wrap your component into a ModalContext')
  }

  return context
}

export {Modal, ModalDismissButton, ModalOpenButton, ModalContents, ModalContentsBase}
