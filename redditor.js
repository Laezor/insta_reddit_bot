const request = require('request');
const postStatus = require("./poststatus.js");
postStatus.init();

const rPrefix = "https://www.reddit.com";
let r = null;
const rSuffix = "/.json?limit=";

exports.setSubreddit = function(subreddit) {
    if (subreddit.indexOf("/r/") != 0) {
        throw Error("Subreddit should always start with /r/. Example: /r/me_irl");
    }
    else {
        r = subreddit;
    }
};

exports.getSubreddit = function() {
    return r;
};

exports.retrieveRedditPosts = function(amount) {
    return new Promise(function(resolve, reject) {
        request({
            url: rPrefix + r + rSuffix + parseInt(amount),
            json: true
        }, function(err, response, body) {
            if (!err && response.statusCode === 200) {
                resolve(body['data']['children']);
            }
            else {
                reject(err);
            }
        });
    });
};

exports.getPostToDo = function() {
    return new Promise(function(resolve, reject) {
        module.exports.retrieveRedditPosts(40).then(function(redditPosts) {
            let post = null;
            for (let i = 0; i < redditPosts.length; i++) {
                // set currently reviewing post
                post = redditPosts[i];
                if (postStatus.postNotDone(post['data']['id'])) {
                    // check if post is not nsfw and not stickied
                    if (post['data']['over_18'] == false && post['data']['stickied'] == false) {
                        // break from the for-loop to continue
                        break;
                    }
                }
            }
        
            // check once more if the selected post is still on the to-do list
            // it could be an already done one in case the break command from the for-loop was never executed!
            if (postStatus.postNotDone(post['data']['id'])) {
                resolve(post);
            }
            else {
                reject("No post to upload to Instagram left (all posts are done)");
            }
        }).catch(function(err) {
            reject(err);
        });
    });
};