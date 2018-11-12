import {parse} from 'url';

export default (location) => {

  const {query, href} = parse(location.href, true);

  //remove login from the url
  var baseHref = href.replace(/login.*$/,'');

  //add web app path
  baseHref = baseHref + 'app/kibana#/';

  if (query.next) {
    return baseHref + query.next;
  }
  else {
    return baseHref + 'discover';
  }
};
