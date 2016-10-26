var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}var global=typeof window!=="undefined"&&window||typeof self!=="undefined"&&self||{};var GLOBAL=global;var root=global;var __SB_PUNDLE_DEFAULT_EXPORT={};var __sb_pundle={cache:{},extensions:[".js"],resolve:function resolve(path){return path}};var __require=void 0;var __sb_pundle_hmr_topological_sort=function(){function n(n,r){function e(f,u,d){if(d.indexOf(f)>=0)throw new Error("Cyclic dependency: "+JSON.stringify(f));if(!~n.indexOf(f))throw new Error("Found unknown node. Make sure to provided all involved nodes. Unknown node: "+JSON.stringify(f));if(!t[u]){t[u]=!0;var a=r.filter(function(n){return n[0]===f});if(u=a.length){var c=d.concat(f);do{var l=a[--u][1];e(l,n.indexOf(l),c)}while(u)}i[--o]=f}}for(var o=n.length,i=new Array(o),t={},f=o;f--;){t[f]||e(n[f],f,[])}return i}function r(n){for(var r=[],e=0,o=n.length;o>e;e++){var i=n[e];r.indexOf(i[0])<0&&r.push(i[0]),r.indexOf(i[1])<0&&r.push(i[1])}return r}return function(e){return n(r(e),e)}}();var __sb_pundle_hot=function(){function __sb_pundle_hot(data){_classCallCheck(this,__sb_pundle_hot);this.data=data;this.accepts=new Set;this.declines=new Set;this.callbacks_accept=new Set;this.callbacks_dispose=new Set}_createClass(__sb_pundle_hot,[{key:"accept",value:function accept(a,b){var clause=typeof a==="string"?a:"*";var callback=typeof a==="function"&&a||typeof b==="function"&&b||null;this.accepts.add(clause);if(callback){this.callbacks_accept.add({clause:clause,callback:callback})}}},{key:"decline",value:function decline(){var path=arguments.length<=0||arguments[0]===undefined?null:arguments[0];this.declines.add(typeof path==="string"?path:"*")}},{key:"dispose",value:function dispose(callback){this.callbacks_dispose.add(callback)}},{key:"addDisposeHandler",value:function addDisposeHandler(callback){this.callbacks_dispose.add(callback)}},{key:"removeDisposeHandler",value:function removeDisposeHandler(callback){this.callbacks_dispose.delete(callback)}}]);return __sb_pundle_hot}();function __sb_pundle_hmr_is_accepted(id,givenMatchAgainst){var module=__sb_pundle.cache[id];var matchAgainst=givenMatchAgainst||id;return module&&((module.hot.accepts.has("*")||module.hot.accepts.has(matchAgainst))&&1||module.parents.some(function(entry){return __sb_pundle_hmr_is_accepted(entry,matchAgainst)})&&2)}function __sb_pundle_hmr_get_update_order(updatedModules){var input=[];var added=new Set;var failed=[];var duplicates=[];function iterate(from,parents){if(added.has(from)){return}added.add(from);for(var i=0,length=parents.length;i<length;++i){var parent=parents[i];if(added.has(parent)){continue}var acceptanceStatus=__sb_pundle_hmr_is_accepted(parent);if(!acceptanceStatus){failed.push(parent);continue}var parentModule=__sb_pundle.cache[parent];if(added.has(from+"-"+parent)||added.has(parent+"-"+from)){duplicates.push([from,parent]);continue}added.add(from+"-"+parent);input.push([parent,from]);if(acceptanceStatus===2&&parentModule.parents.length){iterate(parent,parentModule.parents)}}}for(var i=0,length=updatedModules.length;i<length;++i){var updated=updatedModules[i];var updatedModule=__sb_pundle.cache[updated];if(!__sb_pundle_hmr_is_accepted(updated)){failed.push(updated);continue}if(!added.has(updated)&&updatedModule.parents.length){iterate(updated,updatedModule.parents)}}if(duplicates.length){console.log("[HMR] Error: Update could not be applied because these modules require each other:n"+duplicates.map(function(item){return" • "+item[0]+" <--> "+item[0]}).join("n"));var error=new Error("Unable to apply HMR because some modules require their parents");error.code="HMR_REBOOT_REQUIRED";throw error}if(failed.length){console.log("[HMR] Error: Update could not be applied because these did not accept:n"+failed.map(function(item){return" • "+item}).join("n"));var _error=new Error("Unable to apply HMR because some modules didnt accept it");_error.code="HMR_REBOOT_REQUIRED";throw _error}return __sb_pundle_hmr_topological_sort(input).reverse()}function __sb_pundle_hmr_apply(updatedModules){var modules=__sb_pundle_hmr_get_update_order(updatedModules);var _loop=function _loop(i,length){var id=modules[i];var module=__sb_pundle.cache[id];var data={};var oldHot=module.hot;oldHot.callbacks_dispose.forEach(function(callback){callback(data)});module.exports={};module.hot=new __sb_pundle_hot(data);__sb_pundle.cache[id].callback.call(module.exports,module,module.exports);oldHot.callbacks_accept.forEach(function(_ref){var clause=_ref.clause;var callback=_ref.callback;if(clause==="*"||modules.indexOf(clause)!==-1){callback()}})};for(var i=0,length=modules.length;i<length;++i){_loop(i,length)}}function __sb_pundle_register(filePath,callback){if(__sb_pundle.cache[filePath]){__sb_pundle.cache[filePath].callback=callback}else{var module={id:filePath,hot:new __sb_pundle_hot({}),filePath:filePath,callback:callback,exports:__SB_PUNDLE_DEFAULT_EXPORT,parents:[]};__sb_pundle.cache[filePath]=module}}function __sb_pundle_require_module(fromModule,request){if(!(request in __sb_pundle.cache)){throw new Error("Module not found")}var module=__sb_pundle.cache[request];if(module.parents.indexOf(fromModule)===-1&&fromModule!=="$root"){module.parents.push(fromModule)}if(module.exports===__SB_PUNDLE_DEFAULT_EXPORT){module.exports={};module.callback.call(module.exports,module,module.exports)}return module.exports}function __sb_generate_require(moduleName){var bound=__sb_pundle_require_module.bind(null,moduleName);bound.cache=__sb_pundle.cache;bound.extensions=__sb_pundle.extensions;bound.resolve=__sb_pundle.resolve;return bound}__require=__sb_generate_require("$root");
