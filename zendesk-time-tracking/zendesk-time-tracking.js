// ==UserScript==
// @name         Zendesk time tracker
// @namespace    http://procurios.com/
// @version      0.2.1
// @description  Track time spent on tickets
// @author       Taco van den Broek
// @match        https://procurios.zendesk.com/agent/tickets/*
// @grant        none
// @updateUrl    https://raw.githubusercontent.com/procurios/gists/master/zendesk-time-tracking/zendesk-time-tracking.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

(function () {
    var trackedUrls = {};
    var currentUrl;

    var lastWorkspace;
    var getCurrentWorkspace = function () {
        if (lastWorkspace && window.getComputedStyle(lastWorkspace).display !== 'none') {
            return lastWorkspace
        }

        var workspaces = document.querySelectorAll('div.workspace');
        if (workspaces.length === 0) {
            return null;
        }

        for (var i = 0; i < workspaces.length; i++) {
            if (window.getComputedStyle(workspaces[i]).display !== 'none') {
                lastWorkspace = workspaces[i];
                return lastWorkspace;
            }
        }

        return null;
    };

    var getCurrentTags = function () {
        var workspace = getCurrentWorkspace();
        if (!workspace) {
            return null;
        }

        var tagDiv = workspace.querySelector('div.tags');
        if (tagDiv.length === 0) {
            return null;
        }

        var tags = [];
        var tagElements = tagDiv.querySelectorAll('a[role="menuitem"]');
        for (var i = 0; i < tagElements.length; i++) {
            tags.push(tagElements[i].innerHTML);
        }
        return tags.join(' ');
    };

    var getCurrentProcessStep = function () {
        var workspace = getCurrentWorkspace();
        if (!workspace) {
            return null;
        }

        var processStepField = workspace.querySelector('div.custom_field_26378428 span.zd-selectmenu-base-content');
        if (!processStepField) {
            return null;
        }

        return processStepField.innerHTML;
    };

    var getDurationString = function (durationMS) {
        var decimalHours = Math.round(durationMS / 36000).toString();

        while (decimalHours.length < 3) {
            decimalHours = '0' + decimalHours;
        }

        return decimalHours.replace(/^(\d*)(\d\d)$/, '$1,$2');
    };

    var presentSpentTime = function () {
        if (!currentUrl) {
            return;
        }

        if ( !(currentUrl in trackedUrls) ) {
            return;
        }

        var workspace = getCurrentWorkspace();
        if (!workspace) {
            return;
        }

        var timeSpentElem = workspace.querySelector('div.custom_field_20888298 input.ember-text-field');
        if (!timeSpentElem) {
            return;
        }

        var sessions = trackedUrls[currentUrl].sessions.slice(0);
        sessions.push([trackedUrls[currentUrl].startSession, new Date(), null]);

        var totalTime = 0;
        var firstSessionStart = null;
        var lastSessionEnd = 0;
        var sessions = [];
        var session, sessionStartTS, sessionEndTS, sessionDescription, sessionTime;
        for (var i = 0; i < sessions.length; i++) {
            session = sessions[i];
            sessionStartTS = session[0].getTime();
            sessionEndTS = session[1].getTime();

            if (firstSessionStart === null) {
                firstSessionStart = sessionStartTS;
            }

            sessionTime = sessionEndTS - sessionStartTS;
            totalTime += sessionTime;

            if (sessionTime >= 30000) {
                if (sessions.length > 0) {
                    sessions.push('break (' + getDurationString(sessionStartTS - lastSessionEnd) + ')');
                }

                sessionDescription =
                    session[0].getHours() + ':' + ("0" + session[0].getMinutes()).slice(-2)
                    + ' - ' + session[1].getHours() + ':' + ("0" + session[1].getMinutes()).slice(-2)
                    + ' (' + getDurationString(sessionTime) + ')';

                if (session[2]) {
                    sessionDescription += ' -> ' + session[2];
                }

                sessions.push(sessionDescription);
            }
            lastSessionEnd = sessionEndTS;
        }

        var message = [];
        if (sessions.length) {
            message.push('Sessies van dit ticket:');
            message.push(sessions.join("\n"));
            message.push('Totale sessie tijd: ' + getDurationString(totalTime) + "\n"
                + 'Totale doorlooptijd: ' + getDurationString(lastSessionEnd - firstSessionStart));
        }
        message.push('Tel jouw gewerkte tijd op bij "Bestede tijd (in uren)". Druk op OK om de sessies te wissen.');
        var clearSessions = confirm(message.join("\n\n"));

        if (clearSessions === true) {
            delete trackedUrls[currentUrl];
        }
    };

    var getCurrentTicketTitle = function () {
        var workspace = getCurrentWorkspace();
        if (!workspace) {
            return null;
        }

        var subjectElem = workspace.querySelector('input[name="subject"]');
        if (!subjectElem) {
            return null;
        }

        if (subjectElem.value.length > 40) {
            return subjectElem.value.substring(0, 37) + '...';
        }

        return subjectElem.value;
    };

    var check = function () {
        if (currentUrl != document.location.href) {
            if (currentUrl && (currentUrl in trackedUrls)) {
                trackedUrls[currentUrl].sessions.push([trackedUrls[currentUrl].startSession, new Date(), getCurrentTicketTitle()]);
                trackedUrls[currentUrl].startSession = null;
            }

            currentUrl = document.location.href;
            if ( !(currentUrl in trackedUrls) ) {
                trackedUrls[currentUrl] = {
                    'sessions': [],
                    'startSession': null,
                    'tags': getCurrentTags(),
                    'processStep': getCurrentProcessStep()
                };
            }
            trackedUrls[currentUrl].startSession = new Date();
        } else if ( !(currentUrl in trackedUrls) ) {
            return;
        }

        var currentTags = getCurrentTags();
        if (trackedUrls[currentUrl].tags === null) {
            trackedUrls[currentUrl].tags = currentTags;
        } else if (trackedUrls[currentUrl].tags !== currentTags) {
            trackedUrls[currentUrl].tags = currentTags;
            presentSpentTime();
            return;
        }

        var currentProcessStep = getCurrentProcessStep();
        if (trackedUrls[currentUrl].processStep === null) {
            trackedUrls[currentUrl].processStep = currentProcessStep;
        } else if (trackedUrls[currentUrl].processStep !== currentProcessStep) {
            trackedUrls[currentUrl].processStep = currentProcessStep;
            presentSpentTime();
            return;
        }
    };

    var init = function () {
        window.setInterval(check, 1000);
    };

    if (document.readyState === "complete") {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();
