import Dialog from '@reach/dialog';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Logo } from './components/logo';
import { LoginForm } from 'components/login-form';
import "@reach/dialog/styles.css";

function App() {
  const [openModal, setOpenModal] = React.useState('none')
  
  function handleSubmit(formData) {
    console.log('login', formData)
  }

  return (
    <>
      <Logo height='80' width='80'></Logo>
      <h1>Bookshelf</h1>
      <div>
        <button onClick={() => setOpenModal('login')}>Login</button>
      </div>
      <div>
        <button onClick={() => setOpenModal('register')}>Register</button>
      </div>
      <Dialog aria-label='login form' isOpen={openModal === 'login'}>
        <div>
          <button onClick={() => setOpenModal('none')}>Close</button>
        </div>
        <h3>Login</h3>
        <LoginForm onSubmit={(formData) => console.log('login', formData)} buttonText="Login"></LoginForm>
      </Dialog>
      <Dialog aria-label='registration form' isOpen={openModal === 'register'}>
        <div>
            <button onClick={() => setOpenModal('none')}>Close</button>
            <h3>Register</h3>
          </div>
          <LoginForm onSubmit={(formData) => console.log('Register', formData)} buttonText="Register"></LoginForm>
      </Dialog>
    </>
  );
}

const domContainer = document.getElementById('root');
const root = createRoot(domContainer);
root.render(<App />);

export { root };
