<template>
<div id="selenium_id_content">

<div class="wrapper">

  <!-- Sidebar Holder -->
  <nav id="sidebar" v-bind:class="{ active: isActive }">
    <div class="sidebar-header">
      <b class="sidebar-header-title">Sidebar</b>
      <button
        id="sidebarCollapse"
        v-on:click="toggleSidebar()"
        class="btn btn-info">
          <i class="glyphicon glyphicon-align-left"></i>
      </button>
    </div>

    <div class="sidebar-content">
      <div class="row superclass" v-for="c in superclasses">
        <div class="col-xs-8">
          {{c.label}}
        </div>
        <div class="col-xs-4">
          ({{c.id}})
        </div>
      </div>

      <div class="row currentclass">
        <div class="col-xs-8">
          {{node.labels[0]}}
        </div>
        <div class="col-xs-4">
          ({{node.id}})
        </div>
      </div>

      <div class="row subclass" v-for="c in subclasses">
        <div class="col-xs-8">
          {{c.label}}
        </div>
        <div class="col-xs-4">
          ({{c.id}})
        </div>
      </div>
    </div>
  </nav>

  <div
    id="main"
    v-if="node != null"
    class="container-fluid node-container">

    <div class="row">
      <div class="col-xs-1">
        <a
          target="_blank"
          v-bind:href="'http://beta.monarchinitiative.org' + path">
          <img class="node-logo" :src="nodeIcon"/>
        </a>
      </div>

      <div class="col-xs-11 node-title">
        <h4>{{node.labels[0]}} ({{node.id}})</h4>
      </div>
    </div>

    <div class="row">
      <div class="col-xs-12">
        <h5>{{node.definitions[0]}}</h5>
      </div>
    </div>

    <hr>

    <div class="row" v-for="equivalentClass in equivalentClasses">
      <div class="col-xs-8">
        {{equivalentClass.label}}
      </div>
      <div class="col-xs-4">
        ({{equivalentClass.id}})
      </div>
    </div>


    <div class="row" v-if="node.relationships">
      <vue-good-table
        class="table table-stripped table-bordered condensed"
        title="Relationships"
        :defaultSortBy="{field: 'property.id', type: 'asc'}"
        :columns="relationshipsColumns"
        :rows="node.relationships"
        :paginate="false"
        :lineNumbers="false">

        <template slot="table-row" slot-scope="props">
          <td class="fancy">{{ props.row.subject.label }} ({{ props.row.subject.id }})</td>
          <td class="fancy">{{ props.row.property.label }} ({{ props.row.property.id }})</td>
          <td class="fancy">{{ props.row.object.label }} ({{ props.row.object.id }})</td>
          <td class="has-text-right">{{ props.row.source }}</td>
        </template>
      </vue-good-table>

    </div>
    <div class="overlay"></div>

<!--
    <div class="row pre-scrollable well well-sm">
      <div class="col-xs-12">
        <tree-view :data="node" :options="{rootObjectKey: '', maxDepth: 1}">
        </tree-view>
      </div>
    </div>
-->
  </div>
</div>

</div>
</template>

<script>

import _ from 'underscore';

function pathLoadedAsync(sourceText, responseURL, path, done) {
  if (done) {
    done(sourceText, responseURL);
  }
  else {
    console.log('pathLoadedAsync', responseURL, path, sourceText.slice(0, 100));
  }
}


function loadPathContentAsync(path, done) {
  console.log('loadPathContentAsync', path);
  /* global XMLHttpRequest */
  const oReq = new XMLHttpRequest();
  oReq.addEventListener('load', function load() {
    console.log('loadPathContentAsync', path, this);
    pathLoadedAsync(this.responseText, this.responseURL, path, done);
  });

  let refinedPath = path;

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


const icons = {
  disease: require('../../image/carousel-diseases.png'),
  gene: require('../../image/carousel-genes.png'),
  Phenotype: require('../../image/carousel-phenotypes.png'),
  model: require('../../image/carousel-models.png'),
};

export default {
  name: 'home',
  mounted() {
    // $('#dismiss, .overlay').on('click', function () {
    //     $('#sidebar').removeClass('active');
    //     $('.overlay').fadeOut();
    // });

    // $('#sidebarCollapse').on('click', function () {
    //     $('#sidebar').addClass('active');
    //     $('.overlay').fadeIn();
    //     $('.collapse.in').toggleClass('in');
    //     $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    // });

    this.fetchData();
  },
  watch: {
    '$route' (to, from) {
      // Only fetchData if the path is different.
      // hash changes are currently handled by monarch-tabs.js
      // within the loaded MonarchLegacy component.

      console.log('$route', to, from, to.path, this.path);
      if (to.path !== this.path) {
        this.fetchData();
      }
    }
  },
  data () {
    return {
      isActive: false,
      node: null,
      equivalentClasses: null,
      subclasses: null,
      contentScript: '',
      contentBody: '',
      progressTimer: null,
      progressPath: null,
      path: null,
      nodeID: null,
      nodeIcon: null,

      relationshipsColumns: [
        {
          label: 'Subject',
          field: 'subject.id'
        },
        {
          label: 'Property',
          field: 'property.id'
        },
        {
          label: 'Object',
          field: 'object.id'
        },
        {
          label: 'Source',
          field: 'source'
        }
      ],
    }
  },


  methods: {
    toggleSidebar() {
      console.log('toggleSidebar');
      this.isActive = !this.isActive;
    },

    parseNodeContent(content) {
      var that = this;
      this.node = JSON.parse(content);
      var equivalentClasses = [];
      var superclasses = [];
      var subclasses = [];
      if (this.node.relationships) {
        this.node.relationships.forEach(relationship => {
          if (relationship.property.id === 'subClassOf') {
            if (relationship.subject.id === this.nodeID) {
              superclasses.push(relationship.object);
            }
            else if (relationship.object.id === this.nodeID) {
              subclasses.push(relationship.subject);
            }
            else {
              console.log('parseNodeContent ERROR', relationship);
            }
          }
          else if (relationship.property.id === 'equivalentClass') {
            equivalentClasses.push(relationship.subject);
          }
        });
      }

      this.superclasses = _.uniq(superclasses, function(item, key, list) {
        return JSON.stringify(item);
      });
      this.subclasses = _.uniq(subclasses, function(item, key, list) {
        return JSON.stringify(item);
      });
      this.equivalentClasses = _.uniq(equivalentClasses, function(item, key, list) {
        return JSON.stringify(item);
      });

      this.nodeIcon = icons[this.node.categories[0]];
    },

    fetchData() {
      const that = this;
      const path = that.$route.fullPath;
      this.path = that.$route.path;
      this.nodeID = this.$route.params.id;

      if (that.progressTimer) {
        console.log('leftover progressTimer');
      }
      else {
        that.progressPath = null;
        that.progressTimer = setTimeout(function timeout() {
          that.progressTimer = null;
          that.progressPath = path;
          that.node = null;
        }, 500);
      }
      console.log('fetchData', path);
      that.node = null;
      var url = `${that.path}.json`;
      loadPathContentAsync(url, function(content, responseURL) {
        that.parseNodeContent(content);
        console.log('that.node', that.node);
        that.$nextTick(function() {
          if (that.progressTimer) {
            clearTimeout(that.progressTimer);
            that.progressTimer = null;
          }
          that.progressPath = null;
        });
      });
    }
  }

}

</script>

<style lang="scss">
@import "../../css/_prelude.scss";

.node-container {
}

.node-container img.node-logo {
  margin: 0 0 0 0;
  padding: 0;
  height: 30px !important;
}

.node-container .node-title {
  background: darkgray;
  color: white;
}



/* ---------------------------------------------------
    SIDEBAR STYLE
https://bootstrapious.com/tutorial/files/sidebar.zip
https://bootstrapious.com/p/bootstrap-sidebar
----------------------------------------------------- */

#sidebar a,
#sidebar a:hover,
#sidebar a:focus {
  color: inherit;
  text-decoration: none;
  transition: all 0.3s;
}



#sidebar a img.sidebar-logo {
  margin: 0 0 0 0;
  padding: 0;
  height: 30px !important;
}

.wrapper {
  display: flex;
  align-items: stretch;
  min-height: 100%;
  width: 100%;
  margin: ($navbar-height + 3) 0 2px 0;
  padding: 0;
}

.wrapper .container-fluid.monarch-container {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

#sidebarCollapse {
  float: right;
  top: 2px;
  right: 3px;
}


/*
#sidebar {
    min-width: 250px;
    max-width: 250px;
    background: #7386D5;
    color: #fff;
    transition: all 0.3s;
}

#sidebar.active {
    min-width: 80px;
    max-width: 80px;
    text-align: center;
}
*/


$sidebar-width: 600px;

#sidebar {
  width: $sidebar-width;
  position: fixed;
  top: ($navbar-height + 3);
  left: (-$sidebar-width + 45);
  xheight: 80vh;
  min-height: 40px;
  z-index: 999;
  color: #fff;
  transition: all 0.3s;
  overflow-y: auto;
  overflow-x: auto;
}

#sidebar.active {
    left: 0;
}

#sidebar .sidebar-content {
  display:none;
  width: ($sidebar-width - 20);
  margin: 0;
  background: #7386D5;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2);
}

#sidebar.active .sidebar-content {
  display:block;
}

#sidebar .sidebar-content .superclass {
  margin-left: 0;
}

#sidebar .sidebar-content .currentclass {
  font-weight: 600;
  margin-left: 15px;
}

#sidebar .sidebar-content .subclass {
  margin-left: 30px;
}


#dismiss {
    width: 35px;
    height: 35px;
    line-height: 35px;
    text-align: center;
    background: #7386D5;
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    -webkit-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
}
#dismiss:hover {
    background: #fff;
    color: #7386D5;
}

.overlay {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    z-index: 998;
    display: none;
}

#sidebar .sidebar-header-title {
  display: none;
}

#sidebar.active .sidebar-header-title {
  display: initial;
}

#sidebar.active .sidebar-header h3,
#sidebar.active .CTAs {
    display: none;
}

#sidebar.active .sidebar-header strong {
    display: block;
}

#sidebar ul li a {
    text-align: left;
}

#sidebar.active ul li a {
    padding: 20px 10px;
    text-align: center;
    font-size: 0.85em;
}

#sidebar.active ul li a i {
    margin-right:  0;
    display: block;
    font-size: 1.8em;
    margin-bottom: 5px;
}

#sidebar.active ul ul a {
    padding: 10px !important;
}

#sidebar.active a[aria-expanded="false"]::before, #sidebar.active a[aria-expanded="true"]::before {
    top: auto;
    bottom: 5px;
    right: 50%;
    -webkit-transform: translateX(50%);
    -ms-transform: translateX(50%);
    transform: translateX(50%);
}

#sidebar .sidebar-header {
    padding: 0;
    background: #6d7fcc;
}

#sidebar .sidebar-header strong {
    display: none;
    font-size: 1.8em;
}

#sidebar ul.components {
    padding: 20px 0;
    border-bottom: 1px solid #47748b;
}

#sidebar ul li a {
    padding: 10px;
    font-size: 1.1em;
    display: block;
}
#sidebar ul li a:hover {
    color: #7386D5;
    background: #fff;
}
#sidebar ul li a i {
    margin-right: 10px;
}

#sidebar ul li.active > a, a[aria-expanded="true"] {
    color: #fff;
    background: #6d7fcc;
}


a[data-toggle="collapse"] {
    position: relative;
}

a[aria-expanded="false"]::before, a[aria-expanded="true"]::before {
    content: '\e259';
    display: block;
    position: absolute;
    right: 20px;
    font-family: 'Glyphicons Halflings';
    font-size: 0.6em;
}
a[aria-expanded="true"]::before {
    content: '\e260';
}


ul ul a {
    font-size: 0.9em !important;
    padding-left: 30px !important;
    background: #6d7fcc;
}

ul.CTAs {
    padding: 20px;
}

ul.CTAs a {
    text-align: center;
    font-size: 0.9em !important;
    display: block;
    border-radius: 5px;
    margin-bottom: 5px;
}

a.download {
    background: #fff;
    color: #7386D5;
}

a.article, a.article:hover {
    background: #6d7fcc !important;
    color: #fff !important;
}



/* ---------------------------------------------------
    CONTENT STYLE
----------------------------------------------------- */
#main {
    padding: 20px;
    min-height: 100vh;
    transition: all 0.3s;
}


/* ---------------------------------------------------
    MEDIAQUERIES
@media (max-width: 768px) {
    #sidebar {
        min-width: 80px;
        max-width: 80px;
        text-align: center;
        margin-left: -80px !important ;
    }
    a[aria-expanded="false"]::before, a[aria-expanded="true"]::before {
        top: auto;
        bottom: 5px;
        right: 50%;
        -webkit-transform: translateX(50%);
        -ms-transform: translateX(50%);
        transform: translateX(50%);
    }
    #sidebar.active {
        margin-left: 0 !important;
    }

    #sidebar .sidebar-header h3, #sidebar .CTAs {
        display: none;
    }

    #sidebar .sidebar-header strong {
        display: block;
    }

    #sidebar ul li a {
        padding: 20px 10px;
    }

    #sidebar ul li a span {
        font-size: 0.85em;
    }
    #sidebar ul li a i {
        margin-right:  0;
        display: block;
    }

    #sidebar ul ul a {
        padding: 10px !important;
    }

    #sidebar ul li a i {
        font-size: 1.3em;
    }
    #sidebar {
        margin-left: 0;
    }
}
----------------------------------------------------- */


</style>
