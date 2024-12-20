[![Build and Publish RPE](https://github.com/os-fpga/rapid_power_estimator/actions/workflows/rpe_test.yml/badge.svg)](https://github.com/os-fpga/rapid_power_estimator/actions/workflows/rpe_test.yml)
[![Documentation Status](https://readthedocs.org/projects/rapidpowerestimator/badge/?version=latest)](https://rapidpowerestimator.readthedocs.io/latest)
[![code coverage](https://codecov.io/gh/os-fpga/rapid_power_estimator/graph/badge.svg?token=O98SZ9DI28)](https://codecov.io/gh/os-fpga/rapid_power_estimator)

# Rapid Power Estimator

![RPE Logo](imgs/rpelogo.png)

Rapid Power Estimation Tool allows you to estimate power consumption at various stages of your design cycle. It simplifies the input of design information through intuitive wizards and delivers comprehensive power and thermal data analysis.

## Pre-requisite

The development workflow requires NodeJS at least version 21 or above to run. Please goto the official NodeJS website https://nodejs.org/ to download and install for your respective OS.

At the command prompt or terminal, execute the commands below to check if NodeJS and npm are installed properly with the correct version:-

- `$ node -v`
- `$ npm -v`

## Installation Steps

1. Download the source code `git clone https://github.com/os-fpga/rapid_power_estimator`
2. Change to source folder `cd rapid_power_estimator`
3. Install Electron app dependencies `npm install`
4. Install Python dependencies `pip install -r requirements.txt`

### Launch the app (development stage)

1. Launch the Electron desktop app by command `npm start`
