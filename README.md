# url reducer



This app uses node.js running on heroku

-- http://nintex.herokuapp.com


and couchbase 4.0 running on amazon 

-- http://ec2-54-191-226-92.us-west-2.compute.amazonaws.com:8091


REST calls -

http://nintex.herokuapp.com/url   			to execute a reduced url<br>
http://nintex.herokuapp.com/seed  			to create/advance the next generated url<br>
http://nintex.herokuapp.com/reduce/:key    		read/write a reduced url record<br>
http://nintex.herokuapp.com/findKeys/:url	find all the keys for a particular url<br>
http://nintex.herokuapp.com/config<br>

Examples

http://nintex.herokuapp.com/url/myKey<br>
http://nintex.herokuapp.com/seed<br>
http://nintex.herokuapp.com/reduce/myKey<br>
http://nintex.herokuapp.com/reduce/myKey&url=www.google.com<br>
http://nintex.herokuapp.com/findKeys/bing<br>

Testing - run "npm test" in root directory

