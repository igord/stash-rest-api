
var async = require('async');
var utils = require('lodash');

module.exports = function (client) {

    var projects = require('./projects')(client);

    return {
        get: function(projectKey, options) {
            return client.get('projects/' + projectKey + '/repos');
        },

        getCombined: function(projectKey, options) {
            if (projectKey) {
                return this.get(projectKey, options);
            }
            else {
                // For each project, get all repos.
                var reposCombined = [];

                var API = this;

                return new Promise(function(resolve, reject) {
                    // Get all projects.
                    projects.get().then(function(projectsResponse) {
                        // Async, for each project.
                        async.forEachOf(projectsResponse.values, function(project, index, callback) {
                            // Get project repos.
                            API.get(project.key).then(function(repoResponse) {
                                // Merge to result.
                                reposCombined = utils(reposCombined).concat(repoResponse.values).value();
                                callback();
                            });
                        }, function(err) { // all repos resolved.
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve({values:reposCombined});
                            }
                        });
                    });
                });
            };
        }
    }
};

