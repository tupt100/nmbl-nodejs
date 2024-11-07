#!/usr/bin/env node

'use strict';
var https = require('https');
var fs = require('fs');
var CodeGen = require('swagger-js-codegen').CodeGen;
var ts = require('../node_modules/swagger-js-codegen/lib/typescript');
var path = require('path');
var appConfig = require('../config/app.config.js');
var config = appConfig(getEnvironment());
var _ = require('lodash');

var services = config.LIST_SWAGGER_CONF_ENDPOINTS;

/**
 * Environment configuration custom parameters
 */
function getEnvironment() {
	return process.argv[2] || 'dev';
}

/**
 * Gets JSON spec from a given host and path (url)
 * @param host
 * @param path
 * @param callback
 */
function getSpec(host, path, callback) {
	var noProtocolHost = host.match(/[http|https]:\/\/(.+)/)[1];
	var options = {
		host: noProtocolHost,
		path: path
	};
	var req = https['get'](options, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		}).on('end', function() {
			var data = null;
			var error = null;
			try {
				data = JSON.parse(body);
			} catch (e) {
				error = e;
			}

			callback(data, error);
		});
	});

	req.on('error', function(e) {
		callback(null, e);
	});
}

/**
 * Goes through the services and generate the corresponding
 * provider file.
 */
function generateProviderFiles() {
	for (var i = 0; i < services.length; i++) {
		generateProviderFile(services[i]);
	}
}

/**
 * Generates the provider file for the corresponding service
 * @param service
 */
function generateProviderFile(service) {
	getSpec(service['url'], service['sub_path'], function(swagger, error) {
		if (error) {
			console.error(error);
		} else {
			handleSwaggerResponse(service, swagger);
		}
	});
}

/**
 * Handles swagger response
 * @param serviceObject
 * @param swagger
 */
function handleSwaggerResponse(serviceObject, swagger) {

	_.each(swagger.paths, function(val,key){
		_.each(val, function(val1,key1){
			_.forEach(val1.parameters, function(parmchk){
				if(parmchk.name === 'AuthToken' || parmchk.name === 'AuthUserId'){
					parmchk.required = false;
				}
			});
		})
	});

	var source = CodeGen.getCustomCode({
		moduleName: serviceObject['apiName'],
		className: serviceObject['className'],
		lint: false,
		swagger: swagger,
		template: getTemplatesObject(),
		apiName: serviceObject['apiName'],
		mustache: {
			getLowercaseMethod: function getCapitalMethod() {
				return function(val, render) {
					return this.method.toLowerCase();
				}
			},
			hasResponseBody: function hasResponseBody() {
				return this.method.toLowerCase() !== 'delete';
			},
			getResponseType: function() {
				return function(val, render) {
					// get the swagger definition for this calling context
					var swaggerDef = swagger.paths[this.path][this.method.toLowerCase()];
					return processSuccessResponses(swaggerDef, render);
				};
			},
			getName: function getName() {
				return function(val, render) {
					var displayName = this.name;
					// if property contains a hyphen, we quote the property so that
					// we don't get JS error
					if (this.name.match(/\-/)) {
						displayName = '"' + this.name + '"';
					}
					return displayName;
				};
			},
			getApiUrl: function() {
				return function(val, render) {
					// return '"' + serviceObject['url'] + '/admin/SP2/api"';
					return '"' + serviceObject['url'] + '"';
				}
			},
			getType: function getType() {
				function identity(x) {
					return x;
				}
				return function _getType(val, render) {
					if (this.tsType.isRef) {
						return render(this.tsType.target).replace(/ /g, '').replace(/-/g, '_');
					}

					if (this.tsType.isArray) {
						return render('Array<' + _getType.call({
							tsType: this.tsType.elementType
						}, null, identity) + '>');
					}

					if (this.tsType.isObject) {
						return render('any');
					}
					return render(this.tsType.tsType);
				};
			},
			definitions: mapSwaggerDefinitions(swagger.definitions)
		}
	});
	// generate corresponding file
	fs.writeFileSync(path.join(__dirname, serviceObject['path']), source);
	console.log(serviceObject['className'] + ' file generated at ' + serviceObject['path']);
}

/**
 * Returns an object containing the class, method and request mustache template files
 * @returns {{class: (string|Buffer), method: (string|Buffer), request: (string|Buffer)}}
 */
function getTemplatesObject() {
	var templateDir = path.join(__dirname, 'templates');
	return {
		'class': fs.readFileSync(path.join(templateDir, 'class.mustache'), 'utf-8'),
		method: fs.readFileSync(path.join(templateDir, 'method.mustache'), 'utf-8'),
		request: fs.readFileSync(path.join(templateDir, 'request.mustache'), 'utf-8')
	};
}

/**
 * Maps swagger definitions
 * @param swaggerDefinitions
 * @returns {U[]|Array}
 */
function mapSwaggerDefinitions(swaggerDefinitions) {
	return Object.keys(swaggerDefinitions).map(function(defName) {
		var definition = swaggerDefinitions[defName];
		var data = {
			name: defName.replace(/ /g, '').replace(/-/g, '_'),
			properties: Object.keys(definition.properties || {}).map(function mapProperties(propertyName) {
				var property = definition.properties[propertyName];

				var prop = {
					name: propertyName,
					type: property.type,
					$ref: property.ref,
					cardinality: (definition.required || []).indexOf(propertyName) !== -1 ? '' : '?',
					items: property.items
				};

				prop.tsType = ts.convertType(prop);
				return prop;
			})
		};
		return data;
	})
}

/**
 * Process the success responses from swagger api
 * @param swaggerDef
 * @returns {*}
 */
function processSuccessResponses(swaggerDef, render) {
	var successResponseTypes = [];
	// check the success responses for type
	for (var responseCode in swaggerDef.responses) {
		if (responseCode >= 200 && responseCode <= 299) {
			// by default, the type is 'any'
			var successResponseType = 'any';
			var response = swaggerDef.responses[responseCode];

			// attempt to get the corresponding TS type
			if (response.schema) {
				var tsType = ts.convertType(response.schema);
				if (tsType.isRef) {
					successResponseType = tsType.target + 'Wrapper';
				} else {
					successResponseType = tsType.tsType;
				}
			}

			// use 'any' as the type instead of a type union, as 'any' includes everything
			if (successResponseType === 'any') {
				return render('any');
			}

			successResponseTypes.push(successResponseType);
		}
	}
	return render(successResponseTypes.join('|') || 'any');
}

generateProviderFiles();
