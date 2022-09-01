import * as React from 'react';
import * as auth from 'auth-provider';
import { useAsync } from 'utils/hooks';
import { client } from 'utils/api-client';
import { FullPageErrorFallback, FullPageSpinner } from 'components/lib';

async function getUser() {
  let user = null

  const token = await auth.getToken()
  if (token) {
    const data = await client('me', {token})
    user = data.user
    }

  return user
}

const AuthContext = React.createContext();
AuthContext.displayName = 'AuthContext'

function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error(`an AuthContext is required to use its value, please wrap the Component you're trying to use in an AuthProvider`);
  }

  return context;
}

function AuthProvider(props) {
  const {
    data: user,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
  } = useAsync();

  React.useEffect(() => {
    run(getUser())
  }, [run])

  const login = form => auth.login(form).then(user => setData(user));
  const register = form => auth.register(form).then(user => setData(user));
  const logout = () => {
    auth.logout();
    setData(null);
  };


  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />
  }
  const value = { user, login, register, logout };

  if (isSuccess) {
  return <AuthContext.Provider value={value} {...props}/>
  }
}

function useClient() {
  const token = useAuth().user.token
  return React.useCallback((endpoint, config) => client(endpoint, {...config, token})
  , [token])
}

export { AuthContext, useAuth, AuthProvider, useClient };