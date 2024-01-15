# Vmix Video Timer

This nodejs script allow the user to view the time remaining of a video running on Vmix through a web page that can be opened by anyone on the network.

## Installation and running

Before we can run the Node server you will need to have the application installed on your device. 

```
git clone https://github.com/x3rud/Vmix-Video-Timer.git
```

Next, change directory into that folder using the following commands to install all of your projects dependencies.
```
cd Vmix-Video-Timer
```
```
npm install
```

Now, make sure everything is working by starting up your Node server.
```
node index
```

Open the environment.json file and set there the ip of vmix instance with the port (eg.: 192.168.1.79:8088)

Once done connect to:
```
http://localhost:3000
```

## Installation and running on a PI with Kiosk mode

The prerequisite is to have a Raspberry PI with a Raspbian distro on it.
Follow the previous instruction to setup the node server.

Now you can go ahead and create a server file. Create this in the systemd directory using the following command:
```
sudo nano /etc/systemd/system/node-server.service
```
And insert
```
[Service]
WorkingDirectory=/home/pi/Vmix-Video-Timer
ExecStart=/usr/local/bin/node --expose-gc /home/pi/Vmix-Video-Timer/index.js
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodeServer
User=root
Group=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
Exit nano with `ctrl + x` and press `Y` to save the file. You can then activate the system file with the following command:
```
sudo systemctl enable node-server
```

To check that it worked, reboot your Pi using `sudo reboot` and once it has loaded back up, use the browser navigate to the port that your server usually runs on `http://localhost:3000`.

### Booting Chromium into kiosk mode on start up

Make shure to have ./config/lxsession directory, if not run:
```
cp -r /etc/xdg/lxsession ~/.config/
```

The last step in the process is to boot the chromium-browser into kiosk mode to show your Node application full screen. To do this you need to add one line of code to the autostart file. To edit your autostart file, use the following command:
```
nano /home/pi/.config/lxsession/LXDE-pi/autostart
```

Add the following line to the bottom of the file. The `--kiosk` flag removes the frame and makes it full screen. The `--incognito` means that it doesn't remember sessions, so if you pull the power chord out of your Pi, you won't get a warning next time you boot up Chromium. Remember to change the port to whatever your node server is running on. If you're not running a node server, you can change the http address to any website address.
```
@chromium-browser --kiosk --incognito http://localhost:3000
```
If you want to remove the mouse pointer you can install unclutter and again add that to the autostart file. Install unclutter using the following command:
```
sudo apt-get install unclutter
```
Again, open your autostart file:
```
nano /home/pi/.config/lxsession/LXDE-pi/autostart
```
and add the following line to the bottom:
```
@unclutter -idle 0.1 -root
```