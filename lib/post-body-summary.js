"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostBodySummary = void 0;
var he_1 = __importDefault(require("he"));
var helper_1 = require("./helper");
var cache_1 = require("./cache");
var lolight = require('lolight');
var Remarkable = require('remarkable');
var joint = function (arr, limit) {
    if (limit === void 0) { limit = 200; }
    var result = '';
    for (var i = 0; i < arr.length; i++) {
        // join array with space separator
        if (result) {
            result += " ";
        }
        // break with length reaches limit
        if (result.length > limit) {
            break;
        }
        else {
            // make sure last join doesn't break the limit too much
            if ((result + arr[i]).length < limit + 10) {
                result += arr[i];
            }
            else {
                break;
            }
        }
    }
    return result.trim();
};
function postBodySummary(entryBody, length) {
    if (!entryBody) {
        return '';
    }
    var md = new Remarkable({
        html: true,
        breaks: true,
        linkify: false,
        highlight: function (str) {
            try {
                var tokens = lolight.tok(str);
                return tokens.map(function (token) { return "<span class=\"ll-" + token[0] + "\">" + token[1] + "</span>"; }).join('');
            }
            catch (err) {
                console.error(err);
            }
            return str;
        }
    });
    // Convert markdown to html
    var text = md.render(entryBody);
    text = text
        .replace(/(<([^>]+)>)/gi, '') // Remove html tags
        .replace(/\r?\n|\r/g, ' ') // Remove new lines
        .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove urls
        .trim()
        .replace(/ +(?= )/g, ''); // Remove all multiple spaces
    if (length) {
        // Truncate
        text = joint(text.split(' '), length);
    }
    text = he_1.default.decode(text); // decode html entities
    return text;
}
function getPostBodySummary(obj, length) {
    if (typeof obj === 'string') {
        return postBodySummary(obj, length);
    }
    var key = helper_1.makeEntryCacheKey(obj) + "-sum-" + length;
    var item = cache_1.cacheGet(key);
    if (item) {
        return item;
    }
    var res = postBodySummary(obj.body, length);
    cache_1.cacheSet(key, res);
    return res;
}
exports.getPostBodySummary = getPostBodySummary;
//# sourceMappingURL=post-body-summary.js.map