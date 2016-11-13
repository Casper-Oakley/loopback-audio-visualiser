# loopback-audio-visualiser
A NodeJS applet built for visualising sound! This applet reads in data sent to it from it's sister application, [music-loop](https://github.com/casper-oakley/music-loop), applies colours to it and renders it, both on an angular based web frontend, as well as rendering it to any connected blinkstick LED strips. The colours are either selectable by searching for an album, by selecting a static colour, or by the system watching a LastFM account, to see what the account is currently listening to.


## Getting Started

Simply `bower install` and `npm install` and you should be good to go!

### Prerequisites

* NodeJS
* MongoDB
* Bower
* NPM
* RabbitMQ
* [music-loop](https://github.com/casper-oakley/music-loop) - A C tool to read music data, process it live and send it to RabbitMQ

## Built With

* [NPM](https://www.npmjs.com/) - Backend package manager
* [Bower](https://bower.io/) - Frontend package manager

## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
