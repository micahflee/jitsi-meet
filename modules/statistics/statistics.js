/* global require, APP */
/**
 * Created by hristo on 8/4/14.
 */
var LocalStats = require("./LocalStatsCollector.js");
var RTPStats = require("./RTPStatsCollector.js");
var EventEmitter = require("events");
var StreamEventTypes = require("../../service/RTC/StreamEventTypes.js");
var XMPPEvents = require("../../service/xmpp/XMPPEvents");
var RTCEvents = require("../../service/RTC/RTCEvents");

var eventEmitter = new EventEmitter();

var localStats = null;

var rtpStats = null;

function stopLocal() {
    if (localStats) {
        localStats.stop();
        localStats = null;
    }
}

function stopRemote() {
    if (rtpStats) {
        rtpStats.stop();
        eventEmitter.emit("statistics.stop");
        rtpStats = null;
    }
}

function startRemoteStats (peerconnection) {
    if (rtpStats) {
        rtpStats.stop();
    }

    rtpStats = new RTPStats(peerconnection, 200, 2000, eventEmitter);
    rtpStats.start();
}

function onStreamCreated(stream) {
    if(stream.getOriginalStream().getAudioTracks().length === 0) {
        return;
    }

    localStats = new LocalStats(stream.getOriginalStream(), 200, statistics,
        eventEmitter);
    localStats.start();
}

function onDisposeConference(onUnload) {
    stopRemote();
    if(onUnload) {
        stopLocal();
        eventEmitter.removeAllListeners();
    }
}

var statistics = {
    /**
     * Indicates that this audio level is for local jid.
     * @type {string}
     */
    LOCAL_JID: 'local',

    addAudioLevelListener: function(listener)
    {
        eventEmitter.on("statistics.audioLevel", listener);
    },

    removeAudioLevelListener: function(listener)
    {
        eventEmitter.removeListener("statistics.audioLevel", listener);
    },

    addConnectionStatsListener: function(listener)
    {
        eventEmitter.on("statistics.connectionstats", listener);
    },

    removeConnectionStatsListener: function(listener)
    {
        eventEmitter.removeListener("statistics.connectionstats", listener);
    },


    addRemoteStatsStopListener: function(listener)
    {
        eventEmitter.on("statistics.stop", listener);
    },

    removeRemoteStatsStopListener: function(listener)
    {
        eventEmitter.removeListener("statistics.stop", listener);
    },

    stop: function () {
        stopLocal();
        stopRemote();
        if(eventEmitter)
        {
            eventEmitter.removeAllListeners();
        }
    },

    stopRemoteStatistics: function()
    {
        stopRemote();
    },

    start: function () {
        APP.RTC.addStreamListener(onStreamCreated,
            StreamEventTypes.EVENT_TYPE_LOCAL_CREATED);
        APP.xmpp.addListener(XMPPEvents.DISPOSE_CONFERENCE,
                             onDisposeConference);
        //FIXME: we may want to change CALL INCOMING event to
        // onnegotiationneeded
        APP.xmpp.addListener(XMPPEvents.CALL_INCOMING, function (event) {
            startRemoteStats(event.peerconnection);
        });
        APP.xmpp.addListener(XMPPEvents.PEERCONNECTION_READY,
            function (session) {
        });
        APP.RTC.addListener(RTCEvents.AUDIO_MUTE, function (mute) {
        });
        APP.xmpp.addListener(XMPPEvents.CONFERENCE_SETUP_FAILED, function () {
        });
        APP.RTC.addListener(RTCEvents.VIDEO_MUTE, function (mute) {
        });
    }
};




module.exports = statistics;
