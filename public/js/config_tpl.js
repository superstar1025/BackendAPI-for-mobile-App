// config
app.config(['$httpProvider', '$translateProvider', 'growlProvider', 'blockUIConfig', '$authProvider',
  function($httpProvider, $translateProvider, growlProvider, blockUIConfig, $authProvider) {

    $authProvider.authHeader = 'Authorization';
    $authProvider.httpInterceptor = true;
    $authProvider.tokenName = 'token';
    $authProvider.loginUrl = '/api/signin';
    $authProvider.loginRedirect = '/';
    $authProvider.tokenPrefix = 'user';

    $authProvider.google({
      clientId: '@@googleClientId'
    });

    // Google
    $authProvider.google({
      url: '/auth/google',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
      scope: ['profile', 'email'],
      scopePrefix: 'openid',
      scopeDelimiter: ' ',
      requiredUrlParams: ['scope'],
      optionalUrlParams: ['display'],
      display: 'popup',
      type: '2.0',
      popupOptions: {width: 580, height: 400}
    });

    $authProvider.facebook({
      clientId: '@@facebookClientId'
    });

    // Facebook
    $authProvider.facebook({
      url: '/auth/facebook',
      authorizationEndpoint: 'https://www.facebook.com/dialog/oauth',
      redirectUri: window.location.origin ?  window.location.origin + '/' :
                   window.location.protocol + '//' + window.location.host + '/',
      scope: 'email',
      scopeDelimiter: ',',
      requiredUrlParams: ['display', 'scope'],
      display: 'popup',
      type: '2.0',
      popupOptions: { width: 481, height: 269 }
    });

    // Register a loader for the static files
    // So, the module will search missing translation tables under the specified urls.
    // Those urls are [prefix][langKey][suffix].
    $translateProvider.useStaticFilesLoader({
      prefix: 'l10n/',
      suffix: '.js'
    });
    // Tell the module what language to use by default
    $translateProvider.preferredLanguage('en');
    // Tell the module to store the language in the local storage
    $translateProvider.useLocalStorage();

    //growlProvider.globalPosition('top-right');
    growlProvider.globalTimeToLive(3500);

    blockUIConfig.delay = 0;
    blockUIConfig.autoBlock = false;
    blockUIConfig.templateUrl = '/tpl/wave-spinner.html';
  }]);
