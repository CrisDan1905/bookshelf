/** @jsx jsx */
import { jsx } from '@emotion/core';

import * as React from 'react';
// 🐨 you're going to need this:
import * as auth from 'auth-provider';
import { AuthenticatedApp } from './authenticated-app';
import { UnauthenticatedApp } from './unauthenticated-app';
import { client } from 'utils/api-client.exercise';
import { useAsync } from 'utils/hooks';
import { FullPageSpinner } from 'components/lib';
import * as colors from './styles/colors'

function App() {
  const {
    data,
    error,
    isIdle,
    isLoading,
    isSuccess,
    isError,
    run,
    setData,
  } = useAsync();

  const login = form => run(auth.login(form));
  const registration = form => run(auth.register(form));
  const logout = () => {
    auth.logout();
    setData(null);
  };

  React.useEffect(() => {
    run((async () => {
      let user
      const token = await auth.getToken();

      if (token) {
        const data = await client('me', { token });
        user = data.user
      }

      return user
    })());
  }, [setData, run]);

  if (isIdle || isLoading) {
    return <FullPageSpinner />;
  } else if (isSuccess) {
    return data ? <AuthenticatedApp logout={logout} user={data} /> : <UnauthenticatedApp login={login} register={registration} />;
  } else {
    return <div
      css={{
        color: colors.danger,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p>Uh oh... There's a problem. Try refreshing the app.</p>
      <pre>{error.message}</pre>
    </div>;
  }

}

export { App };

/*
eslint
  no-unused-vars: "off",
*/
