# zfssyncstatus
Dashboard of ZFS Sync Status, modified from https://github.com/IronSummitMedia/startbootstrap-sb-admin-2

Dashboard to see if this system's dataset snapshots are in sync with a remote system's snapshots.

This does nothing on its own. But combine with other tools to make a nice dashboard.

![](https://github.com/johnko/zfssyncstatus/raw/master/screenshot.png)

## Quick Install

I install this in a FreeBSD jail and forward tcp/80 to it.

See https://github.com/johnko/deploy/blob/master/bin/deploy_zfssyncstatus

### Jail fstab

```
/usr/local/www/data    /iocage/tags/zfssyncstatus/root/usr/local/www/data    nullfs    ro    0    0
/var/log               /iocage/tags/zfssyncstatus/root/var/hostlog           nullfs    ro    0    0
```

## Configuration

This goes on the jail host.

Create a file `/usr/local/www/data/json-datasets.js` with contents like this for each dataset you want to monitor:

```
[
{"name":"tank/dataset"},
{"name":"tank/mail"},
{"name":"tank/assets"},
{"name":"tank/website"}
]
```

## Check local / remote snapshots

This goes on the jail host.

Ideally, your zfs send/recv sync script will dump the last local and last remote snapshot names in json to the file `/usr/local/www/data/json-snapshots.js`

For an example see: https://github.com/johnko/zfs-tools/blob/master/bin/zfs-sync-xz-pull

Set https://github.com/johnko/gtfc-overlay/blob/master/_zfs-offsite-bkp/usr/home/urep/bin/zfs-sync-xz-pull-all to run in a user's crontab to perform the actual sync:

```
1 * * * * * zfs-sync-xz-pull-all
```

## RAM / zpool Usage Updates

This goes on the jail host.

Similarly a script will output RAM and zpool usage to files:
- `/usr/local/www/data/json-ramusage.js`
- `/usr/local/www/data/json-poolusage.js`
- `/usr/local/www/data/json-tankusage.js`

Since `zfs-sync-xz-pull` actually dumps the snapshots into separate files, this script also combines them to make `/usr/local/www/data/json-snapshots.js`

Set https://github.com/johnko/freebsd-system-info/blob/master/bin/stat-json-urep to run in a user's crontab:

```
0,15,30,45 * * * * stat-json-urep
```
