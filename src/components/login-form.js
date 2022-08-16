import * as React from 'react'

export function LoginForm({ onSubmit, buttonText }) {

  function onFormSubmit(e) {
    e.preventDefault()

    const inputs = e.target.elements
    
    onSubmit({
      username: inputs.username.value,
      password: inputs.password.value,
    })
  }

  return (
    <form onSubmit={onFormSubmit}>
      <div className="username">
        <label>
          Username
          <input type="text" name="username" />
        </label>
      </div>
      <div className="password">
        <label>
          Password
          <input type="password" name="password" />
        </label>
      </div>
      <div className="submit">
        <input type="submit" value={buttonText} />
      </div>
    </form>
  );
}