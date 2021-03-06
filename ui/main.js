/* xeslint-disable */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Router from 'vue-router';
import VueGoodTable from 'vue-good-table';
import JsonTree from 'vue-json-tree';
Vue.component('json-tree', JsonTree);

import App from './App.vue';
import Home from '@/components/Home.vue';
import Navbar from '@/components/Navbar.vue';
import About from '@/components/About.vue';
import Node from '@/components/Node.vue';
import NodeCard from '@/components/NodeCard.vue';
import MonarchLegacy from '@/components/MonarchLegacy.vue';

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

let router = null;

function pathLoadedAsync(sourceText, responseURL, path, done) {
  if (done) {
    done(sourceText, responseURL);
  }
  else {
    console.log('pathLoadedAsync', responseURL, path, sourceText.slice(0, 100));
  }
}


function loadPathContentAsync(path, done) {
  /* global XMLHttpRequest */
  const oReq = new XMLHttpRequest();
  oReq.addEventListener('load', function load() {
    // console.log('loadPathContentAsync', path, this);
    pathLoadedAsync(this.responseText, this.responseURL, path, done);
  });

  let refinedPath = path;
  if (refinedPath.indexOf('/') === 0) {
    refinedPath = '/legacy' + refinedPath;
  }

  // const hashIndex = refinedPath.indexOf('#');
  // if (hashIndex >= 0) {
  //   refinedPath = refinedPath.slice(0, hashIndex) + '?stripme' + refinedPath.slice(hashIndex);
  // }
  // else {
  //   refinedPath += '?stripme';
  // }
  oReq.open('GET', refinedPath);
  oReq.send();
}


/* global window */
window.loadPathContentAsync = loadPathContentAsync;

// window.addEventListener('popstate', function pop(event) {
//   console.log('popstate fired!');
//   console.log('location: ' + document.location + ', state: ' + JSON.stringify(event.state));
// });


const main = () => {
  Vue.config.productionTip = false;
  Vue.use(Router);
  Vue.use(VueGoodTable);

  Vue.component('monarch-navbar', Navbar);
  Vue.component('node-card', NodeCard);

  router = new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        name: 'Home',
        component: Home
      },
      {
        path: '/page/aboutSPA',
        name: 'AboutSPA',
        component: About
      },
      {
        path: '/disease/:id',
        name: 'DiseaseNode',
        component: Node
      },
      {
        path: '/phenotype/:id',
        name: 'PhenotypeNode',
        component: Node
      },
      {
        path: '/gene/:id',
        name: 'GeneNode',
        component: Node
      },
      {
        path: '/model/:id',
        name: 'ModelNode',
        component: Node
      },
      {
        path: '/*',
        name: 'MonarchLegacy',
        component: MonarchLegacy
      },
    ]
  });


  router.locationChangeHack = function(url) {
    console.log('locationChangeHack loadPathContentAsync', url);
    loadPathContentAsync(url);
  };

//
// Adapted from Navigo - https://github.com/krasimir/navigo
//
// the html to: <a href="javascript:void(0);" data-navigo>About</a>
      // var location = link.getAttribute('href');
      // ...
      // link.addEventListener('click', e => {
      //   e.preventDefault();
      //   router.navigate(location);
      // });

  router.updatePageLinks = function updatePageLinks() {
    function findLinks() {
      return [].slice.call(document.querySelectorAll('[data-monarch-legacy]'));
    }

    function getLinkPath(link) {
      return link.pathname || link.getAttribute('href');
    }

    var self = this;

    findLinks().forEach(link => {
      if (!link.hasListenerAttached) {
        // console.log('link:', link, getLinkPath(link));
        link.addEventListener('click', function (e) {
          var location = getLinkPath(link);

          location = location
                .replace(/\/+$/, '')
                .replace(/^\/+/, '/');

          // console.log('click', location, self._destroyed);
          if (!self._destroyed) {
            e.preventDefault();
            self.push(location);
          }
        });
        link.hasListenerAttached = true;
      }
    });
  };


  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
  });

  window.vueRouter = router;

  const { document } = global;
  if (document && document.querySelector) {
    const testRequireEnsureLink = document.querySelector('.test-require-ensure');
    const logos = global.document.querySelectorAll('.fidget-spinner');

    testRequireEnsureLink.addEventListener('click', () => {
      console.log('testRequireEnsureLink');
      // the following won't be included in the original build but
      // will be lazy loaded only when needed
      import('./scripts/css-utils.js')
        .then(module => {
          const { toggleCssClassName } = module;
          toggleCssClassName(logos[0], 'rotate');
          toggleCssClassName(logos[1], 'rotate');
          toggleCssClassName(testRequireEnsureLink, 'active');
        })
        .catch(error => console.error('Chunk loading failed', error));
    });
  }
};

main();

