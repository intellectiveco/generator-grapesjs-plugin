<% if (plugins && plugins.length) { for(let i in plugins){ let plugin = plugins[i]; %>import <%= plugin.name %> from "<%= plugin.slug %>";
<% }} %>
<% if (commands === true) { %>
import commands from "./commands";<% } %><% if (blocks === true) { %>
import blocks from "./blocks";<% } %><% if (components === true) { %>
import components from "./components";<% } %><% if (panels === true) { %>
import panels from "./panels";<% } %><% if (styles === true) { %>
import styles from "./styles";<% } %>

export default grapesjs.plugins.add("<%= slug %>", (editor, opts = {}) => {
  let config = opts;

  // Setup default options for the plugin
  let defaults = {<% if (plugins && plugins.length) { for(let i in plugins){ let plugin = plugins[i]; %>
    <%= plugin.name %>Opts : {}<% if(i-1<plugins.length){%>,<%}}}%>    
  };

  // Load the defaults
  for (let name in defaults) {
    if (!(name in config)) {
      config[name] = defaults[name];
    }
  }

  <% if (plugins && plugins.length){ %>
  const {<% for(let i in plugins){ let plugin = plugins[i]; %>
    <%= plugin.name %>Opts<% if(i-1 < plugins.length){%>,<%}}%>
  } = config;
  <%}%>

  <% if (plugins && plugins.length) { for(let i in plugins){ let plugin = plugins[i]; %>
  <%= plugin.name %>Opts && <%= plugin.name %>(editor, <%= plugin.name %>Opts);<%}}%>


  <% if (commands === true) { %>
  commands(editor,config);<% } %><% if (blocks === true) { %>
  blocks(editor,config);<% } %><% if (components === true) { %>
  components(editor,config);<% } %><% if (panels === true) { %>
  panels(editor,config);<% } %><% if (styles === true) { %>
  styles(editor,config);<% } %>
});
