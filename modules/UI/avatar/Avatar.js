/* global Strophe, APP, MD5 */
var Settings = require("../../settings/Settings");

var users = {};

var Avatar = {

    /**
     * Sets the user's avatar in the settings menu(if local user), contact list
     * and thumbnail
     * @param jid jid of the user
     * @param id email or userID to be used as a hash
     */
    setUserAvatar: function (jid, id) {
        if (id) {
            if (users[jid] === id) {
                return;
            }
            users[jid] = id;
        }
        var thumbUrl = this.getThumbUrl(jid);
        var contactListUrl = this.getContactListUrl(jid);
        var resourceJid = Strophe.getResourceFromJid(jid);

        APP.UI.userAvatarChanged(resourceJid, thumbUrl, contactListUrl);
    },
    /**
     * Returns image URL for the avatar to be displayed on large video area
     * where current active speaker is presented.
     * @param jid full MUC jid of the user for whom we want to obtain avatar URL
     */
    getActiveSpeakerUrl: function (jid) {
        return this.getUrl(jid, 100);
    },
    /**
     * Returns image URL for the avatar to be displayed on small video thumbnail
     * @param jid full MUC jid of the user for whom we want to obtain avatar URL
     */
    getThumbUrl: function (jid) {
        return this.getUrl(jid, 100);
    },
    /**
     * Returns the URL for the avatar to be displayed as contactlist item
     * @param jid full MUC jid of the user for whom we want to obtain avatar URL
     */
    getContactListUrl: function (jid) {
        return this.getUrl(jid, 30);
    },
    getUrl: function (jid, size) {
        if(size == 100) {
            return '/images/avatar-100.png';
        } else {
            return '/images/avatar-30.png';
        }
    }

};


module.exports = Avatar;
