import { keyframes } from '@emotion/core';
import styled from '@emotion/styled/macro'
import {Dialog as ReachDialog} from '@reach/dialog'
import { FaSpinner } from 'react-icons/fa';
import * as colors from 'styles/colors'
import * as mq from 'styles/media-queries'

const Button = styled.button((props) => (`
  background-color: ${props.variant === 'secondary' ? colors.indigo : colors.orange};
    color: ${colors.base};
    border: none;
    padding: 0.5rem 2rem;
    border-radius: 0.2rem;
`))

const Input = styled.input`
  padding: 0.4rem 0.7rem;
  background: ${colors.gray};
  border: none;
  font-size: .87rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const spin = keyframes({
  '0%': {transform: 'rotate(0deg)'},
  '100%': {transform: 'rotate(360deg)'},
})

const Spinner = styled(FaSpinner)({
  animation: `${spin} 1s linear infinite`,
})
Spinner.defaultProps = {
  'aria-label': 'loading',
}

console.log(Spinner)

// 💰 I'm giving a few of these to you:
const CircleButton = styled.button({
  borderRadius: '30px',
  padding: '0',
  width: '40px',
  height: '40px',
  lineHeight: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: colors.base,
  color: `${colors.text}`,
  border: `1px solid ${colors.gray10}`,
  cursor: 'pointer',
})

const Dialog = styled(ReachDialog)({
  maxWidth: '450px',
  borderRadius: '3px',
  paddingBottom: '3.5em',
  boxShadow: `0 10px 30px -5px ${colors.gray80}`,
  margin: '20vh auto',
  [mq.small]: {
    width: '100%',
    margin: '10vh auto',
  },
})

export {CircleButton, Dialog, Button, Input, FormGroup, Spinner}
