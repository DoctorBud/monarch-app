////
//// ...
////

function CyPathDemoInit(){

    ///
    /// Setup and preamble.
    ///
    
    //var DEBUG = false;
    var DEBUG = true;

    // Color/name context.
    var context = new bbop.context(amigo.data.context);
    var desired_layout = null;

    // HTML connctions.
    var demo_output_id = 'cydemo';
    var demo_output_elt = '#' + demo_output_id;
    var demo_input_id = 'demo_input';
    var demo_input_elt = '#' + demo_input_id;
    var auto_1_input_id = 'auto_1_input';
    var auto_1_input_elt = '#' + auto_1_input_id;
    var auto_2_input_id = 'auto_2_input';
    var auto_2_input_elt = '#' + auto_2_input_id;
    var sel_1_input_id = 'sel_1_input';
    var sel_1_input_elt = '#' + sel_1_input_id;
    var sel_2_input_id = 'sel_2_input';
    var sel_2_input_elt = '#' + sel_2_input_id;
    var sel_3_input_id = 'sel_3_input';
    var sel_3_input_elt = '#' + sel_3_input_id;

    // Aliases.
    var each = bbop.core.each;
    var ll = function(str){
	if( DEBUG && console && console.log ){
	    console.log(str);
	}
    };

    // Ready spinner for use.
    var spin = new bbop.widget.spinner('spinloc', '/image/waiting_ac.gif',
				       {'visible_p': false});
    ll('Start ready!');

    ///
    /// Renderer originally lifted from AmiGO 2 demo.
    ///

    // 
    function draw_graph(graph_json, focus_id){

	// graphs may be either a single object (short) or multiple
	// graph objects (simple). For now, fold them all in to a
	// single graph entity.
	var graph = new bbop.model.graph();
	if( ! bbop.core.is_array(graph_json) ){
	    graph_json = [graph_json];
	}
	each(graph_json,
	     function(grg){
		 graph.load_json(grg);
	     });

	// Clear current contents of graph elt.
	jQuery(demo_output_elt).empty();

	// Nodes.
	var cyroots = [];
	var cynodes = [];
	var info_lookup = {};
	each(graph.all_nodes(),
	     function(node){
		 ll('node: ' + node.id());
		 info_lookup[node.id()] = {
		     'id': node.id(), 
		     'label': node.label() || node.id()
		 };
		 if( graph.is_root_node(node.id()) ){
		     cyroots.push(node.id());
		 }
		 var clr;
		 if( focus && node.id() == focus_id ){
		     
		 }
		 var node_opts = {
		     //'group': 'nodes',
		     'data': {
			 'id': node.id(), 
			 'label': node.label() || node.id()
		     },
		     'grabbable': true
		 };
		 // Highlight the focus if there.
		 if( focus_id && node.id() == focus_id ){
		     node_opts['css'] = { 'background-color': '#111111' };
		 }
		 cynodes.push(node_opts);
	     });

	// Edges.
	var cyedges = [];
	each(graph.all_edges(),
	     function(edge){
		 var sub = edge.subject_id();
		 var obj = edge.object_id();
		 var prd = edge.predicate_id();
		 var clr = context.color(prd);
                 var eid = '' + prd + '_' + sub + '_' + obj;
		 ll('edge: ' + eid);
		 cyedges.push(
                     {
			 //'group': 'edges',
			 'data': {
                             'id': eid,
                             'pred': prd,
                             // 'source': sub,
                             // 'target': obj
                             'source': obj,
                             'target': sub
			 },
			 css: {
			     'line-color': clr
			 }
                     });
	     });

	// Render.
	var elements = {nodes: cynodes, edges: cyedges};
	
	// Select which layout we want to use.
	var layout_opts = {
	    'random': {
		name: 'random'//,
		// fit: true
	    },
	    'grid': {
		name: 'grid',
		// fit: true,
		padding: 30,
		rows: undefined,
		columns: undefined
	    },
	    'circle': {
		name: 'circle'//,
		//fit: true
	    },
	    'concentric': {
		name: 'concentric'//,
		//fit: true
	    },
	    'breadthfirst': {
                'name': 'breadthfirst',
                'directed': true,
                //'fit': true,
		//'maximalAdjustments': 0,
		'circle': false,
		'roots': cyroots
	    },
	    // 'arbor': {
	    // },
	    'cose': {
                'name': 'cose'//,
                // 'directed': true,
                // //'fit': true,
		// //'maximalAdjustments': 0,
		// 'circle': false,
		// 'roots': cyroots
	    }
	};
	var lo = layout_opts[desired_layout];
	if( ! lo ){
	    alert('your selected layout does not exist: ' + desired_layout);   
	}

	jQuery(demo_output_elt).cytoscape(
            {
		userPanningEnabled: true, // pan over box select
		'elements': elements,
		'layout': lo,
		hideLabelsOnViewport: true, // opt
		hideEdgesOnViewport: true, // opt
		textureOnViewport: true, // opt
		'style': [
                    {
			selector: 'node',
			css: {
                            'content': 'data(label)',
			    'font-size': 8,
			    'min-zoomed-font-size': 6, //10,
                            'text-valign': 'center',
                            'color': 'white',
			    'shape': 'roundrectangle',
                            'text-outline-width': 2,
                            'text-outline-color': '#222222'
			}
                    },
                    {
			selector: 'edge',
			css: {
                            //'content': 'data(pred)', // opt
                            'width': 2,
			    //'curve-style': 'haystack', // opt
                            'line-color': '#6fb1fc'
                            //'source-arrow-shape': 'triangle' // opt
			}
                    }
		]
            });

	var cy = jQuery(demo_output_elt).cytoscape('get');

	// Bind events.
	// cy.nodes().bind('click',
	// 		function(e){
	// 		    e.stopPropagation();
	// 		    var nid = e.cyTarget.id();
	// 		    man.set_id(nid);
	// 		    //spin.show();
	// 		    man.search();
	// 		});
	cy.nodes().bind('mouseover',
			function(e){
			    e.stopPropagation();

			    // TODO/BUG: this popover positioning got out of
			    // hand; just rewrite doing it manually with a
			    // div from bootstrap like normal people.
			    // (couldn't do it the obvious way because the
			    // canvas elements are just layers with nothing
			    // to adere to).
			    var nid = e.cyTarget.id();
			    var nlbl = info_lookup[nid]['label'];
 			    var popt = {
				title: nid,
				content: nlbl,
				// container: 'body',
				animation: false,
				placement: 'top',
				trigger: 'manual'
			    };
			    var epos = e.cyRenderedPosition;
			    jQuery(e.originalEvent.target).popover(popt);
			    jQuery(e.originalEvent.target).popover('show');
			    jQuery('.arrow').hide();
			    jQuery('.popover').css('top', epos.y -100);
			    jQuery('.popover').css('left', epos.x -100);
			    // TODO/BUG: Also, unfortunately, I cannot
			    // figure out why I am stuck with the
			    // single frozen pop-up (cannot change
			    // from the intial, probably a quirk of
			    // bs3). Manually change it.
			    var new_html = '<div style="display: none;" class="arrow"></div><h3 class="popover-title">' + nid + '</h3><div class="popover-content">' + nlbl + '</div>';
			    jQuery('.popover').html(new_html);

			    //ll('node: ' + nid);
			});
	cy.nodes().bind('mouseout',
			function(e){
			    e.stopPropagation();
			    jQuery(e.originalEvent.target).popover('destroy');
			});

	// 
	cy.edges().unselectify(); // opt
	cy.boxSelectionEnabled(false);
	cy.resize();

	// Make sure re respect resizing.
	jQuery(window).off('resize');
	jQuery(window).on('resize',
			  function(){
			      cy.resize(); 
			  });

	//ll('done draw');
    }

    ///
    /// Demo runner.
    ///

    // For now, use a generic manager with a generic response.
    var manager = new bbop.rest.manager.jquery(bbop.rest.response.json);
    // Generic responder.
    function _success_callback(resp, man){
	// The response is a generic bbop.rest.response.json.
	// Peel out the graph and render it.
	if( resp.okay() ){
	    draw_graph(resp.raw());
	}else{
	    ll('the response was not okay');	    
	}
	spin.hide();
    }
    function _error_callback(resp, man){
	spin.hide();
	alert('some kind of error?');
    }
    manager.register('success', 'draw', _success_callback);
    manager.register('error', 'oops', _error_callback);
    function data_call(arg1, arg2, arg3, arg4){
	var base = 'http://kato.crbs.ucsd.edu:9000/scigraph/graph/paths/' + arg4;
	var rsrc = base + '/' + arg1 + '/' + arg2 + '.jsonp?length=' + arg3;
	manager.resource(rsrc);
	manager.method('get');
	manager.use_jsonp(true);
	manager.jsonp_callback('callback');
	spin.show();
	manager.action();
    }

    ///
    /// Activate autocomplete and actions on inputs for demo.
    ///

    // Arguments for autocomplete box.
    var ac_args = {
	position : {
       	    my: "left top",
            at: "left bottom",
	    collision: "none"
	},
	source: function(request, response) {
	    console.log("trying autocomplete on " + request.term);

	    // Argument response from source gets map as argument.
	    var _parse_data_item = function(item){
		
		// If has a category, append that; if not try to use
		// namespace; otherwise, nothing.
		var appendee = '';
		if( item ){
		    if( item['concept']['categories'] &&
			! bbop.core.is_empty(item['concept']['categories']) ){
			appendee = item['concept']['categories'].join(' ');
		    }else if( item['concept']['fragment'] ){
			// Get first split on '_'.
			var fspl =
			    bbop.core.first_split('_',
						  item['concept']['fragment']);
			if( fspl[0] ){
			    appendee = fspl[0];
			}
		    }
		}

		return {
		    label: item['completion'],
		    tag: appendee,
		    name: item['concept']['fragment']
		};
	    };
	    var _on_success = function(data) {

		// Get the list out of the return.
		if( data && data['list'] ){

		    var ldata = data['list'];

		    // // Pare out duplicates. Assume existance of structure.
		    // var pared_data = [];
		    // var seen_ids = {};
		    // for( var di = 0; di < ldata.length; di++ ){
		    // 	var datum = ldata[di];
		    // 	var datum_id = datum['concept']['uri'];
		    // 	if( ! seen_ids[datum_id] ){
		    // 	    // Only add new ids to pared data list.
		    // 	    pared_data.push(datum);
			    
		    // 	    // Block them in the future.
		    // 	    seen_ids[datum_id] = true;
		    // 	}
		    // }

		    // Map out into the display format.
		    //var map = jQuery.map(pared_data, _parse_data_item);
		    var map = jQuery.map(data['list'], _parse_data_item);
		    response(map);
		}
	    };

	    // Define and run request on service.
	    var query =
		'http://kato.crbs.ucsd.edu:9000/scigraph/vocabulary/prefix/' +
		request.term +
		'.jsonp?limit=20&searchSynonyms=true';
	    jQuery.ajax({
			    'url': query,
			    'dataType': 'jsonp',
			    'jsonp': 'callback',
			    'success': _on_success
			});
	},
	messages: {
            noResults: '',
	    results: function() {}
        }
    };

    // Create our own custom rendering to make the categories a little
    // nicer to look at (as minor data).
    // http://jqueryui.com/autocomplete/#custom-data
    function _sub_render(ul, item){
	var li = jQuery('<li>');
	li.append('<a alt="'+ item.name +'" title="'+ item.name +'">' +
		  '<span class="autocomplete-main-item">' +
		  item.label +
		  '</span>' + 
		  '&nbsp;' + 
		  '<span class="autocomplete-tag-item">' +
		  item.tag +
		  '</span>' + 
		  '</a>');
	li.appendTo(ul);
	return li;
    }

    // Activate first autocomplete.
    ac_args['select'] = function(event, ui) {
	event.preventDefault();
	if (ui.item !== null) { 
	    ll('got: ' + ui.item.name);
	    jQuery(auto_1_input_elt).val(ui.item.name);
	}
    };	
    var jac1 = jQuery(auto_1_input_elt).autocomplete(ac_args);
    jac1.data('ui-autocomplete')._renderItem = _sub_render;

    // Activate second autocomplete.
    ac_args['select'] = function(event, ui) {
	event.preventDefault();
	if (ui.item !== null) {
	    ll('got: ' + ui.item.name);
	    jQuery(auto_2_input_elt).val(ui.item.name);
	}
    };	
    var jac2 = jQuery(auto_2_input_elt).autocomplete(ac_args);
    jac2.data('ui-autocomplete')._renderItem = _sub_render;

    // Rewire the form to produce the graph.
    jQuery(demo_input_elt).submit(
	function(event){
	    event.preventDefault();
	    
	    var v1 = jQuery(auto_1_input_elt).val() || '';
	    var v2 = jQuery(auto_2_input_elt).val() || '';
	    var s1 = jQuery(sel_1_input_elt).val() || '';
	    var s2 = jQuery(sel_2_input_elt).val() || '';
	    var s3 = jQuery(sel_3_input_elt).val() || '';

	    // TODO:
	    if( v1 != '' && v2 != '' && s1 != '' && s2 != '' && s3 != '' ){
		// alert('TODO: only using demo input; ignoring: ' +
		// 	 [v1, v2, s1].join(', '));
		desired_layout = s3;
		data_call(v1, v2, s1, s2);
	    }else{
		alert('insufficient args: ' + [v1, v2, s1, s2].join(', ') ); //+
	    }

	});

    ll('Done ready!');
};

// jQuery gets to bootstrap everything.
jQuery(document).ready(
    function(){
	CyPathDemoInit();
    });
