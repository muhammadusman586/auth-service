#!/bin/bash
NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" jest "$@"
