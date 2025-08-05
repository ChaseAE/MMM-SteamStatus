const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-SteamStatus node_helper started");
    this.apiKey = null;
    this.mySteamId = null;
    this.friendSteamIds = [];
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "SET_API_INFO") {
      this.apiKey = payload.apiKey;
      this.mySteamId = payload.mySteamId;
      this.friendSteamIds = payload.friendSteamIds;
    }

    if (notification === "GET_API_USER_DATA") {
      this.getUserData();
    }

  },

  getUserData: async function () {
    if (!this.apiKey) {
      console.error("apiKey not set, can't fetch user data.");
      return;
    }

    if (!this.mySteamId && this.friendSteamIds.length === 0) {
      console.error("friendSteamIds not set, can't fetch user data.");
      return;
    }

    try {
      const steamIds = [this.mySteamId, ...this.friendSteamIds].join(',');
      const response = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamIds}`);
      const data = await response.json();
      if (data.response && data.response.players) {
        const processedData = this.processUserData(data.response.players);
        this.sendSocketNotification("API_USER_DATA_RESULT", processedData);
      } else {
        console.error("No player data found in response.");
      }
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
    return;
  },

  /**
   * Format the user data into a structure suitable for rendering.
   */
  processUserData(users) {
    let userCardInfo = [];
    users.forEach(user => {
      const isPlaying = user?.gameextrainfo;
      const isOnline = user.personastate === 1 || user.personastate === 2 || user.personastate === 3;
      const isOffline = !isOnline;
      const lastOnlineTime = user.lastlogoff ? new Date(user.lastlogoff * 1000) : null;

      let userStatus = '';
      let userAvatarClasses = 'user-avatar';
      let userInfoClasses = 'user-info';
      let userStatusClasses = 'user-status';

      // Set user status and card styling based on their state
      if (isPlaying) {
        userStatus = user.gameextrainfo;
        userAvatarClasses += ' user-avatar-playing';  
        userInfoClasses += ' user-info-playing';
        userStatusClasses += ' user-status-playing';  
      }
      else if (isOnline) {
        userStatus = "Online";
        userAvatarClasses += ' user-avatar-online';  
        userInfoClasses += ' user-info-online';
        userStatusClasses += ' user-status-online';
      }
      else if (isOffline && lastOnlineTime) {
        // Find the last time they were online
        userStatus = 'Last Online ';

        const now = new Date();
        const diffMs = now - lastOnlineTime;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
          userStatus += `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          userStatus += `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
          userStatus += `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
          userStatus += 'just now';
        }
      }
      else {
        userStatus = "Offline";
      }


      if (user.steamid === this.mySteamId) {
        // Set specific styling for the user's own card
        userAvatarClasses = 'my-avatar';
        userInfoClasses = `my-${userInfoClasses.split(' ').join(' my-')}`;
        userStatusClasses = `my-${userStatusClasses.split(' ').join(' my-')}`;
      }

      userCardInfo.push({
        steamId: user.steamid,
        avatar: user.avatarfull,
        name: user.personaname,
        status: userStatus,
        cardClasses: (user.steamid === this.mySteamId) ? 'my-user-card' : 'user-card',
        avatarClasses: userAvatarClasses,
        infoClasses: userInfoClasses,
        statusClasses: userStatusClasses,
        lastLogoff: lastOnlineTime ? lastOnlineTime.getTime() : null
      });
    });

    // Sort user cards: User's own card first, then Playing, then Online, then Offline (sorted by lastLogoff for Offline)
    userCardInfo.sort((a, b) => {
      // Always prioritize the user's own card
      if (a.steamId === this.mySteamId) return -1;
      if (b.steamId === this.mySteamId) return 1;

      const statusOrder = {
        'user-avatar-playing': 1,
        'user-avatar-online': 2,
        'user-avatar': 3 // Default for offline
      };

      const aStatus = Object.keys(statusOrder).find(key => a.avatarClasses.includes(key)) || 'user-avatar';
      const bStatus = Object.keys(statusOrder).find(key => b.avatarClasses.includes(key)) || 'user-avatar';

      const statusComparison = statusOrder[aStatus] - statusOrder[bStatus];

      // If both are offline, sort by lastLogoff (most recent first)
      if (statusComparison === 0 && aStatus === 'user-avatar' && bStatus === 'user-avatar') {
        if (a.lastLogoff && b.lastLogoff) {
          return b.lastLogoff - a.lastLogoff;
        }
      }

      return statusComparison;
    });

    return userCardInfo;
  }
});
