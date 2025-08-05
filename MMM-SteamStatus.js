Module.register("MMM-SteamStatus", {
  defaults: {
    apiKey: '',
    mySteamId: '',
    friendSteamIds: [],
  },

  previousUsersData: [],

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["MMM-SteamStatus.css"]
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    console.log("Starting module MMM-SteamStatus");

    this.sendSocketNotification("SET_API_INFO", { "apiKey": this.config.apiKey, "mySteamId": this.config.mySteamId,
      "friendSteamIds": this.config.friendSteamIds 
    });

    setInterval(() => this.sendSocketNotification("GET_API_USER_DATA"), 60 * 1000 * 1); // every 1 minute
    this.sendSocketNotification("GET_API_USER_DATA");
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div");
    wrapper.id = 'wrapper';
    wrapper.innerHTML = `<div id="steamCards"></div>`;

    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "API_USER_DATA_RESULT") {
      this.populateUserCards(payload);
    }
  },

  /**
   * Set the user cards based on the data received.
   */
  populateUserCards(usersData) {
    const steamCards = document.getElementById('steamCards');

    if (steamCards.children.length > 0) {
      this.updateExistingCards(usersData, steamCards);
    }
    else { // Create new cards if none exist
      usersData.forEach(user => {
        this.createNewCard(user, steamCards);
      });    
      this.previousUsersData = usersData;
    }
  },

  /**
   * Create a new user card based on the provided user data.
   */
  createNewCard(userData, steamCards) {
    const card = document.createElement('div');
    card.id = userData.steamId;
    card.className = userData.cardClasses;

    card.innerHTML = `
      <img src="${userData.avatar}" class="${userData.avatarClasses}" alt="${userData.name}'s avatar">
      <div class="${userData.infoClasses}">
        <div>
          ${userData.name}
        </div>
        <span class="${userData.statusClasses}">${userData.status}</span>
      </div>
    `;

    steamCards.appendChild(card);
  },

  /**
   * Update the existing user cards based on the provided user data.
   */
  updateExistingCards(usersData, steamCards) {
    const cards = steamCards.children;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card) {
        const user = usersData.find(u => u.steamId === card.id);
        const previousUser = this.previousUsersData.find(u => u.steamId === card.id);
        if (previousUser && user) {
          const { lastLogoff: prevLastLogoff, ...prevUserData } = previousUser;
          const { lastLogoff, ...currentUserData } = user;
          if (JSON.stringify(prevUserData) !== JSON.stringify(currentUserData)) {
            this.updateCard(user, card);
          }
        }
      }
    }
    this.previousUsersData = usersData;
  },

  /**
   * Update an existing user card with new data.
   */
  updateCard(userData, card) {
    card.id = userData.steamId;
    card.classList = userData.cardClasses;
    card.querySelector('img').src = userData.avatar;
    card.querySelector('img').classList = userData.avatarClasses;
    card.querySelector('img').alt = `${userData.name}'s avatar`;

    const infoClass = userData.infoClasses.includes('my-') ? '.my-user-info' : '.user-info';
    const statusClass = userData.statusClasses.includes('my-') ? '.my-user-status' : 'user-status'; 
    
    card.querySelector(infoClass).classList = userData.infoClasses;
    card.querySelector(infoClass + ' > div').textContent = userData.name;
    card.querySelector(statusClass).classList = userData.statusClasses;
    card.querySelector(statusClass).textContent = userData.status;
  }
});
