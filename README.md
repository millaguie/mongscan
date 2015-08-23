## What is this?

This software is a nonfunctional attempt to develop a scanner for all internet servers in node.js.
SQLite is not the best option for this operations.

## Tests
I have been testing this with a bad connected and low resources vps (256MB of RAM, 2vcpu, ). For every configuration I run this test 5 or 3 times (one minute each).
Load average never went over 0,7 (2vcpu),


* Original configuration (50 live attempts, 100ms queue refresh): 388/408/420/421/405 ports per minute
* Second configuration (70 live attempts, 100ms queue refresh): 508/564/516/538/532 ports per minute
* Third configuration (90 live attempts, 10ms queue refresh): 663/650/698/684/706 ports per minute
* Fourth configuration (150 live attempts, 10ms queue refresh): 1024/1068/820/1039/960 ports per minute
* Fifth configuration (300 live attempts, 10ms queue refresh): 1424/1034/1000 ports per minute
* Seventh configuration (600 live attempts, 10ms queue refresh): 1331/1300/2178 ports per minute






