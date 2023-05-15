# Computational Cognitive Models of Learning and Development: Modeling Surprise

This repository contains materials and challenge problems for the Computational Cognitive Models of Learning and Development 2023 workshop tutorial on Coding Surprise / Core Knowledge. This tutorial uses WebPPL for probabilistic inference, and as such is an adaptation of [a previous tutorial](https://github.com/tobiasgerstenberg/webppl_tutorial) with extra exercises specifically related to modeling "surprising" events that happen under occlusion.

## Quickstart

This code is a fork of the [WebPPL web interface](http://webppl.org/) that includes libraries for the problem set in this repository. To set it up, clone this repo, go into the top level folder, and open up an http server via Python:

> python -m http.server

Then all you have to do is point a web browser to the [localhost:8000](http://0.0.0.0:8000) site and you'll be up and running!

## Repository structure

Of the four folders in this repository, you only need to worry about two of them:

* The `notes` folder contains notes and exercises for the first half of the tutorial, which will involve learning the basics of the WebPPL language
* The `exercises` folder contains the challenge problems in which you'll model "surprising" things happening to a ball while it's occluded