import React, { useState, useRef }  from 'react'
import { useIdleTimer } from 'react-idle-timer'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import List from '@material-ui/core/List'
import LogoutIcon from '@material-ui/icons/ExitToApp'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

function IdleTimer (props) {
  const { startTimer } = props

  const [modalIsOpen, setmodalIsOpen] = useState(false)

  const onIdle = () => {
    console.log('User is idle')
    setmodalIsOpen(true)
  }
  const handleClose = () => {
    reset()
    setmodalIsOpen(false)
    console.log('User is logged out')
  }

  const stayActive = () => {
    setmodalIsOpen(false)
    reset()
    console.log('User is active')
  }
  
  const {reset, activate} = useIdleTimer({ onIdle, timeout: 10 * 1000 })
  return (
    <div>
    <Dialog aria-labelledby="simple-dialog-title" open={modalIsOpen}>
      <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle>
      {/* <Button
          variant='contained'
          onClick={handleClose}
          
          aria-label='clear'
        >
          Logout
        </Button> */}
        <Link  href='/accounts/logout/'>
                    <ListItem button>
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText inset primary='Logout' />
                    </ListItem>
                  </Link>
        <Button
          variant='contained'
          onClick={stayActive}
        >
          Stay Active
        </Button>
    </Dialog>
    </div>
  )
}

export default IdleTimer