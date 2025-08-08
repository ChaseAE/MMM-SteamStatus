# MMM-SteamStatus

**MMM-SteamStatus** is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) that allows you to display information from your Steam account and a list of friends as well.

This module relies on the **Steam API** and will be extended in the future to inlcude more information as configuration options. Register for an API key [here](https://steamcommunity.com/dev/apikey).

**WARNING:** If a user's profile is private or you do not have proper permissions to view it, select information will not be displayed and it will simply display 'Offline'.

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/ChaseAE/MMM-SteamStatus.git
```

## Updating

Update this module by navigating into its folder on the command line and using `git pull`:

```bash
cd ~/MagicMirror/modules/MMM-SteamStatus
git pull
```

## Config

Make sure to fill in the API key and Steam ID fields. Steam ID's can be found in the URL of a profile page. Check out [your own profile page](https://steamcommunity.com/my/) for an example and to get your Steam ID. If a user's Steam ID is not shown, their profile is private or not visible to you and cannot be displayed unless your retrieve it from the person directly.

```
{
  module: 'MMM-SteamStatus',
  position: 'bottom_left',
  config: {
    apiKey: 'Insert your Steam API key',
    mySteamId: 'Your Steam ID',
    friendSteamIds: ['Friend 1 Steam ID', 'Friend 2 Steam ID', 'etc.'],
  }
},
```

## Preview

## Future Plans

I plan adding more styling customizability so it looks better if you move it to the right side of the screen. It is currently styled for the bottom left corner but will work anywhere.

## Changelog

All notable changes to this project will be documented in the [CHANGELOG.md](CHANGELOG.md) file.

Please submit any issues and I will get to them as soon as possible!
