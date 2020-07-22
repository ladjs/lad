# Quick Start

We strictly support Mac and Ubuntu-based operating systems (Windows _might_ work).

## Requirements

Please ensure your operating system has the following software installed:

* [Git][] - see [GitHub's tutorial][github-git] for installation

* [Node.js][node] (v10+) - use [nvm][] to install it on any OS

* [MongoDB][] (v3.x+):

  * Mac (via [brew][]): `brew install mongodb && brew services start mongo`
  * Ubuntu:

    ```sh
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    sudo apt-get update
    sudo apt-get -y install mongodb-org
    ```

* [Redis][] (v4.x+):

  * Mac (via [brew][]): `brew install redis && brew services start redis`
  * Ubuntu:

    ```sh
    sudo add-apt-repository -y ppa:chris-lea/redis-server
    sudo apt-get update
    sudo apt-get -y install redis-server
    ```

## Install

[npm][]:

```sh
npm install -g lad
```

[yarn][]:

```sh
yarn global add lad
```

## Usage

### Create a project

```sh
lad new-project
cd new-project
```

### Development

To begin, try typing "npm start" (or "yarn start") on command line.  This will display to you all the scripts you can run.

The "start" script (among many others) uses [nps][] and [nps-utils][] under the hood.  This helps to keep scripts very developer-friendly, and rids the need to write in JSON syntax.

This script accepts a "task" argument, whereas a task of "all" will spawn, watch, and re-compile all of the microservices.

Just open <http://localhost:3000> for testing!

[npm][]:

```sh
npm start all
```

[yarn][]:

```sh
yarn start all
```


##

[github-git]: https://help.github.com/articles/set-up-git/

[git]: https://git-scm.com/

[node]: https://nodejs.org

[nvm]: https://github.com/creationix/nvm

[mongodb]: https://www.mongodb.com/

[redis]: https://redis.io/

[yarn]: https://yarnpkg.com/

[npm]: https://www.npmjs.com/

[brew]: https://brew.sh/

[nps]: https://github.com/kentcdodds/nps

[nps-utils]: https://github.com/kentcdodds/nps-utils
