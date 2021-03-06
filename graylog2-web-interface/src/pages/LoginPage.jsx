import React, { useContext, useEffect, useState } from 'react';
import { PluginStore } from 'graylog-web-plugin/plugin';

import { DocumentTitle, Icon } from 'components/common';
import { Alert } from 'components/graylog';
import LoginForm from 'components/login/LoginForm';
import LoginBox from 'components/login/LoginBox';
import authStyles from 'theme/styles/authStyles';
import CombinedProvider from 'injection/CombinedProvider';
import { GlobalStylesContext } from 'contexts/GlobalStylesProvider';

import LoadingPage from './LoadingPage';

const { SessionActions } = CombinedProvider.get('Session');

const LoginPage = () => {
  const [didValidateSession, setDidValidateSession] = useState(false);
  const [lastError, setLastError] = useState(undefined);
  const { addGlobalStyles } = useContext(GlobalStylesContext);

  useEffect(() => {
    const sessionPromise = SessionActions.validate().then((response) => {
      addGlobalStyles(authStyles);
      setDidValidateSession(true);

      return response;
    });

    return () => {
      sessionPromise.cancel();
      addGlobalStyles(null);
    };
  }, []);

  const resetLastError = () => {
    setLastError(undefined);
  };

  const formatLastError = () => {
    if (lastError) {
      return (
        <div className="form-group">
          <Alert bsStyle="danger">
            <button type="button" className="close" onClick={resetLastError}>&times;</button>{lastError}
          </Alert>
        </div>
      );
    }

    return null;
  };

  const renderLoginForm = () => {
    const loginComponent = PluginStore.exports('loginProviderType');

    if (loginComponent.length === 1) {
      return React.createElement(loginComponent[0].formComponent, {
        onErrorChange: setLastError,
      });
    }

    return <LoginForm onErrorChange={setLastError} />;
  };

  if (!didValidateSession) {
    return (
      <LoadingPage />
    );
  }

  return (
    <DocumentTitle title="Sign in">
      <LoginBox>
        <legend><Icon name="users" /> Welcome to Graylog</legend>
        {formatLastError()}
        {renderLoginForm()}
      </LoginBox>
    </DocumentTitle>
  );
};

export default LoginPage;
