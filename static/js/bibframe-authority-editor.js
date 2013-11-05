var suggestions = {};
var components = [];
var components_count = 0;

var mainformhtml = ' \
    <div class="controls">      \
        <div class="input-append" id="component%NUM%">      \
            <select id="component%NUM%type" name="ctype%NUM%" class="input-xlarge">     \
                <option>Person</option>     \
                <option>Topic</option>      \
                <option>Place</option>      \
                <option>Organization</option>       \
                <option>GenreForm</option>      \
                <option>Family</option>     \
                <option>Jurisdiction</option>       \
                <option>Meeting</option>        \
            </select>       \
            <input class="typeahead" autocomplete="off" id="component%NUM%term" name="buttondropdown" class="input-xlarge" placeholder="Authorized heading" type="text">        \
            <hidden id="component%NUM%uri" name="termuri" value="" />       \
            <div class="btn-group">     \
                <button class="btn dropdown-toggle" data-toggle="dropdown">     \
                    Action      \
                    <span class="caret"></span>     \
                </button>       \
                <ul id="component%NUM%action" class="dropdown-menu">        \
                    <li><a href="#">Add subdivision</a></li>        \
                    <li><a href="#">Remove</a></li>     \
                </ul>       \
            </div>      \
        </div>      \
    </div> \
    ';
    
var baserdf = ' \
<rdf:RDF        \n\
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"     \n\
    xmlns:bf="http://bibframe.org/vocab/"       \n\
    xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">        \n\
    \
    <bf:%BFTYPE% rdf:about="http://bibframe.org/auths/%BFID%">      \n\
        <bf:authorizedAccessPoint>%AAP%</bf:authorizedAccessPoint>     \n \
        <bf:hasAuthority>       \n\
            <madsrdf:%MADSTYPE%>        \n\
                <madsrdf:authoritativeLabel>%AAP%</madsrdf:authoritativeLabel>      \n\
%COMPS% \n\
            </madsrdf:%MADSTYPE%>       \n\
        </bf:hasAuthority>      \n\
    </bf:%BFTYPE%>        \n\
    \
</rdf:RDF>      \n\
    ';

var basecomponentList = ' \
                <madsrdf:componentList rdf:parseType="Collection">     \n\
                    %COMPONENTS%        \n\
                </madsrdf:componentList> \n\
    ';
    
$( document ).ready(function() {

    /*
    $.ajax({
        url: "http://id.loc.gov/authorities/subjects/suggest?q=Dog",
        dataType: "jsonp",
        success: function (data) {
            console.log(data)
            alert(data);
        }
    });
    */
    
    /*
    $("#component1term").bind('input', function() {
        field = $( this );
        t = $( this ).val();
        if ( t.length > 3 ) {
            q = t + " OR " + t + "*";
            q = encodeURI(q);
            u = "http://localhost:8281/search/?format=jsonp&q=" + q;
            $.ajax({
                url: u,
                dataType: "jsonp",
                success: function (data) {
                    //console.log(data)
                    //alert(data);
                    processATOM(data, field);
                }
                //jsonpCallback: "processATOM"
            });
        }
    });
    */
    
    /*
    // Typeahead construction credit: https://gist.github.com/mrgcohen/5062352
    window.query_cache = {};
    $('#component1term').typeahead({
        source:function(query,process){
            // if in cache use cached value, if don't wanto use cache remove this if statement
            if(query_cache[query]){
                process(query_cache[query]);
                return;
            }
            if( typeof searching != "undefined") {
                clearTimeout(searching);
                process([]);
            }
            searching = setTimeout(function() {
                if ( query.length > 3 ) {
                    type = $( this );
                    alert( query.parent().toSource() );
                    q = query + " OR " + query + "*";
                    q = encodeURI(q);
                    u = "http://localhost:8281/search/?format=jsonp&start=1&count=10&q=" + q;
                    $.ajax({
                        url: u,
                        dataType: "jsonp",
                        success: function (data) {
                            //console.log(data)
                            //alert(data);
                            parsedlist = processATOM(data);
                            // save result to cache, remove next line if you don't want to use cache
                            query_cache[query] = parsedlist;
                            // only search if stop typing for 300ms aka fast typers
                            return process(parsedlist);    
                        }
                        //jsonpCallback: "processATOM"
                    });
                } else {
                    return [];
                }
            }, 300); // 300 ms
        }
    });
    */
    
    // Typeahead construction credit: https://gist.github.com/mrgcohen/5062352
    // Typeahead with context credit: http://stackoverflow.com/questions/12413594/twitter-bootstrap-typeahead-get-context-calling-element-with-this
    
    $("#button2id").click(function() {
        window.location.href = "index.html";
        return false;
    });
    
    $('#button1id').click(function(){
        $('#dataModal').modal('show');
        //$('#datatextarea').focus();
        //alert(JSON.stringify(components));
        
        bftype = "Authority";
        madstype = "Authority";
        aap = "";
        comps = "";
        for (i=0;i<components.length;i++) {
            if (i > 0) {
                aap += "--";
            }
            aap += components[i].label;
            
            if (i === 0) {
                type = $("#component" + i + "type").find(":selected").text();
                bftype = type;
            }
            if (components.length === 1) {
                type = $("#component" + i + "type").find(":selected").text();
                if ( type == "Person") {
                    madstype = "PersonalName";
                } else if ( type == "Topic") {
                    madstype = "Topic";
                } else if ( type == "Place") {
                    madstype = "Geographic";
                } else if ( type == "Organization") {
                    madstype = "CorporateName";
                } else if ( type == "Family") {
                    madstype = "FamilyName";
                } else if ( type == "Meeting") {
                    madstype = "ConferenceName";
                } else if ( type == "Jurisdiction") {
                    rdftype = "CorporateName";
                } else if ( type == "GenreForm") {
                    madstype = "GenreForm";
                }
            } else {
                madstype = "ComplexSubject";
            }
            if (components.length > 1) {
                type = $("#component" + i + "type").find(":selected").text();
                if ( type == "Person") {
                    madstype = "PersonalName";
                } else if ( type == "Topic") {
                    madstype = "Topic";
                } else if ( type == "Place") {
                    madstype = "Geographic";
                } else if ( type == "Organization") {
                    madstype = "CorporateName";
                } else if ( type == "Family") {
                    madstype = "FamilyName";
                } else if ( type == "Meeting") {
                    madstype = "ConferenceName";
                } else if ( type == "Jurisdiction") {
                    rdftype = "CorporateName";
                } else if ( type == "GenreForm") {
                    madstype = "GenreForm";
                }
                u = "http://problem.find.ing/uri";
                s = suggestions[components[i].label];
                if(typeof s !== 'undefined'){
                    u = s.uri;
                }
                comps += '      <madsrdf:' + madstype + ' rdf:about="' + u + '" />' + "\n";
            }
        }
        
        bfid = aap.replace(/ /g, "");
        
        bfresource = baserdf;
        bfresource = bfresource.replace(/%BFID%/g, bfid);
        bfresource = bfresource.replace(/%BFTYPE%/g, bftype);
        bfresource = bfresource.replace(/%AAP%/g, aap);
        bfresource = bfresource.replace(/%MADSTYPE%/g, madstype);
        
        if (components.length > 1) {
            compsrdf = basecomponentList;
            compsrdf = compsrdf.replace("%COMPONENTS%", comps);
            bfresource = bfresource.replace(/%COMPS%/g, compsrdf);
        } else {
            bfresource = bfresource.replace(/%COMPS%/g, "");
        }
        
        $("#datatextarea").text(bfresource);
        
        return false;
    });
    
    window.query_cache = {};
    
    createComponent();
    freshenTypeaheads();
    

});



function createComponent() {
    component = mainformhtml.replace(/%NUM%/g, components_count);
    if (components_count > 0) {
        component = component.replace('Authorized heading', "Subdivision");
    } else {
        component = component.replace('<li><a href="#">Remove</a></li>', '');
    }
    //alert(component);
    c = $(component);
    $("#mainform").append( c );
    $("#component" + components_count + "term").css("z-index", 100-components_count);
    $("#component" + components_count + "action li a").click(function() {
        parentid = $( this ).parent().parent().parent().parent().attr("id");
        compnum = parseInt(parentid.replace("component", ""));
        selected = $( this ).text();
        //alert(selected);
        if (selected == "Add subdivision") {
            processComponent( $("#" + parentid + "term").val(), compnum );
            createComponent();
            freshenTypeaheads();
        } else if (selected == "Remove" && parentid !== "component0") {
             $("#" + parentid).remove();
        }
    });
    $("#component" + components_count + "term").blur(function() {
        processComponent( $("#" + parentid + "term").val(), compnum );
    });
    
    components_count++;
    
}


function freshenTypeaheads() {
    $(':input[class="typeahead"]').each(function(){
        var $this = $(this);
        $this.typeahead({
            source:function(query,process){
                // if in cache use cached value, if don't wanto use cache remove this if statement
                parentid = $this.parent().attr("id");
                typeid = parentid + "type";
                type = $("#" + typeid).find(":selected").text();
                if ( type == "Person") {
                    rdftype = "rdftype:PersonalName"
                } else if ( type == "Topic") {
                    rdftype = "(rdftype:Topic OR rdftype:ComplexSubject)"
                } else if ( type == "Place") {
                    rdftype = "rdftype:Geographic"
                } else if ( type == "Organization") {
                    rdftype = "rdftype:CorporateName"
                } else if ( type == "Family") {
                    rdftype = "rdftype:FamilyName"
                } else if ( type == "Meeting") {
                    rdftype = "rdftype:ConferenceName"
                } else if ( type == "Jurisdiction") {
                    rdftype = "rdftype:CorporateName"
                } else if ( type == "GenreForm") {
                    rdftype = "rdftype:GenreForm"
                }
                
                compnum = parseInt(parentid.replace("component", ""));
                subdivision = 0;
                if (compnum > 0) {
                    // This should be a subdivision, but first we need to check
                    // and make sure there is no pattern heading to use.
                    if (components[0].pc) {
                        subdivision = "memberOf:" + components[0].pc
                    } else {
                        subdivision = "memberOf:http://id.loc.gov/authorities/subjects/collection_Subdivisions";
                    }
                }
                
                //alert( type );
                q = '(' + query + ' OR ' + query + '*)';
                if (rdftype) {
                    q = q + ' AND ' + rdftype
                    }
                if (subdivision) {
                        q = q + ' AND ' + subdivision
                    }
                //alert(q);
                q = encodeURI(q);
                
                if(query_cache[q]){
                    process(query_cache[q]);
                    return;
                }
                if( typeof searching != "undefined") {
                    clearTimeout(searching);
                    process([]);
                }
                
                searching = setTimeout(function() {
                    if ( query.length > 3 ) {
                        //alert(q)
                        //u = "http://localhost:8281/search/?format=jsonp&start=1&count=10&q=" + q;
                        u = "http://id.loc.gov/search/?format=jsonp&start=1&count=10&q=" + q;
                        //alert(u);
                        $.ajax({
                            url: u,
                            dataType: "jsonp",
                            success: function (data) {
                                //console.log(data)
                                //alert(data);
                                parsedlist = processATOM(data, query);
                                // save result to cache, remove next line if you don't want to use cache
                                query_cache[q] = parsedlist;
                                // only search if stop typing for 300ms aka fast typers
                                return process(parsedlist);    
                            }
                            //jsonpCallback: "processATOM"
                        });
                    } else {
                        return [];
                    }
                }, 300); // 300 ms
            }
        });
    });
}

function processATOM(atomjson, query) {
    typeahead_source = [];
    c = 0;
    for (var k in atomjson) {
        if (atomjson[k][0] == "atom:entry") {
            t = "";
            u = "";
            for (var e in atomjson[k] ) {
                //alert(atomjson[k][e]);
                if (atomjson[k][e][0] == "atom:title") {
                    //alert(atomjson[k][e][2]);
                    t = atomjson[k][e][2];
                }
                if (atomjson[k][e][0] == "atom:link") {
                    //alert(atomjson[k][e][2]);
                    u = atomjson[k][e][1].href;
                }
                if ( t !== "" && u !== "") {
                    suggestions[t] = {}
                    suggestions[t].label = t;
                    suggestions[t].uri = u;
                    typeahead_source[c] = t;
                    c++;
                    break;
                }
            }
        }
    }
    //alert(suggestions);
    if (typeahead_source.length === 0) {
        typeahead_source[0] = "[No suggestions found for " + query + ".]";    
    }
    //alert(typeahead_source);
    return typeahead_source;
}

function processComponent(term, compnum) {
   //alert(term);
    s = suggestions[term];
    if(typeof s !== 'undefined'){
        u = s.uri;
        //u = u.replace("id.loc.gov", "localhost:8281");
        u = u + ".jsonp";
        //alert(u);
        $.ajax({
            url: u,
            dataType: "jsonp",
            success: function (data) {
                //for (var k in data) {
                //    alert(k);
                //}
                uri = "<" + s.uri + ">";
                r = data[uri];
                pc = r["<http://www.loc.gov/mads/rdf/v1#usePatternCollection>"];
                if (pc) {
                    suggestions[term].pc = pc[0].value;
                }
                components[compnum] = {};
                components[compnum].uri = suggestions[term].uri;
                components[compnum].label = suggestions[term].label;
                components[compnum].pc = suggestions[term].pc;
                //alert(JSON.stringify(components[compnum]));
            }
            //jsonpCallback: "parseResource"
        });
    }
    
}
