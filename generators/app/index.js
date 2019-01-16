"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const _ = require("lodash");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the fantastic ${chalk.red(
          "GrapesJs Plugin"
        )} generator by Intellective!`
      )
    );

    const project_prompts = [
      {
        type: "input",
        name: "name",
        message: "Your plugin name",
        default: this.appname
      },
      {
        type: "input",
        name: "description",
        message: "Your plugin description",
        default: "GrapesJs Plugin"
      },
      {
        type: "confirm",
        name: "blocks",
        message: "Does your plugin add/edit blocks?",
        default: true
      },
      {
        type: "confirm",
        name: "commands",
        message: "Does your plugin add/edit commands?",
        default: true
      },
      {
        type: "confirm",
        name: "components",
        message: "Does your plugin add/edit components?",
        default: false
      },
      {
        type: "confirm",
        name: "panels",
        message: "Does your plugin add/edit panels?",
        default: false
      },
      {
        type: "confirm",
        name: "styles",
        message: "Does your plugin add/edit styles?",
        default: false
      }
    ];

    const plugin_prompts = [
      {
        type: "confirm",
        name: "hasPlugins",
        message: "Does your plugin import other GrapesJs plugins?",
        default: false
      }
    ];

    const plugin_detail_prompts = [
      {
        type: "input",
        name: "pluginSlug",
        message: "Enter plugin name (eg: grapesjs-plugin-name)",
        default: ""
      },
      {
        type: "confirm",
        name: "pluginNpm",
        message: "Is the plugin available over npm?",
        default: true
      }
    ];

    const plugin_git_prompts = [
      {
        type: "input",
        name: "pluginGit",
        message: "Please enter the SSH url for the plugin's git repository",
        default: ""
      }
    ];

    const plugin_more_prompts = [
      {
        type: "confirm",
        name: "morePlugins",
        message: "Would you like to add more plugins?",
        default: false
      }
    ];

    const askMorePlugins = () => {
      return this.prompt(plugin_more_prompts).then(props => {
        if (props.morePlugins) {
          return askPluginDetails();
        }
      });
    };

    const askPluginDetails = () => {
      const plugin = {};
      return this.prompt(plugin_detail_prompts).then(props => {
        plugin.slug = props.pluginSlug;
        plugin.name = _.camelCase(plugin.slug);
        if (props.pluginNpm) {
          plugin.npm = props.pluginName;
          this.plugins.push(plugin);
          return askMorePlugins();
        }
        return this.prompt(plugin_git_prompts).then(props => {
          plugin.git = "git+ssh://" + props.pluginGit;
          this.plugins.push(plugin);
          return askMorePlugins();
        });
      });
    };

    return this.prompt(project_prompts).then(props => {
      // To access props later use this.props.someAnswer;
      props.slug = _.kebabCase(props.name);
      props.name = _.startCase(props.name);
      this.plugin = props;

      // TODO: complete plugin dependency implemententation
      this.plugins = [];
      // Return this.prompt(plugin_prompts).then(props => {
      //   if (props.hasPlugins) {
      //     return askPluginDetails();
      //   }
      // });
    });
  }

  writing() {
    // Make package.json
    this.fs.copyTpl(
      this.templatePath("_package.json"),
      this.destinationPath("package.json"),
      {
        projectSlug: this.plugin.slug,
        projectName: this.plugin.name,
        projectDescription: this.plugin.description
      }
    );

    // Copy webpack config
    this.fs.copy(
      this.templatePath("_webpack.config.js"),
      this.destinationPath("webpack.config.js")
    );

    // Make directories
    this.fs.copyTpl(
      this.templatePath("_index.js"),
      this.destinationPath("src/index.js"),
      {
        name: this.plugin.name,
        slug: this.plugin.slug,
        commands: this.plugin.commands,
        blocks: this.plugin.blocks,
        styles: this.plugin.styles,
        panels: this.plugin.panels,
        components: this.plugin.components,
        plugins: this.plugins
      }
    );

    this.fs.copyTpl(
      this.templatePath("_index.html"),
      this.destinationPath("index.html"),
      {
        name: this.plugin.name,
        slug: this.plugin.slug
      }
    );

    ["blocks", "styles", "panels", "commands", "components"].forEach(elem => {
      if (this.plugin[elem]) {
        this.fs.copy(
          this.templatePath(`${elem}/_index.js`),
          this.destinationPath(`src/${elem}/index.js`)
        );
      }
    });
  }

  install() {
    this.installDependencies();
    if (this.plugins && this.plugins.length) {
      let plugin_names = [];
      this.plugins.forEach(plugin => {
        plugin_names.push(plugin.pluginNpm || plugin.pluginGit);
      });
      this.npmInstall(plugin_names);
    }
  }
};
