# HearVoice

## Pi Setup

- Change hostname to hearvoice

### Passwordless SSH

ssh-copy-id -p 22 pi@hearvoice.local

### Core Libraries

```
sudo apt update && sudo apt full-upgrade -y && sudo apt-get update && sudo apt-get -y upgrade && sudo apt-get dist-upgrade
sudo apt-get install -y python3-pip git sox nodejs npm lsof
sudo apt install postgresql -y
sudo pip3 install --upgrade setuptools adafruit-python-shell
wget https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/raspi-blinka.py
sudo python3 raspi-blinka.py
pip3 install --upgrade adafruit-circuitpython-dotstar adafruit-circuitpython-motor adafruit-circuitpython-bmp280
```

### Audio

1. Pull seeed-voicecard

```
cd ~
git clone https://github.com/HinTak/seeed-voicecard
cd seeed-voicecard
```

2. Run `uname -r`, if kernel is 5.4 use `v5.5` otherwise use `v5.9`

3. Checkout and install seeed-voicecard

```
git checkout v<v from uname>
sudo ./install.sh
sudo reboot
```

5. Configure mixer

- Run `alsamixer`. Enter `F6` and select the correct card (`seeed-2mic-voicecard`)
- Set the gain on all speakers to `60`
- Hit `ESC`

6. Run `aplay -l` and location the card number for `seeed-2mic-voicecard`

7. Create `~/.asoundrc` and replace `3` with your card number from above.

```
pcm.!default {
        type plug
        slave {
                pcm "hw:3,0"
        }
}

ctl.!default {
        type hw
        card 3
}

```

7. Run `speaker-test -c2` to test the voice bonnet speaker port. `plughw:3`.

8. Test recording/playback: `sudo arecord -f cd -Dhw:3 | aplay -Dhw:3`

## Postgres Setup

```
sudo su postgres
createuser pi -P --interactive # enter password, setup as super user
psql
CREATE DATABASE pi;
exit
exit
psql
CREATE DATABASE hearvoice;
exit

sudo vi /etc/postgresql/13/main/postgresql.conf
# SET `listen_addresses = '*'`
sudo vi /etc/postgresql/13/main/pg_hba.conf
# CHANGE `127.0.0.1/32` to `0.0.0.0/0 `
# CHANGE `::1/128` to `::/0`
sudo service postgresql restart
```

## AWS Setup

### S3

Create audio and transcription buckets and update `config.yml`.

## Commands

### Sync Code/Data

**To Pi**

`rsync -avh --exclude '.git' --exclude 'node_modules' ./ pi@hearvoice.local:~/hearvoice` // --delete

**From Pi**

`rsync -av pi@hearvoice.local:~/hearvoice/ .`

## AWS Setup

1. Create IAM access key
2. Add access key to `config.yml`
3. Add access key to `~/.aws/credentials`
