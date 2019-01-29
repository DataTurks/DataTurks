# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

The backend code for bonsai.
Process SMS(s) for a user, parse it and break it in constituents, classify them and put them to DB.

Ideal flow:
App uploads a SMS, SMS is appended to a user table and an event is queued for the userID+SMSID. 
The background process picks up the event, reads the SMS for the user, do parse/classify and updated the processed table
for the user. 



When a Get request is fired, the processed table is accessed to get the list of SMS with metadata. 

'Get requests' to backend:
	> Get SMS list: returns all SMSs + meta data (like mechant, category, cost, datetime).
	> Get stats: returns a structured obj with data points helpful to plot the graph/piecharts. 
	


* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact