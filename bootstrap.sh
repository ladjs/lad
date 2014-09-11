#!/bin/bash

# update packages
sudo apt-get update
sudo apt-get upgrade -y

# core packages
sudo apt-get -y -q install \
  software-properties-common \
  python-software-properties \
  python \
  curl \
  g++ \
  make \
  libssl-dev \
  build-essential \
  openssl \
  libssl-dev \
  unicode-data \
  git-core \
  pkg-config \
  vim \
  screen \

# add ppa's to sources

## node
sudo add-apt-repository -y ppa:chris-lea/node.js

## redis
sudo add-apt-repository -y ppa:chris-lea/redis-server

## mongo
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list

# update sources
sudo apt-get -y update

# install packages
sudo apt-get -y -q install \
  nodejs \
  redis-server \
  mongodb-org

# npm packages
sudo npm install -g jshint bower gulp anywhere
