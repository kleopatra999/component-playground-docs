import React from "react";
import find from "lodash/find";

import MarkdownIt from "markdown-it";
import markdownItTocAndAnchor from "markdown-it-toc-and-anchor";
import Prism from "prismjs";
/* eslint-disable no-unused-vars */
// add more language support
import jsx from "prismjs/components/prism-jsx";
import sh from "prismjs/components/prism-bash";
import yaml from "prismjs/components/prism-yaml";
/* eslint-enable no-unused-vars */

import Page from "../../components/page";
import basename from "../../basename";
import { config } from "../../components/config";


class Docs extends React.Component {
  componentDidMount() {
    Prism.highlightAll();
  }

  componentDidUpdate() { // is this the right one??
    Prism.highlightAll();
  }

  componentWillMount() {
    this.setMarkdownRenderer(this.props.location.pathname);
  }

  /* eslint-disable camelcase, max-params */
  // Create a markdown renderer that builds relative links
  // based on the currentPath and site's base href
  setMarkdownRenderer(currentPath) {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    });

    md.use(markdownItTocAndAnchor, {
      anchorLinkSymbol: "",
      anchorClassName: "Anchor",
      tocCallback(tocMarkdown, tocArray) {
        // TODO: Pass toc to <Page /> component
        console.log(tocArray); // eslint-disable-line no-console
      }
    });

    // store the original rule
    const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, renderer) {
      return renderer.renderToken(tokens, idx, options);
    };
    //
    // Update anchor links to include the basename
    md.renderer.rules.link_open = function (tokens, idx, options, env, renderer) {
      const anchor = tokens[idx].attrs[1];
      if (anchor.length > 0) {
        const href = anchor[1];
        if (href.indexOf("#") === 0) {
          tokens[idx].attrs[1][1] = `${basename}${currentPath}${href}`;
        }
      }
      return defaultRender(tokens, idx, options, env, renderer);
    };

    this.md = md;
  }

  renderDocs(active) {
    const docsMarkdown = find(config, { slug: active }).docs;
    return (
      <article
        dangerouslySetInnerHTML={{
          __html: this.md.render(docsMarkdown)
        }}
      />
    );
  }

  render() {
    const activePage = this.props.params.component ?
      this.props.params.component : "index";
    return (
      <Page>
        { this.renderDocs(activePage) }
      </Page>
    );
  }
}

Docs.propTypes = {
  location: React.PropTypes.object,
  params: React.PropTypes.object
};

Docs.defaultProps = {
  params: null
};

export default Docs;