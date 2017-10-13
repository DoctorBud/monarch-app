/* eslint-disable */

/* This is how you use the environments variables passed by the webpack.DefinePlugin */

import 'jquery';
import 'bootstrap';
import 'bootstrap-sass';
import Navigo from 'navigo';

/**
 * The linter can be disabled via LINTER=false env var
 *  - show a message in console to inform if it's on or off
 * Won't show in production
 */
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.LINTER) {
    console.warn('Linter disabled, make sure to run your code against the linter, otherwise, if it fails, your commit will be rejected.');
  }
  else {
    console.info('Linter active, if you meet some problems, you can still run without linter, just set the env var LINTER=false.');
  }
}
else if (process.env.DEVTOOLS) {
  console.info('Turn on the "Sources" tab of your devtools to inspect original source code - thanks to sourcemaps!');
}

/**
 * You could setup some mocks for tests
 * Won't show in production
 */
if (process.env.NODE_ENV === 'mock') {
  console.info('MOCK mode');
}

if (process.env.DEVTOOLS && process.env.NODE_ENV !== 'production') {
  console.info(`You're on DEVTOOLS mode, you may have access to tools enhancing developer experience - off to you to choose to disable them in production ...`);
}

var router = null;
var progressTimer = null;

function pathLoaded(sourceText, path) {
  console.log('###pathLoaded', path, sourceText.slice(100, 300));
  if (progressTimer) {
    clearTimeout(progressTimer);
    progressTimer = null;
  }

  var dom = document.getElementById('monarch-content-fragment');
  if (dom) {
    dom.innerHTML = sourceText;
    if (router) {
      console.log('###router.updatePageLinks');
      router.updatePageLinks();
    }
    var launchablesScript = document.getElementById('monarch-launchables');
    if (launchablesScript) {
      var text = launchablesScript.text;
      console.log('path launchables', text);
      if (text) {
        if (text.indexOf('/* monarch-launchable-safety-check */') === 0) {
          eval(text);
        }
      }
      else {
        console.log('no monarch-launchables text for', path);
      }
    }
    else {
      console.log('no monarch-launchables script for', path);
    }
  }
}



function loadPathContent(path) {
  if (progressTimer) {
    console.log('leftover progressTimer');
  }
  else {
    var dom = document.getElementById('monarch-content-fragment');
    dom.innerHTML = '';
    progressTimer = setTimeout(function() {
      if (dom && dom.innerHTML === '') {
        progressTimer = null;
        dom.innerHTML =
`<br>
<br>
<br>
<div class="progress">
  <div
    class="progress-bar progress-bar-striped active"
    role="progressbar"
    aria-valuenow="40"
    aria-valuemin="0"
    aria-valuemax="100"
    style="width:100%;margin:auto;">Loading <b>${path}</b>
  </div>
</div>
`;
      }
    }, 500);
  }

  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load', function () {
    pathLoaded(this.responseText, path);
  });

  console.log('##loadPathContent', path);
  if (path === '/spa') {
    path = '/';
  }
  path += '?stripme';
  oReq.open('GET', path);
  oReq.send();
}
window.loadPathContent = loadPathContent;

window.addEventListener('popstate', function(event) {
  console.log('popstate fired!');
  console.log('location: ' + document.location + ', state: ' + JSON.stringify(event.state));
});

const main = () => {
  console.log('monarch', monarch);
  window.monarch.dovechart.locationChangeHack = function(url) {
    loadPathContent(url);
  };

  var root = null;
  var useHash = false; // Defaults to: false
  var hash = '#!'; // Defaults to: '#'
  router = new Navigo(root);  // , useHash, hash);
  // https://github.com/krasimir/navigo
  router
    .on(function () {
      let path = window.location.pathname;
      // if (path === '') {
      //   path = '/home';
      // }
      console.log('router: path: ', path);
      loadPathContent(path);
    })
    .resolve();

  router
    .on('*', function (params, query) {
      let url = router.lastRouteResolved().url;
      console.log('router: *:', router, this, params, query, url);
      if (url === '') {
        url = '/';
      }
      router.pause();
      router.navigate(url, true);
      router.resume();
      loadPathContent(url);
    })
    .resolve();

  // router
  //   .on('/home', function () {
  //     console.log('router: /home');
  //     loadPathContent('/home');
  //   })
  //   .resolve();

  // router
  //   .on('/disease', function () {
  //     console.log('router: /disease');
  //     loadPathContent('/disease');
  //   })
  //   .resolve();

  // router
  //   .on('/analyze/:id', function (params) {
  //     console.log('router: /analyze/:id', params);
  //     loadPathContent(`/analyze/${params.id}`);
  //   })
  //   .resolve();

  // router
  //   .on('/disease/:id', function (params) {
  //     console.log('router: /disease/:id', params);
  //     loadPathContent(`/disease/${params.id}`);
  //   })
  //   .resolve();

  window.addEventListener('popstate', function(event) {
    console.log('popstate fired!', event);
    event.preventDefault();
  });

  const { document } = global;
  if (document && document.querySelector) {
    const testRequireEnsureLink = document.querySelector('.test-require-ensure');
    const logo = global.document.querySelector('.logo');

    testRequireEnsureLink.addEventListener('click', () => {
      console.log('testRequireEnsureLink');
      // the following won't be included in the original build but
      // will be lazy loaded only when needed
      import('./scripts/css-utils.js')
        .then(module => {
          const { toggleCssClassName } = module;
          toggleCssClassName(logo, 'rotate');
          toggleCssClassName(testRequireEnsureLink, 'active');
        })
        .catch(error => console.error('Chunk loading failed', error));
    });
  }
};

main();

